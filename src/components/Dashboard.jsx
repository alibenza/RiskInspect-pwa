import React from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { 
  ShieldCheck, AlertTriangle, Target, Activity, Gauge, Globe2, Zap, 
  Waves, Mountain, Info
} from 'lucide-react';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const Dashboard = () => {
  const { aiResults } = useInspectionStore();

  const radarData = {
    labels: aiResults?.analyses_par_garantie?.map(an => an.garantie) || [],
    datasets: [{
      label: 'Niveau d\'Exposition (1-10)',
      data: aiResults?.analyses_par_garantie?.map(an => an.exposition) || [],
      backgroundColor: 'rgba(99, 102, 241, 0.15)',
      borderColor: '#6366f1',
      borderWidth: 2,
      pointBackgroundColor: '#6366f1',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#6366f1',
    }]
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 10,
        ticks: { stepSize: 2, display: false },
        grid: { color: '#f1f5f9' },
        angleLines: { color: '#f1f5f9' },
        pointLabels: { font: { size: 10, weight: '900' }, color: '#64748b' }
      }
    },
    plugins: { legend: { display: false } }
  };

  if (!aiResults) return (
    <div className="p-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 m-4">
      <Activity className="mx-auto text-slate-200 animate-pulse mb-4" size={48} />
      <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Analyse IA requise pour peupler le dashboard</p>
    </div>
  );

  return (
    <div className="p-4 space-y-6 bg-slate-50/50 min-h-screen pb-20">
      
      {/* SECTION HAUTE : SCORES FLASH */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Score Global */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white md:col-span-2 flex justify-between items-center relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
              <ShieldCheck size={12} fill="currentColor" /> Rating Global de Maîtrise
            </p>
            <h3 className="text-7xl font-black tracking-tighter">{aiResults.score_global}%</h3>
          </div>
          <Target className="text-white/5 absolute -right-4 -bottom-4" size={180} />
        </div>
        
        {/* Score CATNAT Algérie */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-center relative overflow-hidden">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Indice CATNAT (DZ)</p>
          <div className="flex items-end gap-1">
            <span className={`text-5xl font-black ${aiResults.analyse_nat_cat?.score_catnat > 7 ? 'text-rose-500' : 'text-slate-800'}`}>
              {aiResults.analyse_nat_cat?.score_catnat}
            </span>
            <span className="text-slate-300 font-bold text-xl mb-1">/10</span>
          </div>
          <Globe2 className="absolute -right-6 -top-6 text-slate-50" size={100} />
        </div>

        {/* Status de la Synthèse */}
        <div className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-lg shadow-indigo-200 text-white flex flex-col justify-center">
          <p className="text-[10px] font-bold text-indigo-200 uppercase mb-2">Avis Souscription</p>
          <p className="text-xs font-bold leading-tight italic">
            "{aiResults.synthese_executive?.substring(0, 80)}..."
          </p>
        </div>
      </div>

      {/* SECTION MOYENNE : RADAR & NAT-CAT DETAILS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Graphique Radar */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm md:col-span-2 h-[450px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <Activity size={16} className="text-indigo-500" /> Profil d'Exposition par Garantie
            </h4>
          </div>
          <div className="flex-grow">
            <Radar data={radarData} options={radarOptions} />
          </div>
        </div>

        {/* Détails NAT-CAT Technique */}
        <div className="bg-slate-900 p-8 rounded-[3rem] text-white space-y-6">
          <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
            <Mountain size={16} /> Analyse Géo-Technique
          </h4>
          
          <div className="space-y-4">
            <div className="border-l-2 border-indigo-500 pl-4 py-1">
              <p className="text-[10px] font-black text-slate-400 uppercase">Sismique (CRAAG/RPA)</p>
              <p className="text-xs text-slate-200 mt-1">{aiResults.analyse_nat_cat?.exposition_sismique}</p>
            </div>
            
            <div className="border-l-2 border-blue-400 pl-4 py-1">
              <p className="text-[10px] font-black text-slate-400 uppercase">Hydrologie (Oueds/Crues)</p>
              <p className="text-xs text-slate-200 mt-1">{aiResults.analyse_nat_cat?.exposition_hydrologique}</p>
            </div>

            <div className="border-l-2 border-emerald-400 pl-4 py-1">
              <p className="text-[10px] font-black text-slate-400 uppercase">Note Géologique</p>
              <p className="text-xs text-slate-200 mt-1">{aiResults.analyse_nat_cat?.synthese_geologique}</p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION BASSE : MESURES PRIORITAIRES (RECOMMANDATIONS IA) */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
        <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
          <AlertTriangle size={16} className="text-rose-500" /> Plan d'Action Prioritaire (Prévention)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {aiResults.analyses_par_garantie?.flatMap(g => g.recommandations).slice(0, 6).map((rec, i) => (
            <div key={i} className="flex gap-4 items-start p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-colors">
              <div className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center text-[10px] font-black text-indigo-600 shrink-0">
                {i + 1}
              </div>
              <p className="text-xs font-bold text-slate-600 leading-snug">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
