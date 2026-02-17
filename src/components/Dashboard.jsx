import React from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import { 
  Chart as ChartJS, 
  RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, 
  CategoryScale, LinearScale, BarElement 
} from 'chart.js';
import { Radar, Bar } from 'react-chartjs-2';
import { ShieldCheck, AlertCircle, Target, Activity, Gauge, ShieldAlert } from 'lucide-react';

// Enregistrement des composants Chart.js
ChartJS.register(
  RadialLinearScale, PointElement, LineElement, Filler, 
  Tooltip, Legend, CategoryScale, LinearScale, BarElement
);

const Dashboard = () => {
  const { aiResults, responses } = useInspectionStore();

  const scoredQ = Object.values(responses).filter(r => r.isScored);
  const globalScore = scoredQ.length 
    ? Math.round((scoredQ.reduce((a, b) => a + (Number(b.score) || 0), 0) / (scoredQ.length * 5)) * 100) 
    : 0;

  // --- CONFIGURATION RADAR (Exposition) ---
  const radarData = {
    labels: aiResults?.analyses?.map(an => an.garantie) || [],
    datasets: [{
      label: 'Exposition (0-10)',
      data: aiResults?.analyses?.map(an => an.exposition) || [],
      backgroundColor: 'rgba(79, 70, 229, 0.2)',
      borderColor: 'rgba(79, 70, 229, 1)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(79, 70, 229, 1)',
    }]
  };

  // --- CONFIGURATION BARRES (Fiabilité) ---
  const barData = {
    labels: aiResults?.analyses?.map(an => an.garantie) || [],
    datasets: [{
      label: 'Indice de Confiance (%)',
      data: aiResults?.analyses?.map(an => an.confidence) || [],
      backgroundColor: aiResults?.analyses?.map(an => an.confidence > 75 ? '#10b981' : '#f59e0b'),
      borderRadius: 8,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      r: { beginAtZero: true, max: 10, ticks: { display: false } }
    }
  };

  return (
    <div className="p-4 space-y-6 pb-24 animate-in fade-in duration-500">
      
      {/* HEADER SCORE */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Score de Conformité Terrain</p>
          <h3 className="text-5xl font-black text-slate-900">{globalScore}%</h3>
        </div>
        <div className={`p-5 rounded-3xl ${globalScore > 70 ? 'bg-green-50 text-green-500' : 'bg-orange-50 text-orange-500'}`}>
          <Activity size={40} />
        </div>
      </div>

      {!aiResults ? (
        <div className="bg-indigo-50/50 p-12 rounded-[2.5rem] border-2 border-dashed border-indigo-100 text-center">
          <p className="text-[10px] font-black text-indigo-600 uppercase">Générez l'analyse IA pour débloquer les scores</p>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* RADAR EXPOSITION */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <h4 className="text-[10px] font-black text-slate-400 uppercase mb-6 flex items-center gap-2">
                <ShieldAlert size={14} className="text-indigo-500" /> Profil d'Exposition (0-10)
              </h4>
              <div className="h-64">
                <Radar data={radarData} options={chartOptions} />
              </div>
            </div>

            {/* BARRES FIABILITÉ */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <h4 className="text-[10px] font-black text-slate-400 uppercase mb-6 flex items-center gap-2">
                <Gauge size={14} className="text-emerald-500" /> Indice de Confiance (%)
              </h4>
              <div className="h-64">
                <Bar 
                  data={barData} 
                  options={{
                    ...chartOptions, 
                    indexAxis: 'y', 
                    scales: { x: { beginAtZero: true, max: 100 } } 
                  }} 
                />
              </div>
            </div>
          </div>

          {/* VULNÉRABILITÉS & RECOMMANDATION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50/50 p-6 rounded-[2rem] border border-green-100">
              <h4 className="text-[10px] font-black text-green-700 uppercase mb-4 flex items-center gap-2"><ShieldCheck size={16}/> Rassurance</h4>
              <div className="space-y-3">
                {aiResults.analyses?.map((an, i) => (
                  <div key={i} className="text-[11px] font-bold text-green-900 flex gap-2">✓ {an.garantie}</div>
                ))}
              </div>
            </div>

            <div className="bg-red-50/50 p-6 rounded-[2rem] border border-red-100">
              <h4 className="text-[10px] font-black text-red-700 uppercase mb-4 flex items-center gap-2"><AlertCircle size={16}/> Points Noirs</h4>
              <div className="space-y-2">
                {aiResults.analyses?.filter(an => an.exposition > 6).map((an, i) => (
                  <div key={i} className="p-3 bg-white/60 rounded-xl text-[10px] font-bold text-red-700">{an.points_noirs[0]}</div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl">
            <h4 className="text-[10px] font-black text-indigo-400 uppercase mb-4 flex items-center gap-2"><Target size={16}/> Priorité Prévention</h4>
            <p className="text-sm font-bold leading-relaxed">{aiResults.recommandation_maitresse}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
