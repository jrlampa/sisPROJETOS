
import { ProjectEvent, ProjectSnapshot } from '../types';

// Mock Blockchain/Hash generator
const generateHash = (data: string): string => {
  // Simple hash for demo purposes (DJB2 variant)
  let hash = 5381;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) + hash) + data.charCodeAt(i);
  }
  return (hash >>> 0).toString(16).padStart(64, '0');
};

export const createEvent = (
  userId: string,
  action: ProjectEvent['actionType'],
  desc: string,
  previousHash: string
): ProjectEvent => {
  const timestamp = new Date().toISOString();
  const rawData = `${timestamp}|${userId}|${action}|${desc}|${previousHash}`;
  
  return {
    id: `evt-${Date.now()}`,
    timestamp,
    userId,
    userRole: 'ENGINEER',
    actionType: action,
    description: desc,
    metadata: {},
    previousHash,
    hash: generateHash(rawData)
  };
};

export const MOCK_AUDIT_TRAIL: ProjectEvent[] = [
  {
    id: 'evt-1',
    timestamp: '2023-10-25T08:00:00Z',
    userId: 'SYSTEM',
    userRole: 'SYSTEM',
    actionType: 'CALCULATION',
    description: 'Projeto inicial criado via Importação DXF',
    metadata: {},
    hash: 'a1b2c3d4e5...',
    previousHash: '0000000000...'
  },
  {
    id: 'evt-2',
    timestamp: '2023-10-25T09:15:00Z',
    userId: 'joao.silva',
    userRole: 'ENGINEER',
    actionType: 'FIELD_UPDATE',
    description: 'Atualização de altimetria (SRTM) no vão V-03',
    metadata: { method: 'GPS_RTK' },
    hash: 'f6g7h8i9j0...',
    previousHash: 'a1b2c3d4e5...'
  },
  {
    id: 'evt-3',
    timestamp: '2023-10-25T10:30:00Z',
    userId: 'maria.campo',
    userRole: 'FIELD_TECH',
    actionType: 'FIELD_UPDATE',
    description: 'Foto de evidência adicionada ao Poste PT-04',
    metadata: { imgId: 'img-99' },
    hash: 'k1l2m3n4o5...',
    previousHash: 'f6g7h8i9j0...'
  }
];

export const MOCK_SNAPSHOTS: ProjectSnapshot[] = [
  {
    id: 'snap-v1',
    version: '1.0.0',
    createdAt: '2023-10-20T18:00:00Z',
    createdBy: 'joao.silva',
    hash: '8f7d6a5c4b3e2d1f...',
    status: 'APPROVED',
    normativeVersion: 'ENEL-2023-V2'
  },
  {
    id: 'snap-v2',
    version: '1.1.0',
    createdAt: '2023-10-26T14:30:00Z',
    createdBy: 'carlos.admin',
    hash: 'e2a1b9c8d7e6f5...',
    status: 'DRAFT',
    normativeVersion: 'ENEL-2023-V3 (Draft)'
  }
];
