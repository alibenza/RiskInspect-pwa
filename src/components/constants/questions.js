export const RISK_QUESTIONS = [
  // ... vos autres sections ...
  {
    id: 'hse_management',
    title: 'Management des Risques & HSE',
    questions: [
      { id: 'structure_hse', label: 'Existence d’une structure HSE', type: 'boolean', weight: 15 },
      { id: 'doc_hse', label: 'Documentation (EDD, EIE, Permis de travail)', type: 'boolean', weight: 10 },
    ]
  },
  {
    id: 'incendie',
    title: 'Protection Incendie',
    questions: [
      { id: 'detection', label: 'Système de détection automatique', type: 'boolean', weight: 25 },
      { id: 'moyens_mobiles', label: 'Extincteurs conformes et vérifiés', type: 'boolean', weight: 15 },
      { id: 'reseau_hydraulique', label: 'Réseau RIA / Poteaux fonctionnel', type: 'boolean', weight: 20 },
    ]
  },
  {
    id: 'surete',
    title: 'Sûreté',
    questions: [
      { id: 'videosurveillance', label: 'Vidéosurveillance opérationnelle', type: 'boolean', weight: 15 },
    ]
  }
];
