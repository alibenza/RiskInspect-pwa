import React, { useState } from 'react';
import MainNavigation from './components/MainNavigation';
import Dashboard from './components/Dashboard';
import AIAnalysis from './components/AIAnalysis';
import InspectionForm from './components/InspectionForm';
import AuditorSettings from './components/AuditorSettings'; // Importation du nouveau composant
import { useInspectionStore } from './hooks/useInspectionStore';
import { exportToPdf } from './components/ExportPDF'; // Importation de la fonction d'export
import { FileDown } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('audit');
  
  // Récupération des données nécessaires depuis le store
  const { 
    responses, 
    questionsConfig, 
    aiResults, 
    auditorInfo 
  } = useInspectionStore();

  // Fonction pour afficher le bon contenu selon l'onglet
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'ai':
        return <AIAnalysis />;
      case 'audit':
      default:
        return (
          <div className="space-y-6">
            {/* On place les réglages de l'auditeur en haut du formulaire d'audit */}
            <AuditorSettings />
            <InspectionForm />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
      {/* Header fixe */}
      <header className="p-6 bg-white border-b border-slate-100 sticky top-0 z-10 flex justify-between items-center">
        <h1 className="text-xl font-black uppercase tracking-tighter text-slate-900">
          Risk<span className="text-indigo-600">Inspect</span> Pro
        </h1>
        
        {/* Affichage discret du logo de l'auditeur s'il existe */}
        {auditorInfo.logo && (
          <img 
            src={auditorInfo.logo} 
            alt="Logo Expert" 
            className="h-8 w-auto rounded border border-slate-50" 
          />
        )}
      </header>

      {/* Zone de contenu dynamique */}
      <main className="max-w-2xl mx-auto p-4">
        {renderContent()}
      </main>

      {/* BOUTON D'EXPORT FLOTTANT (Visible partout sauf sur le formulaire pour plus de clarté) */}
      {activeTab !== 'audit' && (
        <div className="fixed bottom-24 right-6 animate-in slide-in-from-bottom-4">
          <button 
            onClick={() => exportToPdf(responses, questionsConfig, aiResults, auditorInfo)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold shadow-2xl hover:bg-indigo-700 transition-all active:scale-95"
          >
            <FileDown size={20} />
            <span className="text-sm">Exporter PDF</span>
          </button>
        </div>
      )}

      {/* Navigation basse */}
      <MainNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;
