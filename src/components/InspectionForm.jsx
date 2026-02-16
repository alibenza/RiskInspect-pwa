import React from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import { CheckCircle2, Circle, AlertCircle, MessageSquareText } from 'lucide-react';

const InspectionForm = () => {
  const { questionsConfig, responses, setResponse } = useInspectionStore();

  // Sécurité : Si questionsConfig n'est pas encore chargé
  if (!questionsConfig || questionsConfig.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-slate-400">
        <AlertCircle size={40} className="mb-4 animate-pulse" />
        <p className="text-xs font-black uppercase tracking-widest">Chargement de la configuration...</p>
      </div>
    );
  }

  const handleScoreChange = (qId, score, label, isScored) => {
    const current = responses[qId] || {};
    setResponse(qId, {
      ...current,
      value: current.value || label,
      score: score,
      label: label,
      isScored: isScored
    });
  };

  const handleCommentChange = (qId, comment) => {
    const current = responses[qId] || {};
    setResponse(qId, { ...current, comment });
  };

  return (
    <div className="space-y-12 pb-32 animate-in fade-in duration-500">
      {questionsConfig.map((section, sIdx) => (
        <div key={sIdx} className="space-y-6">
          {/* Titre de Section */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200"></div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 whitespace-nowrap">
              {section.title}
            </h2>
            <div className="h-px flex-1 bg-slate-200"></div>
          </div>

          {section.questions.map((q) => (
            <div key={q.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-4">
              <label className="block text-sm font-bold text-slate-800 leading-tight">
                {q.label}
              </label>

              {/* Options de Score 1 à 5 */}
              {q.isScored ? (
                <div className="flex justify-between items-center gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleScoreChange(q.id, num, q.label, true)}
                      className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${
                        responses[q.id]?.score === num
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105'
                          : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              ) : (
                /* Input Texte pour questions non-notées */
                <input
                  type="text"
                  placeholder="Réponse..."
                  value={responses[q.id]?.value || ''}
                  onChange={(e) => setResponse(q.id, { value: e.target.value, isScored: false, label: q.label })}
                  className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              )}

              {/* Zone de Commentaire / Observation */}
              <div className="relative group">
                <MessageSquareText size={14} className="absolute left-4 top-4 text-slate-300 group-focus-within:text-indigo-500" />
                <textarea
                  placeholder="Observations ou recommandations..."
                  value={responses[q.id]?.comment || ''}
                  onChange={(e) => handleCommentChange(q.id, e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-xl p-4 pl-10 text-xs text-slate-600 focus:ring-2 focus:ring-indigo-500 transition-all min-h-[80px]"
                />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

{/* BOUTON AJOUTER SECTION */}
<div className="mt-10 p-6 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center gap-4">
  <p className="text-[10px] font-black uppercase text-slate-400">Besoin d'un point spécifique ?</p>
  <div className="flex gap-2 w-full">
    <button 
      onClick={() => {
        const title = prompt("Nom de la nouvelle section :");
        if(title) addSection(title);
      }}
      className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
    >
      + Ajouter une Section
    </button>
  </div>
</div>


export default InspectionForm;
