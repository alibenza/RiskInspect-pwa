import { create } from 'zustand';
import { RISK_QUESTIONS } from '../components/questions';

export const useInspectionStore = create((set, get) => ({
  // Configuration des questions (chargée par défaut depuis le fichier questions.js)
  questionsConfig: RISK_QUESTIONS,
  responses: {},
  
  // --- ACTIONS POUR LES RÉPONSES ---
  setResponse: (id, value) => set((state) => {
    const newResponses = { ...state.responses, [id]: value };
    localStorage.setItem('risk-inspect-data', JSON.stringify(newResponses));
    return { responses: newResponses };
  }),

  resetInspection: () => {
    localStorage.removeItem('risk-inspect-data');
    set({ responses: {} });
  },

  // --- ACTIONS POUR LA STRUCTURE DYNAMIQUE (BOUTONS) ---
  addSection: (title) => set((state) => {
    const newConfig = [
      ...state.questionsConfig, 
      { id: `sec_${Date.now()}`, title: title, questions: [] }
    ];
    localStorage.setItem('risk-inspect-config', JSON.stringify(newConfig));
    return { questionsConfig: newConfig };
  }),

  addQuestion: (sectionId, label, type, weight = 10) => set((state) => {
    const newConfig = state.questionsConfig.map(section => 
      section.id === sectionId 
        ? { 
            ...section, 
            questions: [...section.questions, { 
              id: `q_${Date.now()}`, 
              label, 
              type, 
              weight: type === 'range' ? weight : 0 
            }] 
          }
        : section
    );
    localStorage.setItem('risk-inspect-config', JSON.stringify(newConfig));
    return { questionsConfig: newConfig };
  }),

  removeSection: (sectionId) => set((state) => {
    const newConfig = state.questionsConfig.filter(s => s.id !== sectionId);
    localStorage.setItem('risk-inspect-config', JSON.stringify(newConfig));
    return { questionsConfig: newConfig };
  }),

  // --- CHARGEMENT ---
  loadFromLocalStorage: () => {
    const savedData = localStorage.getItem('risk-inspect-data');
    const savedConfig = localStorage.getItem('risk-inspect-config');
    
    set({ 
      responses: savedData ? JSON.parse(savedData) : {},
      questionsConfig: savedConfig ? JSON.parse(savedConfig) : RISK_QUESTIONS
    });
  },

  // --- MOTEUR DE CALCUL PONDÉRÉ ---
  calculateScore: () => {
    const { responses, questionsConfig } = get();
    let totalPointsPossible = 0;
    let totalPointsGained = 0;

    // Logique spécifique : Extincteurs
    const surface = parseFloat(responses['superficie_batie']) || 0;
    const nbReel = parseFloat(responses['nb_extincteurs']) || 0;
    const nbTheorique = Math.ceil(surface / 150);
    
    let scoreNormeExtincteur = 0;
    if (nbTheorique > 0) {
      scoreNormeExtincteur = Math.min(5, (nbReel / nbTheorique) * 5);
    }

    // Parcours de la configuration dynamique
    questionsConfig.forEach(section => {
      section.questions.forEach(q => {
        const weight = q.weight || 0;
        
        if (q.type === 'range') {
          totalPointsPossible += 5 * weight;
          totalPointsGained += (parseFloat(responses[q.id]) || 0) * weight;
        }
        
        if (q.id === 'nb_extincteurs') {
          const normWeight = 20; 
          totalPointsPossible += 5 * normWeight;
          totalPointsGained += scoreNormeExtincteur * normWeight;
        }
      });
    });

    return totalPointsPossible > 0 
      ? Math.round((totalPointsGained / totalPointsPossible) * 100) 
      : 0;
  }
}));
