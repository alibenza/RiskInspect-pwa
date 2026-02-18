import React from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import { 
  Chart as ChartJS, 
  RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, 
  CategoryScale, LinearScale, BarElement 
} from 'chart.js';
import { Radar, Bar } from 'react-chartjs-2';
import { ShieldCheck, AlertTriangle, Target, Activity, Gauge, ShieldAlert, Globe2, ClipboardCheck } from 'lucide-react';

// Enregistrement des composants Chart.js
ChartJS.register(
  RadialLinearScale, PointElement, LineElement, Filler, 
  Tooltip, Legend, CategoryScale, LinearScale, BarElement
);

const Dashboard = () => {
  const { aiResults, responses } = useInspectionStore();

  // Score de conformité terrain (basé sur tes saisies 1-5)
  const scoredQ = Object.values(responses).filter(r => r.isScored);
  const globalScore = scoredQ.length 
    ? Math.round((scoredQ.reduce((a, b) => a + (Number(b.score) || 0), 0) / (scoredQ.length * 5)) * 100) 
    : 0;

  // --- CONFIGURATION RADAR (Exposition par Garantie) ---
  const radarData = {
    labels: aiResults?.analyses_par_garantie?.map(an => an.garantie) || [],
    datasets: [{
      label: 'Niveau d\'Exposition',
      data: aiResults?.analyses_par_garantie?.map(an => an.exposition) || [],
      backgroundColor: 'rgba(79, 70, 229, 0.2)',
      borderColor: 'rgba(79, 70, 229, 1)',
      borderWidth: 3,
      pointBackgroundColor: 'rgba(79, 70, 229, 1)',
      pointRadius: 4,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      r: { 
        beginAtZero: true, 
        max: 10, 
        ticks: { display: false, stepSize: 2 },
        grid: { color: '#e2e8f0' },
        angleLines: { color: '#e2e8f0' }
      }
    }
  };

  return (
    <div className="p-4 space-y-6 pb-24 animate-in fade-in duration-500">
      
      {/* SECTION DES SCORES PRINCIPAUX */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Score de Conformité Terrain */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Audit Terrain</p>
            <h3 className="text-4xl font-black text-slate-900">{globalScore}%</h3>
          </div>
          <div className={`p-4 rounded-2xl ${globalScore > 70 ? 'bg-emerald-50 text-emerald-500' : 'bg-orange-50 text-orange-500'}`}>
            <ClipboardCheck size={32} />
          </div>
        </div>

        {/* Score Qualité Risque IA */}
        <div className="bg-slate-900 p-6 rounded-[2rem] shadow-xl flex items-center justify-between text-white">
          <div>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Qualité Risque (IA)</p>
            <h3 className="text-4xl font-black">{aiResults?.score_global || '--'}%</h3>
          </div>
          <div className="p-4 bg-indigo-500/20 rounded-2xl text-indigo-400">
            <Activity size={32} />
          </div>
        </div>
      </div>

      {!aiResults ? (
        <div className="bg-indigo-50/30 p-16 rounded-[3rem] border-2 border-dashed border-indigo-100 text-center">
          <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <ShieldAlert className="text-indigo-500" size={32} />
          </div>
          <h3 className="text-indigo-900 font-bold mb-1">Analyse experte en attente</h3>
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Lancez l'expertise IA pour voir les graphiques</p>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-700">
          
          {/* ANALYSE VISUELLE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* RADAR D'EXPOSITION */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <ShieldAlert size={16} className="text-indigo-500" /> Profil d'Exposition
                </h4>
                <span className="text-[9px] font-black px-2 py-1 bg-slate-100 rounded text-slate-500">Échelle 0-10</span>
              </div>
              <div className="h-72">
                <Radar data={radarData} options={chartOptions} />
              </div>
            </div>

            {/* FOCUS NAT-CAT ALGERIE */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden relative">
              <Globe2 className="absolute top-[-20px] right-[-20px] text-slate-50 opacity-10" size={200} />
              <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10">
                <Globe2 size={16} className="text-cyan-500" /> Exposition Aléas (Nat-Cat)
              </h4>
              <div className="space-y-4 relative z-10">
                <div className="p-5 bg-cyan-50/50 rounded-2xl border border-cyan-100">
                  <p className="text-[11px] text-cyan-900 leading-relaxed font-medium italic">
                    {aiResults.analyse_nat_cat.substring(0, 200)}...
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[8px] font-black text-slate-400 uppercase">Sismicité</p>
                    <p className="text-[11px] font-bold text-slate-700">Zone Nord Algérie</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[8px] font-black text-slate-400 uppercase">Référence</p>
                    <p className="text-[11px] font-bold text-slate-700">MunichRe / SwissRe</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* POINTS CRITIQUES & VIGILANCE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100">
              <h4 className="text-[10px] font-black text-emerald-700 uppercase mb-6 flex items-center gap-2">
                <ShieldCheck size={18}/> Maîtrise Positive
              </h4>
              <div className="grid gap-3">
                {aiResults.analyses_par_garantie?.filter(an => an.exposition < 5).map((an, i) => (
                  <div key={i} className="flex items-center gap-3 text-[11px] font-bold text-emerald-800 bg-white/60 p-3 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    {an.garantie}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-rose-50 p-8 rounded-[2.5rem] border border-rose-100">
              <h4 className="text-[10px] font-black text-rose-700 uppercase mb-6 flex items-center gap-2">
                <AlertTriangle size={18}/> Points de Vigilance
              </h4>
              <div className="space-y-3">
                {aiResults.points_vigilance_majeurs?.map((v, i) => (
                  <div key={i} className="p-4 bg-white rounded-2xl text-[10px] font-bold text-rose-700 shadow-sm border border-rose-100 flex gap-3">
                    <span className="text-rose-300">#0{i+1}</span>
                    {v}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* PRIORITÉ STRATÉGIQUE */}
          <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute right-[-20px] top-[-20px] w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />
            <h4 className="text-[10px] font-black text-indigo-400 uppercase mb-6 flex items-center gap-2 tracking-[0.2em]">
              <Target size={20}/> Plan de Maîtrise Prioritaire
            </h4>
            <div className="space-y-6">
              {Object.entries(aiResults.plan_actions).slice(0, 1).map(([key, val]) => (
                <div key={key}>
                  <p className="text-xl font-black text-white mb-2">{key}</p>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium">{val}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Dashboard;
