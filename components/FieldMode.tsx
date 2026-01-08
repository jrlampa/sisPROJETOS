
import React, { useState, useEffect } from 'react';
import { 
  Wifi, WifiOff, MapPin, Camera, Save, RefreshCw, 
  Battery, UserCheck, PlusCircle, Navigation, CheckCircle2, Mountain, Ruler, ArrowRightLeft, Footprints,
  Sparkles, Smartphone, Menu, Layers, HardHat, AlertTriangle, CloudOff, Database,
  // Fix: Added missing X and Map (aliased as MapIcon) imports
  X, Map as MapIcon
} from 'lucide-react';
import { FieldQueueItem, GisFeature, GeoPoint } from '../types';
import { getElevationAsync, calculateSpanMetricsAsync } from '../services/gisService';

export const FieldMode: React.FC = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [queue, setQueue] = useState<FieldQueueItem[]>([]);
  const [activeTool, setActiveTool] = useState<'none' | 'pole' | 'span'>('none');
  const [formData, setFormData] = useState({ type: 'Concreto DT', height: '11', effort: '600', obs: '' });
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [spanP1, setSpanP1] = useState<GeoPoint | null>(null);
  const [spanP2, setSpanP2] = useState<GeoPoint | null>(null);
  const [spanMetrics, setSpanMetrics] = useState<{dist: number, drop: number, real: number} | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({ lat: -23.5878, lng: -46.6590, alt: 780 });

  useEffect(() => {
    const interval = setInterval(() => {
      setGpsAccuracy(Math.floor(Math.random() * 3) + 1); // Simular precisão industrial < 4m
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSavePole = async () => {
    setIsCalculating(true);
    const alt = await getElevationAsync(currentLocation.lat, currentLocation.lng);
    const newItem: FieldQueueItem = {
      id: `field-${Date.now()}`,
      status: 'PENDING',
      feature: {
        id: `pole-${Date.now()}`,
        type: 'POLE',
        coordinates: { ...currentLocation, alt },
        properties: formData,
        layer: 'PROJECTED',
        source: 'FIELD_TABLET',
        audit: { userId: 'TECH_LEO', timestamp: new Date().toISOString(), action: 'CREATE' }
      }
    };
    setQueue([newItem, ...queue]);
    setActiveTool('none');
    setIsCalculating(false);
  };

  const handleSync = () => {
    setIsOnline(true);
    setTimeout(() => {
      setQueue(prev => prev.map(i => ({ ...i, status: 'SYNCED' })));
      setTimeout(() => {
        setQueue(prev => prev.filter(i => i.status !== 'SYNCED'));
        setIsOnline(false);
      }, 2000);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 overflow-hidden font-sans">
      
      {/* Rugged Tablet Shell Header */}
      <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center text-white shadow-xl">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-amber-500 rounded-lg text-slate-900 font-black"><HardHat size={20}/></div>
           <div>
             <h1 className="text-sm font-black tracking-widest uppercase">CROQUI CAMPO v2.5</h1>
             <p className="text-[10px] text-slate-400 font-mono">ENEL_SP_CENTRO // OS#92831</p>
           </div>
        </div>
        <div className="flex items-center gap-6">
           <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 text-emerald-400">
                 <Navigation size={14} className="animate-pulse"/>
                 <span className="text-xs font-bold font-mono">±{gpsAccuracy}m RTK</span>
              </div>
              <div className="text-[9px] text-slate-500">SATS: 18 FIX: 3D</div>
           </div>
           <div className="flex items-center gap-2 border-l border-slate-700 pl-4">
              <Battery size={18} className="text-emerald-500" />
              <span className="text-xs font-bold">92%</span>
           </div>
        </div>
      </div>

      {/* Main Field Interface */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Connection & Storage Health */}
        <div className="grid grid-cols-2 gap-3">
           <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3 text-slate-400">
                 {isOnline ? <Wifi className="text-blue-400"/> : <WifiOff/>}
                 <span className="text-xs font-bold uppercase">{isOnline ? 'Online' : 'Offline'}</span>
              </div>
              <button onClick={handleSync} className="p-2 bg-blue-600 text-white rounded-lg"><RefreshCw size={16} className={isOnline ? 'animate-spin' : ''}/></button>
           </div>
           <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3 text-slate-400">
                 <Database/>
                 <span className="text-xs font-bold uppercase">{queue.length} Itens Salvos</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
           </div>
        </div>

        {activeTool === 'none' ? (
          <div className="grid grid-cols-1 gap-4">
             <button 
               onClick={() => setActiveTool('pole')}
               className="bg-slate-100 p-8 rounded-2xl flex flex-col items-center gap-4 border-b-8 border-slate-300 active:translate-y-1 active:border-b-0 transition-all"
             >
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl">
                   <PlusCircle size={40}/>
                </div>
                <span className="text-xl font-black text-slate-900 uppercase">Novo Poste</span>
             </button>

             <button 
               onClick={() => setActiveTool('span')}
               className="bg-slate-100 p-8 rounded-2xl flex flex-col items-center gap-4 border-b-8 border-slate-300 active:translate-y-1 active:border-b-0 transition-all"
             >
                <div className="w-20 h-20 bg-orange-600 rounded-full flex items-center justify-center text-white shadow-xl">
                   <Ruler size={40}/>
                </div>
                <span className="text-xl font-black text-slate-900 uppercase">Medir Vão</span>
             </button>

             <div className="grid grid-cols-2 gap-4">
                <button className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-col items-center gap-2 text-white">
                   <Camera size={24} className="text-indigo-400"/>
                   <span className="text-xs font-bold uppercase">Foto</span>
                </button>
                <button className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-col items-center gap-2 text-white">
                   <Layers size={24} className="text-emerald-400"/>
                   <span className="text-xs font-bold uppercase">Camadas</span>
                </button>
             </div>
          </div>
        ) : (
          <div className="bg-slate-100 rounded-2xl p-6 space-y-6 animate-in slide-in-from-bottom-10">
             <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                <h3 className="text-xl font-black text-slate-900 uppercase flex items-center gap-2">
                   {activeTool === 'pole' ? <PlusCircle className="text-blue-600"/> : <Ruler className="text-orange-600"/>}
                   Coleta: {activeTool === 'pole' ? 'Poste' : 'Vão'}
                </h3>
                <button onClick={() => setActiveTool('none')} className="p-2 bg-slate-200 rounded-full"><X size={24}/></button>
             </div>

             {activeTool === 'pole' && (
               <div className="space-y-6">
                  <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Estrutura</label>
                     <div className="grid grid-cols-2 gap-2">
                        {['Concreto DT', 'Concreto Circ', 'Fibra', 'Madeira'].map(t => (
                          <button 
                            key={t}
                            onClick={() => setFormData({...formData, type: t})}
                            className={`p-4 rounded-xl border-2 font-bold transition-all ${formData.type === t ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-slate-200 bg-white'}`}
                          >
                             {t}
                          </button>
                        ))}
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Altura (m)</label>
                        <input type="number" value={formData.height} className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl text-2xl font-black focus:border-blue-500 outline-none" readOnly />
                     </div>
                     <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Esforço (daN)</label>
                        <input type="number" value={formData.effort} className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl text-2xl font-black focus:border-blue-500 outline-none" readOnly />
                     </div>
                  </div>
                  
                  <div className="bg-slate-900 p-4 rounded-xl text-white flex justify-between items-center">
                     <div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase">Posição GPS Fixa</p>
                        <p className="text-xs font-mono">{currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-[9px] font-bold text-slate-500 uppercase">Altitude Estimada</p>
                        <p className="text-xs font-mono text-emerald-400 font-bold">782.45m</p>
                     </div>
                  </div>

                  <button 
                    onClick={handleSavePole}
                    disabled={isCalculating}
                    className="w-full py-6 bg-emerald-600 text-white text-2xl font-black rounded-2xl shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                  >
                    {isCalculating ? <RefreshCw className="animate-spin"/> : <Save size={32}/>}
                    SALVAR ATIVO
                  </button>
               </div>
             )}

             {activeTool === 'span' && (
               <div className="space-y-6 text-center py-12">
                  <Ruler size={64} className="mx-auto text-slate-300 mb-4" />
                  <p className="font-bold text-slate-500">Módulo de Medição Laser (Bluetooth)</p>
                  <p className="text-xs text-slate-400">Aguardando dados do dispositivo...</p>
                  <button onClick={() => setActiveTool('none')} className="px-8 py-3 bg-slate-200 rounded-full font-bold uppercase text-xs">Simular Medição</button>
               </div>
             )}
          </div>
        )}

        {/* Sync Queue */}
        {queue.length > 0 && activeTool === 'none' && (
          <div className="space-y-2 pb-12">
             <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Fila de Sincronização</h4>
             {queue.map(item => (
               <div key={item.id} className="bg-slate-800 p-4 rounded-2xl border border-slate-700 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center text-slate-400">
                        {item.feature.type === 'POLE' ? <MapPin size={20}/> : <Ruler size={20}/>}
                     </div>
                     <div>
                        <p className="text-white font-bold text-sm">Poste {item.feature.properties.type}</p>
                        <p className="text-[10px] text-slate-500 font-mono">LAT: {item.feature.coordinates.lat.toFixed(4)}... // ALT: {item.feature.coordinates.alt}m</p>
                     </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${item.status === 'PENDING' ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                     {item.status === 'PENDING' ? 'Local' : 'Sincronizado'}
                  </div>
               </div>
             ))}
          </div>
        )}
      </div>

      {/* Bottom Tablet Nav Bar */}
      <div className="bg-slate-800 p-2 flex justify-around border-t border-slate-700 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
         <button className="p-4 text-blue-400 bg-slate-900 rounded-xl border border-slate-700 shadow-inner"><Menu size={24}/></button>
         <button className="p-4 text-slate-400 hover:text-white transition-colors"><MapIcon size={24}/></button>
         <button className="p-4 text-slate-400 hover:text-white transition-colors"><Smartphone size={24}/></button>
         <button className="p-4 text-slate-400 hover:text-white transition-colors"><RefreshCw size={24}/></button>
      </div>

    </div>
  );
};
