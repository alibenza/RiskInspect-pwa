import React, { useState, useEffect } from 'react'
import { Download, RotateCcw, ClipboardList, ShieldCheck, AlertTriangle } from 'lucide-react'
import RiskChart from './RiskChart'
import { useInspectionStore } from '../hooks/useInspectionStore'

/**
 * Tableau de Bord Principal - Version Optimisée pour Visite de Risque
 */
function Dashboard() {
  const { responses, resetInspection, calculateScore, loadFromLocalStorage } = useInspectionStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFromLocalStorage()
    setLoading(false)
  }, [])

  const globalScore = calculateScore()
  
  // Déterminer le statut visuel en fonction du score
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

          {/* Jauge Circulaire */}
          <div className="w-24 h-24 relative">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="40" fill="none"
                stroke={status.color}
                strokeWidth="8"
                strokeDasharray={`${globalScore * 2.51} 251`}
                strokeLinecap="round"
                className
