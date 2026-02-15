import React, { useState, useEffect } from 'react'
import { Download, RotateCcw, ClipboardList, ShieldCheck, AlertTriangle } from 'lucide-react'
import RiskChart from './RiskChart'
import { useInspectionStore } from '../hooks/useInspectionStore'

/**
 * Tableau de Bord Principal - Version Corrigée
 */
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
    <div className="space-y-6 animate-in fade-in duration-500">
      
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
            <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-slate-400 uppercase">
              Score
            </div>
          </div>
        </div>
      </div>

      {hasData ? (
        <>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-tight flex items-center">
              <ClipboardList className="mr-2 w-4 h-4 text-blue-600" />
              Profil de Risque
            </h3>
            <div className="h-72 w-full">
               <RiskChart categoryScores={responses} /> 
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pb-8">
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center space-x-2 bg-blue-600 text-white p-4 rounded-2xl font-bold text-sm shadow-lg shadow-blue-100 active:scale-95 transition-transform"
            >
              <Download size={18} />
              <span>Imprimer</span>
            </button>
            <button
              onClick={() => { if(window.confirm("Effacer l'inspection ?")) resetInspection() }}
              className="flex items-center justify-center space-x-2 bg-white text-slate-600 p-4 rounded-2xl font-bold text-sm border border-slate-200 active:scale-95 transition-transform"
            >
              <RotateCcw size={18} />
              <span>Reset</span>
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
