import React from 'react'
import { useInspectionStore } from '../hooks/useInspectionStore'
import { PlusCircle, Trash2, HelpCircle } from 'lucide-react'

function InspectionForm() {
  const { questionsConfig, responses, setResponse, addQuestion, removeSection } = useInspectionStore()

  const renderField = (q) => {
    switch (q.type) {
      case 'range':
        return (
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
              <span>Critique (0)</span>
              <span>Excellent (5)</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="1"
              value={responses[q.id] || 0}
              onChange={(e) => setResponse(q.id, e.target.value)}
              className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="text-center font-black text-blue-600 text-xl">
              {responses[q.id] || 0} / 5
            </div>
          </div>
        )
      case 'number':
        return (
          <input
            type="number"
            value={responses[q.id] || ''}
            onChange={(e) => setResponse(q.id, e.target.value)}
            className="w-full p-4 rounded-2xl bg-slate-50 border-none text-lg font-bold focus:ring-2 focus:ring-blue-500"
            placeholder="0"
          />
        )
      default: // Type 'text'
        return (
          <textarea
            rows="3"
            value={responses[q.id] || ''}
            onChange={(e) => setResponse(q.id, e.target.value)}
            className="w-full p-4 rounded-2xl bg-slate-50 border-none text-sm focus:ring-2 focus:ring-blue-500"
            placeholder="Saisir les détails techniques ici..."
          />
        )
    }
  }

  return (
    <div className="space-y-10 pb-20">
      {questionsConfig.map((section) => (
        <div key={section.id} className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 relative group">
          
          {/* Titre de Section avec option de suppression */}
          <div className="flex justify-between items-start mb-8">
            <h2 className="text-xl font-black text-slate-800 leading-tight pr-8">
              {section.title}
            </h2>
            <button 
              onClick={() => { if(confirm("Supprimer ce volet ?")) removeSection(section.id) }}
              className="text-slate-300 hover:text-red-500 transition-colors"
            >
              <Trash2 size={20} />
            </button>
          </div>

          <div className="space-y-8">
            {section.questions.map((q) => (
              <div key={q.id} className="animate-in slide-in-from-bottom-2 duration-300">
                <label className="block text-sm font-bold text-slate-600 mb-3 flex items-center">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
                  {q.label}
                  {q.weight > 0 && <span className="ml-2 text-[10px] bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full">Poids: {q.weight}</span>}
                </label>
                {renderField(q)}
              </div>
            ))}
          </div>

          {/* Bouton pour ajouter une question à la volée dans cette section */}
          <button
            onClick={() => {
              const label = prompt("Nom de la nouvelle question ?")
              if (!label) return
              const isScore = confirm("Est-ce une notation (0 à 5) ?\n(OK = Notation, Annuler = Texte libre)")
              addQuestion(section.id, label, isScore ? 'range' : 'text')
            }}
            className="mt-8 w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 text-xs font-bold hover:border-blue-200 hover:text-blue-500 transition-all flex items-center justify-center space-x-2"
          >
            <PlusCircle size={16} />
            <span>AJOUTER UN POINT DE CONTRÔLE</span>
          </button>
        </div>
      ))}

      {/* Bouton flottant pour ajouter une nouvelle SECTION entière */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => {
            const title = prompt("Nom du nouveau volet (ex: Risques Environnementaux) ?")
            if (title) {
              const { addSection } = useInspectionStore.getState()
              addSection(title)
            }
          }}
          className="bg-slate-900 text-white p-4 rounded-full shadow-2xl active:scale-90 transition-transform flex items-center space-x-2 border-4 border-white"
        >
          <PlusCircle size={24} />
          <span className="pr-2 font-bold text-sm">Nouveau Volet</span>
        </button>
      </div>
    </div>
  )
}

export default InspectionForm
