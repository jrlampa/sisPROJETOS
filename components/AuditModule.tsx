
import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, History, Lock, FileCheck, Scale, AlertTriangle, 
  CheckCircle2, Search, Fingerprint, MapPin, Camera, Zap, FileText, Download,
  GitCompare, X, ArrowRight
} from 'lucide-react';
import { MOCK_AUDIT_TRAIL, MOCK_SNAPSHOTS, createEvent } from '../services/auditService';
import { NORMATIVE_DATABASE, checkCompliance } from '../services/normativeService';
import { generateComplianceSummary, verifyLocationContext, analyzeFieldEvidence } from '../services/aiService';
import { ProjectEvent, ProjectSnapshot, ComplianceItem } from '../types';

export const AuditModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'timeline' | 'snapshots'>('matrix');
  const [events, setEvents] = useState<ProjectEvent[]>(MOCK_AUDIT_TRAIL);
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([]);
  
  // Snapshot Comparison State
  const [selectedSnapshotIds, setSelectedSnapshotIds] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // AI State
  const [aiSummary, setAiSummary] = useState<string>('Carregando análise...');
  const [verifyingLoc, setVerifyingLoc] = useState(false);
  const [locVerification, setLocVerification] = useState<string | null>(null);

  // Initialize Compliance Matrix
  useEffect(() => {
    // In a real app, these values come from the Calculation Engine
    const currentValues = {
      'NBR_5410_VDROP_GLOBAL': 5.2, // Violation example
      'NBR_15214_SAFETY_MECH': 2.8,
      'PRODIST_M8_V_MIN': 215,
      'ENEL_SP_SAG_MAX': 2.1
    };

    const matrix: ComplianceItem[] = NORMATIVE_DATABASE.map(rule => {
      const actual = currentValues[rule.code as keyof typeof currentValues] || 0;
      const isOk = checkCompliance(rule.code, actual);
      return {
        ruleId: rule.id,
        ruleCode: rule.code,
        description: rule.description,
        limit: `${rule.comparator} ${rule.value}${rule.unit}`,
        actualValue: `${actual}${rule.unit}`,
        status: isOk ? 'OK' : 'VIOLATION'
      };
    });
    setComplianceItems(matrix);

    // Call Fast AI for summary
    generateComplianceSummary(1, 'Rede Distribuição BT').then(setAiSummary);

  }, []);

  const handleVerifyLocation = async () => {
    setVerifyingLoc(true);
    // Coords from project center
    const result = await verifyLocationContext(-23.5878, -46.6590);
    setLocVerification(result.context);
    setVerifyingLoc(false);

    // Log this verification in the audit trail
    const newEvent = createEvent(
      'AI_AGENT', 
      'APPROVAL', 
      'Verificação de contexto geográfico via Google Maps (Grounding)', 
      events[events.length-1].hash
    );
    setEvents(prev => [...prev, newEvent]);
  };

  const handleGenerateReport = () => {
    // Create an immutable log entry
    const newEvent = createEvent(
      'SYSTEM',
      'SNAPSHOT',
      'Relatório de Conformidade Normativa gerado oficialmente.',
      events[events.length - 1].hash
    );
    setEvents(prev => [...prev, newEvent]);
    
    // In a real app, this would trigger a PDF download
    alert("Relatório de Conformidade gerado com sucesso e registrado na trilha de auditoria.");
  };

  // Snapshot Logic
  const toggleSnapshotSelection = (id: string) => {
    if (selectedSnapshotIds.includes(id)) {
      setSelectedSnapshotIds(prev => prev.filter(s => s !== id));
    } else {
      if (selectedSnapshotIds.length < 2) {
        setSelectedSnapshotIds(prev => [...prev, id]);
      }
    }
  };

  const getSnapshotDiff = () => {
    const s1 = MOCK_SNAPSHOTS.find(s => s.id === selectedSnapshotIds[0]);
    const s2 = MOCK_SNAPSHOTS.find(s => s.id === selectedSnapshotIds[1]);
    
    if (!s1 || !s2) return [];

    // Mock Comparison Data
    return [
      { label: 'Versão', v1: s1.version, v2: s2.version, diff: true },
      { label: 'Norma Aplicada', v1: s1.normativeVersion, v2: s2.normativeVersion, diff: s1.normativeVersion !== s2.normativeVersion },
      { label: 'Responsável', v1: s1.createdBy, v2: s2.createdBy, diff: s1.createdBy !== s2.createdBy },
      { label: 'Status', v1: s1.status, v2: s2.status, diff: s1.status !== s2.status },
      // Simulated technical changes
      { label: 'Queda de Tensão Máx', v1: '4.8%', v2: '5.2%', diff: true },
      { label: 'Carga Instalada', v1: '45.0 kVA', v2: '48.5 kVA', diff: true },
      { label: 'Total de Postes', v1: '15', v2: '15', diff: false },
    ];
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg border border-slate-700 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="text-emerald-400" /> Auditoria & Defesa Técnica
          </h2>
          <p className="text-slate-400 text-sm">Rastreabilidade forense e conformidade normativa (Event Sourcing)</p>
        </div>
        <div className="flex gap-4 text-right">
           <div>
             <p className="text-[10px] uppercase text-slate-500 font-bold">Status Jurídico</p>
             <div className="text-sm font-bold text-emerald-400 flex items-center gap-1 justify-end">
               <Scale size={14}/> AUDITÁVEL
             </div>
           </div>
           <div className="w-px bg-slate-700"></div>
           <div>
             <p className="text-[10px] uppercase text-slate-500 font-bold">Versão da Norma</p>
             <p className="text-sm font-mono text-slate-200">NBR-5410:2004</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden h-fit">
           <button 
             onClick={() => setActiveTab('matrix')}
             className={`w-full flex items-center gap-3 px-4 py-4 border-l-4 transition ${activeTab === 'matrix' ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-transparent text-slate-600 hover:bg-slate-50'}`}
           >
             <FileCheck size={20} /> Matriz de Conformidade
           </button>
           <button 
             onClick={() => setActiveTab('timeline')}
             className={`w-full flex items-center gap-3 px-4 py-4 border-l-4 transition ${activeTab === 'timeline' ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-transparent text-slate-600 hover:bg-slate-50'}`}
           >
             <History size={20} /> Linha do Tempo (Audit)
           </button>
           <button 
             onClick={() => setActiveTab('snapshots')}
             className={`w-full flex items-center gap-3 px-4 py-4 border-l-4 transition ${activeTab === 'snapshots' ? 'border-purple-500 bg-purple-50 text-purple-800' : 'border-transparent text-slate-600 hover:bg-slate-50'}`}
           >
             <Lock size={20} /> Snapshots & Versões
           </button>
           
           {/* AI Widget */}
           <div className="p-4 border-t border-slate-100 bg-slate-50">
             <div className="flex items-center gap-2 mb-2 text-indigo-700 font-bold text-xs uppercase">
               <Zap size={14} className="fill-current"/> Análise Rápida (Flash Lite)
             </div>
             <p className="text-xs text-slate-600 leading-relaxed italic">
               "{aiSummary}"
             </p>
           </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">

          {/* TAB: COMPLIANCE MATRIX */}
          {activeTab === 'matrix' && (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 animate-in fade-in">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Scale className="text-emerald-600"/> Matriz de Rastreabilidade Normativa
                </h3>
                <button 
                  onClick={handleGenerateReport}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-700 transition shadow-sm"
                >
                  <Download size={16}/> Gerar Relatório de Conformidade
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-100 text-slate-600 uppercase font-bold text-xs">
                    <tr>
                      <th className="p-3 rounded-tl-lg">ID da Regra</th>
                      <th className="p-3">Descrição</th>
                      <th className="p-3">Fonte (Norma)</th>
                      <th className="p-3">Limite</th>
                      <th className="p-3">Valor Real</th>
                      <th className="p-3 rounded-tr-lg text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {complianceItems.map((item) => (
                      <tr key={item.ruleId} className="hover:bg-slate-50">
                        <td className="p-3">
                          <span className="font-mono text-xs text-slate-500">{item.ruleCode}</span>
                        </td>
                        <td className="p-3 font-medium text-slate-700">
                          {item.description}
                        </td>
                        <td className="p-3 text-slate-500 text-xs">
                          {NORMATIVE_DATABASE.find(n => n.code === item.ruleCode)?.source}
                        </td>
                        <td className="p-3 font-mono text-slate-600">{item.limit}</td>
                        <td className="p-3 font-mono font-bold text-slate-800">{item.actualValue}</td>
                        <td className="p-3 text-center">
                          {item.status === 'OK' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                              <CheckCircle2 size={12}/> OK
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                              <AlertTriangle size={12}/> VIOLAÇÃO
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 animate-in fade-in">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="font-bold text-slate-800 flex items-center gap-2">
                   <History className="text-blue-600"/> Trilha de Auditoria (Immutable Log)
                 </h3>
                 <button 
                   onClick={handleVerifyLocation}
                   disabled={verifyingLoc}
                   className="text-xs bg-slate-800 text-white px-3 py-1.5 rounded flex items-center gap-2 hover:bg-slate-700 disabled:opacity-50"
                 >
                   {verifyingLoc ? <Zap className="animate-spin" size={12}/> : <MapPin size={12}/>}
                   {verifyingLoc ? 'Verificando...' : 'Verificar Contexto (Maps AI)'}
                 </button>
              </div>

              {locVerification && (
                <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-indigo-800 flex gap-3">
                   <MapPin className="shrink-0 mt-0.5" />
                   <div>
                     <span className="font-bold block text-xs uppercase mb-1">Grounding (Google Maps Data):</span>
                     {locVerification}
                   </div>
                </div>
              )}
              
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-200 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                {events.slice().reverse().map((evt) => (
                  <div key={evt.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    
                    {/* Icon */}
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 
                      ${evt.actionType === 'CALCULATION' ? 'bg-blue-500 text-white' : 
                        evt.actionType === 'FIELD_UPDATE' ? 'bg-orange-500 text-white' : 
                        evt.actionType === 'APPROVAL' ? 'bg-green-500 text-white' : 'bg-slate-500 text-white'}`}
                    >
                      {evt.actionType === 'CALCULATION' && <Zap size={16}/>}
                      {evt.actionType === 'FIELD_UPDATE' && <Camera size={16}/>}
                      {evt.actionType === 'APPROVAL' && <CheckCircle2 size={16}/>}
                    </div>
                    
                    {/* Card */}
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded border border-slate-200 shadow-sm">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-slate-700 text-sm">{evt.userId}</span>
                        <span className="text-[10px] text-slate-400">{new Date(evt.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-slate-600 mb-2">{evt.description}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono bg-slate-50 p-1 rounded">
                         <Fingerprint size={10}/> Hash: {evt.hash.substring(0, 16)}...
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: SNAPSHOTS */}
          {activeTab === 'snapshots' && (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 animate-in fade-in">
              {showComparison ? (
                // --- COMPARISON VIEW ---
                <div className="animate-in fade-in">
                  <div className="flex justify-between items-center mb-6">
                     <button 
                       onClick={() => { setShowComparison(false); setSelectedSnapshotIds([]); }}
                       className="text-sm font-bold text-slate-500 hover:text-slate-800 flex items-center gap-2"
                     >
                       <ArrowRight className="rotate-180" size={16} /> Voltar
                     </button>
                     <h3 className="font-bold text-slate-800 flex items-center gap-2">
                       <GitCompare className="text-purple-600"/> Comparativo de Versões
                     </h3>
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                       <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                         <tr>
                           <th className="p-4 text-left w-1/3">Parâmetro / Recurso</th>
                           <th className="p-4 text-left w-1/3 bg-blue-50/50">
                              v{MOCK_SNAPSHOTS.find(s=>s.id === selectedSnapshotIds[0])?.version} (A)
                           </th>
                           <th className="p-4 text-left w-1/3 bg-purple-50/50">
                              v{MOCK_SNAPSHOTS.find(s=>s.id === selectedSnapshotIds[1])?.version} (B)
                           </th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                         {getSnapshotDiff().map((row, i) => (
                           <tr key={i} className={row.diff ? 'bg-amber-50/50' : ''}>
                             <td className="p-4 font-medium text-slate-700 flex items-center gap-2">
                               {row.diff && <AlertTriangle size={14} className="text-amber-500"/>}
                               {row.label}
                             </td>
                             <td className={`p-4 text-slate-600 ${row.diff ? 'font-bold' : ''}`}>{row.v1}</td>
                             <td className={`p-4 text-slate-600 ${row.diff ? 'font-bold' : ''}`}>{row.v2}</td>
                           </tr>
                         ))}
                       </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                // --- LIST VIEW ---
                <>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Lock className="text-purple-600"/> Versões Bloqueadas (Legal Hold)
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">Selecione 2 versões para comparar diferenças.</p>
                    </div>
                    {selectedSnapshotIds.length === 2 && (
                      <button 
                        onClick={() => setShowComparison(true)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-purple-700 shadow-md flex items-center gap-2 animate-in zoom-in"
                      >
                        <GitCompare size={16}/> Comparar Selecionados
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {MOCK_SNAPSHOTS.map((snap) => {
                      const isSelected = selectedSnapshotIds.includes(snap.id);
                      return (
                        <div 
                          key={snap.id} 
                          className={`border rounded-lg p-4 transition group relative overflow-hidden cursor-pointer ${
                            isSelected ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500' : 'border-slate-200 hover:border-purple-300'
                          }`}
                          onClick={() => toggleSnapshotSelection(snap.id)}
                        >
                           <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition">
                             <Fingerprint size={64} className="text-purple-600"/>
                           </div>
                           
                           <div className="flex justify-between items-center mb-2">
                             <div className="flex items-center gap-2">
                               {isSelected ? (
                                 <CheckCircle2 size={18} className="text-purple-600 fill-current bg-white rounded-full"/> 
                               ) : (
                                 <div className="w-4 h-4 rounded-full border-2 border-slate-300"></div>
                               )}
                               <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold">v{snap.version}</span>
                             </div>
                             <span className="text-xs text-slate-400">{new Date(snap.createdAt).toLocaleDateString()}</span>
                           </div>
                           
                           <p className="text-sm font-bold text-slate-700 mb-1">Snapshot de Aprovação</p>
                           <p className="text-xs text-slate-500 mb-4">Norma Base: {snap.normativeVersion}</p>
                           
                           <div className="bg-slate-100 p-2 rounded text-[10px] font-mono text-slate-500 break-all border border-slate-200">
                              {snap.hash}
                           </div>
                        </div>
                      );
                    })}
                    
                    {/* Create New Snapshot */}
                    <button className="border-2 border-dashed border-slate-300 rounded-lg p-4 flex flex-col items-center justify-center text-slate-400 hover:border-purple-400 hover:text-purple-600 transition min-h-[200px]">
                       <Lock size={32} className="mb-2"/>
                       <span className="font-bold text-sm">Criar Novo Snapshot</span>
                       <span className="text-xs">Congelar versão atual</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
