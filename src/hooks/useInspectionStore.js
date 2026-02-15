import { create } from 'zustand';
import { RISK_QUESTIONS } from '../components/questions';

export const useInspectionStore = create((set, get) => ({
  questionsConfig: RISK_QUESTIONS,
  responses: {}, // Chaque clé contiendra désormais { value: ..., comment: ... }
  
  // --- ACTIONS POUR LES RÉPONSES (Modifié pour gérer valeur + commentaire) ---
  setResponse: (id, field, val) => set((state) => {
    // field peut être 'value' (pour la note/chiffre) ou 'comment' (pour le texte)
    const current = state.responses[id] || { value: '', comment: '' };
    const newResponses = { 
      ...state.responses, 
      [id]: { ...current, [field]: val } 
    };
    localStorage.setItem('risk-inspect-data', JSON.stringify(newResponses));
    return { responses: newResponses };
  }),

  resetInspection: () => {
    localStorage.removeItem('risk-inspect-data');
    set({ responses: {} });
  },

  // --- ACTIONS POUR LA STRUCTURE DYNAMIQUE ---
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

  // --- MOTEUR DE CALCUL PONDÉRÉ (Adapté pour lire .value) ---
  calculateScore: () => {
    const { responses, questionsConfig } = get();
    let totalPointsPossible = 0;
    let totalPointsGained = 0;

    // Logique spécifique : Extincteurs
    // On va chercher .value pour les calculs
    const surface = parseFloat(responses['superficie_batie']?.value) || 0;
    const nbReel = parseFloat(responses['nb_extincteurs']?.value) || 0;
    const nbTheorique = Math.ceil(surface / 150);
    
    let scoreNormeExtincteur = 0;
    if (nbTheorique > 0) {
      scoreNormeExtincteur = Math.min(5, (nbReel / nbTheorique) * 5);
    }

    questionsConfig.forEach(section => {
      section.questions.forEach(q => {
        const weight = q.weight || 0;
        const resp = responses[q.id]; // Récupère l'objet {value, comment}
        
        if (q.type === 'range') {
          totalPointsPossible += 5 * weight;
          totalPointsGained += (parseFloat(resp?.value) || 0) * weight;
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
