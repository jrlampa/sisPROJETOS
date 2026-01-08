
import React from 'react';
import { PosteData, MapEdge, NodeStatus } from '../types';

interface NetworkMapProps {
  nodes: PosteData[];
  edges: MapEdge[];
  onSelectNode: (node: PosteData) => void;
  onSelectEdge: (edge: MapEdge) => void;
}

export const NetworkMap: React.FC<NetworkMapProps> = ({ nodes, edges, onSelectNode, onSelectEdge }) => {
  const padding = 100;
  const minX = Math.min(...nodes.map(n => n.x)) - padding;
  const maxX = Math.max(...nodes.map(n => n.x)) + padding;
  const minY = Math.min(...nodes.map(n => n.y)) - padding;
  const maxY = Math.max(...nodes.map(n => n.y)) + padding;

  const width = maxX - minX;
  const height = maxY - minY;

  const getStatusRadius = (status: NodeStatus) => {
    switch (status) {
      case 'critical': return 12;
      case 'warning': return 9;
      case 'ok': return 7;
      default: return 5;
    }
  };

  const getStatusColor = (status: NodeStatus) => {
    switch (status) {
      case 'critical': return '#ef4444'; 
      case 'warning': return '#f59e0b';  
      case 'ok': return '#10b981';       
      default: return '#94a3b8';         
    }
  };

  return (
    <div className="w-full h-full bg-slate-50 relative overflow-hidden rounded-xl border border-slate-200 shadow-inner">
      <svg 
        viewBox={`${minX} ${minY} ${width} ${height}`} 
        className="w-full h-full touch-none"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Camada de Conexões (Vãos) */}
        {edges.map(edge => {
          const source = nodes.find(n => n.id === edge.sourceId);
          const target = nodes.find(n => n.id === edge.targetId);
          if (!source || !target) return null;

          return (
            <g key={edge.id} className="cursor-pointer group/edge" onClick={() => onSelectEdge(edge)}>
              {/* Hitbox larga para facilitar o clique */}
              <line 
                x1={source.x} y1={source.y}
                x2={target.x} y2={target.y}
                stroke="transparent"
                strokeWidth="15"
              />
              <line 
                x1={source.x} y1={source.y}
                x2={target.x} y2={target.y}
                stroke={edge.status === 'critical' ? "#ef4444" : "#cbd5e1"}
                strokeWidth="3"
                className="group-hover/edge:stroke-blue-400 group-hover/edge:stroke-[5] transition-all"
                strokeDasharray={edge.status === 'critical' ? "4,4" : "0"}
              />
            </g>
          );
        })}

        {/* Camada de Postes */}
        {nodes.map(node => {
          const radius = getStatusRadius(node.status);
          const color = getStatusColor(node.status);
          const isCritical = node.status === 'critical';

          return (
            <g key={node.id} className="cursor-pointer group" onClick={() => onSelectNode(node)}>
              <circle cx={node.x} cy={node.y} r={radius + 4} fill={color} fillOpacity="0" className="group-hover:fill-opacity-10 transition-all duration-300" />
              {isCritical && (
                <circle cx={node.x} cy={node.y} r={radius}>
                  <animate attributeName="r" from={radius} to={radius + 6} dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.6" to="0" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={node.x} cy={node.y} r={radius} fill={color} stroke="white" strokeWidth="2" className="transition-transform group-hover:scale-110" />
              <text x={node.x} y={node.y + radius + 14} textAnchor="middle" className="text-[10px] font-bold fill-slate-600 pointer-events-none select-none">{node.id}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
