
import { Conductor, MechanicalCalcResult, CableCalculationDetail } from '../types';
import { NEUTRO_FATOR_REDUCAO } from '../constants';

export interface MechanicalInputItem {
  conductor: Conductor;
  spanHorizontal: number;
  heightDiff: number;
  angle: number;
  qty: number;
  hasNeutral: boolean;
}

/**
 * Calculates unitary tension based on 3D span length
 */
const calculateUnitaryTension = (conductor: Conductor, realSpan3D: number): number => {
  const [taxa, base] = conductor.stressParams;
  return (taxa * realSpan3D) + base;
};

export const calculatePoleMechanicalStress = (
  poleResistance: number,
  cables: MechanicalInputItem[]
): MechanicalCalcResult => {
  let sumX = 0;
  let sumY = 0;
  const details: CableCalculationDetail[] = [];

  cables.forEach((item, index) => {
    // 3D Geometry: hypotenuse of horizontal span and vertical difference
    const realSpan3D = Math.sqrt(Math.pow(item.spanHorizontal, 2) + Math.pow(item.heightDiff, 2));
    
    const unitTension = calculateUnitaryTension(item.conductor, realSpan3D);
    const phaseTension = unitTension * item.qty;
    
    let neutralTension = 0;
    if (item.hasNeutral) {
      neutralTension = unitTension * NEUTRO_FATOR_REDUCAO;
    }

    const totalTension = phaseTension + neutralTension;
    const rad = (item.angle * Math.PI) / 180;
    const fx = totalTension * Math.cos(rad);
    const fy = totalTension * Math.sin(rad);

    sumX += fx;
    sumY += fy;

    details.push({
      id: `c-${index}`,
      label: item.conductor.name,
      tensionPhases: parseFloat(phaseTension.toFixed(2)),
      tensionNeutral: parseFloat(neutralTension.toFixed(2)),
      fx: parseFloat(fx.toFixed(2)),
      fy: parseFloat(fy.toFixed(2)),
      angle: item.angle,
      realSpan3D: parseFloat(realSpan3D.toFixed(2))
    });
  });

  const resultant = Math.sqrt(sumX ** 2 + sumY ** 2);
  let angleRes = (Math.atan2(sumY, sumX) * 180) / Math.PI;
  if (angleRes < 0) angleRes += 360;

  const usage = (resultant / poleResistance) * 100;

  return {
    poleId: 'P-ANALYSIS',
    totalResultantDan: parseFloat(resultant.toFixed(2)),
    resultantAngle: parseFloat(angleRes.toFixed(2)),
    nominalResistance: poleResistance,
    usagePercent: parseFloat(usage.toFixed(1)),
    isCompliant: resultant <= poleResistance,
    fxTotal: parseFloat(sumX.toFixed(2)),
    fyTotal: parseFloat(sumY.toFixed(2)),
    calculatedCables: details
  };
};
