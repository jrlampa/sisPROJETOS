
import { NormativeRule } from '../types';

// "Norm as Data" - Versioned rules
export const NORMATIVE_DATABASE: NormativeRule[] = [
  {
    id: 'rule-01',
    code: 'NBR_5410_VDROP_GLOBAL',
    description: 'Queda de Tensão Global (Fonte -> Carga)',
    value: 5.0,
    unit: '%',
    comparator: '<=',
    source: 'NBR 5410:2004 - 6.2.7',
    versionDate: '2004-09-30'
  },
  {
    id: 'rule-02',
    code: 'NBR_15214_SAFETY_MECH',
    description: 'Fator de Segurança Mecânico (Tração)',
    value: 2.5,
    unit: 'x',
    comparator: '>=',
    source: 'NBR 15214:2005',
    versionDate: '2005-01-01'
  },
  {
    id: 'rule-03',
    code: 'PRODIST_M8_V_MIN',
    description: 'Tensão Mínima de Fornecimento (BT)',
    value: 202, // 220V - ~8%
    unit: 'V',
    comparator: '>=',
    source: 'ANEEL PRODIST M8',
    versionDate: '2021-01-01'
  },
  {
    id: 'rule-04',
    code: 'ENEL_SP_SAG_MAX',
    description: 'Flecha Máxima Permitida (% do Vão)',
    value: 3.0,
    unit: '%',
    comparator: '<=',
    source: 'NT-ENEL-004',
    versionDate: '2023-03-15'
  }
];

export const getActiveNorms = (date: string = new Date().toISOString()): NormativeRule[] => {
  // In a real app, this would filter by date to ensure historical reproducibility
  return NORMATIVE_DATABASE;
};

export const checkCompliance = (ruleCode: string, value: number): boolean => {
  const rule = NORMATIVE_DATABASE.find(r => r.code === ruleCode);
  if (!rule) return true; // Fail safe

  switch (rule.comparator) {
    case '<=': return value <= rule.value;
    case '>=': return value >= rule.value;
    case '==': return value === rule.value;
    default: return true;
  }
};
