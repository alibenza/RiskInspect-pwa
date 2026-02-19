import React from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import { 
  Chart as ChartJS, 
  RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, 
  CategoryScale, LinearScale, BarElement 
} from 'chart.js';
import { Radar, Bar } from 'react-chartjs-2';
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

  // --- CONFIGURATION RADAR (Exposition IA) ---
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
    animation: false, // <--- IMPORTANT : Désactive l'animation pour une capture PDF instantanée
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
    /* AJOUT DE L'ID 'dashboard-to-export' POUR LA CAPTURE PDF */
    <div id="dashboard-to-export" className="p-4 space-y-6 pb-24 animate-in fade-in duration-700 bg-slate-50/50">
      
      {/* KPI SECTION : LE DUEL DES SCORES */}
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
                {aiResults?.synthese_executive?.substring(0, 100)}...
              </p>
            </div>
            <div className="hidden sm:block p-6 bg-indigo-500 rounded-3xl shadow-lg shadow-indigo-500/20">
              <Activity size={40} />
            </div>
          </div>
        </div>
      </div>

      {!aiResults ? (
        <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="text-slate-300 animate-pulse" size={40} />
          </div>
          <h3 className="text-slate-900 font-black uppercase text-xs tracking-widest">En attente d'analyse IA</h3>
          <p className="text-slate-400 text-[10px] mt-2 italic">Veuillez lancer l'analyse dans l'onglet Underwriting</p>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-bottom-10 duration-1000">
          
          {/* GRAPHIQUES ET NAT-CAT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* RADAR D'EXPOSITION */}
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600"><Gauge size={20} /></div>
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tighter">Profil d'Exposition IA</h4>
                </div>
              </div>
              <div className="h-80">
                <Radar data={radarData} options={chartOptions} />
              </div>
            </div>

            {/* NAT-CAT ALGERIE DYNAMIQUE */}
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col">
              <div className="flex items-center gap-3 mb-6 text-cyan-600">
                <div className="p-2 bg-cyan-50 rounded-xl"><Globe2 size={20} /></div>
                <h4 className="text-[11px] font-black uppercase tracking-tighter">Diagnostic Aléas Naturels (Algérie)</h4>
              </div>
              <div className="flex-1 space-y-6">
                <div className="p-6 bg-slate-900 rounded-[2rem] text-white relative overflow-hidden group">
                   <div className="relative z-10">
                     <p className="text-[11px] text-slate-300 leading-relaxed italic">
                       {aiResults.analyse_nat_cat}
                     </p>
                   </div>
                   <Globe2 className="absolute -bottom-10 -right-10 text-white/5" size={150} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                      <p className="text-[8px] font-black text-amber-600 uppercase mb-1">Risque Sismique</p>
                      <p className="text-[11px] font-bold text-slate-800">Zone RPA {aiResults.analyse_nat_cat.toLowerCase().includes('nord') ? 'III/II' : 'I'}</p>
                   </div>
                   <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                      <p className="text-[8px] font-black text-blue-600 uppercase mb-1">Référence Normative</p>
                      <p className="text-[11px] font-bold text-slate-800">Normes ASAL / CNAT</p>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* VIGILANCE CRITIQUE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* ALERTES ROUGES */}
             <div className="bg-rose-50 p-8 rounded-[3rem] border border-rose-100 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-6">
                  <AlertTriangle className="text-rose-600 animate-bounce" size={24} />
                  <h4 className="text-[11px] font-black text-rose-800 uppercase tracking-widest">Alertes de Souscription</h4>
                </div>
                <div className="space-y-3">
                  {aiResults.points_vigilance_majeurs?.map((v, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl flex gap-4 shadow-sm group hover:scale-[1.02] transition-transform">
                       <span className="w-10 h-10 shrink-0 bg-rose-100 rounded-xl flex items-center justify-center font-black text-rose-600 text-xs">!</span>
                       <p className="text-[11px] font-bold text-slate-700">{v}</p>
                    </div>
                  ))}
                </div>
             </div>

             {/* MAÎTRISE ET CONSEILS */}
             <div className="bg-emerald-50 p-8 rounded-[3rem] border border-emerald-100">
                <div className="flex items-center gap-3 mb-6">
                  <ShieldCheck className="text-emerald-600" size={24} />
                  <h4 className="text-[11px] font-black text-emerald-800 uppercase tracking-widest">Points Forts Identifiés</h4>
                </div>
                <div className="grid gap-3">
                  {aiResults.analyses_par_garantie?.filter(an => an.exposition < 5).map((an, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/60 p-4 rounded-2xl border border-emerald-200/50">
                      <span className="text-[11px] font-black text-emerald-900">{an.garantie}</span>
                      <div className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-[9px] font-black uppercase">Risque Faible</div>
                    </div>
                  ))}
                  {aiResults.analyses_par_garantie?.filter(an => an.exposition < 5).length === 0 && (
                    <p className="text-[10px] text-emerald-600 italic">Aucun point fort critique identifié. Focus nécessaire sur la prévention.</p>
                  )}
                </div>
             </div>
          </div>

          {/* ACTIONS PRIORITAIRES (LAYOUT TYPE TIMELINE) */}
          <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
              <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-3">
                <Target size={20}/> Matrice d'actions prioritaires
              </h4>
              <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-[10px] font-bold text-indigo-300">
                Estimation Impact Risque : Élevé
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {Object.entries(aiResults.plan_actions).map(([key, val], idx) => (
                <div key={key} className="relative group">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="text-3xl font-black text-indigo-600 opacity-30 group-hover:opacity-100 transition-opacity">0{idx + 1}</span>
                    <div className="h-[2px] flex-1 bg-slate-800" />
                  </div>
                  <h5 className="font-black text-xs uppercase mb-2 text-white group-hover:text-indigo-400 transition-colors">{key}</h5>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-4">{val}</p>
                  <ArrowUpRight className="absolute top-0 right-0 text-slate-700 group-hover:text-indigo-500 transition-colors" size={16} />
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
