import React, { useState, useEffect } from 'react'
import { RotateCcw, ClipboardList, ShieldCheck, AlertTriangle, FileText } from 'lucide-react'
import RiskChart from './RiskChart'
import ExportPDF from './ExportPDF' // Import du nouveau composant
import { useInspectionStore } from '../hooks/useInspectionStore'

function Dashboard() {
  const { responses, resetInspection, calculateScore, loadFromLocalStorage } = useInspectionStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFromLocalStorage()
    setLoading(false)
  }, [])

  const globalScore = calculateScore()
  
  const getStatusConfig = (score) => {
    if (score >= 80) return { color: '#16a34a', text: 'Excellent', icon: <ShieldCheck className="text-green-600" />, bg: 'bg-green-50' }
    if (score >= 50) return { color: '#ea580c', text: 'Passable', icon: <AlertTriangle className="text-orange-600" />, bg: 'bg-orange-50' }
    return { color: '#dc2626', text: 'Critique', icon: <AlertTriangle className="text-red-600" />, bg: 'bg-red-50' }
  }

  const status = getStatusConfig(globalScore)
  const hasData = Object.keys(responses).length > 0

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* SECTION SCORE GLOBAL */}
      <div className={`p-6 rounded-3xl ${status.bg} border border-white shadow-sm relative overflow-hidden`}>
        <div className="flex justify-between items-center relative z-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Score de Conformité</p>
            <div className="flex items-baseline space-x-2">
              <span className="text-5xl font-black text-slate-900">{globalScore}%</span>
            </div>
            <div className="mt-4 flex items-center space-x-2">
              {status.icon}
              <span className="font-bold text-sm uppercase">{status.text}</span>
            </div>
          </div>

          <div className="w-24 h-24 relative">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="40" fill="none"
                stroke={status.color}
                strokeWidth="8"
                strokeDasharray={`${globalScore * 2.51} 251`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
          </div>
        </div>
      </div>

      {hasData ? (
        <>
          {/* GRAPHIQUE */}
<div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
  <h3 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-tight flex items-center">
    <ClipboardList className="mr-2 w-4 h-4 text-blue-600" />
    Profil de Risque
  </h3>
  <div className="h-72 w-full">
      {/* On retire categoryScores={responses} car le composant est auto-suffisant */}
      <RiskChart /> 
  </div>
</div>

          {/* ACTIONS D'EXPORTATION ET RESET */}
          <div className="space-y-3">
            {/* Nouveau composant ExportPDF qui contient le bouton stylisé */}
            <ExportPDF />

            <button
              onClick={() => { if(window.confirm("Effacer toutes les données de l'inspection ?")) resetInspection() }}
              className="w-full flex items-center justify-center space-x-2 bg-white text-red-500 p-4 rounded-2xl font-bold text-sm border border-red-50 active:scale-95 transition-transform"
            >
              <RotateCcw size={18} />
              <span>Réinitialiser l'audit</span>
            </button>
          </div>
        </>
      ) : (
        <div className="bg-white p-10 rounded-3xl border border-dashed border-slate-300 text-center">
          <p className="text-slate-400 text-sm italic">
            Aucune donnée d'inspection.<br/>Allez dans l'onglet "Inspecter" pour commencer.
          </p>
        </div>
      )}
    </div>
  )
}

export default Dashboard
