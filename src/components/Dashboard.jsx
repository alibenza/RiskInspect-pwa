import React from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { 
  ShieldCheck, AlertTriangle, Target, Activity, Gauge, Globe2, Zap, 
  Waves, Mountain, Info, Calculator, ShieldAlert, TrendingUp
} from 'lucide-react';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const Dashboard = () => {
  const { aiResults, smpData } = useInspectionStore();

  // Formatage monétaire pour le SMP
  const formatDZD = (val) => new Intl.NumberFormat('fr-DZ', { 
    style: 'currency', 
    currency: 'DZD', 
    maximumFractionDigits: 0 
  }).format(val || 0);

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
    <div className="p-4 space-y-6 bg-slate-50/50 min-h-screen pb-20 font-sans">
      
      {/* SECTION HAUTE : SCORES FLASH & SMP */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Score Global */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white md:col-span-1 flex flex-col justify-center relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Maîtrise Risque</p>
            <h3 className="text-6xl font-black tracking-tighter">{aiResults.score_global}%</h3>
          </div>
          <Target className="text-white/5 absolute -right-4 -bottom-4" size={120} />
        </div>

        {/* NOUVEAU : BLOC SMP FINANCIER */}
        <div className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-xl text-white md:col-span-2 flex justify-between items-center relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-indigo-200 text-[10px] font-black uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
              <ShieldAlert size={12} /> Sinistre Maximum Possible (SMP)
            </p>
            <h3 className="text-4xl lg:text-5xl font-black tracking-tighter">
              {formatDZD(smpData.smpFinal)}
            </h3>
            <p className="text-[10px] text-indigo-100 mt-2 font-medium bg-white/10 py-1 px-3 rounded-full w-fit">
              Basé sur le scénario : {smpData.scenario?.substring(0, 40) || "Incendie généralisé"}...
            </p>
          </div>
          <Calculator className="text-white/10 absolute -right-4 -bottom-4" size={150} />
        </div>
        
        {/* Score CATNAT Algérie */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-center relative overflow-hidden">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Indice CATNAT</p>
          <div className="flex items-end gap-1">
            <span className={`text-5xl font-black ${aiResults.analyse_nat_cat?.score_catnat > 7 ? 'text-rose-500' : 'text-slate-800'}`}>
              {aiResults.analyse_nat_cat?.score_catnat}
            </span>
            <span className="text-slate-300 font-bold text-xl mb-1">/10</span>
          </div>
          <Globe2 className="absolute -right-6 -top-6 text-slate-50" size={100} />
        </div>
      </div>

      {/* SECTION MOYENNE : RADAR & ANALYSE FINANCIÈRE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Graphique Radar */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm lg:col-span-2 h-[450px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <Activity size={16} className="text-indigo-500" /> Profil d'Exposition par Garantie
            </h4>
          </div>
          <div className="flex-grow">
            <Radar data={radarData} options={radarOptions} />
          </div>
        </div>

        {/* RÉPARTITION DES CAPITAUX EXPOSÉS (VTA) */}
        <div className="bg-slate-900 p-8 rounded-[3rem] text-white space-y-6">
          <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
            <TrendingUp size={16} /> Valeur Totale Assurée (VTA)
          </h4>
          
          <div className="space-y-4">
            <VTAItem label="Bâtiments" value={smpData.valeurs?.batiment} color="bg-blue-500" />
            <VTAItem label="Équipements" value={smpData.valeurs?.materiel} color="bg-indigo-500" />
            <VTAItem label="Stocks" value={smpData.valeurs?.stocks} color="bg-orange-500" />
            <VTAItem label="Pertes d'Exploitation" value={smpData.valeurs?.pe} color="bg-rose-500" />
          </div>

          <div className="pt-6 border-t border-slate-800">
             <div className="flex items-start gap-3">
                <Info size={16} className="text-indigo-400 shrink-0 mt-1" />
                <p className="text-[10px] text-slate-400 leading-relaxed italic">
                  Ces valeurs sont issues de l'extraction automatique de vos observations et des prix de marché 2026.
                </p>
             </div>
          </div>
        </div>
      </div>

      {/* SECTION BASSE : MESURES PRIORITAIRES */}
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

/* Sous-composant pour les lignes de valeur */
const VTAItem = ({ label, value, color }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
      <span className="text-slate-400">{label}</span>
      <span className="text-white">{new Intl.NumberFormat('fr-DZ').format(value || 0)} DA</span>
    </div>
    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
      <div 
        className={`h-full ${color} transition-all duration-1000`} 
        style={{ width: value > 0 ? '100%' : '0%' }}
      />
    </div>
  </div>
);

export default Dashboard;
