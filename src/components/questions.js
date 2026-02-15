export const RISK_QUESTIONS = [
  {
    id: 'infos_generales',
    title: '1. Informations Générales sur l’Entreprise',
    questions: [
      { id: 'nomination', label: 'Nomination / Raison Sociale', type: 'text' },
      { id: 'nature_activite', label: 'Nature de l’activité', type: 'text' },
      { id: 'date_creation', label: 'Date de Création et mise en service', type: 'text' }
    ]
  },
  {
    id: 'infos_site',
    title: '2. Informations sur le Site',
    questions: [
      { id: 'superficie_totale', label: 'Superficie totale du site (m²)', type: 'number' },
      { id: 'superficie_batie', label: 'Superficie bâtie (m²)', type: 'number' },
      { id: 'compartimentage', label: 'Détails Compartimentage (Prod/Stockage/Admin)', type: 'text' }
    ]
  },
  {
    id: 'activite_utilites',
    title: '3. Activité & Utilités',
    questions: [
      { id: 'procede_prod', label: 'Procédé de production', type: 'text' },
      { id: 'matieres_premieres', label: 'Matières premières (Natures/Quantités/Origine)', type: 'text' },
      { id: 'produits_finis', label: 'Produits finis (Marché local/Export)', type: 'text' },
      { id: 'elec_principale', label: 'Électricité (Capacité, Transfos, Maintenance)', type: 'text' },
      { id: 'elec_secours', label: 'Électricité de secours (Puissance, Groupes)', type: 'text' },
      { id: 'eau_infos', label: 'Eau (Capacité, Utilisation)', type: 'text' },
      { id: 'gaz_pression', label: 'Gasoil & Gaz sous pression (Réservoirs)', type: 'text' }
    ]
  },
  {
    id: 'rh_management',
    title: '4. Ressources Humaines & Management',
    questions: [
      { id: 'nb_employes', label: 'Nombre total d’employés', type: 'number' },
      { id: 'regime_travail', label: 'Régime de travail (Shifts)', type: 'text' },
      { id: 'structure_hse', label: 'Existence & Efficacité Structure HSE', type: 'range', weight: 20 },
      { id: 'doc_hse', label: 'Conformité Documentation HSE (EDD, EIE, Permis)', type: 'range', weight: 15 },
      { id: 'gestion_dechets', label: 'Gestion et Traitement des déchets', type: 'range', weight: 10 }
    ]
  },
  {
    id: 'maintenance',
    title: '5. Maintenance',
    questions: [
      { id: 'structure_maint', label: 'Existence Structure Maintenance', type: 'text' },
      { id: 'prog_maint', label: 'Programmes de maintenance (Préventive/Curative)', type: 'range', weight: 20 },
      { id: 'gmao', label: 'Utilisation d’une GMAO', type: 'range', weight: 10 }
    ]
  },
  {
    id: 'incendie',
    title: '6. Moyens de Lutte contre l’Incendie',
    questions: [
      { id: 'detection_incendie', label: 'Détection (Type, Couverture, Centralisation)', type: 'range', weight: 25 },
      { id: 'nb_extincteurs', label: 'Nombre d’extincteurs (Moyens mobiles)', type: 'number' },
      { id: 'reseau_hydraulique', label: 'Réseau Incendie (Pompes, RIA, Poteaux)', type: 'range', weight: 30 },
      { id: 'sprinkler_gaz', label: 'Systèmes fixes (Sprinkler, Gaz inerte)', type: 'range', weight: 20 },
      { id: 'signalisation', label: 'Signalisation & Interdictions', type: 'range', weight: 10 },
      { id: 'protection_civile', label: 'Lien Protection Civile (Éloignement, Ligne directe)', type: 'text' }
    ]
  },
  {
    id: 'surete',
    title: '7. Sûreté du Site',
    questions: [
      { id: 'cloture_acces', label: 'État Clôture & Nombre d’accès', type: 'range', weight: 10 },
      { id: 'gardiennage', label: 'Gardiennage (Brigades, Agents)', type: 'range', weight: 15 },
      { id: 'videosurveillance', label: 'Vidéosurveillance (Nombre, Visionnage)', type: 'range', weight: 15 },
      { id: 'controle_acces', label: 'Contrôle d’accès (ID, Badges, Portiques)', type: 'range', weight: 10 }
    ]
  }
];
