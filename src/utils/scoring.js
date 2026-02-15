/**
 * Logique de calcul du score de conformité RiskInspect
 * Score basé sur 100 points avec catégories pondérées
 */

// Configuration des catégories et leurs poids
export const INSPECTION_CATEGORIES = {
  FIRE_SAFETY: {
    id: 'fire_safety',
    name: 'Incendie 🔥',
    weight: 0.30,
    color: '#dc2626',
    questions: [
      'Extincteurs accessibles et vérifiés',
      'Issues de secours dégagées',
      'Plan d\'évacuation affiché',
      'Détecteurs de fumée fonctionnels',
      'Éclairage de secours en place'
    ]
  },
  ELECTRICAL: {
    id: 'electrical',
    name: 'Électricité ⚡',
    weight: 0.25,
    color: '#ea580c',
    questions: [
      'Câbles en bon état',
      'Prises murales sécurisées',
      'Disjoncteurs accessibles',
      'Pas de surcharge électrique',
      'Installation aux normes'
    ]
  },
  SAFETY: {
    id: 'safety',
    name: 'Sécurité 🛡️',
    weight: 0.25,
    color: '#16a34a',
    questions: [
      'EPI disponibles et utilisés',
      'Sols en bon état',
      'Zones dangereuses signalées',
      'Premiers secours disponibles',
      'Formation du personnel'
    ]
  },
  ENVIRONMENT: {
    id: 'environment',
    name: 'Environnement 🌱',
    weight: 0.20,
    color: '#0891b2',
    questions: [
      'Gestion des déchets adéquate',
      'Pas de fuites chimiques',
      'Ventilation appropriée',
      'Bruit dans les normes',
      'Propreté générale'
    ]
  }
}

/**
 * Énumération des réponses possibles
 */
export const ANSWER_TYPES = {
  COMPLIANT: 'compliant',        // Conforme
  NON_COMPLIANT: 'non_compliant', // Non-conforme
  NOT_APPLICABLE: 'not_applicable' // Non-applicable
}

/**
 * Calcule les points pour une réponse donnée
 * @param {string} answerType - Type de réponse (compliant, non_compliant, not_applicable)
 * @returns {number} Points attribués (0 à 1)
 */
export const getPointsForAnswer = (answerType) => {
  const points = {
    [ANSWER_TYPES.COMPLIANT]: 1,
    [ANSWER_TYPES.NON_COMPLIANT]: 0,
    [ANSWER_TYPES.NOT_APPLICABLE]: 0.5
  }
  return points[answerType] || 0
}

/**
 * Calcule le score par catégorie
 * @param {Object} answers - Objet contenant les réponses { categoryId: [answers] }
 * @returns {Object} Scores par catégorie
 */
export const calculateCategoryScores = (answers) => {
  const categoryScores = {}

  Object.values(INSPECTION_CATEGORIES).forEach(category => {
    const categoryAnswers = answers[category.id] || []
    
    if (categoryAnswers.length === 0) {
      categoryScores[category.id] = {
        score: 0,
        percentage: 0,
        category: category.name,
        color: category.color
      }
      return
    }

    // Calcul de la moyenne des points pour cette catégorie
    const totalPoints = categoryAnswers.reduce((sum, answer) => {
      return sum + getPointsForAnswer(answer)
    }, 0)

    const percentage = (totalPoints / categoryAnswers.length) * 100
    const score = Math.round(percentage)

    categoryScores[category.id] = {
      score,
      percentage: Math.round(percentage * 100) / 100,
      category: category.name,
      color: category.color
    }
  })

  return categoryScores
}

/**
 * Calcule le score global pondéré
 * @param {Object} categoryScores - Scores par catégorie
 * @returns {number} Score global sur 100
 */
export const calculateGlobalScore = (categoryScores) => {
  let weightedScore = 0
  let totalWeight = 0

  Object.values(INSPECTION_CATEGORIES).forEach(category => {
    const categoryScore = categoryScores[category.id]
    if (categoryScore) {
      weightedScore += (categoryScore.percentage / 100) * category.weight * 100
      totalWeight += category.weight
    }
  })

  return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0
}

/**
 * Évalue le statut global basé sur le score
 * @param {number} globalScore - Score global sur 100
 * @returns {Object} Objet statut avec couleur et message
 */
export const getStatusFromScore = (globalScore) => {
  if (globalScore >= 85) {
    return {
      status: 'EXCELLENT',
      color: 'success',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-500',
      message: '✅ Inspection satisfaisante'
    }
  }
  if (globalScore >= 70) {
    return {
      status: 'BON',
      color: 'success',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-500',
      message: '⚠️ Amélioration recommandée'
    }
  }
  if (globalScore >= 50) {
    return {
      status: 'MOYEN',
      color: 'warning',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-500',
      message: '🔴 Corrections nécessaires'
    }
  }
  return {
    status: 'CRITIQUE',
    color: 'danger',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-500',
    message: '❌ Action immédiate requise'
  }
}

/**
 * Identifie les points de vigilance (éléments non-conformes)
 * @param {Object} answers - Réponses de l'inspection
 * @returns {Array} Liste des points non-conformes
 */
export const getAlerts = (answers) => {
  const alerts = []
  const answerIndex = {}
  let questionIndex = 0

  Object.values(INSPECTION_CATEGORIES).forEach(category => {
    category.questions.forEach((question, idx) => {
      const categoryAnswers = answers[category.id] || []
      if (categoryAnswers[idx] === ANSWER_TYPES.NON_COMPLIANT) {
        alerts.push({
          id: `${category.id}-${idx}`,
          category: category.name,
          categoryId: category.id,
          question,
          severity: 'high',
          timestamp: new Date().toISOString()
        })
      }
    })
  })

  return alerts.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}

/**
 * Exporte les données d'inspection au format JSON
 * @param {Object} inspectionData - Données complètes de l'inspection
 * @returns {string} JSON stringifié
 */
export const exportInspectionData = (inspectionData) => {
  return JSON.stringify({
    ...inspectionData,
    exportedAt: new Date().toISOString(),
    version: '1.0'
  }, null, 2)
}

/**
 * Importe des données d'inspection à partir d'un JSON
 * @param {string} jsonData - Données JSON
 * @returns {Object} Données d'inspection parsées
 */
export const importInspectionData = (jsonData) => {
  try {
    return JSON.parse(jsonData)
  } catch (error) {
    console.error('Erreur lors de l\'importation:', error)
    throw new Error('Format JSON invalide')
  }
}
