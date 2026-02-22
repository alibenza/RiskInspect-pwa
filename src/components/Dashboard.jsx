import React from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import { 
  Chart as ChartJS, 
  RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, 
  CategoryScale, LinearScale, BarElement 
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { 
  ShieldCheck, AlertTriangle, Target, Activity, Gauge, 
  ShieldAlert, Globe2, ClipboardCheck, Zap, ArrowUpRight 
} from 'lucide-react';

ChartJS.register(
  RadialLinearScale, PointElement, LineElement, Filler, 
  Tooltip, Legend, CategoryScale, LinearScale, BarElement
);

const Dashboard = () => {
  const { aiResults, responses } = useInspectionStore();

  // Score de conformité terrain
  const scoredQ = Object.values(responses).filter(r => r.isScored);
  const globalScore = scoredQ.length 
    ? Math.round((scoredQ.reduce((a, b) => a + (Number(b.score) || 0), 0) / (scoredQ.length * 5)) * 100) 
    : 0;

  // --- CONFIGURATION RADAR ---
  const radarData = {
    labels: aiResults?.analyses_par_garantie?.map(an => an.garantie) || [],
    datasets: [{
      label: 'Exposition au Risque',
      data: aiResults?.analyses_par_garantie?.map(an => an.exposition) || [],
      backgroundColor: 'rgba(99, 102, 241, 0.2)',
      borderColor: '#6366f1',
      borderWidth: 3,
      pointBackgroundColor: '#6366f1',
      pointRadius: 4,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: { legend: { display: false } },
    scales: {
      r: { 
        beginAtZero: true, 
        max: 10, 
        ticks: { display: false, stepSize: 2 },
        grid: { color: 'rgba(226, 232, 240, 0.5)' },
        angleLines: { color: 'rgba(226, 232, 240, 0.5)' }
      }
    }
  };

  return (
    <div id="dashboard-to-export" className="p-4 space-y-6 pb-24 animate-in fade-in duration-700 bg-slate-50/50">
      
      {/* KPI SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Indice de Conformité</p>
            <h3 className="text-4xl font-black text-slate-900">{globalScore}%</h3>
            <span className="text-[9px] font-bold text-slate-400">Basé sur l'audit terrain</span>
          </div>
          <ClipboardCheck className="absolute right-6 top-6 text-slate-100 group-hover:text-emerald-500/20 transition-colors" size={60} />
        </div>

        <div className="bg-slate-900 p-6 rounded-[2.5rem] shadow-xl text-white md:col-span-2 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-1/2 h-full bg-indigo-500/10 skew-x-12 translate-x-20" />
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                <Zap size={12} fill="currentColor" /> Qualité Risque (Expertise AI)
              </p>
              <h3 className="text-5xl font-black">{aiResults?.score_global || '--'}%</h3>
              <p className="text-xs text-indigo-300/60 mt-2 max-w-md font-medium italic">
                {aiResults?.synthese_executive?.substring(0, 120)}...
              </p>
            </div>
            <div className="hidden sm:block p-6 bg-indigo-500 rounded-3xl">
              <Activity size={40} />
            </div>
          </div>
        </div>
      </div>

      {!aiResults ? (
        <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
          <ShieldAlert className="text-slate-300 animate-pulse mx-auto mb-6" size={40} />
          <h3 className="text-slate-900 font-black uppercase text-xs tracking-widest">En attente d'analyse IA</h3>
          <p className="text-slate-400 text-[10px] mt-2 italic">Veuillez lancer l'analyse dans l'onglet Underwriting</p>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-bottom-10 duration-1000">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* RADAR */}
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm h-[450px]">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600"><Gauge size={20} /></div>
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tighter">Profil d'Exposition</h4>
              </div>
              <div className="h-72">
                <Radar data={radarData} options={chartOptions} />
              </div>
            </div>

            {/* NAT-CAT ALGERIE */}
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col h-[450px]">
              <div className="flex items-center gap-3 mb-6 text-cyan-600">
                <div className="p-2 bg-cyan-50 rounded-xl"><Globe2 size={20} /></div>
                <h4 className="text-[11px] font-black uppercase tracking-tighter">Diagnostic Aléas Naturels</h4>
              </div>
              <div className="flex-1 space-y-4 overflow-y-auto">
                <div className="p-5 bg-slate-900 rounded-[2rem] text-white relative overflow-hidden">
                   <p className="text-[10px] text-slate-300 leading-relaxed italic relative z-10">
                     {aiResults.analyse_nat_cat?.synthese_geologique || "Synthèse géologique en attente..."}
                   </p>
                   <Globe2 className="absolute -bottom-6 -right-6 text-white/5" size={100} />
                </div>
                <div className="grid grid-cols-1 gap-3">
                   <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                      <p className="text-[8px] font-black text-amber-600 uppercase mb-1">Exposition Sismique</p>
                      <p className="text-[11px] font-bold text-slate-800">{aiResults.analyse_nat_cat?.exposition_sismique || "Donnée non disponible"}</p>
                   </div>
                   <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                      <p className="text-[8px] font-black text-blue-600 uppercase mb-1">Risque Hydrologique</p>
                      <p className="text-[11px] font-bold text-slate-800">{aiResults.analyse_nat_cat?.exposition_hydrologique || "Donnée non disponible"}</p>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* VIGILANCE & POINTS FORTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-rose-50 p-8 rounded-[3rem] border border-rose-100">
                <div className="flex items-center gap-3 mb-6">
                  <AlertTriangle className="text-rose-600" size={24} />
                  <h4 className="text-[11px] font-black text-rose-800 uppercase tracking-widest">Alertes Souscription</h4>
                </div>
                <div className="space-y-3">
                  {aiResults.points_vigilance_majeurs?.map((v, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl flex gap-3 shadow-sm">
                       <span className="shrink-0 text-rose-600 font-black text-xs">●</span>
                       <p className="text-[11px] font-bold text-slate-700">{v}</p>
                    </div>
                  ))}
                </div>
             </div>

             <div className="bg-emerald-50 p-8 rounded-[3rem] border border-emerald-100">
                <div className="flex items-center gap-3 mb-6">
                  <ShieldCheck className="text-emerald-600" size={24} />
                  <h4 className="text-[11px] font-black text-emerald-800 uppercase tracking-widest">Points de Maîtrise</h4>
                </div>
                <div className="space-y-2">
                  {aiResults.analyses_par_garantie?.filter(an => an.exposition <= 4).map((an, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/60 p-3 rounded-xl border border-emerald-200/50">
                      <span className="text-[10px] font-black text-emerald-900">{an.garantie}</span>
                      <div className="px-2 py-0.5 bg-emerald-500 text-white rounded text-[8px] font-black uppercase">Sain</div>
                    </div>
                  ))}
                </div>
             </div>
          </div>

          {/* ACTIONS PRIORITAIRES */}
          <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl">
            <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-3 mb-10">
              <Target size={20}/> Matrice d'actions prioritaires
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {aiResults.plan_actions && Object.entries(aiResults.plan_actions).map(([key, val], idx) => (
                <div key={key} className="relative group">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="text-3xl font-black text-indigo-600 opacity-30">0{idx + 1}</span>
                    <div className="h-[2px] flex-1 bg-slate-800" />
                  </div>
                  <h5 className="font-black text-xs uppercase mb-2 text-white">{key.replace('_', ' ')}</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{val}</p>
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
