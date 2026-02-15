export const RISK_QUESTIONS = [
  {
    id: 'site_infos',
    title: 'Informations Site',
    questions: [
      { id: 'superficie_batie', label: 'Superficie bâtie (m²)', type: 'number' },
      { id: 'activite', label: 'Type d\'activité', type: 'text' }
    ]
  },
  {
    id: 'incendie',
    title: 'Protection Incendie',
    questions: [
      { id: 'nb_extincteurs', label: 'Nombre d’extincteurs', type: 'number' },
      { id: 'etat_extincteurs', label: 'Maintenance & État des extincteurs', type: 'range', weight: 15 },
      { id: 'ria', label: 'Réseau RIA (Pression, Accessibilité)', type: 'range', weight: 20 },
      { id: 'detection', label: 'Fiabilité Détection Automatique', type: 'range', weight: 25 }
    ]
  },
  {
    id: 'organisation',
    title: 'Management & HSE',
    questions: [
      { id: 'formation', label: 'Formation du personnel (Équipiers d\'intervention)', type: 'range', weight: 15 },
      { id: 'exercices', label: 'Fréquence des exercices d\'évacuation', type: 'range', weight: 10 },
      { id: 'permis_feu', label: 'Rigueur du système Permis de Feu', type: 'range', weight: 20 }
    ]
  }
  // Tu peux copier-coller un bloc { id, title, questions } pour ajouter une section
];
