import React from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { ShieldCheck, AlertTriangle, Target, Activity, Gauge, Globe2, Zap } from 'lucide-react';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const Dashboard = () => {
  const { aiResults } = useInspectionStore();

  const radarData = {
    labels: aiResults?.analyses_par_garantie?.map(an => an.garantie) || [],
    datasets: [{
      label: 'Exposition au Risque',
      data: aiResults?.analyses_par_garantie?.map(an => an.exposition) || [],
      backgroundColor: 'rgba(99, 102, 241, 0.15)',
      borderColor: '#6366f1',
      borderWidth: 2,
      pointBackgroundColor: '#6366f1',
    }]
  };

  if (!aiResults) return (
    <div className="p-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 m-4">
      <Activity className="mx-auto text-slate-200 animate-pulse mb-4" size={48} />
      <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">En attente de l'analyse IA</p>
    </div>
  );

  return (
    <div className="p-4 space-y-6 bg-slate-50/50 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white md:col-span-2 flex justify-between items-center relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
              <Zap size={12} fill="currentColor" /> Score Souscription
            </p>
            <h3 className="text-6xl font-black">{aiResults.score_global}%</h3>
          </div>
          <Target className="text-white/5 absolute -right-4 -bottom-4" size={150} />
        </div>
        
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-4">Indice CATNAT</p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black text-slate-800">{aiResults.analyse_nat_cat?.score_catnat}</span>
            <span className="text-slate-300 font-bold mb-1">/10</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm h-[400px]">
          <Radar data={radarData} options={{ responsive: true, maintainAspectRatio: false, scales: { r: { beginAtZero: true, max: 10 } } }} />
        </div>

        <div className="bg-rose-50/50 p-8 rounded-[3rem] border border-rose-100 space-y-4">
          <h4 className="text-[11px] font-black text-rose-800 uppercase tracking-widest flex items-center gap-2">
            <AlertTriangle size={16} /> Vigilances Majeures
          </h4>
          <div className="space-y-2">
            {aiResults.points_vigilance_majeurs?.map((v, i) => (
              <div key={i} className="bg-white p-4 rounded-2xl text-[11px] font-bold text-slate-700 shadow-sm border-l-4 border-rose-400">{v}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
