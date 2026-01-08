
import React from 'react';
import { X, Zap, Anchor, AlertTriangle, CheckCircle, Activity, MoveUpRight } from 'lucide-react';
import { PosteData } from '../types';

interface NodeDetailsModalProps {
  node: PosteData | null;
  onClose: () => void;
}

export const NodeDetailsModal: React.FC<NodeDetailsModalProps> = ({ node, onClose }) => {
  if (!node) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${node.status === 'critical' ? 'bg-red-500' : 'bg-blue-500'}`}>
              <Anchor size={20} />
            </div>
            <div>
              <h3 className="font-bold">Detalhes do Ativo: {node.id}</h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">{node.tipo === 'fisico' ? 'Poste de Concreto' : 'Ponto Virtual'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[80vh]">
          
          {/* Sessão Elétrica */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
              <Zap size={14} className="text-blue-500" /> Engenharia Elétrica
            </h4>
            
            {node.electrical ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Queda de Tensão:</span>
                  <span className={`font-mono font-bold ${node.electrical.isCompliant ? 'text-green-600' : 'text-red-600'}`}>
                    {node.electrical.accumulatedDropPercent}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Tensão na Ponta:</span>
                  <span className="font-mono font-bold text-slate-800">{node.electrical.voltageAtEnd} V</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Corrente Estimada:</span>
                  <span className="font-mono font-bold text-indigo-600">{node.electrical.currentAmp} A</span>
                </div>
                <div className={`p-2 rounded text-[10px] font-bold text-center border ${node.electrical.isCompliant ? 'bg-green-100 border-green-200 text-green-700' : 'bg-red-100 border-red-200 text-red-700'}`}>
                  {node.electrical.isCompliant ? 'DENTRO DOS LIMITES NBR 5410' : 'VIOLAÇÃO DE QUEDA DE TENSÃO'}
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-8 text-center">
                 <p className="text-xs text-slate-400 italic">Nenhum cálculo elétrico vinculado.</p>
              </div>
            )}
          </div>

          {/* Sessão Mecânica */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
              <Anchor size={14} className="text-orange-500" /> Esforço Mecânico
            </h4>

            {node.mechanical ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Resultante:</span>
                  <span className="font-mono font-bold text-slate-800">{node.mechanical.totalResultantDan} daN</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Capacidade:</span>
                  <span className="font-mono font-bold text-slate-500">{node.mechanical.nominalResistance} daN</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${node.mechanical.usagePercent > 100 ? 'bg-red-500' : 'bg-blue-500'}`} 
                    style={{ width: `${Math.min(node.mechanical.usagePercent, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between items-baseline">
                   <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Utilização:</span>
                   <span className={`text-lg font-mono font-black ${node.mechanical.usagePercent > 100 ? 'text-red-600' : 'text-blue-700'}`}>
                    {node.mechanical.usagePercent}%
                   </span>
                </div>
                
                <div className="pt-2 border-t border-slate-200">
                   <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                     <MoveUpRight size={14} className="text-indigo-500"/> Ângulo Crítico: {node.mechanical.resultantAngle}°
                   </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-8 text-center">
                 <p className="text-xs text-slate-400 italic">Nenhum cálculo mecânico vinculado.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end gap-3">
           <button 
             onClick={onClose}
             className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition"
           >
             Fechar
           </button>
           <button className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 shadow-md transition flex items-center gap-2">
             <Activity size={16}/> Ver Laudo Completo
           </button>
        </div>
      </div>
    </div>
  );
};
