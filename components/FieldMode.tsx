
import React, { useState, useEffect } from 'react';
import { 
  Wifi, WifiOff, MapPin, Camera, Save, RefreshCw, 
  Battery, UserCheck, PlusCircle, Navigation, CheckCircle2, Mountain, Ruler, ArrowRightLeft, Footprints,
  Sparkles
} from 'lucide-react';
import { FieldQueueItem, GisFeature, GeoPoint } from '../types';
import { getElevationAsync, calculateSpanMetricsAsync } from '../services/gisService';

export const FieldMode: React.FC = () => {
  const [isOnline, setIsOnline] = useState(false); // Simulate Offline First
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [queue, setQueue] = useState<FieldQueueItem[]>([]);
  
  // Tools state
  const [activeTool, setActiveTool] = useState<'none' | 'pole' | 'span'>('none');

  // Pole Form Data
  const [formData, setFormData] = useState({ 
    type: 'Concreto DT', 
    height: '11', 
    effort: '600', 
    obs: '' 
  });

  // Field Intelligence State
  const [suggestion, setSuggestion] = useState<string | null>(null);

  // Field Intelligence Logic: Watch for changes and suggest norms
  useEffect(() => {
    if (activeTool === 'pole') {
      const h = parseInt(formData.height);
      if (formData.type.includes('DT') && h < 10 && h > 0) {
        setSuggestion('Norma Enel: Postes Duplo T devem ter altura mínima de 10m em via pública.');
      } else if (formData.type.includes('Circular') && h < 9 && h > 0) {
        setSuggestion('Recomendação: Altura mínima usual para Circular é 9m.');
      } else {
        setSuggestion(null);
      }
    }
  }, [formData, activeTool]);
  
  // Span Measurement State
  const [spanP1, setSpanP1] = useState<GeoPoint | null>(null);
  const [spanP2, setSpanP2] = useState<GeoPoint | null>(null);
  const [spanMetrics, setSpanMetrics] = useState<{dist: number, drop: number, real: number} | null>(null);
  const [isCalculatingSpan, setIsCalculatingSpan] = useState(false);

  // GPS Simulation
  const [currentLocation, setCurrentLocation] = useState({ lat: -23.55, lng: -46.63, alt: 0 });
  const [isCalculatingAlt, setIsCalculatingAlt] = useState(false);

  // Simulate GPS Locking
  useEffect(() => {
    const interval = setInterval(() => {
      // Mock fluctuating GPS accuracy
      setGpsAccuracy(Math.floor(Math.random() * 5) + 3); 
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const simulateWalk = () => {
    // Simulates walking ~45m to the Northeast
    setCurrentLocation(prev => ({
        lat: prev.lat + 0.00035, 
        lng: prev.lng + 0.00015,
        alt: 0
    }));
  };

  const handleSavePole = async () => {
    setIsCalculatingAlt(true);
    
    // 1. Get accurate Altitude from Service (SRTM Integration)
    const accurateAlt = await getElevationAsync(currentLocation.lat, currentLocation.lng);
    
    setIsCalculatingAlt(false);

    const newItem: FieldQueueItem = {
      id: `local-${Date.now()}`,
      status: 'PENDING',
      feature: {
        id: `temp-${Date.now()}`,
        type: 'POLE',
        coordinates: { 
          lat: currentLocation.lat, 
          lng: currentLocation.lng, 
          alt: accurateAlt 
        }, 
        properties: {
          ...formData,
          elevationSource: 'SRTM_V3_AUTO'
        },
        layer: 'EXISTING',
        source: 'MANUAL',
        audit: {
          userId: 'TECH_01',
          timestamp: new Date().toISOString(),
          action: 'CREATE',
          gpsAccuracy: gpsAccuracy || 10
        }
      }
    };
    setQueue(prev => [...prev, newItem]);
    setActiveTool('none');
  };

  const handleCaptureSpanPoint = async (point: 'p1' | 'p2') => {
      setIsCalculatingSpan(true);
      const alt = await getElevationAsync(currentLocation.lat, currentLocation.lng);
      const p = { ...currentLocation, alt };
      
      if (point === 'p1') {
          setSpanP1(p);
          setSpanP2(null);
          setSpanMetrics(null);
      } else {
          setSpanP2(p);
          if (spanP1) {
              const metrics = await calculateSpanMetricsAsync(spanP1, p);
              setSpanMetrics({
                  dist: metrics.horizontalDist,
                  drop: metrics.heightDiff,
                  real: metrics.realDist
              });
          }
      }
      setIsCalculatingSpan(false);
  };

  const handleSaveSpan = () => {
      if (!spanP1 || !spanP2 || !spanMetrics) return;

      const newItem: FieldQueueItem = {
        id: `local-span-${Date.now()}`,
        status: 'PENDING',
        feature: {
          id: `temp-span-${Date.now()}`,
          type: 'SPAN',
          coordinates: [spanP1, spanP2], 
          properties: {
             length: spanMetrics.real,
             drop: spanMetrics.drop,
             type: 'Multiplex 35mm',
             elevationSource: 'SRTM_V3_AUTO'
          },
          layer: 'EXISTING',
          source: 'MANUAL',
          audit: {
            userId: 'TECH_01',
            timestamp: new Date().toISOString(),
            action: 'CREATE',
            gpsAccuracy: gpsAccuracy || 10
          }
        }
      };
      setQueue(prev => [...prev, newItem]);
      setActiveTool('none');
      setSpanP1(null);
      setSpanP2(null);
      setSpanMetrics(null);
  };

  const handleSync = () => {
    setIsOnline(true);
    setTimeout(() => {
      setQueue(prev => prev.map(item => ({ ...item, status: 'SYNCED' })));
      setTimeout(() => {
        setQueue(prev => prev.filter(item => item.status !== 'SYNCED'));
        setIsOnline(false);
      }, 2000);
    }, 1500);
  };

  return (
    <div className="bg-slate-100 min-h-screen pb-20">
      {/* Tablet Header */}
      <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-lg sticky top-0 z-50">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <UserCheck className="text-green-400" /> MODO TÉCNICO DE CAMPO
          </h1>
          <p className="text-xs text-slate-400">Croqui Digital - OS #49281</p>
        </div>
        <div className="flex items-center gap-4">
           <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${gpsAccuracy && gpsAccuracy < 5 ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
             <Navigation size={14} className={gpsAccuracy && gpsAccuracy < 5 ? '' : 'animate-pulse'}/>
             GPS: {gpsAccuracy ? `±${gpsAccuracy}m` : 'Buscando...'}
           </div>
           <div className="flex items-center gap-2 text-xs">
             <Battery size={16} className="text-green-400" /> 84%
           </div>
        </div>
      </div>

      {/* Main Action Area */}
      <div className="p-4 max-w-3xl mx-auto space-y-6">
        
        {/* Sync Status Banner */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex justify-between items-center">
           <div className="flex items-center gap-3">
             <div className={`p-3 rounded-full ${isOnline ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
               {isOnline ? <Wifi size={24}/> : <WifiOff size={24}/>}
             </div>
             <div>
               <h3 className="font-bold text-slate-800">{isOnline ? 'Conectado' : 'Modo Offline'}</h3>
               <p className="text-sm text-slate-500">{queue.filter(i => i.status === 'PENDING').length} itens aguardando sincronização</p>
             </div>
           </div>
           <button 
             onClick={handleSync}
             disabled={queue.length === 0}
             className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition ${
               queue.length > 0 
               ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' 
               : 'bg-slate-200 text-slate-400 cursor-not-allowed'
             }`}
           >
             <RefreshCw size={20} className={isOnline ? 'animate-spin' : ''} />
             Sincronizar
           </button>
        </div>

        {/* --- GRID OF TOOLS --- */}
        {activeTool === 'none' && (
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setActiveTool('pole')}
              className="bg-white p-8 rounded-xl shadow-sm border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition flex flex-col items-center justify-center gap-4 group"
            >
              <div className="p-4 bg-blue-100 text-blue-600 rounded-full group-hover:bg-blue-200 group-hover:scale-110 transition">
                <PlusCircle size={48} />
              </div>
              <span className="text-lg font-bold text-slate-700">Adicionar Poste</span>
            </button>

            <button 
              onClick={() => setActiveTool('span')}
              className="bg-white p-8 rounded-xl shadow-sm border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition flex flex-col items-center justify-center gap-4 group"
            >
              <div className="p-4 bg-orange-100 text-orange-600 rounded-full group-hover:bg-orange-200 group-hover:scale-110 transition">
                <Ruler size={48} />
              </div>
              <span className="text-lg font-bold text-slate-700">Medir Vão (3D)</span>
            </button>

            <button className="bg-white p-8 rounded-xl shadow-sm border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition flex flex-col items-center justify-center gap-4 group">
              <div className="p-4 bg-purple-100 text-purple-600 rounded-full group-hover:bg-purple-200 group-hover:scale-110 transition">
                <Camera size={48} />
              </div>
              <span className="text-lg font-bold text-slate-700">Foto / Evidência</span>
            </button>
            
            {/* Dev Helper */}
            <button onClick={simulateWalk} className="bg-slate-200 p-8 rounded-xl border-2 border-slate-300 hover:bg-slate-300 transition flex flex-col items-center justify-center gap-4 text-slate-500">
               <Footprints size={48} />
               <span className="text-sm font-bold">Simular Caminhada (+40m)</span>
            </button>
          </div>
        )}

        {/* --- POLE FORM --- */}
        {activeTool === 'pole' && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-in zoom-in-95">
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
               <h3 className="font-bold text-lg">Novo Ativo: Poste</h3>
               <button onClick={() => setActiveTool('none')} className="text-slate-400 font-bold text-lg px-4">✕</button>
            </div>
            <div className="p-6 space-y-6">
               
               {/* Field Intelligence Suggestion */}
               {suggestion && (
                 <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-lg flex gap-3 animate-in slide-in-from-top-2">
                    <div className="bg-indigo-100 p-1.5 rounded-full h-fit text-indigo-600">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-indigo-700 uppercase mb-1">Inteligência de Campo</p>
                      <p className="text-sm text-slate-700">{suggestion}</p>
                    </div>
                 </div>
               )}

               <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Tipo</label>
                    <div className="grid grid-cols-1 gap-2">
                       {['Concreto DT', 'Concreto Circ', 'Madeira', 'Fibra'].map(t => (
                         <button 
                           key={t}
                           onClick={() => setFormData({...formData, type: t})}
                           className={`p-3 rounded border text-left font-bold ${formData.type === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200 text-slate-700'}`}
                         >
                           {t}
                         </button>
                       ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Altura (m)</label>
                      <input 
                         type="number" 
                         className="w-full p-4 text-xl font-mono border-2 border-slate-200 rounded-lg focus:border-blue-500 outline-none" 
                         value={formData.height}
                         onChange={e => setFormData({...formData, height: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Esforço (daN)</label>
                      <input 
                         type="number" 
                         className="w-full p-4 text-xl font-mono border-2 border-slate-200 rounded-lg focus:border-blue-500 outline-none" 
                         value={formData.effort}
                         onChange={e => setFormData({...formData, effort: e.target.value})}
                      />
                    </div>
                  </div>
               </div>

               <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold flex items-center gap-1"><MapPin size={10}/> Localização GPS</p>
                    <p className="font-mono text-sm text-slate-800">{currentLocation.lat.toFixed(5)}, {currentLocation.lng.toFixed(5)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase font-bold flex items-center gap-1 justify-end"><Mountain size={10}/> Altimetria Automática</p>
                    <p className="font-mono text-sm text-blue-700 font-bold">
                       {isCalculatingAlt ? 'Calculando...' : 'SRTM / LiDAR'}
                    </p>
                  </div>
               </div>
               
               <div className="pt-4 border-t border-slate-100">
                 <button 
                   onClick={handleSavePole}
                   disabled={isCalculatingAlt}
                   className="w-full py-4 bg-green-600 text-white text-xl font-bold rounded-lg hover:bg-green-700 shadow-md flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-wait"
                 >
                   {isCalculatingAlt ? <RefreshCw className="animate-spin"/> : <Save size={24} />}
                   {isCalculatingAlt ? 'Obtendo Altitude...' : 'Salvar no Croqui'}
                 </button>
               </div>
            </div>
          </div>
        )}

        {/* --- SPAN MEASUREMENT TOOL --- */}
        {activeTool === 'span' && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-in zoom-in-95">
             <div className="bg-orange-50 p-4 border-b border-orange-100 flex justify-between items-center">
               <h3 className="font-bold text-lg text-orange-800 flex items-center gap-2"><Ruler size={20}/> Medição de Vão & Desnível</h3>
               <button onClick={() => { setActiveTool('none'); setSpanP1(null); setSpanP2(null); setSpanMetrics(null); }} className="text-orange-400 font-bold text-lg px-4">✕</button>
            </div>
            <div className="p-6 space-y-6">
               
               <div className="grid grid-cols-2 gap-4 relative">
                  {/* Point 1 */}
                  <div className={`p-4 rounded-lg border-2 transition ${spanP1 ? 'border-green-500 bg-green-50' : 'border-slate-200 border-dashed'}`}>
                     <p className="text-xs font-bold text-slate-500 uppercase mb-2">Ponto A (Origem)</p>
                     {spanP1 ? (
                       <div>
                         <p className="font-mono font-bold text-slate-800 flex items-center gap-2"><CheckCircle2 size={16} className="text-green-600"/> Capturado</p>
                         <p className="text-xs text-slate-500 mt-1">Z: {spanP1.alt}m</p>
                       </div>
                     ) : (
                       <button 
                         onClick={() => handleCaptureSpanPoint('p1')} 
                         className="w-full py-3 bg-slate-800 text-white rounded font-bold hover:bg-slate-700"
                         disabled={isCalculatingSpan}
                       >
                         Capturar Posição Atual
                       </button>
                     )}
                  </div>

                  {/* Arrow Icon */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-1 rounded-full border shadow-sm z-10">
                     <ArrowRightLeft size={16} className="text-slate-400" />
                  </div>

                  {/* Point 2 */}
                  <div className={`p-4 rounded-lg border-2 transition ${spanP2 ? 'border-green-500 bg-green-50' : 'border-slate-200 border-dashed'}`}>
                     <p className="text-xs font-bold text-slate-500 uppercase mb-2">Ponto B (Destino)</p>
                     {spanP2 ? (
                       <div>
                         <p className="font-mono font-bold text-slate-800 flex items-center gap-2"><CheckCircle2 size={16} className="text-green-600"/> Capturado</p>
                         <p className="text-xs text-slate-500 mt-1">Z: {spanP2.alt}m</p>
                       </div>
                     ) : (
                       <button 
                         onClick={() => handleCaptureSpanPoint('p2')} 
                         className="w-full py-3 bg-slate-800 text-white rounded font-bold hover:bg-slate-700"
                         disabled={!spanP1 || isCalculatingSpan}
                       >
                         Capturar Posição Atual
                       </button>
                     )}
                  </div>
               </div>

               {isCalculatingSpan && (
                 <div className="text-center py-4 text-blue-600 font-bold flex justify-center items-center gap-2">
                   <RefreshCw className="animate-spin" /> Processando Topografia...
                 </div>
               )}

               {/* RESULTS */}
               {spanMetrics && (
                 <div className="bg-slate-800 rounded-lg p-4 text-white animate-in slide-in-from-bottom-4">
                    <h4 className="font-bold border-b border-slate-700 pb-2 mb-4">Resultado da Medição</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                       <div>
                         <p className="text-[10px] uppercase text-slate-400 font-bold">Dist. Horizontal</p>
                         <p className="text-2xl font-mono">{spanMetrics.dist}m</p>
                       </div>
                       <div className="relative">
                         <div className="absolute -left-2 top-2 bottom-2 w-px bg-slate-700"></div>
                         <p className="text-[10px] uppercase text-orange-400 font-bold flex items-center justify-center gap-1"><Mountain size={12}/> Desnível</p>
                         <p className="text-2xl font-mono text-orange-400">{spanMetrics.drop}m</p>
                         <div className="absolute -right-2 top-2 bottom-2 w-px bg-slate-700"></div>
                       </div>
                       <div>
                         <p className="text-[10px] uppercase text-slate-400 font-bold">Vão Real 3D</p>
                         <p className="text-2xl font-mono">{spanMetrics.real}m</p>
                       </div>
                    </div>
                 </div>
               )}

               <div className="pt-2 border-t border-slate-100 flex gap-4">
                 <button onClick={simulateWalk} className="flex-1 py-3 border-2 border-slate-200 text-slate-500 font-bold rounded hover:bg-slate-50 flex items-center justify-center gap-2">
                   <Footprints size={18} /> Mover 40m (Sim)
                 </button>
                 <button 
                   onClick={handleSaveSpan}
                   disabled={!spanMetrics}
                   className="flex-[2] py-3 bg-green-600 text-white font-bold rounded hover:bg-green-700 shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   <Save size={20} /> Salvar Vão
                 </button>
               </div>

            </div>
          </div>
        )}

        {/* Sync Queue List */}
        {queue.length > 0 && (
          <div className="space-y-2">
             <h3 className="font-bold text-slate-500 text-sm uppercase px-2">Fila de Sincronização</h3>
             {queue.map((item, i) => (
               <div key={item.id} className="bg-white p-4 rounded-lg border border-slate-200 flex justify-between items-center animate-in slide-in-from-bottom-2">
                  <div>
                    <p className="font-bold text-slate-800">
                      {item.feature.type === 'POLE' ? `${item.feature.properties.type} ${item.feature.properties.height}m` : `Vão BT ${item.feature.properties.length}m`}
                    </p>
                    <div className="flex gap-4">
                       <p className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin size={10}/> 
                          {Array.isArray(item.feature.coordinates) 
                             ? `${item.feature.coordinates[0].lat.toFixed(4)}...` // Show Span Coords
                             : `${item.feature.coordinates.lat.toFixed(5)}, ${item.feature.coordinates.lng.toFixed(5)}`
                          }
                       </p>
                       {item.feature.properties.drop !== undefined && (
                         <p className="text-xs text-orange-600 font-bold flex items-center gap-1">
                            <Mountain size={10}/> ΔZ: {item.feature.properties.drop}m
                         </p>
                       )}
                       {!Array.isArray(item.feature.coordinates) && item.feature.coordinates.alt && (
                          <p className="text-xs text-blue-600 font-bold flex items-center gap-1">
                             <Mountain size={10}/> Z: {item.feature.coordinates.alt}m
                          </p>
                       )}
                    </div>
                  </div>
                  <div>
                    {item.status === 'PENDING' && <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded">Pendente</span>}
                    {item.status === 'SYNCED' && <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1"><CheckCircle2 size={12}/> Enviado</span>}
                  </div>
               </div>
             ))}
          </div>
        )}

      </div>
    </div>
  );
};
