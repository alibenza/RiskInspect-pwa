import React from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';

const ScoreDisplay = () => {
  const score = useInspectionStore((state) => state.calculateScore());

  const getStatus = (s) => {
    if (s >= 80) return { color: 'text-green-600', bg: 'bg-green-100', label: 'Risque Maîtrisé' };
    if (s >= 50) return { color: 'text-orange-600', bg: 'bg-orange-100', label: 'Amélioration Requise' };
    return { color: 'text-red-600', bg: 'bg-red-100', label: 'Risque Critique' };
  };

  const status = getStatus(score);

  return (
    <div className={`p-6 rounded-3xl ${status.bg} border-2 border-white shadow-inner text-center transition-all duration-500`}>
      <span className="text-sm font-bold uppercase tracking-widest text-slate-500">Score de Conformité</span>
      <div className={`text-6xl font-black my-2 ${status.color}`}>{score}%</div>
      <div className={`inline-block px-4 py-1 rounded-full text-xs font-bold uppercase ${status.color} bg-white/50`}>
        {status.label}
      </div>
    </div>
  );
};

export default ScoreDisplay;
