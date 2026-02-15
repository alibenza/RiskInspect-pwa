// Ce fichier doit être placé dans src/components/questions.js
export const RISK_QUESTIONS = [
  {
    id: 'infos_generales',
    title: 'Informations Générales',
    questions: [
      { id: 'nomination', label: 'Nomination', type: 'text' },
      { id: 'activite_nature', label: 'Nature de l’activité', type: 'text' },
      { id: 'mise_en_service', label: 'Date Création et mise en service', type: 'date' }
    ]
  },
  {
    id: 'site_infos',
    title: 'Informations sur le Site',
    questions: [
      { id: 'superficie_totale', label: 'Superficie totale du site', type: 'text' },
      { id: 'superficie_batie', label: 'Superficie bâtie', type: 'text' },
      { id: 'compartimentage', label: 'Compartimentage (production, stockage, admin...)', type: 'textarea' }
    ]
  },
  {
    id: 'utilites',
    title: 'Utilités & Énergie',
    questions: [
      { id: 'elec_principale', label: 'Électricité (Fournisseur, Transfos, Maintenance)', type: 'textarea' },
      { id: 'elec_secours', label: 'Électricité de secours (Groupes, Puissance)', type: 'text' },
      { id: 'eau', label: 'Eau (Capacité, Utilisation)', type: 'textarea' },
      { id: 'gaz_gasoil', label: 'Gasoil et autres gaz sous pression', type: 'text' }
    ]
  },
  {
    id: 'hse_management',
    title: 'Management des Risques & HSE',
    questions: [
      { id: 'structure_hse', label: 'Existence d’une structure HSE', type: 'boolean', weight: 20 },
      { id: 'doc_hse', label: 'Documentation (EDD, EIE, Permis de travail)', type: 'boolean', weight: 15 },
      { id: 'gestion_dechets', label: 'Gestion et traitement des déchets', type: 'textarea' }
    ]
  },
  {
    id: 'maintenance',
    title: 'Maintenance',
    questions: [
      { id: 'structure_maint', label: 'Existence d’une structure de maintenance', type: 'boolean', weight: 15 },
      { id: 'prog_maint', label: 'Programmes de maintenance (Préventive/Curative)', type: 'boolean', weight: 15 },
      { id: 'gmao', label: 'Utilisation d’une GMAO', type: 'boolean', weight: 5 }
    ]
  },
  {
    id: 'incendie',
    title: 'Moyens de Lutte contre l’Incendie',
    questions: [
      { id: 'detection', label: 'Système de détection automatique', type: 'boolean', weight: 25 },
      { id: 'moyens_mobiles', label: 'Extincteurs (Type, Répartition, Mise à jour)', type: 'boolean', weight: 15 },
      { id: 'reseau_hydraulique', label: 'Réseau hydraulique (Pompes, RIA, Poteaux)', type: 'boolean', weight: 20 },
      { id: 'signalisation', label: 'Système de signalisation et interdictions', type: 'boolean', weight: 5 }
    ]
  },
  {
    id: 'surete',
    title: 'Sûreté du Site',
    questions: [
      { id: 'cloture_acces', label: 'Clôture et contrôle des accès', type: 'boolean', weight: 10 },
      { id: 'gardiennage', label: 'Gardiennage (Effectif, Brigades)', type: 'boolean', weight: 10 },
      { id: 'videosurveillance', label: 'Vidéosurveillance opérationnelle', type: 'boolean', weight: 15 }
    ]
  }
];
