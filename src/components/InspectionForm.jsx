import React from 'react'
import { useInspectionStore } from '../hooks/useInspectionStore'
import { PlusCircle, Trash2, MessageSquare } from 'lucide-react'

function InspectionForm() {
  const { questionsConfig, responses, setResponse, addQuestion, removeSection } = useInspectionStore()

  const renderField = (q) => {
    const resp = responses[q.id] || { value: '', comment: '' };

    return (
      <div className="space-y-4">
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
              placeholder="Détails techniques..."
            />
          )}
        </div>
        <div className="relative">
          <div className="absolute left-3 top-3 text-slate-300">
            <MessageSquare size={14} />
          </div>
          <textarea
            rows="2"
            value={resp.comment || ''}
            onChange={(e) => setResponse(q.id, 'comment', e.target.value)}
            className="w-full pl-9 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-xs italic text-slate-600 focus:ring-2 focus:ring-blue-400 outline-none transition-all shadow-sm"
            placeholder="Observations..."
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10 pb-32">
      {questionsConfig.map((section) => (
        <div key={section.id} className="bg-white rounded-[2.5rem] p-6 shadow-md border border-slate-100 relative">
          <div className="flex justify-between items-start mb-8 border-b border-slate-50 pb-4">
            <h2 className="text-xl font-black text-slate-800 leading-tight pr-8">{section.title}</h2>
            <button 
              onClick={() => { if(window.confirm("Supprimer ce volet ?")) removeSection(section.id) }}
              className="text-slate-200 hover:text-red-500 transition-colors p-2"
            ><Trash2 size={18} /></button>
          </div>
          <div className="space-y-10">
            {section.questions.map((q) => (
              <div key={q.id} className="animate-in slide-in-from-bottom-2 duration-300">
                <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />{q.label}
                </label>
                {renderField(q)}
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              const label = prompt("Nom du nouveau point ?")
              if (label) addQuestion(section.id, label, window.confirm("Notation 0-5 ?") ? 'range' : 'text')
            }}
            className="mt-10 w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 text-[11px] font-black uppercase hover:border-blue-200 hover:text-blue-500 transition-all flex items-center justify-center space-x-2"
          ><PlusCircle size={16} /><span>Ajouter une question</span></button>
        </div>
      ))}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-50">
        <button
          onClick={() => {
            const title = prompt("Nom du nouveau volet ?")
            if (title) addSection(title)
          }}
          className="w-full bg-slate-900 text-white py-4 rounded-2xl shadow-2xl flex items-center justify-center space-x-3 border-2 border-slate-800 active:scale-95 transition-transform"
        ><PlusCircle size={20} className="text-blue-400" /><span className="font-bold text-sm uppercase">Nouveau Volet</span></button>
      </div>
    </div>
  )
}
export default InspectionForm
