import React, { useEffect, useState } from 'react';
import { useInspectionStore } from './hooks/useInspectionStore';
import InspectionForm from './components/InspectionForm';
import Dashboard from './components/Dashboard';
import GarantieSelector from './components/GarantieSelector';
import AIAnalysis from './components/AIAnalysis';
import { ClipboardList, LayoutDashboard, BrainCircuit, Shield } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('inspect');
  const [isStarted, setIsStarted] = useState(false);
  const { loadFromLocalStorage, selectedGaranties } = useInspectionStore();

  // Chargement des données au démarrage
  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  // Fonction pour gérer le démarrage de l'audit
  const startAudit = () => {
    if (selectedGaranties.length > 0) {
      setIsStarted(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* En-tête Fixe (Optionnel) */}
      <div className="max-w-md mx-auto px-6 pt-8">
        
        {/* VUE : INSPECTION / AUDIT */}
        {activeTab === 'inspect' && (
          !isStarted ? (
            <div className="space-y-6 animate-in fade-in duration-500">
              <GarantieSelector />
              <button 
                onClick={startAudit}
                disabled={selectedGaranties.length === 0}
                className={`w-full py-5 rounded-2xl font-black shadow-xl transition-all uppercase tracking-widest flex items-center justify-center space-x-2 ${
                  selectedGaranties.length > 0 
                  ? 'bg-blue-600 text-white active:scale-95' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Shield size={20} />
                <span>Démarrer l'Expertise</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <button 
                onClick={() => setIsStarted(false)} 
                className="text-[10px] font-black text-blue-600 uppercase mb-2 flex items-center hover:opacity-70 transition-opacity"
              >
                <span className="mr-1">←</span> Modifier les garanties du contrat
              </button>
              <InspectionForm
