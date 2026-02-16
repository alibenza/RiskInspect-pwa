import { create } from 'zustand';

export const useInspectionStore = create((set) => ({
  // CONFIGURATION INITIALE (Basée sur ton document Word)
  questionsConfig: [
    {
      title: "Informations Générales",
      questions: [
        { id: 'nomination', label: "Nomination (Raison Sociale)", isScored: false },
        { id: 'activite_nature', label: "Nature de l’activité", isScored: false },
        { id: 'date_creation', label: "Date Création et mise en service", isScored: false }
      ]
    },
    {
      title: "Informations sur le Site",
      questions: [
        { id: 'superficie_totale', label: "Superficie totale du site", isScored: false },
        { id: 'superficie_batie', label: "Superficie bâtie", isScored: false },
        { id: 'compartimentage', label: "Compartimentage (Production, Stockage, Admin...)", isScored: true }
      ]
    },
    {
      title: "Utilités",
      questions: [
        { id: 'elec_principale', label: "Électricité (Transfos, maintenance, fournisseur)", isScored: true },
        { id: 'elec_secours', label: "Électricité de secours (Groupes électrogènes)", isScored: true },
        { id: 'eau_source', label: "Eau (Fournisseur, capacité, usage)", isScored: true },
        { id: 'gaz_pression', label: "Gasoil et gaz sous pression (Réservoirs)", isScored: true }
      ]
    },
    {
      title: "Management des Risques & HSE",
      questions: [
        { id: 'hse_structure', label: "Structure HSE (Effectif, formations)", isScored: true },
        { id: 'hse_doc', label: "Documentation (EDD, EIE, permis de travail)", isScored: true },
        { id: 'dechets_gestion', label: "Gestion et traitement des déchets", isScored: true }
      ]
    },
    {
      title: "Maintenance",
      questions: [
        { id: 'maint_prog', label: "Programmes de maintenance (Préventive/Curative)", isScored: true },
        { id: 'maint_gmao', label: "Gestion Assistée de maintenance (GMAO)", isScored: true }
      ]
    },
    {
      title: "Lutte contre l'Incendie",
      questions: [
        { id: 'inc_detection', label: "Détection (Type, zones, centralisation)", isScored: true },
        { id: 'inc_mobile', label: "Moyens mobiles (Type, Répartition, mise à jour)", isScored: true },
        { id: 'inc_hydraulique', label: "Réseau hydraulique (Capacité, RIA, Poteaux)", isScored: true },
        { id: 'inc_ext_auto', label: "Systèmes automatiques (Sprinkler, Gaz inertes)", isScored: true }
      ]
    },
    {
      title: "Sûreté du Site",
      questions: [
        { id: 'surete_gardiennage', label: "Gardiennage (Effectifs, brigades)", isScored: true },
        { id: 'surete_cctv', label: "Vidéosurveillance et Contrôle d'accès", isScored: true },
        { id: 'surete_cloture', label: "Clôture et accès au site", isScored: true }
      ]
    }
  ],

  responses: {},
  aiResults: null,

  // ACTIONS POUR MODIFIER LES RÉPONSES
  setResponse: (id, data) => set((state) => ({
    responses: { 
      ...state.responses, 
      [id]: { ...state.responses[id], ...data } 
    }
  })),

  // ACTIONS POUR AJOUTER DYNAMIQUEMENT
  addSection: (title) => set((state) => ({
    questionsConfig: [...state.questionsConfig, { title: title, questions: [] }]
  })),

  addQuestion: (sectionIndex, label, isScored = true) => set((state) => {
    const newConfig = [...state.questionsConfig];
    const newId = `custom_${Date.now()}`;
    newConfig[sectionIndex].questions.push({ id: newId, label: label, isScored: isScored });
    return { questionsConfig: newConfig };
  }),

  setAiResults: (results) => set({ aiResults: results }),

  resetAudit: () => set({ responses: {}, aiResults: null })
}));
