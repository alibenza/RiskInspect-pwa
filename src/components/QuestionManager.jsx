import React, { useState } from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import { PlusCircle, FolderPlus } from 'lucide-react';

const QuestionManager = () => {
  const { addSection, addQuestion, questionsConfig } = useInspectionStore();
  const [newSecTitle, setNewSecTitle] = useState('');

  const handleAddSection = () => {
    if (!newSecTitle) return;
    addSection(newSecTitle);
    setNewSecTitle('');
  };

  return (
    <div className="p-4 bg-slate-900 text-white rounded-3xl mt-10">
      <h3 className="font-bold mb-4 flex items-center">
        <FolderPlus className="mr-2" /> Personnaliser l'Audit
      </h3>
      
      {/* Ajouter une Section */}
      <div className="flex space-x-2 mb-6">
        <input 
          type="text" 
          value={newSecTitle}
          onChange={(e) => setNewSecTitle(e.target.value)}
          placeholder="Nom du nouveau volet..."
          className="flex-1 bg-slate-800 border-none rounded-xl p-3 text-sm"
        />
        <button onClick={handleAddSection} className="bg-blue-600 p-3 rounded-xl">
          <PlusCircle size={20} />
        </button>
      </div>

      {/* Liste simplifiée pour ajouter des questions aux sections existantes */}
      <div className="space-y-4">
        {questionsConfig.map(sec => (
          <div key={sec.id} className="border-t border-slate-700 pt-3">
            <p className="text-xs font-bold text-slate-400 uppercase">{sec.title}</p>
            <button 
              onClick={() => {
                const label = prompt("Nom de la question ?");
                const type = confirm("Est-ce une notation 0-5 ? (Annuler pour texte)") ? 'range' : 'text';
                if(label) addQuestion(sec.id, label, type);
              }}
              className="mt-2 text-xs flex items-center text-blue-400"
            >
              <PlusCircle size={14} className="mr-1"/> Ajouter une question ici
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
