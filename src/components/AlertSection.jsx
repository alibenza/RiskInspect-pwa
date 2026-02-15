import { AlertTriangle, CheckCircle } from 'lucide-react'

/**
 * Section des Points de Vigilance
 * Affiche la liste des éléments non-conformes
 */
function AlertSection({ alerts }) {
  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-dark mb-2">✅ Aucun Point de Vigilance</h3>
        <p className="text-secondary">
          Tous les éléments inspectés sont conformes aux normes de sécurité.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <AlertTriangle className="w-6 h-6 text-warning" />
        <h3 className="text-2xl font-bold text-dark">
          Points de Vigilance ({alerts.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alerts.map((alert, index) => (
          <AlertCard key={alert.id} alert={alert} index={index + 1} />
        ))}
      </div>
    </div>
  )
}

/**
 * Carte d'alerte individuelle
 */
function AlertCard({ alert, index }) {
  const severityConfig = {
    high: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-300',
      textColor: 'text-red-800',
      badge: '🔴 Critique'
    },
    medium: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-300',
      textColor: 'text-yellow-800',
      badge: '🟠 Moyen'
    },
    low: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      textColor: 'text-blue-800',
      badge: '🔵 Faible'
    }
  }

  const config = severityConfig[alert.severity] || severityConfig.high

  return (
    <div className={`${config.bgColor} border-l-4 ${config.borderColor} p-4 rounded`}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm font-bold">{index}</span>
        <span className={`text-xs font-semibold ${config.textColor}`}>
          {config.badge}
        </span>
      </div>
      <p className={`font-semibold ${config.textColor} mb-1`}>
        {alert.category}
      </p>
      <p className={`text-sm ${config.textColor}`}>
        {alert.question}
      </p>
      <p className="text-xs text-secondary mt-2">
        {new Date(alert.timestamp).toLocaleString('fr-FR')}
      </p>
    </div>
  )
}

export default AlertSection
