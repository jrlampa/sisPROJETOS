
import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, TrendingUp, AlertTriangle, ThumbsUp, Activity, Info, Layers
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, ReferenceLine
} from 'recharts';
import { NORMATIVE_LIMITS } from '../constants';
import { 
  runDiagnostic, runSensitivityAnalysis, generateScenarios, calculateApprovalScore 
} from '../services/intelligenceService';
import { IntelligenceAlert, ScenarioResult, SensitivityData, ApprovalScore } from '../types';

export const IntelligenceModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sensitivity' | 'scenarios' | 'suggestions'>('dashboard');
  
  const [alerts, setAlerts] = useState<IntelligenceAlert[]>([]);
  const [sensitivityData, setSensitivityData] = useState<SensitivityData[]>([]);
  const [scenarios, setScenarios] = useState<ScenarioResult[]>([]);
  const [approvalScore, setApprovalScore] = useState<ApprovalScore | null>(null);

  useEffect(() => {
    setAlerts(runDiagnostic());
    setSensitivityData(runSensitivityAnalysis());
    setScenarios(generateScenarios());
    setApprovalScore(calculateApprovalScore());
  }, []);

  return (
    <div className="space-y-6 min-h-[600px] flex flex-col">
      <div className="flex gap-2 bg-white p-1 rounded-lg border border-slate-200 w-fit shadow-sm">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2 font-bold text-xs uppercase rounded transition ${
            activeTab === 'dashboard' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Activity size={16} /> Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('sensitivity')}
          className={`flex items-center gap-2 px-4 py-2 font-bold text-xs uppercase rounded transition ${
            activeTab === 'sensitivity' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <TrendingUp size={16} /> Sensibilidade
        </button>
        <button 
          onClick={() => setActiveTab('scenarios')}
          className={`flex items-center gap-2 px-4 py-2 font-bold text-xs uppercase rounded transition ${
            activeTab === 'scenarios' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Layers size={16} /> Cenários
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === 'dashboard' && approvalScore && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 lg:col-span-1">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <ThumbsUp className="text-blue-600"/> Score de Aprovação
                </h3>
                <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                   <div className="text-5xl font-bold text-indigo-600">{approvalScore.total}</div>
                   <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">Pontos de Conformidade</div>
                </div>
                <div className="mt-6 space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1"><span>Técnico</span><span>{approvalScore.technical}%</span></div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden"><div className="bg-blue-500 h-full" style={{width:`${approvalScore.technical}%`}}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1"><span>Normativo</span><span>{approvalScore.normative}%</span></div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden"><div className="bg-emerald-500 h-full" style={{width:`${approvalScore.normative}%`}}></div></div>
                  </div>
                </div>
             </div>
             <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 lg:col-span-2">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                   <AlertTriangle className="text-amber-500"/> Alertas Predictivos
                </h3>
                <div className="space-y-3">
                   {alerts.map(a => (
                     <div key={a.id} className="p-3 bg-slate-50 border rounded-lg flex gap-3">
                        <div className={`p-1.5 rounded h-fit ${a.severity==='CRITICAL'?'bg-red-100 text-red-600':'bg-blue-100 text-blue-600'}`}>
                          <Activity size={14}/>
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-800">{a.title}</h4>
                          <p className="text-xs text-slate-500">{a.description}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {activeTab === 'sensitivity' && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 h-[450px] flex flex-col">
             <div className="mb-4">
               <h3 className="font-bold text-slate-800 flex items-center gap-2"><TrendingUp size={20} className="text-blue-600"/> Crescimento Vegetativo (Projeção 10 Anos)</h3>
               <p className="text-xs text-slate-500">Estimativa de queda de tensão baseada em 3% de crescimento de carga a.a.</p>
             </div>
             <div className="flex-1 w-full min-h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={sensitivityData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} />
                   <XAxis dataKey="year" />
                   <YAxis unit="%" />
                   <RechartsTooltip />
                   <ReferenceLine y={NORMATIVE_LIMITS.maxVoltageDrop} stroke="red" strokeDasharray="5 5" label="Limite" />
                   <Line type="monotone" dataKey="maxVoltageDrop" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                 </LineChart>
               </ResponsiveContainer>
             </div>
          </div>
        )}

        {activeTab === 'scenarios' && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
             <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><BrainCircuit size={20} className="text-indigo-600"/> Alternativas de Dimensionamento</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {scenarios.map(sc => (
                 <div key={sc.id} className="p-4 border rounded-xl bg-slate-50 hover:border-indigo-300 transition">
                    <h4 className="font-bold text-slate-800">{sc.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 mb-4">{sc.description}</p>
                    <div className="flex justify-between text-xs font-bold border-t pt-3 mt-auto">
                       <span className="text-slate-400 uppercase">Custo</span>
                       <span className="text-indigo-600">R$ {sc.totalCost.toLocaleString()}</span>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
