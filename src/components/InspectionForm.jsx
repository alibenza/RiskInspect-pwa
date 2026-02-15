import React from 'react';
import { RISK_QUESTIONS } from '../constants/questions';
import { useInspectionStore } from '../hooks/useInspectionStore';
import { ClipboardList, CheckCircle2, Circle } from 'lucide-react';

const RiskForm = () => {
  const { responses, setResponse } = useInspectionStore();

  return (
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {RISK_QUESTIONS.map((section) => (
        <div key={section.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {/* En-tête de section */}
          <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
            <h3 className="text-white font-bold uppercase text-xs tracking-widest">{section.title}</h3>
            <ClipboardList className="text-slate-400 w-4 h-4" />
          </div>
          
          <div className="p-6 space-y-6">
            {section.questions.map((q) => (
              <div key={q.id} className="flex flex-col space-y-3">
                <label className="text-sm font-bold text-slate-700 leading-tight">
                  {q.label}
                </label>
                
                {/* Champ TEXTAREA pour les descriptions longues */}
                {q.type === 'textarea' ? (
                  <textarea 
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                    rows="3"
                    placeholder="Saisissez les détails ici..."
                    value={responses[q.id] || ''}
                    onChange={(e) => setResponse(q.id, e.target.value)}
                  />
                ) : 
                /* Sélecteur OUI / NON pour le scoring */
                q.type === 'boolean' ? (
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => setResponse(q.id, 'Oui')}
                      className={`flex-1 flex items-center justify-center space-x-2 py-4 rounded-2xl font-bold transition-all border-2 ${
                        responses[q.id] === 'Oui' 
                        ? 'bg-green-500 text-white border-green-500 shadow-lg shadow-green-100' 
                        : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <CheckCircle2 size={18} />
                      <span>Oui</span>
                    </button>
                    <button 
                      onClick={() => setResponse(q.id, 'Non')}
                      className={`flex-1 flex items-center justify-center space-x-2 py-4 rounded-2xl font-bold transition-all border-2 ${
                        responses[q.id] === 'Non' 
                        ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-100' 
                        : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <Circle size={18} />
                      <span>Non</span>
                    </button>
                  </div>
                ) : 
                /* INPUT standard (texte, date, nombre) */
                (
                  <input 
                    type={q.type}
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                    value={responses[q.id] || ''}
                    onChange={(e) => setResponse(q.id, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      
      <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 text-center">
        <p className="text-blue-800 text-sm font-medium">
          Toutes les modifications sont enregistrées automatiquement en local.
        </p>
      </div>
    </div>
  );
};

export default RiskForm;
