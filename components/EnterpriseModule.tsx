import React, { useState } from 'react';
import { Building2, Settings, Database, Users, Shield, RefreshCw, Check, Globe } from 'lucide-react';

export const EnterpriseModule: React.FC = () => {
  const [selectedUtility, setSelectedUtility] = useState('Enel SP');
  const [activeTab, setActiveTab] = useState('norms');

  const utilities = ['Enel SP', 'Enel RJ', 'Cemig', 'Copel', 'Neoenergia'];
  
  const integrations = [
    { id: 1, name: 'SAP ERP (ECC 6.0)', type: 'Financeiro/Ativos', status: 'connected', lastSync: '10 min atrás' },
    { id: 2, name: 'Legacy GIS (Smallworld)', type: 'Geospacial', status: 'syncing', lastSync: 'Em andamento...' },
    { id: 3, name: 'OMS (PowerOn)', type: 'Operação', status: 'error', lastSync: 'Falha há 2h' },
    { id: 4, name: 'SCADA Historian', type: 'Medição', status: 'connected', lastSync: '1 min atrás' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Bar: Tenant Selector */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-2 rounded text-white">
            <Building2 size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Painel Corporativo</h2>
            <p className="text-xs text-slate-500">Gestão Multi-Concessionária</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <label className="text-sm font-medium text-slate-600">Concessionária Ativa:</label>
           <select 
             value={selectedUtility}
             onChange={(e) => setSelectedUtility(e.target.value)}
             className="p-2 border border-slate-300 rounded-md font-bold text-slate-800 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
           >
             {utilities.map(u => <option key={u} value={u}>{u}</option>)}
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
           <button 
             onClick={() => setActiveTab('norms')}
             className={`w-full flex items-center gap-3 px-4 py-4 border-l-4 transition ${activeTab === 'norms' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-transparent text-slate-600 hover:bg-slate-50'}`}
           >
             <Settings size={20} /> Normas e Parâmetros
           </button>
           <button 
             onClick={() => setActiveTab('integrations')}
             className={`w-full flex items-center gap-3 px-4 py-4 border-l-4 transition ${activeTab === 'integrations' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-transparent text-slate-600 hover:bg-slate-50'}`}
           >
             <Database size={20} /> Integrações (APIs)
           </button>
           <button 
             onClick={() => setActiveTab('users')}
             className={`w-full flex items-center gap-3 px-4 py-4 border-l-4 transition ${activeTab === 'users' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-transparent text-slate-600 hover:bg-slate-50'}`}
           >
             <Users size={20} /> Usuários e Perfis
           </button>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow-sm border border-slate-200 p-6 min-h-[500px]">
          
          {/* TAB: NORMS */}
          {activeTab === 'norms' && (
            <div className="animate-in fade-in duration-300">
               <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                 <Settings className="text-blue-600" /> Configuração de Normas - {selectedUtility}
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <h4 className="font-semibold text-slate-700 mb-4 border-b pb-2">Limites Elétricos (PRODIST)</h4>
                    <div className="space-y-4">
                       <div>
                         <label className="block text-sm text-slate-600 mb-1">Queda de Tensão Máx (BT)</label>
                         <div className="flex gap-2 items-center">
                            <input type="number" defaultValue={5.0} className="p-2 border rounded w-24" />
                            <span className="text-sm text-slate-500">%</span>
                         </div>
                       </div>
                       <div>
                         <label className="block text-sm text-slate-600 mb-1">Queda de Tensão Máx (MT)</label>
                         <div className="flex gap-2 items-center">
                            <input type="number" defaultValue={3.0} className="p-2 border rounded w-24" />
                            <span className="text-sm text-slate-500">%</span>
                         </div>
                       </div>
                       <div>
                         <label className="block text-sm text-slate-600 mb-1">Fator de Potência Ref.</label>
                         <div className="flex gap-2 items-center">
                            <input type="number" defaultValue={0.92} className="p-2 border rounded w-24" />
                         </div>
                       </div>
                    </div>
                  </div>

                  <div className="p-4 border border-slate-200 rounded-lg">
                    <h4 className="font-semibold text-slate-700 mb-4 border-b pb-2">Critérios Mecânicos</h4>
                    <div className="space-y-4">
                       <div>
                         <label className="block text-sm text-slate-600 mb-1">Fator de Segurança (Tração)</label>
                         <input type="number" defaultValue={2.5} className="p-2 border rounded w-24" />
                       </div>
                       <div>
                         <label className="block text-sm text-slate-600 mb-1">Pressão de Vento Padrão (Pa)</label>
                         <input type="number" defaultValue={600} className="p-2 border rounded w-24" />
                       </div>
                       <div>
                         <label className="block text-sm text-slate-600 mb-1">Norma de Referência</label>
                         <select className="p-2 border rounded w-full bg-white">
                           <option>NBR 15214 (Brasil)</option>
                           <option>IEC 60826 (Internacional)</option>
                         </select>
                       </div>
                    </div>
                  </div>
               </div>
               
               <div className="mt-6 flex justify-end">
                 <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium shadow-sm">
                   Salvar Parâmetros Globais
                 </button>
               </div>
            </div>
          )}

          {/* TAB: INTEGRATIONS */}
          {activeTab === 'integrations' && (
            <div className="animate-in fade-in duration-300">
               <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                 <Globe className="text-blue-600" /> Integrações Corporativas
               </h3>
               
               <div className="space-y-4">
                 {integrations.map((sys) => (
                   <div key={sys.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:shadow-md transition bg-slate-50">
                      <div className="flex items-center gap-4">
                        <div className="bg-white p-2 rounded shadow-sm border border-slate-100">
                          <Database size={24} className="text-slate-500" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800">{sys.name}</h4>
                          <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">{sys.type}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className={`text-sm font-bold flex items-center gap-1 justify-end ${
                            sys.status === 'connected' ? 'text-green-600' :
                            sys.status === 'syncing' ? 'text-blue-600' : 'text-red-600'
                          }`}>
                            {sys.status === 'connected' && <Check size={14} />}
                            {sys.status === 'syncing' && <RefreshCw size={14} className="animate-spin" />}
                            {sys.status === 'connected' ? 'Conectado' : sys.status === 'syncing' ? 'Sincronizando' : 'Erro de Conexão'}
                          </div>
                          <p className="text-xs text-slate-400">{sys.lastSync}</p>
                        </div>
                        <div className="h-6 w-px bg-slate-300"></div>
                        <button className="text-sm text-blue-600 font-medium hover:underline">Configurar</button>
                      </div>
                   </div>
                 ))}
               </div>

               <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800 flex items-start gap-2">
                  <Shield size={18} className="shrink-0 mt-0.5" />
                  <p>
                    A conexão com sistemas legados é feita via VPN segura. Os dados são criptografados ponta-a-ponta.
                    Para configurar novos endpoints, contate a equipe de TI da {selectedUtility}.
                  </p>
               </div>
            </div>
          )}

          {/* TAB: USERS */}
          {activeTab === 'users' && (
            <div className="animate-in fade-in duration-300">
               <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                 <Shield className="text-blue-600" /> Controle de Acesso (RBAC)
               </h3>
               
               <table className="w-full text-sm text-left">
                 <thead className="bg-slate-100 text-slate-600 uppercase font-semibold">
                   <tr>
                     <th className="p-3">Usuário</th>
                     <th className="p-3">Email</th>
                     <th className="p-3">Perfil</th>
                     <th className="p-3 text-center">Status</th>
                     <th className="p-3 text-right">Ações</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {[
                     { name: 'João Silva', email: 'joao.eng@utility.com', role: 'Engenheiro Sênior', status: 'active' },
                     { name: 'Maria Souza', email: 'maria.campo@utility.com', role: 'Técnico de Campo', status: 'active' },
                     { name: 'Carlos Admin', email: 'admin@utility.com', role: 'Administrador', status: 'active' },
                     { name: 'Auditor Externo', email: 'auditoria@gov.br', role: 'Visualização', status: 'inactive' },
                   ].map((user, i) => (
                     <tr key={i} className="hover:bg-slate-50">
                       <td className="p-3 font-medium text-slate-800">{user.name}</td>
                       <td className="p-3 text-slate-500">{user.email}</td>
                       <td className="p-3">
                         <span className={`px-2 py-1 rounded text-xs font-bold ${
                           user.role === 'Administrador' ? 'bg-purple-100 text-purple-700' :
                           user.role === 'Técnico de Campo' ? 'bg-orange-100 text-orange-700' :
                           'bg-blue-100 text-blue-700'
                         }`}>
                           {user.role}
                         </span>
                       </td>
                       <td className="p-3 text-center">
                         <div className={`w-2 h-2 rounded-full mx-auto ${user.status === 'active' ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                       </td>
                       <td className="p-3 text-right text-slate-400 hover:text-blue-600 cursor-pointer">Editar</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};