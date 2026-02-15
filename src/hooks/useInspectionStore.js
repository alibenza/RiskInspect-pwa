import { create } from 'zustand';
import { RISK_QUESTIONS } from '../components/questions';

export const useInspectionStore = create((set, get) => ({
  responses: {},
  
  setResponse: (id, value) => set((state) => ({
    responses: { ...state.responses, [id]: value }
  })),

  resetInspection: () => set({ responses: {} }),

  loadFromLocalStorage: () => {
    const saved = localStorage.getItem('risk-inspect-data');
    if (saved) set({ responses: JSON.parse(saved) });
  },

  calculateScore: () => {
    const responses = get().responses;
    let totalPointsPossible = 0;
    let totalPointsGained = 0;

    // --- LOGIQUE SPÉCIFIQUE : EXTINCTEURS ---
    const surface = parseFloat(responses['superficie_batie']) || 0;
    const nbReel = parseFloat(responses['nb_extincteurs']) || 0;
    const nbTheorique = Math.ceil(surface / 150);
    
    let scoreNormeExtincteur = 0;
    if (nbTheorique > 0) {
      scoreNormeExtincteur = Math.min(5, (nbReel / nbTheorique) * 5);
    }

    // --- CALCUL GLOBAL PONDÉRÉ ---
    RISK_QUESTIONS.forEach(section => {
      section.questions.forEach(q => {
        const weight = q.weight || 0;
        
        // Si c'est une notation 0-5
        if (q.type === 'range') {
          totalPointsPossible += 5 * weight;
          totalPointsGained += (parseFloat(responses[q.id]) || 0) * weight;
        }
        
        // Intégration du calcul normatif dans le score incendie
        if (q.id === 'nb_extincteurs') {
          const normWeight = 20; // Poids fort pour la conformité légale
          totalPointsPossible += 5 * normWeight;
          totalPointsGained += scoreNormeExtincteur * normWeight;
        }
      });
    });

    const finalScore = totalPointsPossible > 0 
      ? Math.round((totalPointsGained / totalPointsPossible) * 100) 
      : 0;

    localStorage.setItem('risk-inspect-data', JSON.stringify(responses));
    return finalScore;
  }
}));
