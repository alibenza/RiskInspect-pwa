import React from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import { exportToPdf } from './ExportPDF'; // Vérifiez bien le nom du fichier (ExportPDF.js)
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  BrainCircuit, 
  FileDown, 
  RotateCcw 
} from 'lucide-react';

const MainNavigation = ({ activeTab, setActiveTab }) => {
  const { responses, questionsConfig, aiResults, resetAudit } = useInspectionStore();

  const handleDownload = () => {
    if (Object.keys(responses).length === 0) {
      alert("L'audit est vide. Veuillez remplir quelques informations avant d'exporter.");
      return;
    }
    // On lance l'export avec les 3 piliers de données
    exportToPdf(responses, questionsConfig, aiResults);
  };

  const handleReset = () => {
    if (confirm("Voulez-vous vraiment réinitialiser tout l'audit ?")) {
      resetAudit();
      setActiveTab('audit');
    }
  };

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-md bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl z-50 px-6 py-4">
      <div className="flex items-center justify-between">
        
        {/* Onglet Audit */}
        <button 
          onClick={() => setActiveTab('audit')}
          className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'audit' ? 'text-indigo-400 scale-110' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <ClipboardCheck size={20} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Audit</span>
        </button>

        {/* Onglet Dashboard */}
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'dashboard' ? 'text-indigo-400 scale-110' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <LayoutDashboard size={20} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Stats</span>
        </button>

        {/* Bouton IA (Central) */}
        <button 
          onClick={() => setActiveTab('ai')}
          className={`flex flex-col items-center justify-center -translate-y-8 w-14 h-14 rounded-full shadow-lg transition-all ${activeTab === 'ai' ? 'bg-indigo-500 text-white ring-4 ring-indigo-500/20' : 'bg-slate-800 text-slate-400'}`}
        >
          <BrainCircuit size={24} />
        </button>

        {/* Bouton Export PDF */}
        <button 
          onClick={handleDownload}
          className="flex flex-col items-center space-y-1 text-slate-500 hover:text-green-400 transition-colors"
          title="Exporter le rapport complet"
        >
          <FileDown size={20} />
          <span className="text-[10px] font-black uppercase tracking-tighter">PDF</span>
        </button>

        {/* Bouton Reset */}
        <button 
          onClick={handleReset}
          className="flex flex-col items-center space-y-1 text-slate-500 hover:text-red-400 transition-colors"
        >
          <RotateCcw size={20} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Reset</span>
        </button>

      </div>
    </nav>
  );
};

export default MainNavigation;
