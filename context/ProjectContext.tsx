
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PosteData, MapEdge } from '../types';

// Mock Data (moved from App.tsx)
const MOCK_NODES: PosteData[] = [
  { id: 'PT-01', x: 100, y: 100, status: 'ok', resistenciaNominal: 600, tipo: 'fisico', electrical: { segmentId: 's1', segmentName: 'TR-01', totalClients: 10, localKvaDist: 15, localKvaPoint: 0, downstreamKva: 0, momentKvaM: 100, voltageDropAbs: 2, voltageDropPercent: 1.2, accumulatedDropPercent: 1.2, voltageAtEnd: 217.4, currentAmp: 45, iccKa: 3, isCompliant: true, message: 'OK' } },
  { id: 'PT-02', x: 250, y: 120, status: 'warning', resistenciaNominal: 600, tipo: 'fisico', mechanical: { poleId: 'PT-02', totalResultantDan: 510, resultantAngle: 45, nominalResistance: 600, usagePercent: 85, isCompliant: true, fxTotal: 360, fyTotal: 360, calculatedCables: [] } },
  { id: 'PT-03', x: 400, y: 150, status: 'critical', resistenciaNominal: 300, tipo: 'fisico', electrical: { segmentId: 's3', segmentName: 'PT-02', totalClients: 20, localKvaDist: 30, localKvaPoint: 0, downstreamKva: 0, momentKvaM: 400, voltageDropAbs: 12, voltageDropPercent: 5.5, accumulatedDropPercent: 6.7, voltageAtEnd: 205.2, currentAmp: 110, iccKa: 2, isCompliant: false, message: 'Violação QT' } },
  { id: 'V-01', x: 250, y: 50, status: 'neutral', resistenciaNominal: 0, tipo: 'fantasma' },
];

const MOCK_EDGES: MapEdge[] = [
  { id: 'e1', sourceId: 'PT-01', targetId: 'PT-02', status: 'ok', conductorId: 'cal-70', lengthHorizontal: 40, heightDiff: 1.2 },
  { id: 'e2', sourceId: 'PT-02', targetId: 'PT-03', status: 'critical', conductorId: 'cal-35', lengthHorizontal: 50, heightDiff: 5.5 },
  { id: 'e3', sourceId: 'V-01', targetId: 'PT-02', status: 'ok', conductorId: 'cal-70', lengthHorizontal: 35, heightDiff: 0.5 },
];

interface ProjectContextType {
  nodes: PosteData[];
  edges: MapEdge[];
  selectedNode: PosteData | null;
  selectNode: (node: PosteData | null) => void;
  updateNode: (nodeId: string, updates: Partial<PosteData>) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [nodes, setNodes] = useState<PosteData[]>(MOCK_NODES);
  const [edges, setEdges] = useState<MapEdge[]>(MOCK_EDGES);
  const [selectedNode, setSelectedNode] = useState<PosteData | null>(null);

  const updateNode = (nodeId: string, updates: Partial<PosteData>) => {
    setNodes(currentNodes =>
      currentNodes.map(node =>
        node.id === nodeId ? { ...node, ...updates } : node
      )
    );
  };

  const selectNode = (node: PosteData | null) => {
    setSelectedNode(node);
  };

  const value = {
    nodes,
    edges,
    selectedNode,
    selectNode,
    updateNode,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
};
