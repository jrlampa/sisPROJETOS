
import { IntelligenceAlert, ScenarioResult, SensitivityData, ApprovalScore } from '../types';
import { MOCK_PROJECT_DATA, NORMATIVE_LIMITS } from '../constants';

// --- 4.3 Automatic Problem Detection ---

export const runDiagnostic = (): IntelligenceAlert[] => {
  const alerts: IntelligenceAlert[] = [];

  // 1. Electrical Check (Deterministic)
  const maxDrop = 5.2; // Mocked from current project state
  if (maxDrop > NORMATIVE_LIMITS.maxVoltageDrop) {
    alerts.push({
      id: 'alert-elec-01',
      severity: 'CRITICAL',
      title: 'Violação de Tensão (Crítico)',
      description: `Queda de tensão global de ${maxDrop}% excede o limite normativo de ${NORMATIVE_LIMITS.maxVoltageDrop}%.`,
      category: 'ELECTRICAL',
      actionLabel: 'Ver Sugestões'
    });
  }

  // 2. Mechanical Check
  // Simulating a heuristic check
  alerts.push({
    id: 'alert-mech-01',
    severity: 'WARNING',
    title: 'Utilização Mecânica Elevada',
    description: 'Vão V-03 apresenta 85% de utilização do poste. Em cenários de vento extremo (tempestade), pode haver ruptura.',
    category: 'MECHANICAL',
    actionLabel: 'Reforçar Estrutura'
  });

  // 3. Approval Intelligence
  alerts.push({
    id: 'alert-hist-01',
    severity: 'INFO',
    title: 'Histórico de Aprovação',
    description: 'A concessionária Enel SP costuma aprovar projetos com este perfil em 92% dos casos.',
    category: 'NORMATIVE'
  });

  return alerts;
};

// --- 4.3.2 Sensitivity Analysis ---

export const runSensitivityAnalysis = (): SensitivityData[] => {
  // Simulate load growth over 10 years
  const baseLoad = 1.0;
  const growthRate = 0.03; // 3% per year
  const data: SensitivityData[] = [];

  for (let year = 0; year <= 10; year++) {
    const factor = 1 + (growthRate * year);
    // Simplified VDrop Model: V_drop_new = V_drop_base * factor
    const vDrop = 4.2 * factor; // Starting at 4.2% healthy base for simulation

    let risk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (vDrop > 4.8) risk = 'MEDIUM';
    if (vDrop > 5.0) risk = 'HIGH';

    data.push({
      year: 2024 + year,
      loadFactor: parseFloat(factor.toFixed(2)),
      maxVoltageDrop: parseFloat(vDrop.toFixed(2)),
      riskLevel: risk
    });
  }
  return data;
};

// --- 4.6 Scenario Comparison ---

export const generateScenarios = (): ScenarioResult[] => {
  return [
    {
      id: 'sc-current',
      name: 'Cenário Atual',
      type: 'CURRENT',
      description: 'Configuração atual do projeto com cabos 35mm².',
      totalCost: 12500,
      complianceScore: 75,
      maxVoltageDrop: 5.2,
      maxMechanicalStress: 85,
      lifespan: 15
    },
    {
      id: 'sc-min',
      name: 'Mínimo Normativo',
      type: 'MIN_NORMATIVE',
      description: 'Ajuste estrito para cumprir NBR 5410 (Cabo 50mm² no tronco).',
      totalCost: 14200,
      complianceScore: 100,
      maxVoltageDrop: 4.8,
      maxMechanicalStress: 80,
      lifespan: 20
    },
    {
      id: 'sc-opt',
      name: 'Otimizado (Recomendado)',
      type: 'OPTIMIZED',
      description: 'Equilíbrio ideal Custo x Benefício com Cabo 70mm² e novos postes.',
      totalCost: 16800,
      complianceScore: 98,
      maxVoltageDrop: 3.5,
      maxMechanicalStress: 60,
      lifespan: 30
    }
  ];
};

// --- 4.7 Approval Intelligence ---

export const calculateApprovalScore = (): ApprovalScore => {
  // Mock logic based on "Current" state
  return {
    total: 82,
    technical: 95,
    normative: 70, // Low because of the voltage violation
    historical: 88,
    verdict: 'MODERATE'
  };
};
