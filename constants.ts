
import { Conductor, ConductorMaterial, Pole, DemandCurve } from './types';

// ==============================================================================
// 1. CONDUTORES - BANCO DE DADOS SisCQT / sisCALC v2025
// ==============================================================================
// stressParams: [taxa (a), base (b)] para fórmula y = ax + b (Tração em daN)
export const CONDUCTORS_DB: Conductor[] = [
  {
    id: 'cal-2x16',
    name: '2#16(25)mm² Al',
    material: ConductorMaterial.ALUMINUM,
    section: 16,
    dropCoef: 0.7779,
    resistance: 1.91,
    reactance: 0.10,
    weight: 135,
    breakingLoad: 500,
    ampacity: 75,
    pricePerKm: 2100,
    stressParams: [0.8, 15.0]
  },
  {
    id: 'cal-35',
    name: '3x35+54.6mm² Al',
    material: ConductorMaterial.ALUMINUM,
    section: 35,
    dropCoef: 0.2416,
    resistance: 0.87,
    reactance: 0.09,
    weight: 250,
    breakingLoad: 800,
    ampacity: 120,
    pricePerKm: 3800,
    stressParams: [1.2, 25.0]
  },
  {
    id: 'cal-50',
    name: '3x50+54.6mm² Al',
    material: ConductorMaterial.ALUMINUM,
    section: 50,
    dropCoef: 0.1784,
    resistance: 0.64,
    reactance: 0.09,
    weight: 340,
    breakingLoad: 1200,
    ampacity: 155,
    pricePerKm: 5200,
    stressParams: [1.78, 30.0]
  },
  {
    id: 'cal-70',
    name: '3x70+54.6mm² Al',
    material: ConductorMaterial.ALUMINUM,
    section: 70,
    dropCoef: 0.1248,
    resistance: 0.44,
    reactance: 0.08,
    weight: 450,
    breakingLoad: 1600,
    ampacity: 195,
    pricePerKm: 6900,
    stressParams: [2.1, 40.0]
  },
  {
    id: 'cal-95',
    name: '3x95+54.6mm² Al',
    material: ConductorMaterial.ALUMINUM,
    section: 95,
    dropCoef: 0.0891,
    resistance: 0.32,
    reactance: 0.08,
    weight: 600,
    breakingLoad: 2100,
    ampacity: 240,
    pricePerKm: 8800,
    stressParams: [2.8, 50.0]
  },
  {
    id: 'cal-150',
    name: '3x150+70mm² Al',
    material: ConductorMaterial.ALUMINUM,
    section: 150,
    dropCoef: 0.0573,
    resistance: 0.21,
    reactance: 0.08,
    weight: 950,
    breakingLoad: 3200,
    ampacity: 315,
    pricePerKm: 12500,
    stressParams: [3.5, 60.0]
  },
  {
    id: 'caa-1/0',
    name: '1/0 CAA (MT)',
    material: ConductorMaterial.ALUMINUM,
    section: 50,
    dropCoef: 0.089,
    resistance: 0.54,
    reactance: 0.10,
    weight: 300,
    breakingLoad: 2100,
    ampacity: 220,
    pricePerKm: 9500,
    stressParams: [4.2, 80.0]
  },
  {
    id: 'cu-6',
    name: '1#6 (6) CU',
    material: ConductorMaterial.COPPER,
    section: 6,
    dropCoef: 1.6800,
    resistance: 3.08,
    reactance: 0.12,
    weight: 70,
    breakingLoad: 250,
    ampacity: 50,
    pricePerKm: 16500,
    stressParams: [0.5, 10.0]
  }
];

export const POLES_DB: Pole[] = [
  { id: 'p-300', type: 'Poste 300 daN', height: 9, nominalLoad: 300 },
  { id: 'p-600', type: 'Poste 600 daN', height: 11, nominalLoad: 600 },
  { id: 'p-1000', type: 'Poste 1000 daN', height: 11, nominalLoad: 1000 },
];

export const NEUTRO_FATOR_REDUCAO = 0.7;

export const DEMAND_TABLE: DemandCurve[] = [
  { min: 1, max: 5, classA: 1.50, classB: 2.50, classC: 4.00, classD: 6.00 },
  { min: 6, max: 10, classA: 1.20, classB: 2.00, classC: 3.20, classD: 5.00 },
  { min: 11, max: 20, classA: 1.00, classB: 1.60, classC: 2.50, classD: 4.00 },
  { min: 21, max: 50, classA: 0.80, classB: 1.20, classC: 2.00, classD: 3.00 },
  { min: 51, max: 9999, classA: 0.50, classB: 0.80, classC: 1.30, classD: 2.00 },
];

export const PUBLIC_LIGHTING_DB = {
  "Sem IP": 0.0,
  "IP 70W": 70.0,
  "IP 80W": 80.0,
  "IP 100W": 100.0,
  "IP 150W": 150.0,
  "IP 250W": 250.0,
  "IP 400W": 400.0,
};

export const TRANSFORMER_LIST = [15, 30, 45, 75, 112.5, 150, 225, 300];

export const NORMATIVE_LIMITS = {
  maxVoltageDrop: 6.0, 
  maxVoltageDropCritical: 5.0,
  sobrecargaMax: 120.0, 
  unitDivisor: 100.0,
};

export const MOCK_PROJECT_DATA = {
  projectName: "Expansão Linha Sul - SP",
  id: "PRJ-2023-ALPHA",
  engineer: "Eng. João Silva",
  crea: "123456/SP",
  client: "Concessionária Local Energia S.A.",
  date: new Date().toLocaleDateString('pt-BR'),
  electrical: [
    { id: 'seg-01', from: 'TR-01', to: 'PT-01', length: 45, load: 15.2, cable: 'Multiplex AL 70mm²', vDrop: 1.2, status: 'OK' },
    { id: 'seg-02', from: 'PT-01', to: 'PT-02', length: 50, load: 12.4, cable: 'Multiplex AL 70mm²', vDrop: 2.4, status: 'OK' },
    { id: 'seg-03', from: 'PT-02', to: 'PT-03', length: 60, load: 8.9, cable: 'Multiplex AL 35mm²', vDrop: 5.2, status: 'CRÍTICO' },
  ],
  mechanical: [
    { id: 'span-01', poles: 'PT-01 - PT-02', span: 45, tension: 180, safety: 3.2, status: 'OK' },
    { id: 'span-02', poles: 'PT-02 - PT-03', span: 50, tension: 210, safety: 2.8, status: 'OK' },
    { id: 'span-03', poles: 'PT-03 - PT-04', span: 60, tension: 350, safety: 1.8, status: 'ATENÇÃO' },
  ]
};
