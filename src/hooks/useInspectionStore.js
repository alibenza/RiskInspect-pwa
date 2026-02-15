import { create } from 'zustand';
import { RISK_QUESTIONS } from '../components/questions.js';;

export const useInspectionStore = create((set, get) => ({
  responses: {},

  // Enregistrer une réponse
  setResponse: (id, value) => {
    const newResponses = { ...get().responses, [id]: value };
    set({ responses: newResponses });
    // Sauvegarde automatique locale
    localStorage.setItem('risk_inspect_data', JSON.stringify(newResponses));
  },

  // Charger les données sauvegardées
  loadFromLocalStorage: () => {
    const saved = localStorage.getItem('risk_inspect_data');
    if (saved) {
      set({ responses: JSON.parse(saved) });
      return true;
    }
    return false;
  },

  // Réinitialiser
  resetInspection: () => {
    localStorage.removeItem('risk_inspect_data');
    set({ responses: {} });
  },

  // Calcul du score global (Moyenne pondérée)
  calculateScore: () => {
    const responses = get().responses;
    let totalWeight = 0;
    let gainedWeight = 0;

    RISK_QUESTIONS.forEach(section => {
      section.questions.forEach(q => {
        if (q.type === 'boolean') {
          totalWeight += (q.weight || 10); // Poids par défaut de 10 si non défini
          if (responses[q.id] === 'Oui') {
            gainedWeight += (q.weight || 10);
          }
        }
      });
    });

    return totalWeight > 0 ? Math.round((gainedWeight / totalWeight) * 100) : 0;
  },

  // Calcul des scores par catégorie (pour le graphique Radar)
  getCategoryScores: () => {
    const responses = get().responses;
    const scores = {};

    RISK_QUESTIONS.forEach(section => {
      let catTotal = 0;
      let catGained = 0;
      let hasBoolean = false;

      section.questions.forEach(q => {
        if (q.type === 'boolean') {
          hasBoolean = true;
          catTotal += (q.weight || 10);
          if (responses[q.id] === 'Oui') catGained += (q.weight || 10);
        }
      });

      if (hasBoolean) {
        scores[section.id] = {
          percentage: catTotal > 0 ? Math.round((catGained / catTotal) * 100) : 0
        };
      }
    });

    return scores;
  }
}));
