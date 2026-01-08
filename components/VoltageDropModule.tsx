
import React, { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { 
  AlertTriangle, CheckCircle, Calculator, Zap, Plus, Trash2, 
  Activity, Info, Box, Users, Lightbulb, Settings, RefreshCw, ArrowUpCircle, Check
} from 'lucide-react';
import { CONDUCTORS_DB, NORMATIVE_LIMITS, PUBLIC_LIGHTING_DB, TRANSFORMER_LIST } from '../constants';
import { calculateNetwork } from '../services/electricalService';
import { NetworkSegment, NetworkCalculationResult, OptimizationSuggestion } from '../types';

export const VoltageDropModule: React.FC = () => {
  const [trafoKva, setTrafoKva] = useState(75);
  const [clientClass, setClientClass] = useState<'A' | 'B' | 'C' | 'D'>('B');

  const [segments, setSegments] = useState<NetworkSegment[]>([
    { 
      id: 's1', name: 'Vão 01 (TR->P1)', length: 40, 
      mono: 4, bi: 1, tri: 0, triSpecial: 0, dedicatedKva: 0,
      ipType: 'IP 100W', ipQty: 1, conductorId: 'cal-70'
    },
    { 
      id: 's2', name: 'Vão 02 (P1->P2)', length: 35, 
      mono: 6, bi: 0, tri: 1, triSpecial: 0, dedicatedKva: 2.5,
      ipType: 'IP 100W', ipQty: 1, conductorId: 'cal-70'
    },
    { 
      id: 's3', name: 'Vão 03 (P2->P3)', length: 50, 
      mono: 2, bi: 0, tri: 0, triSpecial: 0, dedicatedKva: 0,
      ipType: 'Sem IP', ipQty: 0, conductorId: 'cal-35'
    }
  ]);

  const [result, setResult] = useState<NetworkCalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = () => {
    setIsCalculating(true);
    setTimeout(() => {
      const calc = calculateNetwork(segments, trafoKva, clientClass);
      setResult(calc);
      setIsCalculating(false);
    }, 500);
  };

  const updateSegment = (idx: number, field: keyof NetworkSegment, value: any) => {
    const newSegs = [...segments];
    newSegs[idx] = { ...newSegs[idx], [field]: value };
    setSegments(newSegs);
    setResult(null);
  };

  const applySuggestion = (suggestion: OptimizationSuggestion) => {
    const idx = segments.findIndex(s => s.id === suggestion.segmentId);
    if (idx !== -1) {
      updateSegment(idx, 'conductorId', suggestion.suggestedConductorId);
      // Forçar recálculo para limpar sugestão aplicada
      setTimeout(handleCalculate, 50);
    }
  };

  const addSegment = () => {
    const newId = `s${Date.now()}`;
    setSegments([...segments, {
      id: newId,
      name: `Vão ${String(segments.length + 1).padStart(2, '0')}`,
      length: 30,
      mono: 0, bi: 0, tri: 0, triSpecial: 0, dedicatedKva: 0,
      ipType: 'Sem IP', ipQty: 0,
      conductorId: segments[segments.length - 1]?.conductorId || 'cal-35'
    }]);
    setResult(null);
  };

  const removeSegment = (idx: number) => {
    setSegments(segments.filter((_, i) => i !== idx));
    setResult(null);
  };

  const chartData = result ? [
    { dist: 0, voltage: 220 },
    ...result.segments.map((r, i) => {
      const dist = segments.slice(0, i + 1).reduce((sum, s) => sum + s.length, 0);
      return { dist, voltage: r.voltageAtEnd };
    })
  ] : [];

  return (
    <div className="space-y-6 min-h-[600px]">
      
      {/* Simulation Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 px-6 py-4 flex justify-between items-center flex-wrap gap-4">
           <div>
             <h2 className="text-xl font-bold text-white flex items-center gap-2">
               <Zap size={20} className="text-blue-400" /> Motor de Cálculo BT - SisCQT
             </h2>
             <p className="text-slate-400 text-xs">Cálculo de Demanda (DMDI) & Queda de Tensão (ENEL/QTOS)</p>
           </div>
           <div className="flex gap-3">
             <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-widest">Classe de Carga</span>
                <select 
                  value={clientClass} 
                  onChange={e => setClientClass(e.target.value as any)}
                  className="bg-transparent text-white font-bold text-sm outline-none cursor-pointer"
                >
                  <option value="A">Classe A (Massivos)</option>
                  <option value="B">Classe B (Padrão)</option>
                  <option value="C">Classe C (RNT)</option>
                  <option value="D">Classe D (Especial)</option>
                </select>
             </div>
             <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-widest">Capacidade Trafo</span>
                <select 
                  value={trafoKva} 
                  onChange={e => setTrafoKva(Number(e.target.value))}
                  className="bg-transparent text-white font-bold text-sm outline-none cursor-pointer"
                >
                  {TRANSFORMER_LIST.map(v => <option key={v} value={v}>{v} kVA</option>)}
                </select>
             </div>
           </div>
        </div>

        {result && (
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100 bg-white border-b border-slate-200 animate-in fade-in">
             <div className="p-4 text-center">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Ocupação Trafo</p>
                <p className={`text-2xl font-mono font-bold ${result.trafoOcupation > 100 ? 'text-red-600' : 'text-slate-800'}`}>
                  {result.trafoOcupation}%
                </p>
             </div>
             <div className="p-4 text-center">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Demanda Total</p>
                <p className="text-2xl font-mono font-bold text-blue-600">{result.totalDemandKva} kVA</p>
             </div>
             <div className="p-4 text-center">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Queda Máxima</p>
                <p className={`text-2xl font-mono font-bold ${result.maxDropPercent > 6 ? 'text-red-600' : 'text-green-600'}`}>
                  {result.maxDropPercent}%
                </p>
             </div>
             <div className="p-4 text-center">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Conformidade</p>
                <div className={`mt-1 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${result.isGlobalCompliant ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {result.isGlobalCompliant ? <CheckCircle size={14}/> : <AlertTriangle size={14}/>}
                  {result.isGlobalCompliant ? 'CONFORME' : 'VIOLAÇÃO'}
                </div>
             </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Editor Grid */}
        <div className="xl:col-span-2 space-y-4">
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
             <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <h3 className="font-bold text-slate-700 flex items-center gap-2"><Activity size={18}/> Levantamento de Rede</h3>
               <button onClick={addSegment} className="text-xs flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition font-bold shadow-sm">
                 <Plus size={14}/> Novo Trecho
               </button>
             </div>

             <div className="overflow-x-auto">
               <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500 font-bold text-[10px] uppercase tracking-wider text-center border-b">
                     <tr>
                        <th className="p-3 text-left w-32">Nó / Vão</th>
                        <th className="p-3 w-16">Dist(m)</th>
                        <th className="p-3 w-40">Clientes (M/B/T/Esp)</th>
                        <th className="p-3 w-20">Dedic.(kVA)</th>
                        <th className="p-3 w-32">IP / Qtd</th>
                        <th className="p-3">Condutor (SisCQT)</th>
                        <th className="p-3 w-10"></th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {segments.map((seg, idx) => {
                       const segResult = result?.segments.find(r => r.segmentId === seg.id);
                       return (
                        <tr key={seg.id} className={`hover:bg-slate-50 transition ${segResult && !segResult.isCompliant ? 'bg-red-50/50' : ''}`}>
                          <td className="p-2">
                             <input 
                               type="text" value={seg.name} onChange={e => updateSegment(idx, 'name', e.target.value)}
                               className="w-full p-1 font-bold border-b border-transparent focus:border-blue-300 outline-none text-slate-700 bg-transparent"
                             />
                          </td>
                          <td className="p-2">
                             <input type="number" value={seg.length} onChange={e => updateSegment(idx, 'length', Number(e.target.value))} className="w-full p-1 text-center font-mono border rounded"/>
                          </td>
                          <td className="p-2">
                             <div className="grid grid-cols-4 gap-1">
                                <input type="number" title="Mono" value={seg.mono} onChange={e => updateSegment(idx, 'mono', Number(e.target.value))} className="w-full p-1 text-center text-xs rounded border" />
                                <input type="number" title="Bi" value={seg.bi} onChange={e => updateSegment(idx, 'bi', Number(e.target.value))} className="w-full p-1 text-center text-xs rounded border" />
                                <input type="number" title="Tri" value={seg.tri} onChange={e => updateSegment(idx, 'tri', Number(e.target.value))} className="w-full p-1 text-center text-xs rounded border" />
                                <input type="number" title="TriEsp" value={seg.triSpecial} onChange={e => updateSegment(idx, 'triSpecial', Number(e.target.value))} className="w-full p-1 text-center text-xs rounded border bg-amber-50" />
                             </div>
                          </td>
                          <td className="p-2">
                             <input type="number" value={seg.dedicatedKva} onChange={e => updateSegment(idx, 'dedicatedKva', Number(e.target.value))} className="w-full p-1 text-center font-mono border rounded"/>
                          </td>
                          <td className="p-2">
                             <div className="flex gap-1">
                               <select value={seg.ipType} onChange={e => updateSegment(idx, 'ipType', e.target.value)} className="text-[10px] p-1 border rounded w-full">
                                 {Object.keys(PUBLIC_LIGHTING_DB).map(k => <option key={k} value={k}>{k}</option>)}
                               </select>
                               <input type="number" value={seg.ipQty} onChange={e => updateSegment(idx, 'ipQty', Number(e.target.value))} className="w-10 p-1 text-center text-xs border rounded"/>
                             </div>
                          </td>
                          <td className="p-2">
                             <select value={seg.conductorId} onChange={e => updateSegment(idx, 'conductorId', e.target.value)} className="w-full p-1 border rounded text-xs font-bold text-blue-700">
                               {CONDUCTORS_DB.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                             </select>
                          </td>
                          <td className="p-2">
                             <button onClick={() => removeSegment(idx)} className="text-slate-300 hover:text-red-500 p-1"><Trash2 size={16}/></button>
                          </td>
                        </tr>
                      );
                     })}
                  </tbody>
               </table>
             </div>
             
             <div className="p-6 bg-slate-50 border-t border-slate-200">
               <button 
                 onClick={handleCalculate}
                 disabled={isCalculating}
                 className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-3 transition disabled:opacity-50"
               >
                 {isCalculating ? <RefreshCw size={24} className="animate-spin"/> : <Calculator size={24} />}
                 <span className="text-lg">Processar Laudo Técnico SisCQT</span>
               </button>
             </div>
           </div>
           
           {/* Detailed Results Table */}
           {result && (
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-4">
                <div className="p-4 bg-slate-800 text-white font-bold text-sm flex justify-between">
                  <span>Resumo do Fluxo de Potência (kVA.m)</span>
                  <span className="text-slate-400 font-normal text-xs uppercase tracking-widest flex items-center gap-1"><ArrowUpCircle size={14}/> Corrente de Ponta</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-400 font-bold uppercase">
                       <tr>
                         <th className="p-3">Trecho</th>
                         <th className="p-3 text-right">Momento</th>
                         <th className="p-3 text-right">Corrente</th>
                         <th className="p-3 text-right">QT Trecho</th>
                         <th className="p-3 text-right">QT Acum.</th>
                         <th className="p-3 text-right">V. Ponta</th>
                         <th className="p-3 text-right">ICC (kA)</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y">
                      {result.segments.map(r => (
                        <tr key={r.segmentId}>
                          <td className="p-3 font-medium text-slate-700">{r.segmentName}</td>
                          <td className="p-3 text-right font-mono text-slate-500">{r.momentKvaM}</td>
                          <td className="p-3 text-right font-mono text-indigo-600">{r.currentAmp} A</td>
                          <td className="p-3 text-right font-mono">{r.voltageDropPercent}%</td>
                          <td className={`p-3 text-right font-mono font-bold ${r.isCompliant ? 'text-slate-700' : 'text-red-600'}`}>{r.accumulatedDropPercent}%</td>
                          <td className="p-3 text-right font-mono text-blue-600 font-bold">{r.voltageAtEnd} V</td>
                          <td className="p-3 text-right font-mono text-orange-600">{r.iccKa}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             </div>
           )}
        </div>

        {/* Real-time Visualization & Insights */}
        <div className="space-y-6">
           <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-72 flex flex-col relative">
             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Perfil de Tensão Real (V)</h4>
             {!result && (
               <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                 <p className="text-slate-400 text-sm font-medium">Aguardando Simulação...</p>
               </div>
             )}
             <div className="flex-1 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chartData}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} />
                   <XAxis dataKey="dist" unit="m" tick={{fontSize: 10}} />
                   <YAxis domain={[190, 230]} hide />
                   <RechartsTooltip contentStyle={{borderRadius: '8px', fontSize: '12px'}} formatter={(val) => [`${val}V`, 'Tensão']} />
                   <ReferenceLine y={220 * (1 - NORMATIVE_LIMITS.maxVoltageDrop/100)} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'right', value: 'Limite', fill: '#ef4444', fontSize: 10 }} />
                   <Area type="monotone" dataKey="voltage" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={2} />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
           </div>

           <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 text-white space-y-4 shadow-xl">
             <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400"><Box size={20} /></div>
                <h3 className="font-bold">Engenharia Assistida</h3>
             </div>
             
             {!result ? (
                <div className="text-center py-8 text-slate-500 text-sm italic">Execute o cálculo para diagnóstico.</div>
             ) : (
               <div className="space-y-3">
                  <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Status da AA (Área de Atuação)</p>
                    <p className="text-xl font-mono text-indigo-400 font-bold">{result.totalDemandKva} kVA de Demanda</p>
                    <p className="text-[10px] text-slate-500 mt-1 italic">Considerando Curva {clientClass} (Diversidade ENEL)</p>
                  </div>
                  
                  {/* Suggestions Section */}
                  {result.suggestions.length > 0 && (
                    <div className="space-y-2">
                       <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1 mt-4">
                         <Lightbulb size={12}/> Sugestões de Melhoria ({result.suggestions.length})
                       </p>
                       {result.suggestions.map((s, idx) => {
                         const targetCable = CONDUCTORS_DB.find(c => c.id === s.suggestedConductorId);
                         return (
                           <div key={idx} className="p-3 bg-blue-900/20 rounded-lg border border-blue-900/30 group">
                              <div className="flex justify-between items-start mb-2">
                                <div className="text-xs font-bold text-blue-300">Trecho: {segments.find(seg => seg.id === s.segmentId)?.name}</div>
                                <span className="bg-blue-500/20 text-blue-400 text-[9px] px-1.5 py-0.5 rounded-full border border-blue-500/30">+{s.improvementPercent}% Eficiência</span>
                              </div>
                              <p className="text-[11px] text-slate-400 mb-3">{s.description}</p>
                              <button 
                                onClick={() => applySuggestion(s)}
                                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded flex items-center justify-center gap-2 transition"
                              >
                                <Check size={12}/> Trocar para {targetCable?.name}
                              </button>
                           </div>
                         );
                       })}
                    </div>
                  )}

                  {result.trafoOcupation > 100 && (
                    <div className="p-3 bg-red-900/20 rounded-lg border border-red-900/30 flex gap-2">
                       <AlertTriangle size={18} className="text-red-500 shrink-0" />
                       <div className="text-xs text-red-200">
                         <strong>Alerta de Sobrecarga:</strong> Transformador está operando acima da nominal ({result.trafoOcupation}%). Risco de queima ou vida útil reduzida.
                       </div>
                    </div>
                  )}
                  
                  {result.suggestions.length === 0 && result.isGlobalCompliant && (
                    <div className="p-3 bg-green-900/20 rounded-lg border border-green-900/30 flex gap-2">
                       <CheckCircle size={18} className="text-green-500 shrink-0" />
                       <div className="text-xs text-green-200">
                         <strong>Rede Otimizada:</strong> Nenhum ponto crítico detectado. A configuração atual atende aos requisitos técnicos e normativos.
                       </div>
                    </div>
                  )}
               </div>
             )}
           </div>

           <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Info size={12}/> Metodologia SisCQT</h4>
              <div className="text-xs text-slate-600 leading-tight space-y-2">
                 <p>• Diversidade dinâmica via tabela DMDI ENEL.</p>
                 <p>• Sugestão automática via algoritmo de Menor Custo Incremental.</p>
                 <p>• Curto-circuito (ICC) calculado em cascata por impedância complexa.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
