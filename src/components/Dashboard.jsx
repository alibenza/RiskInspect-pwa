import { useState, useEffect } from 'react'
import { Download, RotateCcw, Plus } from 'lucide-react'
import RiskChart from './RiskChart'
import AlertSection from './AlertSection'
import { useInspectionStore } from '../hooks/useInspectionStore'
import { getStatusFromScore } from '../utils/scoring'

/**
 * Tableau de Bord Principal
 * Affiche les scores, graphiques et points de vigilance
 */
function Dashboard() {
  const { inspectionData, resetInspection, exportData, loadFromLocalStorage } = useInspectionStore()
  const [loading, setLoading] = useState(true)
  const [hasInspectionData, setHasInspectionData] = useState(false)

  // Charger les données au montage du composant
  useEffect(() => {
    const loaded = loadFromLocalStorage()
    setHasInspectionData(loaded && Object.keys(inspectionData.answers).length > 0)
    setLoading(false)
  }, [])

  const globalScore = inspectionData.globalScore || 0
  const status = getStatusFromScore(globalScore)

  const handleExport = () => {
    const { data, filename } = exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleReset = () => {
    if (window.confirm('⚠️ Êtes-vous sûr de vouloir réinitialiser l\'inspection ?')) {
      resetInspection()
      setHasInspectionData(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* En-tête du Dashboard */}
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-dark">Tableau de Bord</h2>
        <p className="text-secondary text-lg">
          {hasInspectionData
            ? `Inspection du ${inspectionData.siteInfo.siteName || 'site'}`
            : 'Aucune inspection en cours - Commencez une nouvelle inspection'}
        </p>
      </div>

      {hasInspectionData ? (
        <>
          {/* Score Global */}
          <div className={`rounded-lg p-8 ${status.bgColor} border-l-4 ${status.borderColor} shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-semibold ${status.textColor}`}>
                  {status.message}
                </p>
                <p className={`text-5xl font-bold mt-2 ${status.textColor}`}>
                  {globalScore}/100
                </p>
                <p className={`text-sm mt-2 ${status.textColor}`}>
                  Statut: <span className="font-semibold">{status.status}</span>
                </p>
              </div>

              {/* Jauge visuelle */}
              <div className="w-32 h-32 relative">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Cercle de base */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="8"
                  />
                  {/* Cercle de progression */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={status.color === 'success' ? '#16a34a' : status.color === 'warning' ? '#ea580c' : '#dc2626'}
                    strokeWidth="8"
                    strokeDasharray={`${(globalScore / 100) * 283} 283`}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-dark">
                    {globalScore}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Informations du site */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard label="Site" value={inspectionData.siteInfo.siteName} />
            <InfoCard label="Localisation" value={inspectionData.siteInfo.location} />
            <InfoCard label="Inspecteur" value={inspectionData.siteInfo.inspector} />
            <InfoCard 
              label="Date d'inspection" 
              value={new Date(inspectionData.siteInfo.inspectionDate).toLocaleDateString('fr-FR')} 
            />
          </div>

          {/* Graphique Radar */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-2xl font-bold text-dark mb-6">Analyse par Catégorie</h3>
            <RiskChart categoryScores={inspectionData.categoryScores} />
          </div>

          {/* Section Alertes */}
          <AlertSection alerts={inspectionData.alerts} />

          {/* Actions */}
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={handleExport}
              disabled={!hasInspectionData}
              className="flex items-center space-x-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5" />
              <span>Exporter JSON</span>
            </button>
            <button
              onClick={handleReset}
              disabled={!hasInspectionData}
              className="flex items-center space-x-2 bg-warning text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Réinitialiser</span>
            </button>
          </div>
        </>
      ) : (
        /* État vide */
        <div className="text-center py-12 bg-white rounded-lg shadow-lg">
          <Plus className="w-16 h-16 text-secondary mx-auto mb-4 opacity-50" />
          <h3 className="text-2xl font-bold text-dark mb-2">Aucune inspection</h3>
          <p className="text-secondary mb-6">
            Commencez une nouvelle inspection pour voir les résultats ici
          </p>
          <button className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
            ➕ Nouvelle Inspection
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * Composant carte d'information réutilisable
 */
function InfoCard({ label, value }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-primary">
      <p className="text-sm text-secondary font-semibold">{label}</p>
      <p className="text-lg font-bold text-dark mt-1">{value || 'Non renseigné'}</p>
    </div>
  )
}

export default Dashboard
