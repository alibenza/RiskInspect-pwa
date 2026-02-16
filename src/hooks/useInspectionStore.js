import { create } from 'zustand';

export const useInspectionStore = create((set) => ({
  [span_2](start_span)// CONFIGURATION INITIALE ISSUE DU DOCUMENT[span_2](end_span)
  questionsConfig: [
    {
      [span_3](start_span)title: "Informations Générales",[span_3](end_span)
      questions: [
        [span_4](start_span){ id: 'nomination', label: "Nomination (Raison Sociale)", isScored: false },[span_4](end_span)
        [span_5](start_span){ id: 'activite_nature', label: "Nature de l’activité", isScored: false },[span_5](end_span)
        [span_6](start_span){ id: 'date_creation', label: "Date Création et mise en service", isScored: false }[span_6](end_span)
      ]
    },
    {
      [span_7](start_span)title: "Informations sur le Site",[span_7](end_span)
      questions: [
        [span_8](start_span){ id: 'superficie_totale', label: "Superficie totale du site", isScored: false },[span_8](end_span)
        [span_9](start_span){ id: 'superficie_batie', label: "Superficie bâtie", isScored: false },[span_9](end_span)
        [span_10](start_span){ id: 'compartimentage', label: "Compartimentage (Production, Stockage, Admin...)", isScored: true }[span_10](end_span)
      ]
    },
    {
      [span_11](start_span)title: "Utilités",[span_11](end_span)
      questions: [
        [span_12](start_span){ id: 'elec_principale', label: "Électricité (Transfos, maintenance, fournisseur)", isScored: true },[span_12](end_span)
        [span_13](start_span){ id: 'elec_secours', label: "Électricité de secours (Groupes électrogènes)", isScored: true },[span_13](end_span)
        [span_14](start_span){ id: 'eau_source', label: "Eau (Fournisseur, capacité, usage)", isScored: true },[span_14](end_span)
        [span_15](start_span){ id: 'gaz_pression', label: "Gasoil et gaz sous pression (Réservoirs)", isScored: true }[span_15](end_span)
      ]
    },
    {
      [span_16](start_span)title: "Management des Risques & HSE",[span_16](end_span)
      questions: [
        [span_17](start_span){ id: 'hse_structure', label: "Structure HSE (Effectif, formations)", isScored: true },[span_17](end_span)
        [span_18](start_span){ id: 'hse_doc', label: "Documentation (EDD, EIE, permis de travail)", isScored: true },[span_18](end_span)
        [span_19](start_span){ id: 'dechets_gestion', label: "Gestion et traitement des déchets", isScored: true }[span_19](end_span)
      ]
    },
    {
      [span_20](start_span)title: "Maintenance",[span_20](end_span)
      questions: [
        [span_21](start_span){ id: 'maint_prog', label: "Programmes de maintenance (Préventive/Curative)", isScored: true },[span_21](end_span)
        [span_22](start_span){ id: 'maint_gmao', label: "Gestion Assistée de maintenance (GMAO)", isScored: true }[span_22](end_span)
      ]
    },
    {
      [span_23](start_span)title: "Lutte contre l'Incendie",[span_23](end_span)
      questions: [
        [span_24](start_span){ id: 'inc_detection', label: "Détection (Type, zones, centralisation)", isScored: true },[span_24](end_span)
        [span_25](start_span){ id: 'inc_mobile', label: "Moyens mobiles (Extincteurs, répartition)", isScored: true },[span_25](end_span)
        [span_26](start_span){ id: 'inc_hydraulique', label: "Réseau hydraulique (RIA, Poteaux, Pompes)", isScored: true },[span_26](end_span)
        [span_27](start_span){ id: 'inc_ext_auto', label: "Systèmes automatiques (Sprinkler, Gaz inertes)", isScored: true }[span_27](end_span)
      ]
    },
    {
      [span_28](start_span)title: "Sûreté du Site",[span_28](end_span)
      questions: [
        [span_29](start_span){ id: 'surete_gardiennage', label: "Gardiennage (Effectifs, brigades)", isScored: true },[span_29](end_span)
        [span_30](start_span){ id: 'surete_cctv', label: "Vidéosurveillance et Contrôle d'accès", isScored: true },[span_30](end_span)
        [span_31](start_span){ id: 'surete_cloture', label: "Clôture et accès au site", isScored: true }[span_31](end_span)
      ]
    }
  ],

  responses: {},
  aiResults: null,

  // ACTIONS POUR AJOUTER DYNAMIQUEMENT
  addSection: (title) => set((state) => ({
    questionsConfig: [...state.questionsConfig, { title, questions: [] }]
  })),

  addQuestion: (sectionIdx, questionLabel, isScored = true) => set((state) => {
    const newConfig = [...state.questionsConfig];
    const newId = `custom_${Date.now()}`;
    newConfig[sectionIdx].questions.push({ id: newId, label: questionLabel, isScored });
    return { questionsConfig: newConfig };
  }),

  setResponse: (id, data) => set((state) => ({
    responses: { ...state.responses, [id]: { ...state.responses[id], ...data } }
  })),
  
  setAiResults: (results) => set({ aiResults: results }),
  resetAudit: () => set({ responses: {}, aiResults: null })
}));
