
import React from 'react';
import { 
  Activity, 
  Map as MapIcon, 
  FileText, 
  Settings, 
  Menu, 
  Zap, 
  Anchor,
  LayoutDashboard,
  BrainCircuit,
  Building2,
  Smartphone,
  ShieldCheck
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const navItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'electrical', label: 'Cálculo Elétrico', icon: Zap },
    { id: 'mechanical', label: 'Cálculo Mecânico', icon: Anchor },
    { id: 'gis', label: 'GIS & Campo', icon: MapIcon },
    { id: 'field', label: 'Modo Técnico (Tablet)', icon: Smartphone },
    { id: 'audit', label: 'Auditoria & Defesa', icon: ShieldCheck }, // Added
    { id: 'reports', label: 'Relatórios & Auditoria', icon: FileText },
    { id: 'intelligence', label: 'Inteligência & IA', icon: BrainCircuit },
    { id: 'enterprise', label: 'Enterprise & Config', icon: Building2 },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-slate-900 text-slate-100 transition-all duration-300 flex flex-col shadow-xl z-20`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          {sidebarOpen && <span className="text-xl font-bold tracking-tight text-blue-400">sis<span className="text-white">PROJETO</span></span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-800 rounded text-slate-400">
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 py-6 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white border-r-4 border-blue-300' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={22} />
              {sidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
           <button className="flex items-center gap-3 text-slate-400 hover:text-white transition w-full">
             <Settings size={20} />
             {sidebarOpen && <span className="text-sm">Configurações</span>}
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10">
          <div>
            <h1 className="text-lg font-semibold text-slate-800">Projeto: Expansão Linha Sul - SP</h1>
            <p className="text-xs text-slate-500">Última sincronização: Hoje, 10:42</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200">
               ONLINE
             </div>
             <div className="h-8 w-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
               JS
             </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
