import React from 'react'
import { useInspectionStore } from '../hooks/useInspectionStore'
import { PlusCircle, Trash2, MessageSquare } from 'lucide-react'

function InspectionForm() {
  const { questionsConfig, responses, setResponse, addQuestion, removeSection } = useInspectionStore()

  const renderField = (q) => {
    // On récupère l'objet de réponse ou on initialise par défaut
    const resp = responses[q.id] || { value: '', comment: '' };

    return (
      <div className="space-y-4">
        {/* PARTIE 1 : CONTRÔLE PRINCIPAL (Note, Nombre ou Texte) */}
        <div className="w-full">
          {q.type === 'range' ? (
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Critique (0)</span>
                <span>Excellent (5)</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="1"
                value={resp.value || 0}
                onChange={(e) => setResponse(q.id, 'value', e.target.value)}
                className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="text-center font-black text-blue-600 text-xl">
                {resp.value || 0} / 5
              </div>
            </div>
          ) : q.type === 'number' ? (
            <input
              type="number"
              value={resp.value || ''}
              onChange={(e) => setResponse(q.id, 'value', e.target.value)}
              className="w-full p-4 rounded-2xl bg-slate-50 border-none text-lg font-bold focus:ring-2 focus:ring-blue-500"
              placeholder="Saisir un nombre..."
            />
          ) : (
            <textarea
              rows="2"
              value={resp.value || ''}
              onChange={(e) => setResponse(q.id, 'value', e.target.value)}
              className="w-full p-4 rounded-2xl bg-slate-50 border-none text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Détails techniques principaux..."
            />
          )}
        </div>

        {/* PARTIE 2 : COMMENTAIRE LIBRE (Systématique pour CHAQUE question) */}
        <div className="relative group/comment">
          <div className="absolute left-3 top-3 text-slate-300">
            <MessageSquare size={14} />
          </div>
          <textarea
            rows="2"
            value={resp.comment || ''}
            onChange={(e) => setResponse(q.id, 'comment', e.target.value)}
            className="w-full pl-9 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-xs italic text-slate-600 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all shadow-sm"
            placeholder="Ajouter une observation ou une remarque particulière..."
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10 pb-32">
      {questionsConfig.map((section) => (
        <div key={section.id} className="bg-white rounded-[2.5rem] p-6 shadow-md border border-slate
