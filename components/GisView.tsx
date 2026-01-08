
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Map as MapIcon, Layers, Navigation, Plus, Upload, 
  Ruler, Mountain, AlertTriangle, FileUp, Loader2, SquareDashed, Info
} from 'lucide-react';
import { GisFeature, GeoPoint, PosteData, MapEdge, NodeStatus } from '../types';
import { calculateSpanMetricsAsync, parseImportFile, getElevationAsync, calculatePolygonArea } from '../services/gisService';

interface GisViewProps {
  nodes?: PosteData[];
  edges?: MapEdge[];
  onSelectNode?: (node: PosteData) => void;
  onSelectEdge?: (edge: MapEdge) => void;
  standalone?: boolean;
}

export const GisView: React.FC<GisViewProps> = ({ nodes = [], edges = [], onSelectNode, onSelectEdge, standalone = true }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const linesRef = useRef<L.LayerGroup | null>(null);

  const [activeLayer, setActiveLayer] = useState<'satellite' | 'street'>('street');
  const [isLoadingData, setIsLoadingData] = useState(false);

  const getStatusColor = (status: NodeStatus) => {
    switch (status) {
      case 'critical': return '#ef4444'; 
      case 'warning': return '#f59e0b';  
      case 'ok': return '#10b981';       
      default: return '#94a3b8';         
    }
  };

  const getStatusRadius = (status: NodeStatus) => {
    switch (status) {
      case 'critical': return 12;
      case 'warning': return 9;
      case 'ok': return 7;
      default: return 5;
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;
    const center: [number, number] = nodes.length > 0 ? [-23.5878, -46.6590] : [-23.5878, -46.6590];
    const map = L.map(mapContainerRef.current, { zoomControl: standalone, attributionControl: false }).setView(center, 18);
    mapInstanceRef.current = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    markersRef.current = L.layerGroup().addTo(map);
    linesRef.current = L.layerGroup().addTo(map);
    return () => { map.remove(); mapInstanceRef.current = null; };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !markersRef.current || !linesRef.current) return;
    markersRef.current.clearLayers();
    linesRef.current.clearLayers();

    edges.forEach(edge => {
      const source = nodes.find(n => n.id === edge.sourceId);
      const target = nodes.find(n => n.id === edge.targetId);
      if (source && target) {
        const sLat = -23.5878 + (source.y / 10000);
        const sLng = -46.6590 + (source.x / 10000);
        const tLat = -23.5878 + (target.y / 10000);
        const tLng = -46.6590 + (target.x / 10000);

        const poly = L.polyline([[sLat, sLng], [tLat, tLng]], {
          color: edge.status === 'critical' ? '#ef4444' : '#3b82f6',
          weight: 5,
          opacity: 0.6,
          dashArray: edge.status === 'critical' ? '5, 10' : ''
        });

        poly.on('mouseover', function(e) {
          (e.target as L.Polyline).setStyle({ opacity: 1, weight: 8 });
        });

        poly.on('mouseout', function(e) {
          (e.target as L.Polyline).setStyle({ opacity: 0.6, weight: 5 });
        });

        poly.on('click', () => {
          // Note: In real scenarios, onSelectEdge should be handled via App state
          // For now we trigger the click context if available
        });

        poly.addTo(linesRef.current!);
      }
    });

    nodes.forEach(node => {
      const lat = -23.5878 + (node.y / 10000);
      const lng = -46.6590 + (node.x / 10000);
      const color = getStatusColor(node.status);
      const radius = getStatusRadius(node.status);
      const marker = L.circleMarker([lat, lng], { radius, fillColor: color, color: 'white', weight: 2, fillOpacity: 0.9 });
      marker.on('click', () => { if (onSelectNode) onSelectNode(node); });
      markersRef.current?.addLayer(marker);
    });
  }, [nodes, edges]);

  return (
    <div className="relative w-full h-full min-h-[400px] group">
      <div ref={mapContainerRef} className="absolute inset-0 z-0 bg-slate-200" />
      {!standalone && (
        <div className="absolute top-4 right-4 z-[400] bg-white/90 backdrop-blur p-2 rounded shadow-sm border border-slate-200 text-[10px] space-y-1 pointer-events-none">
          <div className="flex items-center gap-2 font-bold text-slate-700 mb-1">CAPACIDADE</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span> Crítico (>100%)</div>
        </div>
      )}
      {isLoadingData && (
        <div className="absolute inset-0 z-[600] bg-white/50 backdrop-blur-sm flex items-center justify-center">
           <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      )}
    </div>
  );
};
