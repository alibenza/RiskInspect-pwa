import React from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, Cell 
} from 'recharts';
import { 
  ShieldCheck, AlertCircle, Target, Activity, 
  Gauge, Zap, ShieldAlert 
} from 'lucide-react';

const Dashboard = () => {
  const { aiResults, responses } = useInspectionStore();

  // 1. Calcul du score global (Terrain)
  const scoredQ = Object.values(responses).filter(r => r.isScored);
  const globalScore = scoredQ.length 
    ? Math.round((scoredQ.reduce((a, b) => a + (Number(b.score) || 0), 0) / (scoredQ.length * 5)) * 100) 
    : 0;

  // 2. Préparation des données pour les graphiques IA
  const radarData = aiResults?.analyses?.map(gar => ({
    subject: gar.garantie,
    A: gar.exposition,
    fullMark: 10,
  })) || [];

  const confidenceData = aiResults?.analyses?.map(gar => ({
    name: gar.garantie,
    value: gar.confidence,
  })) || [];

  return (
    <div className="p-4 space-y-6 pb-24 animate-in fade-in duration-500">
      
      {/* --- HEADER : SCORE D'ASSURABILITÉ GLOBAL --- */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between overflow-hidden relative">
        <div className="relative z-10">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Score de Conformité Terrain</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-5xl font-black text-slate-900">{globalScore}%</h3>
            <span className={`text-[10px] font-bold uppercase ${globalScore > 70 ? 'text-green-500' : 'text-orange-500'}`}>
              {globalScore > 70 ? 'Risque Maîtrisé' : 'Amélioration Requise'}
            </span>
          </div>
        </div>
        <div className={`p-5 rounded-3xl ${globalScore > 70 ? 'bg-green-50 text-green-500' : 'bg-orange-50 text-orange-500'}`}>
          <Activity size={40} />
        </div>
      </div>

      {!aiResults ? (
        <div className="bg-indigo-50/50 p-12 rounded-[2.5rem] border-2 border-dashed border-indigo-100 text-center space-y-4">
          <Zap className="mx-auto text-indigo-300 animate-pulse" size={32} />
          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
            Veuillez lancer l'Analyse IA pour générer la console de souscription
          </p>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
          
          {/* --- SECTION IA : RADAR & FIABILITÉ --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Radar d'Exposition */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <h4 className="text-[10px] font-black text-slate-400 uppercase mb-6 flex items-center gap-2">
                <ShieldAlert size={14} className="text-indigo-500" /> Profil d'Exposition (0-10)
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                    <Radar
                      name="Exposition"
                      dataKey="A"
                      stroke="#4f46e5"
                      fill="#4f46e5"
                      fillOpacity={0.15}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Barres de Fiabilité */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <h4 className="text-[10px] font-black text-slate-400 uppercase mb-6 flex items-center gap-2">
                <Gauge size={14} className="text-emerald-500" /> Indice de Confiance (%)
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={confidenceData} layout="vertical" margin={{ left: -10, right: 20 }}>
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis dataKey="name" type="category" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} width={80} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={15}>
                      {confidenceData.map((entry, index) => (
                        <Cell key={index} fill={entry.value > 75 ? '#10b981' : '#f59e0b'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* --- SECTION DÉTAILS IA : FORTS / FAIBLES / REC --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50/50 p-6 rounded-[2rem] border border-green-100">
              <h4 className="text-[10px] font-black text-green-700 uppercase mb-4 flex items-center gap-2">
                <ShieldCheck size={16}/> Points de Rassurance
              </h4>
              <div className="space-y-3">
                {aiResults.analyses?.map((an, i) => (
                  <div key={i} className="text-[11px] font-bold text-green-900 flex gap-2">
                    <span className="text-green-400">✓</span> {an.garantie} : Risque {an.exposition < 5 ? 'bien maîtrisé' : 'sous contrôle'}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-red-50/50 p-6 rounded-[2rem] border border-red-100">
              <h4 className="text-[10px] font-black text-red-700 uppercase mb-4 flex items-center gap-2">
                <AlertCircle size={16}/> Vulnérabilités Majeures
              </h4>
              <div className="space-y-2">
                {aiResults.analyses?.filter(an => an.exposition > 6).map((an, i) => (
                  <div key={i} className="p-3 bg-white/60 rounded-xl text-[10px] font-bold text-red-700 border border-red-200 shadow-sm">
                    <span className="uppercase block text-[8px] opacity-60">{an.garantie}</span>
                    {an.points_noirs[0]}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RECOMMANDATION MAÎTRESSE */}
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="text-[10px] font-black text-indigo-400 uppercase mb-4 flex items-center gap-2 tracking-[0.2em]">
                <Target size={16}/> Priorité de Prévention n°1
              </h4>
              <p className="text-sm font-bold leading-relaxed">
                {aiResults.recommandation_maitresse || aiResults.recommandations?.[0]}
              </p>
            </div>
            <Target size={120} className="absolute -right-10 -bottom-10 text-white/5" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
