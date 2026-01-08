
import React, { useState, useMemo } from 'react';
import { 
  Anchor, Plus, Trash2, ShieldCheck, AlertTriangle, 
  Activity, Zap, Info, Calculator, MoveUpRight, Settings2, Scissors, Mountain
} from 'lucide-react';
import { CONDUCTORS_DB, POLES_DB } from '../constants';
import { calculatePoleMechanicalStress, MechanicalInputItem } from '../services/mechanicalService';
import { MechanicalCalcResult, CableCalculationDetail } from '../types';

export const MechanicalStressModule: React.FC = () => {
  const [poleResistance, setPoleResistance] = useState(600);
  const [cables, setCables] = useState<MechanicalInputItem[]>([
    { conductor: CONDUCTORS_DB[2], spanHorizontal: 40, heightDiff: 0, angle: 0, qty: 3, hasNeutral: true },
    { conductor: CONDUCTORS_DB[4], spanHorizontal: 50, heightDiff: 5.5, angle: 180, qty: 3, hasNeutral: false }
  ]);

  const result = useMemo(() => {
    return calculatePoleMechanicalStress(poleResistance, cables);
  }, [poleResistance, cables]);

  const addCable = () => {
    setCables([...cables, { conductor: CONDUCTORS_DB[0], spanHorizontal: 40, heightDiff: 0, angle: 90, qty: 3, hasNeutral: false }]);
  };

  const updateCable = (idx: number, field: keyof MechanicalInputItem, value: any) => {
    const newCables = [...cables];
    newCables[idx] = { ...newCables[idx], [field]: value };
    setCables(newCables);
  };

  const removeCable = (idx: number) => {
    setCables(cables.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 px-6 py-4 flex justify-between items-center flex-wrap gap-4">
           <div>
             <h2 className="text-xl font-bold text-white flex items-center gap-2">
               <Anchor size={20} className="text-orange-400" /> Cálculo Mecânico 3D
             </h2>
             <p className="text-slate-400 text-xs">Considerando Topografia e Desnível Geométrico</p>
           </div>
           <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-widest">Resistência Nominal</span>
              <select 
                value={poleResistance} 
                onChange={e => setPoleResistance(Number(e.target.value))}
                className="bg-transparent text-white font-bold text-sm outline-none cursor-pointer"
              >
                {POLES_DB.map(p => <option key={p.id} value={p.nominalLoad}>{p.type} ({p.nominalLoad} daN)</option>)}
              </select>
           </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100 bg-white border-b border-slate-200">
           <div className="p-4 text-center">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Resultante 3D</p>
              <p className={`text-2xl font-mono font-bold ${!result.isCompliant ? 'text-red-600' : 'text-slate-800'}`}>
                {result.totalResultantDan} <span className="text-xs">daN</span>
              </p>
           </div>
           <div className="p-4 text-center">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Taxa de Uso</p>
              <p className={`text-2xl font-mono font-bold ${result.usagePercent > 100 ? 'text-red-600' : 'text-blue-600'}`}>
                {result.usagePercent}%
              </p>
           </div>
           <div className="p-4 text-center">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Ângulo de Tração</p>
              <p className="text-2xl font-mono font-bold text-indigo-600">{result.resultantAngle}°</p>
           </div>
           <div className="p-4 text-center">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Status</p>
              <div className={`mt-1 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${result.isCompliant ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {result.isCompliant ? <ShieldCheck size={14}/> : <AlertTriangle size={14}/>}
                {result.isCompliant ? 'APROVADO' : 'CRÍTICO'}
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <h3 className="font-bold text-slate-700 flex items-center gap-2"><Settings2 size={18}/> Vãos e Condutores</h3>
               <button onClick={addCable} className="text-xs flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition font-bold shadow-sm">
                 <Plus size={14}/> Nova Direção
               </button>
             </div>

             <div className="overflow-x-auto">
               <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500 font-bold text-[10px] uppercase tracking-wider border-b">
                     <tr>
                        <th className="p-3 text-left">Condutor</th>
                        <th className="p-3">Vão Horiz. (m)</th>
                        <th className="p-3 text-orange-600 flex items-center gap-1 justify-center"><Mountain size={12}/> ΔZ (m)</th>
                        <th className="p-3">Ângulo (°)</th>
                        <th className="p-3">Qtd</th>
                        <th className="p-3 text-right">Vão 3D (m)</th>
                        <th className="p-3 w-10"></th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {cables.map((item, idx) => {
                       const detail = result.calculatedCables[idx];
                       return (
                         <tr key={idx} className="hover:bg-slate-50 transition">
                           <td className="p-3">
                              <select 
                                value={item.conductor.id} 
                                onChange={e => updateCable(idx, 'conductor', CONDUCTORS_DB.find(c => c.id === e.target.value))}
                                className="w-full p-1 border rounded text-xs font-bold text-slate-700"
                              >
                                {CONDUCTORS_DB.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                              </select>
                           </td>
                           <td className="p-3">
                              <input type="number" value={item.spanHorizontal} onChange={e => updateCable(idx, 'spanHorizontal', Number(e.target.value))} className="w-16 p-1 text-center font-mono border rounded"/>
                           </td>
                           <td className="p-3">
                              <input type="number" value={item.heightDiff} onChange={e => updateCable(idx, 'heightDiff', Number(e.target.value))} className="w-16 p-1 text-center font-mono border rounded bg-orange-50/50"/>
                           </td>
                           <td className="p-3">
                              <input type="number" value={item.angle} onChange={e => updateCable(idx, 'angle', Number(e.target.value))} className="w-16 p-1 text-center font-mono border rounded"/>
                           </td>
                           <td className="p-3 text-center">
                              <input type="number" value={item.qty} onChange={e => updateCable(idx, 'qty', Number(e.target.value))} className="w-12 p-1 text-center font-mono border rounded"/>
                           </td>
                           <td className="p-3 text-right font-mono font-bold text-blue-600">
                              {detail?.realSpan3D}
                           </td>
                           <td className="p-3">
                              <button onClick={() => removeCable(idx)} className="text-slate-300 hover:text-red-500 transition"><Trash2 size={16}/></button>
                           </td>
                         </tr>
                       );
                     })}
                  </tbody>
               </table>
             </div>
           </div>

           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-3 bg-slate-800 text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2">
               <Activity size={14}/> Balanço Vetorial (daN)
             </div>
             <table className="w-full text-xs">
                <thead className="bg-slate-50 text-slate-400 font-bold border-b">
                   <tr>
                      <th className="p-2 text-left">Condutor</th>
                      <th className="p-2 text-right">Fases</th>
                      <th className="p-2 text-right">Neutro</th>
                      <th className="p-2 text-right">Fx</th>
                      <th className="p-2 text-right">Fy</th>
                   </tr>
                </thead>
                <tbody className="divide-y">
                   {result.calculatedCables.map((c, i) => (
                     <tr key={i}>
                        <td className="p-2 font-medium text-slate-600">{c.label} ({c.angle}°)</td>
                        <td className="p-2 text-right font-mono">{c.tensionPhases}</td>
                        <td className="p-2 text-right font-mono">{c.tensionNeutral}</td>
                        <td className="p-2 text-right font-mono text-blue-600">{c.fx}</td>
                        <td className="p-2 text-right font-mono text-indigo-600">{c.fy}</td>
                     </tr>
                   ))}
                </tbody>
             </table>
           </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Equilíbrio de Forças 3D</h4>
              <VectorDiagram 
                cables={result.calculatedCables} 
                resultantAngle={result.resultantAngle} 
                resultantForce={result.totalResultantDan}
                limit={result.nominalResistance}
              />
           </div>

           <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 text-white space-y-4 shadow-xl">
             <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400"><Calculator size={20} /></div>
                <h3 className="font-bold">Análise Estrutural 3D</h3>
             </div>
             <p className="text-xs text-slate-400 leading-relaxed italic">A componente de tração foi ajustada para o vão real hipotenusado (3D). Desníveis acentuados aumentam a tração em até 12%.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

interface VectorDiagramProps {
  cables: CableCalculationDetail[];
  resultantAngle: number;
  resultantForce: number;
  limit: number;
}

const VectorDiagram: React.FC<VectorDiagramProps> = ({ cables, resultantAngle, resultantForce, limit }) => {
  const size = 260;
  const center = size / 2;
  const maxForce = Math.max(limit, resultantForce, ...cables.map(c => Math.abs(c.fx) + Math.abs(c.fy))) * 1.2;
  const scale = (val: number) => (val / maxForce) * (size / 2 - 20);

  const getCoords = (force: number, angleDeg: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: center + scale(force) * Math.cos(rad),
      y: center - scale(force) * Math.sin(rad)
    };
  };

  const pRes = getCoords(resultantForce, resultantAngle);

  return (
    <div className="relative bg-slate-50 rounded-full p-2 border-4 border-white shadow-inner">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <marker id="arrow-blue" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#3b82f6" /></marker>
          <marker id="arrow-green" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#10b981" /></marker>
          <marker id="arrow-red" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#ef4444" /></marker>
        </defs>
        <circle cx={center} cy={center} r={scale(limit)} fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="4,4" />
        <line x1={center} y1="0" x2={center} y2={size} stroke="#f1f5f9" strokeWidth="1" />
        <line x1="0" y1={center} x2={size} y2={center} stroke="#f1f5f9" strokeWidth="1" />
        {cables.map((c, i) => {
          const force = Math.sqrt(c.fx**2 + c.fy**2);
          const p = getCoords(force, c.angle);
          return (
            <g key={i} className="opacity-40 hover:opacity-100 transition-opacity">
               <line x1={center} y1={center} x2={p.x} y2={p.y} stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrow-blue)" />
            </g>
          );
        })}
        <line x1={center} y1={center} x2={pRes.x} y2={pRes.y} stroke={resultantForce <= limit ? "#10b981" : "#ef4444"} strokeWidth="4" markerEnd={`url(#arrow-${resultantForce <= limit ? 'green' : 'red'})`} />
        <circle cx={center} cy={center} r="6" fill="#1e293b" />
      </svg>
    </div>
  );
};
