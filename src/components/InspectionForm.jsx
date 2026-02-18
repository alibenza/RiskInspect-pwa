import React, { useState } from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import PhotoCapture from './PhotoCapture';
import { 
  MessageSquareText, 
  AlertCircle, 
  PlusCircle, 
  FolderPlus,
  X,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  RefreshCcw
} from 'lucide-react';

const InspectionForm = () => {
  const { 
    questionsConfig, 
    responses, 
    setResponse, 
    addSection, 
    addQuestion,
    addPhoto, 
    removePhoto,
    resetAudit // Récupération de l'action de reset
  } = useInspectionStore();

  const [openSections, setOpenSections] = useState({ 0: true }); // Première section ouverte par défaut

  if (!questionsConfig || questionsConfig.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-slate-400">
        <AlertCircle size={40} className="mb-4 animate-pulse" />
        <p className="text-xs font-black uppercase tracking-widest">Chargement de la configuration...</p>
      </div>
    );
  }

  const toggleSection = (idx) => {
    setOpenSections(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // --- MODIFICATION : SÉCURISATION DE LA PERSISTANCE ---
  const handleScoreChange = (qId, score, label) => {
    setResponse(qId, {
      value: responses[qId]?.value || label, // Garde la valeur existante ou met le label
      score: score,
      label: label,
      isScored: true
    });
  };

  const handleTextChange = (qId, val, label) => {
    setResponse(qId, { 
      value: val, 
      label: label, 
      isScored: false 
    });
  };

  const handleCommentChange = (qId, comment) => {
    setResponse(qId, { comment });
  };

  const isSectionComplete = (questions) => {
    const scoredQuestions = questions.filter(q => q.isScored);
    if (scoredQuestions.length === 0) return false;
    return scoredQuestions.every(q => responses[q.id]?.score);
  };

  return (
    <div className="space-y-4 pb-40 animate-in fade-in duration-500">
      
      {/* BOUTON RESET RAPIDE */}
      <div className="flex justify-end px-2">
        <button 
          onClick={() => confirm("Voulez-vous vider tout le formulaire ?") && resetAudit()}
          className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-400 hover:text-red-500 transition-colors"
        >
          <RefreshCcw size={12} /> Réinitialiser le formulaire
        </button>
      </div>

      {questionsConfig.map((section, sIdx) => {
        const isOpen = openSections[sIdx];
        const complete = isSectionComplete(section.questions);

        return (
          <div key={sIdx} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden transition-all">
            <button 
              onClick={() => toggleSection(sIdx)}
              className={`w-full flex items-center justify-between p-6 transition-all ${isOpen ? 'bg-slate-50' : 'bg-white'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-xl ${complete ? 'bg-green-100 text-green-600' : 'bg-indigo-50 text-indigo-600'}`}>
                  {complete ? <CheckCircle2 size={18} /> : <span className="text-[10px] font-black">{sIdx + 1}</span>}
                </div>
                <h2 className={`text-xs font-black uppercase tracking-widest ${isOpen ? 'text-indigo-600' : 'text-slate-600'}`}>
                  {section.title}
                </h2>
              </div>
              {isOpen ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
            </button>

            {isOpen && (
              <div className="p-6 pt-0 space-y-8 animate-in slide-in-from-top-2 duration-300">
                <div className="h-px bg-slate-100 w-full mb-6" />
                
                {section.questions.map((q) => (
                  <div key={q.id} className="space-y-4 border-b border-slate-50 pb-8 last:border-0">
                    <label className="block text-sm font-bold text-slate-800 leading-tight">
                      {q.label}
                    </label>

                    {q.isScored ? (
                      <div className="flex justify-between items-center gap-2">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <button
                            key={num}
                            onClick={() => handleScoreChange(q.id, num, q.label)}
                            className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${
                              responses[q.id]?.score === num
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <input
                        type="text"
                        placeholder="Réponse libre..."
                        value={responses[q.id]?.value || ''}
                        onChange={(e) => handleTextChange(q.id, e.target.value, q.label)}
                        className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    )}

                    <div className="relative">
                      <MessageSquareText size={14} className="absolute left-4 top-4 text-slate-300" />
                      <textarea
                        placeholder="Observations techniques..."
                        value={responses[q.id]?.comment || ''}
                        onChange={(e) => handleCommentChange(q.id, e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-xl p-4 pl-10 text-xs text-slate-600 focus:ring-2 focus:ring-indigo-500 transition-all min-h-[60px]"
                      />
                    </div>

                    {/* SECTION PHOTO */}
                    <div className="pt-2 space-y-3">
                      <PhotoCapture 
                        qId={q.id} 
                        onCapture={(photoData) => addPhoto(q.id, photoData)} 
                      />

                      {responses[q.id]?.photos?.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                          {responses[q.id].photos.map((p, idx) => (
                            <div key={idx} className="relative flex-shrink-0">
                              <img src={p.url} alt="Preuve" className="w-20 h-20 object-cover rounded-xl border border-slate-100" />
                              <button
                                onClick={() => removePhoto(q.id, idx)}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-md"
                              >
                                <X size={10} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <button 
                  onClick={() => {
                    const label = prompt("Libellé de la question :");
                    if (label) addQuestion(sIdx, label, confirm("Score de 1 à 5 ?"));
                  }}
                  className="w-full py-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-500 transition-colors border-2 border-dashed border-slate-100 rounded-2xl"
                >
                  <PlusCircle size={14} /> Ajouter un point de contrôle
                </button>
              </div>
            )}
          </div>
        );
      })}

      <button 
        onClick={() => {
          const title = prompt("Nom de la section :");
          if (title) addSection(title);
        }}
        className="w-full py-6 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center gap-3 shadow-xl hover:bg-indigo-600 transition-all active:scale-95"
      >
        <FolderPlus size={20} />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Nouvelle Section</span>
      </button>
    </div>
  );
};

export default InspectionForm;
