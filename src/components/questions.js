export const RISK_QUESTIONS = [
  {
    id: 'info_gen',
    title: 'Informations Générales',
    questions: [
      { id: 'nom_site', label: 'Nom du site / Client', type: 'text' },
      { id: 'superficie_batie', label: 'Superficie Totale (m²)', type: 'number' },
      { id: 'activite', label: 'Activité principale', type: 'text' }
    ]
  },
  {
    id: 'rex_sinistralite',
    title: 'Retour d’Expérience (Sinistralité)',
    questions: [
      { id: 'sinistre_3ans', label: 'Nombre de sinistres (3 dernières années)', type: 'number', weight: 15 },
      { id: 'montant_total', label: 'Coût total cumulé (€)', type: 'number', weight: 15 },
      { id: 'sinistre_majeur', label: 'Description du sinistre le plus important', type: 'text' },
      { id: 'mesures_correctives', label: 'Mesures de prévention mises en place suite aux sinistres', type: 'text' }
    ]
  },
  {
    id: 'protec_incendie',
    title: 'Protection Incendie',
    questions: [
      { id: 'nb_extincteurs', label: 'Nombre d\'extincteurs', type: 'number', weight: 20 },
      { id: 'alarme_incendie', label: 'Alarme Type 1 / SSI', type: 'text', weight: 15 },
      { id: 'desenfumage', label: 'Désenfumage conforme', type: 'text', weight: 10 }
    ]
  },
  {
    id: 'protec_vol',
    title: 'Protection Vol & Intrusion',
    questions: [
      { id: 'intrusion_alarme', label: 'Système d\'alarme intrusion', type: 'text', weight: 15 },
      { id: 'videosurveillance', label: 'Vidéosurveillance (VMS)', type: 'text', weight: 10 },
      { id: 'cloture', label: 'État des clôtures et accès', type: 'text', weight: 10 }
    ]
  }
];
