/**
 * UTILS : smpCalculations.js
 * Référentiel technique pour l'estimation assistée du SMP (Algérie / IARD)
 */

export const SMP_REFERENCE_DATA = {
  // Coûts de reconstruction moyens au m² (DZD) - Estimations Marché Algérie 2024-2026
  construction_costs: {
    hangar_metallique_simple: 35000,
    hangar_isole_frigo: 85000,
    batiment_beton_industriel: 65000,
    bureaux_standing: 95000,
    plateforme_logistique_haute_hauteur: 55000
  },

  // Densité de valeur de stock par type d'activité (DZD / m²)
  stock_densities: {
    boissons_pet_carton: 45000, // Volume élevé, valeur unitaire faible
    agroalimentaire_sec: 60000,
    pharmaceutique: 250000,     // Valeur très élevée
    pieces_rechange_auto: 150000,
    matiere_premiere_plastique: 75000
  },

  // Facteurs de dangerosité (Multiplicateurs de SMP)
  vulnerability_factors: {
    pas_de_detection: 1.4,      // +40% car le feu est détecté tard
    pas_de_sprinkler: 1.3,      // +30% car pas d'extinction automatique
    poteaux_incendie_eloignes: 1.2,
    stockage_exterieur_proche: 1.15 // Risque de propagation par saut de feu
  }
};

/**
 * Calcule une estimation rapide de la Perte d'Exploitation (PE)
 * @param {number} margeBruteAnnuelle 
 * @param {number} moisArret 
 * @returns {number}
 */
export const calculatePE = (margeBruteAnnuelle, moisArret) => {
  return (margeBruteAnnuelle / 12) * moisArret;
};

/**
 * Calcule la VHR (Valeur Hautement Exposée) simplifiée
 */
export const estimateVHR = (surface, typeBatiment, typeStock) => {
  const costBat = SMP_REFERENCE_DATA.construction_costs[typeBatiment] || 45000;
  const costStock = SMP_REFERENCE_DATA.stock_densities[typeStock] || 50000;
  
  return surface * (costBat + costStock);
};

/**
 * Logique métier pour l'IA : Formate le contexte de calcul pour le prompt
 */
export const getCalculationContext = () => {
  return `Utilise ces barèmes pour tes propositions : 
    Coûts construction: ${JSON.stringify(SMP_REFERENCE_DATA.construction_costs)}
    Densités stocks: ${JSON.stringify(SMP_REFERENCE_DATA.stock_densities)}`;
};
