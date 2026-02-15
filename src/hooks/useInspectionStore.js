import { create } from 'zustand'
import { 
  calculateCategoryScores, 
  calculateGlobalScore,
  getAlerts 
} from '../utils/scoring'

/**
 * Store Zustand pour gérer l'état global de l'inspection
 * Persiste les données dans localStorage pour le mode hors-ligne
 */
export const useInspectionStore = create((set, get) => ({
  // État
  inspectionData: {
    siteInfo: {
      siteName: '',
      location: '',
      inspector: 'alibenza',
      inspectionDate: new Date().toISOString().split('T')[0],
      description: ''
    },
    answers: {},
    categoryScores: {},
    globalScore: 0,
    alerts: [],
    status: null
  },

  // Actions
  /**
   * Met à jour les informations du site
   */
  setSiteInfo: (siteInfo) => {
    set(state => ({
      inspectionData: {
        ...state.inspectionData,
        siteInfo: { ...state.inspectionData.siteInfo, ...siteInfo }
      }
    }))
  },

  /**
   * Met à jour une réponse et recalcule les scores
   */
  setAnswer: (categoryId, questionIndex, answer) => {
    set(state => {
      const newAnswers = {
        ...state.inspectionData.answers,
        [categoryId]: [
          ...(state.inspectionData.answers[categoryId] || [])
        ]
      }
      newAnswers[categoryId][questionIndex] = answer

      // Recalculer les scores
      const categoryScores = calculateCategoryScores(newAnswers)
      const globalScore = calculateGlobalScore(categoryScores)
      const alerts = getAlerts(newAnswers)

      return {
        inspectionData: {
          ...state.inspectionData,
          answers: newAnswers,
          categoryScores,
          globalScore,
          alerts
        }
      }
    })

    // Sauvegarder dans localStorage (mode hors-ligne)
    get().saveToLocalStorage()
  },

  /**
   * Sauvegarde l'inspection en localStorage
   */
  saveToLocalStorage: () => {
    const state = get()
    localStorage.setItem(
      'riskinspect_inspection',
      JSON.stringify(state.inspectionData)
    )
  },

  /**
   * Charge l'inspection depuis localStorage
   */
  loadFromLocalStorage: () => {
    const saved = localStorage.getItem('riskinspect_inspection')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        set({ inspectionData: data })
        return true
      } catch (error) {
        console.error('Erreur chargement localStorage:', error)
        return false
      }
    }
    return false
  },

  /**
   * Réinitialise l'inspection
   */
  resetInspection: () => {
    set({
      inspectionData: {
        siteInfo: {
          siteName: '',
          location: '',
          inspector: 'alibenza',
          inspectionDate: new Date().toISOString().split('T')[0],
          description: ''
        },
        answers: {},
        categoryScores: {},
        globalScore: 0,
        alerts: [],
        status: null
      }
    })
    localStorage.removeItem('riskinspect_inspection')
  },

  /**
   * Exporte les données d'inspection
   */
  exportData: () => {
    const state = get()
    return {
      data: JSON.stringify(state.inspectionData, null, 2),
      filename: `inspection_${state.inspectionData.siteInfo.siteName}_${new Date().toISOString().split('T')[0]}.json`
    }
  }
}))
