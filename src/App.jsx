import React, { useEffect, useState } from 'react';import { useInspectionStore } from './hooks/useInspectionStore';import InspectionForm from './components/InspectionForm';import Dashboard from './components/Dashboard';import GarantieSelector from './components/GarantieSelector';import { ClipboardList, LayoutDashboard, Settings } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('inspect');
  const [showGaranties, setShowGaranties] = useState(true);
  const { loadFromLocalStorage } = useInspectionStore();

  useEffect(() => { loadFromLocalStorage(); }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-24">
      <div className="max-w-md mx-auto px-6 pt-8">
        {activeTab === 'inspect' ? (
          showGaranties ? (
            <div className="space-y-6">
              <GarantieSelector />
              <button onClick={() => setShowGaranties(false)} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black shadow-xl active:scale-95 transition-all uppercase tracking-widest">Démarrer l'Audit</button>
            </div>
          ) : (
            <div className="space-y-4">
              <button onClick={() => setShowGaranties(true)} className="text-[10px] font-black text-blue-600 uppercase tracking-tighter mb-2 flex items-center">← Modifier les garanties</button>
              <InspectionForm />
            </div>
          )
        ) : (
          <Dashboard />
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-8 py-4 z-[100]">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <button onClick={() => {setActiveTab('inspect'); setShowGaranties(false);}} className={`flex flex-col items-center space-y-1 ${activeTab === 'inspect' ? 'text-blue-600' : 'text-slate-400'}`}>
            <ClipboardList size={24} /><span className="text-[10px] font-bold uppercase">Audit</span>
          </button>
          <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center space-y-1 ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-slate-400'}`}>
            <LayoutDashboard size={24} /><span className="text-[10px] font-bold uppercase">Stats</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
export default App;
