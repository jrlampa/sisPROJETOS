
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { VoltageDropModule } from './components/VoltageDropModule';
import { MechanicalStressModule } from './components/MechanicalStressModule';
import { GisView } from './components/GisView';
import { FieldMode } from './components/FieldMode';
import { ReportsModule } from './components/ReportsModule';
import { IntelligenceModule } from './components/IntelligenceModule';
import { EnterpriseModule } from './components/EnterpriseModule';
import { AuditModule } from './components/AuditModule';
import { NetworkMap } from './components/NetworkMap';
import { NodeDetailsModal } from './components/NodeDetailsModal';
import { SpanDetailsModal } from './components/SpanDetailsModal';
import { Activity, FileText, CheckCircle, AlertTriangle, Database, Map, Zap, RefreshCw, Layers, Globe, Smartphone, X } from 'lucide-react';
import { PosteData, MapEdge } from './types';

// Mock Data
const MOCK_NODES: PosteData[] = [
  { id: 'PT-01', x: 100, y: 100, status: 'ok', resistenciaNominal: 600, tipo: 'fisico', electrical: { segmentId: 's1', segmentName: 'TR-01', totalClients: 10, localKvaDist: 15, localKvaPoint: 0, downstreamKva: 0, momentKvaM: 100, voltageDropAbs: 2, voltageDropPercent: 1.2, accumulatedDropPercent: 1.2, voltageAtEnd: 217.4, currentAmp: 45, iccKa: 3, isCompliant: true, message: 'OK' } },
  { id: 'PT-02', x: 250, y: 120, status: 'warning', resistenciaNominal: 600, tipo: 'fisico', mechanical: { poleId: 'PT-02', totalResultantDan: 510, resultantAngle: 45, nominalResistance: 600, usagePercent: 85, isCompliant: true, fxTotal: 360, fyTotal: 360, calculatedCables: [] } },
  { id: 'PT-03', x: 400, y: 150, status: 'critical', resistenciaNominal: 300, tipo: 'fisico', electrical: { segmentId: 's3', segmentName: 'PT-02', totalClients: 20, localKvaDist: 30, localKvaPoint: 0, downstreamKva: 0, momentKvaM: 400, voltageDropAbs: 12, voltageDropPercent: 5.5, accumulatedDropPercent: 6.7, voltageAtEnd: 205.2, currentAmp: 110, iccKa: 2, isCompliant: false, message: 'Violação QT' } },
  { id: 'V-01', x: 250, y: 50, status: 'neutral', resistenciaNominal: 0, tipo: 'fantasma' },
];

const MOCK_EDGES: MapEdge[] = [
  { id: 'e1', sourceId: 'PT-01', targetId: 'PT-02', status: 'ok', conductorId: 'cal-70', lengthHorizontal: 40, heightDiff: 1.2 },
  { id: 'e2', sourceId: 'PT-02', targetId: 'PT-03', status: 'critical', conductorId: 'cal-35', lengthHorizontal: 50, heightDiff: 5.5 },
  { id: 'e3', sourceId: 'V-01', targetId: 'PT-02', status: 'ok', conductorId: 'cal-70', lengthHorizontal: 35, heightDiff: 0.5 },
];

const Dashboard = () => {
  const [selectedNode, setSelectedNode] = useState<PosteData | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<MapEdge | null>(null);
  const [viewMode, setViewMode] = useState<'schematic' | 'geographic'>('schematic');
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Projetos Ativos', val: '12', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Violações Críticas', val: '3', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Trechos Auditados', val: '156', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Relatórios Emitidos', val: '8', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition">
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{stat.val}</p>
            </div>
            <div className={`p-3 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-[500px]">
          <div className="flex justify-between items-center mb-4 px-2">
             <h3 className="font-bold text-slate-800 flex items-center gap-2">
               {viewMode === 'schematic' ? <Map size={18} className="text-blue-500"/> : <Globe size={18} className="text-emerald-500"/>}
               {viewMode === 'schematic' ? 'Visão Unifilar do Projeto' : 'Visão Geográfica (GIS)'}
             </h3>
             <div className="flex gap-2">
                {viewMode === 'geographic' && (
                  <button 
                    onClick={() => setIsFieldModalOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-[10px] font-bold uppercase hover:bg-blue-700 transition shadow-sm"
                  >
                    <Smartphone size={14}/> Modo Tablet
                  </button>
                )}
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                  <button onClick={() => setViewMode('schematic')} className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition ${viewMode === 'schematic' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Unifilar</button>
                  <button onClick={() => setViewMode('geographic')} className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition ${viewMode === 'geographic' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>Geográfico</button>
                </div>
             </div>
          </div>
          <div className="flex-1 relative overflow-hidden rounded-lg">
            {viewMode === 'schematic' ? (
              <NetworkMap nodes={MOCK_NODES} edges={MOCK_EDGES} onSelectNode={setSelectedNode} onSelectEdge={setSelectedEdge} />
            ) : (
              <GisView nodes={MOCK_NODES} edges={MOCK_EDGES} onSelectNode={setSelectedNode} standalone={false} />
            )}
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-slate-900 text-slate-100 p-6 rounded-lg shadow-lg border border-slate-800">
              <div className="flex justify-between items-start mb-6">
                <div>
                   <h3 className="font-bold text-lg text-white">Status Operacional</h3>
                   <p className="text-slate-400 text-sm">Ambiente: Produção (Enel SP)</p>
                </div>
                <div className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/30 flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                   SISTEMA ONLINE
                </div>
              </div>
              <div className="space-y-3">
                 <div className="flex items-center justify-between p-3 bg-slate-800 rounded border border-slate-700/50">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-blue-500/20 rounded text-blue-400"><Database size={18}/></div>
                       <div><p className="font-medium text-sm text-slate-200">SAP ERP</p><p className="text-[10px] text-slate-500">Conectado</p></div>
                    </div>
                 </div>
              </div>
           </div>
           <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
             <h3 className="font-bold text-slate-800 mb-4">Alertas de Inteligência</h3>
             <div className="space-y-4 text-xs">
                <div className="flex gap-3 p-2 bg-red-50 border-l-4 border-red-500 rounded">
                   <AlertTriangle className="text-red-500 shrink-0" size={16}/>
                   <p className="text-red-800"><b>Violação Crítica:</b> O poste PT-03 excede a queda de tensão máxima permitida (6.7%).</p>
                </div>
             </div>
           </div>
        </div>
      </div>

      <NodeDetailsModal node={selectedNode} onClose={() => setSelectedNode(null)} />
      <SpanDetailsModal edge={selectedEdge} onClose={() => setSelectedEdge(null)} />

      {/* Field Mode Modal (Tablet) */}
      {isFieldModalOpen && (
        <div className="fixed inset-0 z-[200] bg-slate-100 flex flex-col animate-in slide-in-from-bottom-10 duration-300">
           <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                 <Smartphone />
                 <span className="font-bold">MODO TABLET - COLETA DE CAMPO</span>
              </div>
              <button onClick={() => setIsFieldModalOpen(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full"><X /></button>
           </div>
           <div className="flex-1 overflow-auto">
              <FieldMode />
           </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'electrical': return <VoltageDropModule />;
      case 'mechanical': return <MechanicalStressModule />;
      case 'gis': return <GisView />;
      case 'field': return <FieldMode />;
      case 'audit': return <AuditModule />;
      case 'reports': return <ReportsModule />;
      case 'intelligence': return <IntelligenceModule />;
      case 'enterprise': return <EnterpriseModule />;
      default: return <Dashboard />;
    }
  };
  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
