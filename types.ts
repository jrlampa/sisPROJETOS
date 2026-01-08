
export enum PhaseType {
  MONO = 'Monofásico (F-N)',
  BIFASICO = 'Bifásico (F-F)',
  TRIFASICO = 'Trifásico (3F)'
}

export enum LoadType {
  RESIDENCIAL = 'Residencial',
  COMERCIAL = 'Comercial',
  IP = 'Iluminação Pública',
  INDUSTRIAL = 'Industrial'
}

export enum ConductorMaterial {
  COPPER = 'Cobre',
  ALUMINUM = 'Alumínio'
}

// --- GIS & Field Types ---

export interface GeoPoint {
  lat: number;
  lng: number;
  alt?: number;
}

export interface AuditLog {
  userId: string;
  timestamp: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'IMPORT';
  gpsAccuracy?: number;
  hash?: string;
}

export interface GisFeature {
  id: string;
  type: 'POLE' | 'SPAN' | 'CLIENT' | 'TRANSFORMER';
  coordinates: GeoPoint | GeoPoint[];
  properties: any;
  layer: 'EXISTING' | 'PROJECTED' | 'TO_REMOVE';
  source: 'MANUAL' | 'GPS' | 'DXF' | 'KML' | 'SHP' | string;
  audit: AuditLog;
}

export interface FieldQueueItem {
  id: string;
  feature: GisFeature;
  status: 'PENDING' | 'SYNCED' | 'ERROR';
}

// --- Electrical & Mechanical ---

export interface Conductor {
  id: string;
  name: string;
  material: ConductorMaterial;
  section: number;
  resistance: number; 
  reactance: number; 
  dropCoef: number; 
  weight: number;
  breakingLoad: number;
  ampacity: number;
  pricePerKm: number; 
  stressParams: [number, number];
}

export interface Pole {
  id: string;
  type: string;
  height: number;
  nominalLoad: number;
}

export interface NetworkSegment {
  id: string;
  name: string;
  length: number; 
  mono: number;
  bi: number;
  tri: number;
  triSpecial: number;
  dedicatedKva: number; 
  ipType: string;
  ipQty: number;
  conductorId: string;
}

export interface SegmentResult {
  segmentId: string;
  segmentName: string;
  totalClients: number;
  localKvaDist: number; 
  localKvaPoint: number; 
  downstreamKva: number; 
  momentKvaM: number; 
  voltageDropAbs: number; 
  voltageDropPercent: number; 
  accumulatedDropPercent: number;
  voltageAtEnd: number;
  iccKa: number; 
  currentAmp: number; 
  isCompliant: boolean;
  message: string;
}

export interface NetworkCalculationResult {
  segments: SegmentResult[];
  maxDropPercent: number;
  totalLength: number;
  totalDemandKva: number;
  trafoOcupation: number;
  dmdiClass: 'A' | 'B' | 'C' | 'D';
  isGlobalCompliant: boolean;
  suggestions: OptimizationSuggestion[];
}

export interface OptimizationSuggestion {
  segmentId: string;
  type: 'CABLE_UPGRADE' | 'SPLIT_CIRCUIT';
  description: string;
  currentConductorId: string;
  suggestedConductorId: string;
  improvementPercent: number;
}

export interface CableCalculationDetail {
  id: string;
  label: string;
  tensionPhases: number;
  tensionNeutral: number;
  fx: number;
  fy: number;
  angle: number;
  realSpan3D: number;
}

export interface MechanicalCalcResult {
  poleId: string;
  totalResultantDan: number;
  resultantAngle: number;
  nominalResistance: number;
  usagePercent: number;
  isCompliant: boolean;
  fxTotal: number;
  fyTotal: number;
  calculatedCables: CableCalculationDetail[];
}

// --- Data Structures for Map and UI ---

export type NodeStatus = 'ok' | 'warning' | 'critical' | 'neutral';

export interface PosteData {
  id: string;
  x: number;
  y: number;
  status: NodeStatus;
  resistenciaNominal: number;
  tipo: 'fisico' | 'fantasma';
  electrical?: SegmentResult;
  mechanical?: MechanicalCalcResult;
}

export interface MapEdge {
  id: string;
  sourceId: string;
  targetId: string;
  label?: string;
  status?: NodeStatus;
  conductorId?: string;
  lengthHorizontal: number;
  heightDiff: number;
}

// --- Missing Types for Modules ---

/**
 * Interface for demand factor lookup table
 */
export interface DemandCurve {
  min: number;
  max: number;
  classA: number;
  classB: number;
  classC: number;
  classD: number;
}

/**
 * Interface for technical normative rules
 */
export interface NormativeRule {
  id: string;
  code: string;
  description: string;
  value: number;
  unit: string;
  comparator: '<=' | '>=' | '==';
  source: string;
  versionDate: string;
}

/**
 * Interface for audit trail events
 */
export interface ProjectEvent {
  id: string;
  timestamp: string;
  userId: string;
  userRole: string;
  actionType: 'CALCULATION' | 'FIELD_UPDATE' | 'APPROVAL' | 'SNAPSHOT' | string;
  description: string;
  metadata: any;
  previousHash: string;
  hash: string;
}

/**
 * Interface for project version snapshots
 */
export interface ProjectSnapshot {
  id: string;
  version: string;
  createdAt: string;
  createdBy: string;
  hash: string;
  status: string;
  normativeVersion: string;
}

/**
 * Interface for AI diagnostics and alerts
 */
export interface IntelligenceAlert {
  id: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  description: string;
  category: 'ELECTRICAL' | 'MECHANICAL' | 'NORMATIVE';
  actionLabel?: string;
}

/**
 * Interface for sensitivity analysis results
 */
export interface SensitivityData {
  year: number;
  loadFactor: number;
  maxVoltageDrop: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

/**
 * Interface for scenario simulation results
 */
export interface ScenarioResult {
  id: string;
  name: string;
  type: 'CURRENT' | 'MIN_NORMATIVE' | 'OPTIMIZED';
  description: string;
  totalCost: number;
  complianceScore: number;
  maxVoltageDrop: number;
  maxMechanicalStress: number;
  lifespan: number;
}

/**
 * Interface for project approval metrics
 */
export interface ApprovalScore {
  total: number;
  technical: number;
  normative: number;
  historical: number;
  verdict: string;
}

/**
 * Interface for compliance matrix display
 */
export interface ComplianceItem {
  ruleId: string;
  ruleCode: string;
  description: string;
  limit: string;
  actualValue: string;
  status: 'OK' | 'VIOLATION';
}
