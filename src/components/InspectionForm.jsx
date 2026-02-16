import React, { useState } from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import { PlusCircle, Trash2, MessageSquare, ChevronRight, ChevronLeft } from 'lucide-react';

function InspectionForm() {
  const { questionsConfig, responses, setResponse, addQuestion, removeSection, addSection } = useInspectionStore();
  const [currentStep, setCurrentStep] = useState(0);

  // Sécurité si on supprime le dernier volet
  const section = questionsConfig[currentStep] || questionsConfig[0];
  if (!section) return <div className="p-10 text-center">Aucun volet configuré.</div>;

  // Calcul de la progression du volet actuel
  const answeredCount = section.questions.filter(q => responses[q.id]?.value !== undefined && responses[q.id]?.value !== '').length;
  const progressPercent = section.questions.length > 0 ? Math.round((answeredCount / section.questions.length) * 100) : 0;

  const handleNext = () => setCurrentStep(p => Math.min(p + 1, questionsConfig.length - 1));
  const handlePrev = () => setCurrentStep(p => Math.max(p - 1, 0));

  const renderField = (q) => {
    const resp = responses[q.id] || { value: '', comment: '' };
    return (
      <div className="space-y-4">
        <div className="w-full">
          {q.type === 'range' ? (
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase"><span>Critique (0)</span><span>Excellent (5)</span></div>
              <input type="range" min="0" max="5" step="1" value={resp.value || 0} onChange={(e) => setResponse(q.id, 'value', e.target.value)} className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"/>
              <div className="text-center font-black text-blue-600 text-xl">{resp.value || 0} / 5</div>
            </div>
          ) : q.type === 'number' ? (
            <input type="number" value={resp.value || ''} onChange={(e) => setResponse(q.id, 'value', e.target.value)} className="w-full p-4 rounded-2xl bg-slate-50 border-none text-lg font-bold" placeholder="Saisir une valeur..."/>
          ) : (
            <textarea rows="2" value={resp.value || ''} onChange={(e) => setResponse(q.id, 'value', e.target.value)} className="w-full p-4 rounded-2xl bg-slate-50 border-none text-sm" placeholder="Saisir le texte..."/>
          )}
        </div>
        <div className="relative">
          <div className="absolute left-3 top-3 text-slate-300"><MessageSquare size={14} /></div>
          <textarea rows="2" value={resp.comment || ''} onChange={(e) => setResponse(q.id, 'comment', e.target.value)} className="w-full pl-9 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-xs italic text-slate-600 outline-none" placeholder="Observations..."/>
        </div>
      </div>
    )
  };

  return (
    <div className="space-y-6 pb-32 animate-in fade-in duration-300">
      
      {/* EN-TÊTE DU STEPPER : Progression et Navigation rapide */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
        <div className="flex-1 pr-4">
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">
            Volet {currentStep + 1} sur {questionsConfig.length}
          </p>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
        <span className="text-xl font-black text-blue-600">{progressPercent}%</span>
      </div>

      {/* CONTENU DU VOLET ACTUEL */}
      <div className="bg-white rounded-[2.5rem] p-6 shadow-md border border-slate-100 relative">
        <div className="flex justify-between items-start mb-8 border-b border-slate-50 pb-4">
          <h2 className="text-xl font-black text-slate-800 leading-tight pr-8">{section.title}</h2>
          <button onClick={() => { if(window.confirm("Supprimer ce volet ?")) { removeSection(section.id); setCurrentStep(0); } }} className="text-slate-200 hover:text-red-500 p-2"><Trash2 size={18} /></button>
        </div>

        <div className="space-y-10">
          {section.questions.map((q) => (
            <div key={q.id} className="animate-in slide-in-from-bottom-2 duration-300">
              <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />{q.label}</label>
              {renderField(q)}
            </div>
          ))}
        </div>

        <button onClick={() => { const label = prompt("Nom du point?"); if (label) addQuestion(section.id, label, window.confirm("Note 0-5?")?'range':'text') }} className="mt-10 w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 text-[11px] font-black uppercase flex items-center justify-center space-x-2">
          <PlusCircle size={16} /><span>Ajouter une question ici</span>
        </button>
      </div>

      {/* NAVIGATION PREV / NEXT */}
      <div className="flex space-x-4">
        <button onClick={handlePrev} disabled={currentStep === 0} className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 ${currentStep === 0 ? 'bg-slate-100 text-slate-300' : 'bg-white text-slate-700 shadow-sm border border-slate-200 active:scale-95'}`}>
          <ChevronLeft size={20} /><span>Précédent</span>
        </button>
        <button onClick={handleNext} disabled={currentStep === questionsConfig.length - 1} className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 ${currentStep === questionsConfig.length - 1 ? 'bg-slate-100 text-slate-300' : 'bg-blue-600 text-white shadow-md active:scale-95'}`}>
          <span>Suivant</span><ChevronRight size={20} />
        </button>
      </div>

      {/* AJOUTER UN NOUVEAU VOLET (Flottant) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-50">
        <button onClick={() => { const title = prompt("Nom du nouveau volet ?"); if (title) { addSection(title); setCurrentStep(questionsConfig.length); } }} className="w-full bg-slate-900 text-white py-4 rounded-2xl shadow-2xl flex items-center justify-center space-x-3 border-2 border-slate-800 active:scale-95 transition-transform">
          <PlusCircle size={20} className="text-blue-400" /><span className="font-bold text-sm uppercase">Créer un volet</span>
        </button>
      </div>
    </div>
  )
}

export default InspectionForm;
