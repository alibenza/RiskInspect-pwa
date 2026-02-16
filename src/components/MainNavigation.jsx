import React, { useState, useEffect } from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import InspectionForm from './InspectionForm';
import Dashboard from './Dashboard';
import GarantieSelector from './GarantieSelector';
import AIAnalysis from './AIAnalysis';
import { ClipboardList, LayoutDashboard, BrainCircuit, Shield } from 'lucide-react';

const MainNavigation = () => {
  const [activeTab, setActiveTab] = useState('inspect');
  const [isStarted, setIsStarted] = useState(false);
  const { loadFromLocalStorage, selectedGaranties } = useInspectionStore();

  useEffect(() => { loadFromLocalStorage(); }, []);

  return (
    <div className="pb-24">
      <div className="max-w-md mx-auto px-6 pt-8">
        {activeTab === 'inspect' && (!isStarted ? (
          <div className="space-y-6">
            <GarantieSelector />
            <button onClick={() => selectedGaranties.length > 0 && setIsStarted(true)} 
              className={`w-full py-5 rounded-2xl font-black shadow-xl uppercase flex items-center justify-center space-x-2 ${selectedGaranties.length > 0 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
              <Shield size={20} /><span>Démarrer l'Expertise</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button onClick={() => setIsStarted(false)} className="text-[10px] font-black text-blue-600 uppercase mb-2">← Garanties</button>
            <InspectionForm />
          </div>
        ))}
        {activeTab === 'analysis' && <AIAnalysis />}
        {activeTab === 'dashboard' && <Dashboard />}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 py-4 z-[100]">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <button onClick={() => {setActiveTab('inspect'); setIsStarted(false);}} className={`flex flex-col items-center ${activeTab === 'inspect' ? 'text-blue-600' : 'text-slate-300'}`}>
            <ClipboardList size={22} /><span className="text-[9px] font-black uppercase tracking-tighter">Audit</span>
          </button>
          <button onClick={() => setActiveTab('analysis')} className={`flex flex-col items-center ${activeTab === 'analysis' ? 'text-indigo-600' : 'text-slate-300'}`}>
            <BrainCircuit size={22} /><span className="text-[9px] font-black uppercase tracking-tighter">IA</span>
          </button>
          <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-slate-300'}`}>
            <LayoutDashboard size={22} /><span className="text-[9px] font-black uppercase tracking-tighter">Stats</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default MainNavigation;
