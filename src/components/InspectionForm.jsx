import React, { useState } from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import { PlusCircle, Trash2, MessageSquare, ChevronRight, ChevronLeft, Info } from 'lucide-react';

function InspectionForm() {
  const { questionsConfig, responses, setResponse, addQuestion, removeSection, addSection } = useInspectionStore();
  const [currentStep, setCurrentStep] = useState(0);

  const section = questionsConfig[currentStep] || questionsConfig[0];
  if (!section) return <div className="p-10 text-center">Aucun volet configuré.</div>;

  // Calculs de progression
  const globalProgress = Math.round(((currentStep + 1) / questionsConfig.length) * 100);
  const answeredCount = section.questions.filter(q => responses[q.id]?.value).length;
  const sectionProgress = section.questions.length > 0 ? Math.round((answeredCount / section.questions.length) * 100) : 0;

  const handleNext = () => setCurrentStep(p => Math.min(p + 1, questionsConfig.length - 1));
  const handlePrev = () => setCurrentStep(p => Math.max(p - 1, 0));

  const renderField = (q) => {
    const resp = responses[q.id] || { value: '', comment: '', score: 0, isScored: false };
    
    return (
      <div className="space-y-3 bg-white p-3 rounded-2xl border border-slate-50 shadow-sm">
        <div className="flex justify-between items-start mb-2">
          <label className="text-sm font-bold text-slate-700 flex-1 pr-4">{q.label}</label>
          <div className="flex flex-col items-end shrink-0">
            <button 
              onClick={() => setResponse(q.id, 'isScored', !resp.isScored)}
              className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${resp.isScored ? 'bg-blue-600' : 'bg-slate-200'}`}
            >
              <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${resp.isScored ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className="text-[8px] font-black uppercase mt-1 text-slate-400">{resp.isScored ? 'Noté' : 'Info'}</span>
          </div>
        </div>

        <div className="w-full">
          {q.type === 'number' ? (
            <input type="number" value={resp.value || ''} onChange={(e) => setResponse(q.id, 'value', e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 border-none text-sm font-bold" placeholder="Valeur numérique..."/>
          ) : (
            <textarea rows="2" value={resp.value || ''} onChange={(e) => setResponse(q.id, 'value', e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 border-none text-sm" placeholder="Description..."/>
          )}
        </div>

        {resp.isScored && (
          <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between text-[9px] font-black text-blue-400 uppercase mb-2"><span>Risque Élevé</span><span>Maîtrisé</span></div>
            <input type="range" min="0" max="5" step="1" value={resp.score || 0} onChange={(e) => setResponse(q.id, 'score', e.target.value)} className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"/>
            <div className="text-center font-black text-blue-600 text-sm mt-1">{resp.score || 0} / 5</div>
          </div>
        )}

        <div className="relative">
          <div className="absolute left-3 top-3 text-slate-300"><MessageSquare size={12} /></div>
          <textarea rows="1" value={resp.comment || ''} onChange={(e) => setResponse(q.id, 'comment', e.target.value)} className="w-full pl-8 pr-4 py-2 rounded-xl bg-slate-50/50 border border-transparent text-xs italic text-slate-500 outline-none focus:border-blue-200" placeholder="Notes d'expertise..."/>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 pb-32 animate-in fade-in duration-500">
      
      {/* DOUBLE PROGRESSION */}
      <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-3">
          <div className="px-3 py-1 bg-blue-600 rounded-full text-[10px] font-black text-white uppercase tracking-widest">
            {section.title}
          </div>
          <span className="text-xs font-black text-slate-400">{currentStep + 1} / {questionsConfig.length}</span>
        </div>
        <div className="space-y-2">
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-blue-600 h-full transition-all duration-700" style={{ width: `${globalProgress}%` }}></div>
          </div>
          <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase">
            <span>Progression globale</span>
            <span>{globalProgress}%</span>
          </div>
        </div>
      </div>

      {/* LISTE DES QUESTIONS */}
      <div className="space-y-4">
        {section.questions.map((q) => (
          <div key={q.id} className="animate-in slide-in-from-bottom-4 duration-500">
            {renderField(q)}
          </div>
        ))}
      </div>

      {/* BOUTON AJOUTER (DISCRET) */}
      <button onClick={() => { const label = prompt("Libellé du point ?"); if (label) addQuestion(section.id, label, 'text') }} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-[10px] font-bold uppercase flex items-center justify-center space-x-2 active:bg-slate-50">
        <PlusCircle size={14} /><span>Ajouter un point de contrôle</span>
      </button>

      {/* NAVIGATION FIXE EN BAS */}
      <div className="fixed bottom-24 left-0 right-0 px-6 pointer-events-none">
        <div className="max-w-md mx-auto flex space-x-3 pointer-events-auto">
          <button onClick={handlePrev} disabled={currentStep === 0} className={`flex-1 py-4 rounded-2xl font-black flex items-center justify-center space-x-2 shadow-lg transition-all ${currentStep === 0 ? 'bg-slate-100 text-slate-300' : 'bg-white text-slate-700 active:scale-95'}`}>
            <ChevronLeft size={20} /><span>RETOUR</span>
          </button>
          <button onClick={handleNext} disabled={currentStep === questionsConfig.length - 1} className={`flex-1 py-4 rounded-2xl font-black flex items-center justify-center space-x-2 shadow-lg transition-all ${currentStep === questionsConfig.length - 1 ? 'bg-slate-100 text-slate-300' : 'bg-blue-600 text-white active:scale-95'}`}>
            <span>SUIVANT</span><ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* GESTION DES VOLETS */}
      <div className="flex justify-center space-x-4 pt-4">
         <button onClick={() => { const title = prompt("Nom du volet ?"); if (title) { addSection(title); setCurrentStep(questionsConfig.length); } }} className="text-[10px] font-black text-slate-400 uppercase underline decoration-blue-500 underline-offset-4">Nouveau volet</button>
         <button onClick={() => { if(window.confirm("Supprimer ce volet ?")) { removeSection(section.id); setCurrentStep(0); } }} className="text-[10px] font-black text-red-400 uppercase underline decoration-red-200 underline-offset-4">Supprimer le volet</button>
      </div>
    </div>
  );
}

export default InspectionForm;
