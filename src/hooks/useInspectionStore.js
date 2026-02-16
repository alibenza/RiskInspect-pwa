import { create } from 'zustand';

export const useInspectionStore = create((set) => ({
  // 1. CONFIGURATION DES QUESTIONS (Le squelette de l'audit)
  questionsConfig: [
    {
      title: "Protection Contre l'Incendie",
      questions: [
        { id: 'fire_extinguishers', label: "Disponibilité et entretien des extincteurs", isScored: true },
        { id: 'fire_alarm', label: "Système de détection incendie fonctionnel", isScored: true },
        { id: 'fire_hazards', label: "Stockage de matières inflammables sécurisé", isScored: true }
      ]
    },
    {
      title: "Sécurité et Vol",
      questions: [
        { id: 'intrusion_alarm', label: "Alarme intrusion reliée à une centrale", isScored: true },
        { id: 'locks_doors', label: "Solidité des accès (portes, rideaux métalliques)", isScored: true },
        { id: 'cctv', label: "Vidéoprotection opérationnelle", isScored: true }
      ]
    },
    {
      title: "Responsabilité Civile & Environnement",
      questions: [
        { id: 'public_access', label: "Sécurité des zones d'accès public", isScored: true },
        { id: 'pollution_risk', label: "Dispositifs de rétention (produits polluants)", isScored: true }
      ]
    },
    {
      title: "Informations Générales",
      questions: [
        { id: 'client_name', label: "Nom de l'entreprise ou du client", isScored: false },
        { id: 'building_age', label: "Année de construction du bâtiment", isScored: false }
      ]
    }
  ],

  // 2. ÉTAT DES RÉPONSES ET RÉSULTATS
  responses: {},
  selectedGaranties: [],
  aiResults: null, // Stockera { synthese, pointsForts, pointsFaibles, recommandations }

  // 3. ACTIONS (Fonctions de modification)
  setResponse: (id, data) => set((state) => ({
    responses: { 
      ...state.responses, 
      [id]: { 
        ...state.responses[id], 
        ...data 
      } 
    }
  })),

  setSelectedGaranties: (garanties) => set({ selectedGaranties: garanties }),

  setAiResults: (results) => set({ aiResults: results }),

  resetAudit: () => set({ 
    responses: {}, 
    aiResults: null,
    selectedGaranties: [] 
  })
}));
