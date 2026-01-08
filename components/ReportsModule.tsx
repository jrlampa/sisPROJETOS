import React, { useState } from 'react';
import { FileText, Printer, Download, Stamp, ShieldCheck, AlertCircle } from 'lucide-react';
import { MOCK_PROJECT_DATA, NORMATIVE_LIMITS } from '../constants';

export const ReportsModule: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<'complete' | 'electrical' | 'mechanical'>('complete');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      {/* Sidebar Controls */}
      <div className="w-full lg:w-64 bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col gap-4">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <FileText size={20} className="text-purple-600"/> Documentação
        </h3>
        
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Tipos de Relatório</p>
          <button 
            onClick={() => setSelectedReport('complete')}
            className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition ${
              selectedReport === 'complete' ? 'bg-purple-100 text-purple-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Memorial Completo
          </button>
          <button 
            onClick={() => setSelectedReport('electrical')}
            className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition ${
              selectedReport === 'electrical' ? 'bg-purple-100 text-purple-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Cálculo de Queda de Tensão
          </button>
          <button 
            onClick={() => setSelectedReport('mechanical')}
            className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition ${
              selectedReport === 'mechanical' ? 'bg-purple-100 text-purple-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Esforços Mecânicos
          </button>
        </div>

        <div className="mt-auto border-t border-slate-100 pt-4 space-y-2">
          <button 
            onClick={handlePrint}
            className="w-full flex items-center justify-center gap-2 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 text-sm font-medium"
          >
            <Printer size={16} /> Imprimir
          </button>
          <button className="w-full flex items-center justify-center gap-2 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-medium shadow-sm">
            <Download size={16} /> Exportar PDF
          </button>
        </div>
      </div>

      {/* Report Preview (A4 Paper Style) */}
      <div className="flex-1 bg-slate-200 overflow-auto rounded-lg p-8 flex justify-center">
        <div className="bg-white w-full max-w-[210mm] min-h-[297mm] p-[20mm] shadow-lg text-slate-900 text-sm leading-relaxed relative">
          
          {/* Header */}
          <div className="border-b-2 border-slate-800 pb-4 mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-wide text-slate-900">Memorial de Cálculo</h1>
              <p className="text-slate-500 font-medium mt-1">Projeto de Distribuição de Energia Elétrica</p>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg text-purple-700">sisPROJETO</div>
              <div className="text-xs text-slate-400">Engenharia Digital</div>
            </div>
          </div>

          {/* Project Metadata */}
          <div className="bg-slate-50 p-4 border border-slate-200 mb-8 grid grid-cols-2 gap-y-2 gap-x-8 rounded-sm">
            <div><span className="font-bold text-slate-700">Projeto:</span> {MOCK_PROJECT_DATA.projectName}</div>
            <div><span className="font-bold text-slate-700">ID:</span> {MOCK_PROJECT_DATA.id}</div>
            <div><span className="font-bold text-slate-700">Cliente:</span> {MOCK_PROJECT_DATA.client}</div>
            <div><span className="font-bold text-slate-700">Data:</span> {MOCK_PROJECT_DATA.date}</div>
            <div><span className="font-bold text-slate-700">Responsável Técnico:</span> {MOCK_PROJECT_DATA.engineer}</div>
            <div><span className="font-bold text-slate-700">CREA:</span> {MOCK_PROJECT_DATA.crea}</div>
          </div>

          {/* 1. Objective */}
          <div className="mb-6">
            <h2 className="text-base font-bold uppercase border-b border-slate-300 mb-3 pb-1">1. Objeto</h2>
            <p className="text-justify text-slate-700">
              O presente memorial tem por objetivo apresentar os cálculos elétricos e mecânicos para a rede de distribuição de baixa tensão, 
              assegurando conformidade com as normas técnicas vigentes e os critérios da concessionária local.
            </p>
          </div>

          {/* 2. Standards */}
          <div className="mb-6">
            <h2 className="text-base font-bold uppercase border-b border-slate-300 mb-3 pb-1">2. Normas Aplicáveis</h2>
            <ul className="list-disc list-inside text-slate-700 space-y-1">
              <li><strong>NBR 5410:</strong> Instalações elétricas de baixa tensão.</li>
              <li><strong>NBR 15214:</strong> Rede de distribuição de energia elétrica — Compartilhamento de infraestrutura.</li>
              <li><strong>PRODIST Módulo 8:</strong> Qualidade da Energia Elétrica.</li>
              <li><strong>Normas Internas (Enel/CPFL):</strong> Critérios de projeto de redes aéreas.</li>
            </ul>
          </div>

          {/* 3. Electrical Calculation */}
          {(selectedReport === 'complete' || selectedReport === 'electrical') && (
            <div className="mb-8">
              <h2 className="text-base font-bold uppercase border-b border-slate-300 mb-3 pb-1">3. Memória de Cálculo Elétrico (Queda de Tensão)</h2>
              <p className="mb-2 text-slate-600 text-xs">
                Método: Fluxo de Potência Acumulado. 
                Limite Global: <strong>{NORMATIVE_LIMITS.maxVoltageDrop}%</strong>
              </p>
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300">
                    <th className="p-2 font-bold text-slate-700">Trecho</th>
                    <th className="p-2 font-bold text-slate-700">De -> Para</th>
                    <th className="p-2 font-bold text-slate-700 text-right">Comp. (m)</th>
                    <th className="p-2 font-bold text-slate-700 text-right">Carga (W)</th>
                    <th className="p-2 font-bold text-slate-700">Cabo</th>
                    <th className="p-2 font-bold text-slate-700 text-right">Queda (%)</th>
                    <th className="p-2 font-bold text-slate-700 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_PROJECT_DATA.electrical.map((row) => (
                    <tr key={row.id} className="border-b border-slate-200">
                      <td className="p-2 text-slate-600">{row.id}</td>
                      <td className="p-2 text-slate-600">{row.from} -> {row.to}</td>
                      <td className="p-2 text-right text-slate-600">{row.length}</td>
                      <td className="p-2 text-right text-slate-600">{row.load}</td>
                      <td className="p-2 text-slate-600">{row.cable}</td>
                      <td className="p-2 text-right font-mono">{row.vDrop}%</td>
                      <td className="p-2 text-center">
                         <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                           row.status === 'OK' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                         }`}>
                           {row.status}
                         </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 4. Mechanical Calculation */}
          {(selectedReport === 'complete' || selectedReport === 'mechanical') && (
            <div className="mb-8">
              <h2 className="text-base font-bold uppercase border-b border-slate-300 mb-3 pb-1">4. Memória de Cálculo Mecânico</h2>
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300">
                    <th className="p-2 font-bold text-slate-700">Vão ID</th>
                    <th className="p-2 font-bold text-slate-700">Postes</th>
                    <th className="p-2 font-bold text-slate-700 text-right">Vão (m)</th>
                    <th className="p-2 font-bold text-slate-700 text-right">Tração (daN)</th>
                    <th className="p-2 font-bold text-slate-700 text-right">Fator Seg.</th>
                    <th className="p-2 font-bold text-slate-700 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_PROJECT_DATA.mechanical.map((row) => (
                    <tr key={row.id} className="border-b border-slate-200">
                      <td className="p-2 text-slate-600">{row.id}</td>
                      <td className="p-2 text-slate-600">{row.poles}</td>
                      <td className="p-2 text-right text-slate-600">{row.span}</td>
                      <td className="p-2 text-right text-slate-600">{row.tension}</td>
                      <td className="p-2 text-right text-slate-600">{row.safety}</td>
                      <td className="p-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                           row.status === 'OK' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                         }`}>
                           {row.status}
                         </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 5. Conclusion */}
          <div className="mb-12">
             <h2 className="text-base font-bold uppercase border-b border-slate-300 mb-3 pb-1">5. Parecer Técnico e Conclusão</h2>
             <p className="text-justify text-slate-700 mb-4">
               Com base nas simulações realizadas, verificou-se que o projeto apresenta <strong>1 não conformidade(s) crítica(s)</strong> no segmento de baixa tensão (Queda de Tensão > 5%), exigindo redimensionamento dos condutores ou divisão de circuitos no trecho PT-03 a PT-04.
             </p>
             <p className="text-justify text-slate-700">
               Os esforços mecânicos encontram-se majoritariamente dentro dos limites de segurança, com um ponto de atenção no vão 03, recomendando-se revisão do estaiamento.
             </p>
          </div>

          {/* Signature Area */}
          <div className="flex justify-around mt-16 pt-8">
             <div className="text-center">
                <div className="border-t border-slate-400 w-48 mx-auto mb-2"></div>
                <p className="font-bold text-slate-800">{MOCK_PROJECT_DATA.engineer}</p>
                <p className="text-xs text-slate-500">Engenheiro Responsável</p>
                <p className="text-xs text-slate-500">CREA {MOCK_PROJECT_DATA.crea}</p>
             </div>
             <div className="text-center opacity-50">
                <div className="border border-slate-300 w-32 h-32 mx-auto mb-2 flex flex-col items-center justify-center rounded">
                   <Stamp size={32} className="text-slate-300 mb-1"/>
                   <span className="text-[10px] text-slate-400">Assinatura Digital</span>
                </div>
             </div>
          </div>
          
          {/* Footer */}
          <div className="absolute bottom-8 left-0 right-0 text-center text-[10px] text-slate-400">
             Documento gerado automaticamente pelo sistema sisPROJETO em {new Date().toLocaleString('pt-BR')} - Hash: a1b2c3d4
          </div>

        </div>
      </div>
    </div>
  );
};