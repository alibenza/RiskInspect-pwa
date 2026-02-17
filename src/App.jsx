import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import AIAnalysis from './components/AIAnalysis';
import InspectionForm from './components/InspectionForm';
import AuditorSettings from './components/AuditorSettings';
import { useInspectionStore } from './hooks/useInspectionStore';
import { exportToPdf } from './components/ExportPDF';
import { 
  FileDown, 
  ChevronLeft, 
  ChevronRight, 
  ClipboardCheck, 
  BarChart3, 
  BrainCircuit,
  Settings,
  LogOut
} from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('audit');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  
  const { 
    responses, 
    questionsConfig, 
    aiResults, 
    auditorInfo,
    resetAudit
  } = useInspectionStore();

  const menuItems = [
    { id: 'audit', label: 'Inspection', icon: <ClipboardCheck size={20} /> },
    { id: 'dashboard', label: 'Statistiques', icon: <BarChart3 size={20} /> },
    { id: 'ai', label: 'Expertise IA', icon: <BrainCircuit size={20} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'ai': return <AIAnalysis />;
      case 'audit':
      default:
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <AuditorSettings />
            <InspectionForm />
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* SIDEBAR LATÉRALE */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 bg-slate-900 text-white transition-all duration-300 ease-in-out flex flex-col ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo / Header Sidebar */}
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <h1 className="text-lg font-black uppercase tracking-tighter animate-in fade-in">
              Risk<span className="text-indigo-400">Pro</span>
            </h1>
          )}
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors mx-auto"
          >
            {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-3 space-y-2 mt-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${
                activeTab === item.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="min-w-[20px]">{item.icon}</span>
              {isSidebarOpen && <span className="text-sm font-bold truncate animate-in slide-in-from-left-2">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Actions bas de Sidebar */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          <button 
            onClick={() => exportToPdf(responses, questionsConfig, aiResults, auditorInfo)}
            className="w-full flex items-center gap-4 p-3 text-emerald-400 hover:bg-slate-800 rounded-xl transition-all"
          >
            <FileDown size={20} />
            {isSidebarOpen && <span className="text-sm font-bold">Export PDF</span>}
          </button>
          <button 
            onClick={() => confirm("Réinitialiser l'audit ?") && resetAudit()}
            className="w-full flex items-center gap-4 p-3 text-red-400 hover:bg-slate-800 rounded-xl transition-all"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="text-sm font-bold">Quitter</span>}
          </button>
        </div>
      </aside>

      {/* ZONE DE CONTENU PRINCIPALE */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'pl-64' : 'pl-20'}`}>
        
        {/* Header de Page */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 px-8 flex justify-between items-center">
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Console d'expertise</h2>
            <p className="text-sm font-bold text-slate-900 capitalize">{activeTab}</p>
          </div>

          <div className="flex items-center gap-4">
             {auditorInfo.logo && (
              <img src={auditorInfo.logo} alt="Logo" className="h-10 w-auto rounded-lg shadow-sm border border-slate-100" />
            )}
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-slate-900 uppercase leading-none">{auditorInfo.name || 'Expert'}</p>
              <p className="text-[10px] font-bold text-indigo-500 uppercase">{auditorInfo.company || 'Cabinet IARD'}</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
