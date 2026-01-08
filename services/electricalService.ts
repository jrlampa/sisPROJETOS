
import { 
  NetworkSegment, NetworkCalculationResult, SegmentResult, OptimizationSuggestion, Conductor 
} from '../types';
import { CONDUCTORS_DB, NORMATIVE_LIMITS, DEMAND_TABLE, PUBLIC_LIGHTING_DB } from '../constants';

const IP_POWER_FACTOR = 1.0;

/**
 * Gets DMDI factor based on total client count and curve class.
 */
const getDemandFactor = (count: number, dmdiClass: 'A' | 'B' | 'C' | 'D'): number => {
  if (count <= 0) return 0;
  const row = DEMAND_TABLE.find(r => count >= r.min && count <= r.max) || DEMAND_TABLE[DEMAND_TABLE.length - 1];
  switch (dmdiClass) {
    case 'A': return row.classA;
    case 'C': return row.classC;
    case 'D': return row.classD;
    default: return row.classB;
  }
};

/**
 * Encontra a melhor sugestão de condutor para um trecho específico.
 * Prioriza o condutor mais barato que resolve o problema.
 */
const findBestSuggestion = (
  segment: NetworkSegment, 
  currentKva: number, 
  accDropBefore: number
): Conductor | null => {
  const currentConductor = CONDUCTORS_DB.find(c => c.id === segment.conductorId);
  if (!currentConductor) return null;

  const hectoLength = segment.length / NORMATIVE_LIMITS.unitDivisor;
  
  // Filtra condutores candidatos: 
  // 1. Devem ter maior capacidade (ampacity) que a corrente de pico estimada
  // 2. Devem ter menor dropCoef que o atual
  // 3. Ordenados por preço crescente
  const currentAmpEstimate = (currentKva * 1000) / (1.732 * 220);
  
  const candidates = CONDUCTORS_DB
    .filter(c => 
      c.id !== currentConductor.id && 
      c.ampacity > currentAmpEstimate && 
      c.dropCoef < currentConductor.dropCoef
    )
    .sort((a, b) => a.pricePerKm - b.pricePerKm);

  // Retornamos o primeiro candidato (o mais barato que é tecnicamente superior)
  return candidates.length > 0 ? candidates[0] : null;
};

/**
 * Core Engine: Implements ENEL/QTOS Methodology with Automatic Suggestions
 */
export const calculateNetwork = (
  segments: NetworkSegment[],
  trafoKva: number,
  dmdiClass: 'A' | 'B' | 'C' | 'D' = 'B'
): NetworkCalculationResult => {
  if (segments.length === 0) {
    return {
      segments: [], maxDropPercent: 0, totalLength: 0, totalDemandKva: 0, 
      trafoOcupation: 0, dmdiClass, isGlobalCompliant: true, suggestions: []
    };
  }

  // 1. Calculate Individual Segment Demands (Local kVA)
  const localDemands = segments.map(seg => {
    const totalClients = seg.mono + seg.bi + seg.tri + seg.triSpecial;
    const factor = getDemandFactor(totalClients, dmdiClass);
    const kvaDist = totalClients * factor;

    const ipWatts = PUBLIC_LIGHTING_DB[seg.ipType as keyof typeof PUBLIC_LIGHTING_DB] || 0;
    const kvaIp = (ipWatts * seg.ipQty) / (1000 * IP_POWER_FACTOR);
    const kvaPoint = seg.dedicatedKva + kvaIp;

    return { totalClients, kvaDist, kvaPoint };
  });

  // 2. Accumulate Downstream Load (Radial Tree)
  const downstreamKvas = new Array(segments.length).fill(0);
  for (let i = segments.length - 2; i >= 0; i--) {
    downstreamKvas[i] = localDemands[i + 1].kvaDist + localDemands[i + 1].kvaPoint + downstreamKvas[i + 1];
  }

  // 3. Main Forward Pass: Voltage Drop and ICC
  let accumulatedDropAbs = 0;
  let totalLength = 0;
  const results: SegmentResult[] = [];
  const suggestions: OptimizationSuggestion[] = [];
  
  const vPhase = 127; 
  const zBase = (0.22 ** 2 * 1000) / trafoKva;
  let zAccumulated = { r: 0, x: 0.04 * zBase };

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const conductor = CONDUCTORS_DB.find(c => c.id === seg.conductorId) || CONDUCTORS_DB[0];
    const loads = localDemands[i];

    const currentTotalKva = loads.kvaDist + loads.kvaPoint + downstreamKvas[i];
    const currentAmp = (currentTotalKva * 1000) / (1.732 * 220);

    const momentKvaM = (loads.kvaDist / 2) + loads.kvaPoint + downstreamKvas[i];
    const hectoLength = seg.length / NORMATIVE_LIMITS.unitDivisor;
    const vDropTrecho = momentKvaM * hectoLength * conductor.dropCoef;
    
    const dropBefore = accumulatedDropAbs;
    accumulatedDropAbs += vDropTrecho;
    const accDropPercent = (accumulatedDropAbs / 220) * 100;

    const km = seg.length / 1000;
    zAccumulated.r += conductor.resistance * km;
    zAccumulated.x += conductor.reactance * km;
    const zMod = Math.sqrt(zAccumulated.r ** 2 + zAccumulated.x ** 2);
    const iccKa = (vPhase / zMod) / 1000;

    totalLength += seg.length;
    
    // Checks for violations
    const hasVoltageViolation = accDropPercent > NORMATIVE_LIMITS.maxVoltageDrop;
    const hasCurrentViolation = currentAmp > conductor.ampacity;
    const isCompliant = !hasVoltageViolation && !hasCurrentViolation;

    // Se houver violação ou queda próxima do limite, buscar sugestão
    if (!isCompliant || accDropPercent > (NORMATIVE_LIMITS.maxVoltageDrop * 0.8)) {
       const bestAlternative = findBestSuggestion(seg, currentTotalKva, dropBefore);
       if (bestAlternative) {
          const newVDrop = momentKvaM * hectoLength * bestAlternative.dropCoef;
          const improvement = ((vDropTrecho - newVDrop) / vDropTrecho) * 100;
          
          suggestions.push({
            segmentId: seg.id,
            type: 'CABLE_UPGRADE',
            description: !isCompliant ? `Upgrade obrigatório para conformidade.` : `Otimização preventiva sugerida.`,
            currentConductorId: conductor.id,
            suggestedConductorId: bestAlternative.id,
            improvementPercent: parseFloat(improvement.toFixed(1))
          });
       }
    }

    results.push({
      segmentId: seg.id,
      segmentName: seg.name,
      totalClients: loads.totalClients,
      localKvaDist: parseFloat(loads.kvaDist.toFixed(2)),
      localKvaPoint: parseFloat(loads.kvaPoint.toFixed(2)),
      downstreamKva: parseFloat(downstreamKvas[i].toFixed(2)),
      momentKvaM: parseFloat(momentKvaM.toFixed(2)),
      voltageDropAbs: parseFloat(vDropTrecho.toFixed(2)),
      voltageDropPercent: parseFloat(((vDropTrecho / 220) * 100).toFixed(2)),
      accumulatedDropPercent: parseFloat(accDropPercent.toFixed(2)),
      voltageAtEnd: parseFloat((220 - accumulatedDropAbs).toFixed(1)),
      currentAmp: parseFloat(currentAmp.toFixed(1)),
      iccKa: parseFloat(iccKa.toFixed(3)),
      isCompliant,
      message: isCompliant ? 'OK' : (hasVoltageViolation ? 'Violação QT' : 'Sobrecarga Condutor')
    });
  }

  const totalDemand = results.length > 0 ? (localDemands[0].kvaDist + localDemands[0].kvaPoint + downstreamKvas[0]) : 0;
  const ocupation = (totalDemand / trafoKva) * 100;

  return {
    segments: results,
    maxDropPercent: parseFloat(results[results.length - 1]?.accumulatedDropPercent.toFixed(2) || '0'),
    totalLength,
    totalDemandKva: parseFloat(totalDemand.toFixed(2)),
    trafoOcupation: parseFloat(ocupation.toFixed(1)),
    dmdiClass,
    isGlobalCompliant: ocupation <= NORMATIVE_LIMITS.sobrecargaMax && results.every(r => r.isCompliant),
    suggestions
  };
};
