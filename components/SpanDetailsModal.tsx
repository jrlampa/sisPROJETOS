
import React from 'react';
import { X, Ruler, Zap, Mountain, Activity, Info } from 'lucide-react';
import { MapEdge, Conductor } from '../types';
import { CONDUCTORS_DB } from '../constants';

interface SpanDetailsModalProps {
  edge: MapEdge | null;
  onClose: () => void;
}

export const SpanDetailsModal: React.FC<SpanDetailsModalProps> = ({ edge, onClose }) => {
  if (!edge) return null;

  const conductor = CONDUCTORS_DB.find(c => c.id === edge.conductorId);
  const realSpan3D = Math.sqrt(Math.pow(edge.lengthHorizontal, 2) + Math.pow(edge.heightDiff, 2));

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-slate-800 p-4 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Ruler size={20} />
            </div>
            <div>
              <h3 className="font-bold">Detalhes do Vão: {edge.sourceId} → {edge.targetId}</h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Infraestrutura de Rede BT</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Vão Horizontal</p>
              <p className="text-xl font-mono font-bold text-slate-800">{edge.lengthHorizontal}m</p>
            </div>
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl text-center">
              <p className="text-[10px] text-orange-400 uppercase font-bold mb-1 flex items-center justify-center gap-1"><Mountain size={10}/> Desnível (ΔZ)</p>
              <p className="text-xl font-mono font-bold text-orange-600">{edge.heightDiff}m</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex justify-between items-center">
             <div>
               <p className="text-[10px] text-blue-400 uppercase font-bold">Vão Real Geométrico (3D)</p>
               <p className="text-2xl font-mono font-bold text-blue-700">{realSpan3D.toFixed(2)}m</p>
             </div>
             <div className="h-10 w-px bg-blue-200"></div>
             <div className="text-right">
               <p className="text-[10px] text-blue-400 uppercase font-bold">Condutor Instalado</p>
               <p className="font-bold text-slate-800">{conductor?.name || 'Não definido'}</p>
             </div>
          </div>

          <div className="space-y-3">
             <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Zap size={14} className="text-yellow-500"/> Capacidade Elétrica</h4>
             <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex justify-between p-2 border-b">
                   <span className="text-slate-500">Capacidade Térmica:</span>
                   <span className="font-bold">{conductor?.ampacity} A</span>
                </div>
                <div className="flex justify-between p-2 border-b">
                   <span className="text-slate-500">Resistência:</span>
                   <span className="font-bold">{conductor?.resistance} Ω/km</span>
                </div>
             </div>
          </div>
        </div>

        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
           <button onClick={onClose} className="px-4 py-2 bg-slate-800 text-white text-sm font-bold rounded-lg hover:bg-slate-900 transition">Fechar</button>
        </div>
      </div>
    </div>
  );
};
