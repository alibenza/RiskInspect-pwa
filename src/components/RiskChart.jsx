import { 
  Chart as ChartJS, 
  RadialLinearScale, 
  PointElement, 
  LineElement, 
  Filler, 
  Legend, 
  Tooltip 
} from 'chart.js'
import { Radar } from 'react-chartjs-2'
import { INSPECTION_CATEGORIES } from '../utils/scoring'

// Enregistrer les composants corrects pour le graphique Radar
ChartJS.register(
  RadialLinearScale, 
  PointElement, 
  LineElement, 
  Filler, 
  Legend, 
  Tooltip
)

/**
 * Graphique Radar pour visualiser les scores par catégorie
 */
function RiskChart({ categoryScores }) {
  // Préparer les données pour le graphique
  const labels = Object.values(INSPECTION_CATEGORIES).map(cat => cat.name)
  const data = Object.values(INSPECTION_CATEGORIES).map(cat => 
    categoryScores[cat.id]?.percentage || 0
  )
  const colors = Object.values(INSPECTION_CATEGORIES).map(cat => cat.color)

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Score de Conformité (%)',
        data,
        borderColor: '#1e40af',
        backgroundColor: 'rgba(30, 64, 175, 0.1)',
        borderWidth: 2,
        pointRadius: 5,
        pointBackgroundColor: colors,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        tension: 0.4,
        fill: true
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Changé à false pour mieux remplir la div h-96
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          font: { size: 12, weight: 'bold' },
          padding: 20,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 12 },
        callbacks: {
          label: (context) => {
            return `${context.label}: ${context.parsed.r}%`
          }
        }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        min: 0,
        ticks: {
          stepSize: 20,
          font: { size: 11 },
          color: '#64748b'
        },
        grid: {
          color: 'rgba(100, 116, 139, 0.1)'
        },
        pointLabels: {
          font: { size: 12, weight: 'bold' },
          color: '#0f172a'
        }
      }
    }
  }

  return (
    <div className="w-full h-96">
      {Object.keys(categoryScores).length > 0 ? (
        <Radar data={chartData} options={options} />
      ) : (
        <div className="flex items-center justify-center h-full text-slate-500 italic">
          <p>Aucune donnée - Commencez une inspection</p>
        </div>
      )}
    </div>
  )
}

export default RiskChart
