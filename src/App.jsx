import React, { useState } from 'react';
import { LayoutDashboard, ClipboardCheck, History, Settings, Bell } from 'lucide-react';
import Dashboard from './components/Dashboard'; // Ton composant de scoring
import RiskForm from './components/RiskForm';   // Ton composant de saisie

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* HEADER */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-blue-900">RiskInspect</h1>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Expertise Terrain</p>
        </div>
        <button className="p-2 bg-slate-100 rounded-full relative">
          <Bell size={20} className="text-slate-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="max-w-md mx-auto p-4 space-y-6">
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Dashboard />
          </div>
        )}
        
        {activeTab === 'inspect' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
              <h2 className="text-lg font-bold mb-2">Nouvelle Inspection</h2>
              <p className="text-sm text-slate-500">Remplissez les points de contrôle pour générer le score.</p>
            </div>
            <RiskForm />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="text-center py-20">
            <History size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">Aucun historique disponible</p>
          </div>
        )}
      </main>

      {/* NAVIGATION BASSE (BOTTOM NAV) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <NavButton 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')}
          icon={<LayoutDashboard size={24} />}
          label="Stats"
        />
        <NavButton 
          active={activeTab === 'inspect'} 
          onClick={() => setActiveTab('inspect')}
          icon={<ClipboardCheck size={24} />}
          label="Inspecter"
        />
        <NavButton 
          active={activeTab === 'history'} 
          onClick={() => setActiveTab('history')}
          icon={<History size={24} />}
          label="Historique"
        />
        <NavButton 
          active={activeTab === 'settings'} 
          onClick={() => setActiveTab('settings')}
          icon={<Settings size={24} />}
          label="Profil"
        />
      </nav>
    </div>
  );
}

// Sous-composant pour les boutons de navigation
function NavButton({ active, icon, label, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center space-y-1 transition-all ${
        active ? 'text-blue-600 scale-110' : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
    </button>
  );
}

export default App;
