import React, { useState } from 'react';
import MainNavigation from './components/MainNavigation';
import Dashboard from './components/Dashboard';
import AIAnalysis from './components/AIAnalysis';
import InspectionForm from './components/InspectionForm'; // Vérifie bien ce nom de fichier
import { useInspectionStore } from './hooks/useInspectionStore';

function App() {
  const [activeTab, setActiveTab] = useState('audit');
  const { questionsConfig } = useInspectionStore();

  // Fonction pour afficher le bon contenu selon l'onglet
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'ai':
        return <AIAnalysis />;
      case 'audit':
      default:
        return <InspectionForm />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header fixe optionnel */}
      <header className="p-6 bg-white border-b border-slate-100">
        <h1 className="text-xl font-black uppercase tracking-tighter text-slate-900">
          Risk<span className="text-indigo-600">Inspect</span> Pro
        </h1>
      </header>

      {/* Zone de contenu dynamique */}
      <main className="max-w-2xl mx-auto p-4">
        {renderContent()}
      </main>

      {/* Navigation basse */}
      <MainNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;
