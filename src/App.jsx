import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import AIAnalysis from './components/AIAnalysis';
import InspectionForm from './components/InspectionForm';
import AuditorSettings from './components/AuditorSettings';
import History from './components/History';
import { useInspectionStore } from './hooks/useInspectionStore';
import { exportToPdf } from './components/ExportPDF';
import { 
  FileDown, 
  Menu, 
  X,    
  ClipboardCheck, 
  BarChart3, 
  BrainCircuit,
  LogOut,
  History as HistoryIcon,
  Loader2 // Import de l'icône de chargement
} from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('audit');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false); // <--- NOUVEL ÉTAT

  const { 
    responses, 
    questionsConfig, 
    aiResults, 
    auditorInfo,
    history, 
    resetAudit
  } = useInspectionStore();

  // --- NOUVELLE LOGIQUE D'EXPORTATION ---
  const handleExport = async () => {
    // Sécurité : Si on n'est pas sur l'onglet dashboard ou AI, 
    // l'élément HTML n'existe pas dans le DOM.
    if (activeTab !== 'dashboard' && activeTab !== 'ai') {
      alert("Veuillez vous rendre sur l'onglet 'Statistiques' pour générer le rapport avec graphiques.");
      return;
    }

    setIsExporting(true);
    try {
      // On attend que la fonction asynchrone se termine
      await exportToPdf(responses, questionsConfig, aiResults, auditorInfo);
    } catch (error) {
      console.error("Erreur export:", error);
      alert("Une erreur est survenue lors de la génération du PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  const menuItems = [
    { id: 'audit', label: 'Inspection', icon: <ClipboardCheck size={20} /> },
    { id: 'dashboard', label: 'Statistiques', icon: <BarChart3 size={20} /> },
    { id: 'ai', label: 'Expertise IA', icon: <BrainCircuit size={20} /> },
    { id: 'history', label: 'Archives', icon: <HistoryIcon size={20} />, badge: history.length },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'ai': return <AIAnalysis />;
      case 'history': return <History />;
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
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans relative overflow-x-hidden">
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside 
        className={`fixed inset-y-0 left-0 z-[70] bg-slate-900 text-white transition-transform duration-300 ease-in-out w-72 flex flex-col shadow-2xl ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          <h1 className="text-lg font-black uppercase tracking-tighter">
            Risk<span className="text-indigo-400">Pro</span>
          </h1>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-6">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all relative ${
                activeTab === item.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="text-sm font-bold">{item.label}</span>
              {item.badge > 0 && (
                <span className="ml-auto flex items-center justify-center bg-indigo-400 text-slate-900 text-[10px] font-black rounded-full h-5 w-5">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          {/* BOUTON EXPORT MIS À JOUR */}
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
              isExporting 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
              : 'text-emerald-400 hover:bg-slate-800'
            }`}
          >
            {isExporting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <FileDown size={20} />
            )}
            <span className="text-sm font-bold">
              {isExporting ? 'Génération...' : 'Export PDF'}
            </span>
          </button>

          <button 
            onClick={() => confirm("Réinitialiser l'audit en cours ?") && resetAudit()}
            className="w-full flex items-center gap-4 p-4 text-red-400 hover:bg-slate-800 rounded-2xl transition-all"
          >
            <LogOut size={20} />
            <span className="text-sm font-bold">Vider le formulaire</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 px-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors text-slate-600 border border-slate-200"
            >
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none">Console</h2>
              <p className="text-sm font-bold text-slate-900 capitalize">
                {activeTab === 'audit' ? 'Inspection Terrain' : activeTab}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {auditorInfo.logo && (
              <img src={auditorInfo.logo} alt="Logo" className="h-9 w-auto rounded-lg shadow-sm" />
            )}
            <div className="text-right hidden xs:block">
              <p className="text-[10px] font-black text-slate-900 uppercase leading-none">{auditorInfo.name || 'Expert'}</p>
              <p className="text-[9px] font-bold text-indigo-500 uppercase">{auditorInfo.company || 'Cabinet IARD'}</p>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto p-6 w-full">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
