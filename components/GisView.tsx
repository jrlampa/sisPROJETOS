
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Map as MapIcon, Layers, Navigation, Plus, Upload, 
  Ruler, Mountain, AlertTriangle, FileUp, Loader2, SquareDashed, Info,
  MousePointer2, MapPin, Share2, Search, Filter, ChevronRight, X
} from 'lucide-react';
import { MapEdge, NodeStatus } from '../types';
import { useProjectContext } from '../context/ProjectContext';

interface GisViewProps {
  onSelectEdge?: (edge: MapEdge) => void;
  standalone?: boolean;
}

type MapTool = 'select' | 'add-pole' | 'add-span' | 'measure';

export const GisView: React.FC<GisViewProps> = ({ 
  onSelectEdge,
  standalone = true 
}) => {
  const { nodes, edges, selectNode } = useProjectContext();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const linesRef = useRef<L.LayerGroup | null>(null);

  const [activeTool, setActiveTool] = useState<MapTool>('select');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [cursorCoords, setCursorCoords] = useState<{lat: number, lng: number} | null>(null);

  const getStatusColor = (status: NodeStatus) => {
    switch (status) {
      case 'critical': return '#ef4444'; 
      case 'warning': return '#f59e0b';  
      case 'ok': return '#10b981';       
      default: return '#94a3b8';         
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;
    
    const center: [number, number] = nodes.length > 0 ? [-23.5878, -46.6590] : [-23.5878, -46.6590];
    const map = L.map(mapContainerRef.current, { 
      zoomControl: false, 
      attributionControl: false 
    }).setView(center, 18);
    
    mapInstanceRef.current = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    
    markersRef.current = L.layerGroup().addTo(map);
    linesRef.current = L.layerGroup().addTo(map);

    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setCursorCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      if (activeTool === 'add-pole') {
        console.log("Add pole at", e.latlng);
        // Implementação de adição de novo nó aqui
      }
    });

    return () => { map.remove(); mapInstanceRef.current = null; };
  }, [activeTool, nodes.length]);

  useEffect(() => {
    if (!mapInstanceRef.current || !markersRef.current || !linesRef.current) return;
    markersRef.current.clearLayers();
    linesRef.current.clearLayers();

    // Vãos (Edges)
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
        }).addTo(linesRef.current!);

        poly.on('click', () => { if (onSelectEdge) onSelectEdge(edge); });
      }
    });

    // Postes (Nodes)
    nodes.forEach(node => {
      const lat = -23.5878 + (node.y / 10000);
      const lng = -46.6590 + (node.x / 10000);
      const color = getStatusColor(node.status);
      
      const marker = L.circleMarker([lat, lng], { 
        radius: node.status === 'critical' ? 12 : 8, 
        fillColor: color, 
        color: 'white', 
        weight: 2, 
        fillOpacity: 0.9,
        interactive: true
      });

      marker.on('click', (e) => { 
        L.DomEvent.stopPropagation(e);
        selectNode(node); 
      });

      markersRef.current?.addLayer(marker);
    });
  }, [nodes, edges, activeTool, selectNode, onSelectEdge]);

  const filteredNodes = nodes.filter(n => n.id.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="relative w-full h-full flex overflow-hidden rounded-xl border border-slate-200 shadow-lg bg-slate-50">
      
      {isSidebarOpen && (
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col z-10 shadow-xl animate-in slide-in-from-left duration-300">
           <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-slate-800 flex items-center gap-2"><Layers size={18} className="text-blue-600"/> Inventário Geográfico</h3>
                 <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={18}/></button>
              </div>
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14}/>
                 <input 
                   type="text" 
                   placeholder="Buscar poste ou trecho..." 
                   className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                 />
              </div>
           </div>
           
           <div className="flex-1 overflow-y-auto">
              <div className="p-2 space-y-1">
                 {filteredNodes.map(node => (
                   <button 
                     key={node.id} 
                     onClick={() => selectNode(node)}
                     className="w-full p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 flex items-center justify-between group transition"
                   >
                     <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(node.status)}`}></div>
                        <div className="text-left">
                           <p className="font-bold text-slate-700 text-sm">{node.id}</p>
                           <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Status: {node.status}</p>
                        </div>
                     </div>
                     <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-500 transition"/>
                   </button>
                 ))}
                 {filteredNodes.length === 0 && (
                   <div className="py-12 text-center text-slate-400">
                      <Search size={32} className="mx-auto mb-2 opacity-20"/>
                      <p className="text-xs">Nenhum ativo encontrado</p>
                   </div>
                 )}
              </div>
           </div>
           
           <div className="p-4 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-500 flex justify-between font-mono">
              <span>NÓS: {nodes.length}</span>
              <span>ARESTAS: {edges.length}</span>
           </div>
        </div>
      )}

      <div className="flex-1 relative">
        <div ref={mapContainerRef} className="absolute inset-0 z-0 bg-slate-100" />

        <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2">
           {!isSidebarOpen && (
             <button onClick={() => setIsSidebarOpen(true)} className="p-3 bg-white rounded-xl shadow-lg border border-slate-200 text-slate-600 hover:bg-slate-50"><Layers size={20}/></button>
           )}
           <div className="bg-white p-1 rounded-xl shadow-xl border border-slate-200 flex flex-col gap-1">
             <button 
               onClick={() => setActiveTool('select')} 
               className={`p-3 rounded-lg transition ${activeTool === 'select' ? 'bg-blue-600 text-white shadow-inner' : 'text-slate-400 hover:bg-slate-100'}`}
               title="Selecionar / Mover"
             >
               <MousePointer2 size={20}/>
             </button>
             <button 
               onClick={() => setActiveTool('add-pole')} 
               className={`p-3 rounded-lg transition ${activeTool === 'add-pole' ? 'bg-emerald-600 text-white shadow-inner' : 'text-slate-400 hover:bg-slate-100'}`}
               title="Adicionar Poste"
             >
               <MapPin size={20}/>
             </button>
             <button 
               onClick={() => setActiveTool('add-span')} 
               className={`p-3 rounded-lg transition ${activeTool === 'add-span' ? 'bg-orange-600 text-white shadow-inner' : 'text-slate-400 hover:bg-slate-100'}`}
               title="Desenhar Vão"
             >
               <Share2 size={20}/>
             </button>
             <div className="h-px bg-slate-100 my-1"></div>
             <button 
               onClick={() => setActiveTool('measure')} 
               className={`p-3 rounded-lg transition ${activeTool === 'measure' ? 'bg-slate-800 text-white shadow-inner' : 'text-slate-400 hover:bg-slate-100'}`}
               title="Medir Distância/Área"
             >
               <Ruler size={20}/>
             </button>
           </div>
        </div>

        {activeTool !== 'select' && (
          <div className="absolute top-4 left-24 z-[400] bg-slate-900/90 text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl animate-in fade-in slide-in-from-left-4">
             {activeTool === 'add-pole' && "Clique no mapa para posicionar um novo poste"}
             {activeTool === 'add-span' && "Clique no poste de origem e depois no destino"}
             {activeTool === 'measure' && "Clique em pontos para medir áreas e perímetros"}
          </div>
        )}

        <div className="absolute bottom-4 right-4 z-[400] flex items-center gap-3">
           {cursorCoords && (
             <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-lg border border-slate-200 shadow-lg text-[10px] font-mono flex gap-4">
                <div className="flex items-center gap-2 text-slate-500">
                   <Navigation size={12} className="text-blue-500"/>
                   LAT: <span className="text-slate-800 font-bold">{cursorCoords.lat.toFixed(6)}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                   LNG: <span className="text-slate-800 font-bold">{cursorCoords.lng.toFixed(6)}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 border-l pl-4">
                   <Mountain size={12} className="text-orange-500"/>
                   ALT: <span className="text-slate-800 font-bold">782.4m</span>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
