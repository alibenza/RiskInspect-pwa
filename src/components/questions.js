export const RISK_QUESTIONS = [
  {
    id: 'identification',
    title: 'Identification du Risque',
    questions: [
      { id: 'nom_client', label: 'Nom du Client / Site', type: 'text' },
      { id: 'adresse_site', label: 'Adresse de l’Assuré', type: 'text' },
      { id: 'activite_detail', label: 'Activité exercée & Process', type: 'text' },
      { id: 'effectif', label: 'Effectif total (pers.)', type: 'number' }
    ]
  },
  {
    id: 'batiment_construction',
    title: 'Bâtiments & Construction',
    questions: [
      { id: 'superficie_batie', label: 'Superficie Totale (m²)', type: 'number' },
      { id: 'annee_const', label: 'Année de construction', type: 'number' },
      { id: 'type_construction', label: 'Type de structure (Béton, Métal, Bois)', type: 'text' },
      { id: 'toiture', label: 'Nature de la toiture / Couverture', type: 'text' },
      { id: 'mitoyennete', label: 'Mitoyenneté et Exposition', type: 'text' }
    ]
  },
  {
    id: 'utilites_techniques',
    title: 'Utilités & Énergies',
    questions: [
      { id: 'tarif_elec', label: 'Tarif Électrique (Bleu, Jaune, Vert)', type: 'text' },
      { id: 'puissance_kva', label: 'Puissance souscrite (kVA)', type: 'number' },
      { id: 'date_q18', label: 'Date dernier contrôle Q18', type: 'text' },
      { id: 'chauffage_type', label: 'Mode de chauffage (Gaz, Fioul, Élec)', type: 'text' },
      { id: 'transfo_present', label: 'Transformateur sur site', type: 'text' }
    ]
  },
  {
    id: 'protection_incendie',
    title: 'Moyens de Protection Incendie',
    questions: [
      { id: 'nb_extincteurs', label: 'Nombre d’extincteurs (Portatifs/Roulants)', type: 'number', weight: 20 },
      { id: 'ria_present', label: 'Présence de RIA (Robinet Incendie Armé)', type: 'text', weight: 15 },
      { id: 'ssi_alarme', label: 'Système de Sécurité Incendie (SSI)', type: 'text', weight: 15 },
      { id: 'desenfumage', label: 'Désenfumage (Mécanique/Naturel)', type: 'text', weight: 10 },
      { id: 'poteau_incendie', label: 'Distance poteau incendie (m)', type: 'number', weight: 10 }
    ]
  },
  {
    id: 'protection_vol',
    title: 'Protection Vol & Intrusion',
    questions: [
      { id: 'alarme_vol', label: 'Système d’alarme intrusion (Type/NFA2P)', type: 'text', weight: 15 },
      { id: 'videosurveillance', label: 'Vidéosurveillance (VMS / Stockage)', type: 'text', weight: 10 },
      { id: 'cloture_etat', label: 'État des clôtures et portails', type: 'text', weight: 10 },
      { id: 'gardiennage', label: 'Présence d’un gardiennage (Humain/Cynophile)', type: 'text', weight: 10 }
    ]
  },
  {
    id: 'rex_sinistralite',
    title: 'Volet REx (Sinistralité)',
    questions: [
      { id: 'nb_sinistres_3ans', label: 'Nombre de sinistres (3 dernières années)', type: 'number', weight: 15 },
      { id: 'cout_total_sinistres', label: 'Coût total cumulé (€)', type: 'number', weight: 15 },
      { id: 'type_sinistre_dominant', label: 'Nature du sinistre dominant', type: 'text', weight: 10 },
      { id: 'mesures_post_sinistre', label: 'Mesures correctives appliquées', type: 'text', weight: 10 }
    ]
  }
];
