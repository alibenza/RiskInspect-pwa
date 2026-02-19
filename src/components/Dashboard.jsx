import React from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import html2canvas from 'html2canvas'; // <--- AJOUT : Import pour la capture
import { 
  Chart as ChartJS, 
  RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, 
  CategoryScale, LinearScale, BarElement 
} from 'chart.js';
import { Radar, Bar } from 'react-chartjs-2';
import { 
  ShieldCheck, AlertTriangle, Target, Activity, Gauge, 
  ShieldAlert, Globe2, ClipboardCheck, Zap, ArrowUpRight, Camera // Ajout icône Camera
} from 'lucide-react';

ChartJS.register(
  RadialLinearScale, PointElement, LineElement, Filler, 
  Tooltip, Legend, CategoryScale, LinearScale, BarElement
);

const Dashboard = () => {
  const { aiResults, responses } = useInspectionStore();

  // --- LOGIQUE DE CAPTURE POUR LE PDF ---
  // Cette fonction peut être exportée ou appelée via un bouton
  const prepareChartsForPDF = async () => {
    const chartElement = document.getElementById('radar-chart-capture');
    if (!chartElement) return null;
    
    // Capture de la zone du graphique
    const canvas = await html2canvas(chartElement, {
      backgroundColor: '#ffffff', // Fond blanc pour le PDF
      scale: 2, // Haute définition
      logging: false,
    });
    
    return canvas.toDataURL('image/png');
  };

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
    animation: false, // <--- IMPORTANT : Désactive l'animation pour une capture nette
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
    <div className="p-4 space-y-6 pb-24 animate-in fade-in duration-700 bg-slate-50/50">
      
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* RADAR D'EXPOSITION AVEC ID DE CAPTURE */}
            <div 
              id="radar-chart-capture" // <--- ID AJOUTÉ ICI
              className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative"
            >
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

            {/* LE RESTE DU CODE (NAT-CAT, ALERTES, ACTIONS) RESTE IDENTIQUE */}
            {/* ... */}
            
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
