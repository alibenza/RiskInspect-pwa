import React from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import { ShieldCheck, AlertCircle, Target, Activity } from 'lucide-react';

const Dashboard = () => {
  const { aiResults, responses, questionsConfig } = useInspectionStore();

  // Calcul du score global (existant)
  const scoredQ = Object.values(responses).filter(r => r.isScored);
  const globalScore = scoredQ.length ? Math.round((scoredQ.reduce((a, b) => a + (Number(b.score) || 0), 0) / (scoredQ.length * 5)) * 100) : 0;

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* SCORE HEADER */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Score d'Assurabilité</p>
          <h3 className="text-4xl font-black text-slate-900">{globalScore}%</h3>
        </div>
        <div className={`p-4 rounded-2xl ${globalScore > 70 ? 'bg-green-50 text-green-500' : 'bg-orange-50 text-orange-500'}`}>
          <Activity size={32} />
        </div>
      </div>

      {!aiResults ? (
        <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100 text-center">
          <p className="text-xs font-bold text-indigo-600 uppercase">Générez l'analyse IA pour voir les détails ici</p>
        </div>
      ) : (
        <div className="space-y-4 animate-in slide-in-from-bottom-4">
          <div className="grid grid-cols-1 gap-4">
            {/* POINTS FORTS */}
            <div className="bg-green-50 p-5 rounded-[2rem] border border-green-100">
              <h4 className="text-[10px] font-black text-green-700 uppercase mb-3 flex items-center gap-2">
                <ShieldCheck size={14}/> 03 Points Forts
              </h4>
              {aiResults.pointsForts.map((pt, i) => (
                <p key={i} className="text-xs font-bold text-green-900 mb-2 flex gap-2"><span>•</span> {pt}</p>
              ))}
            </div>

            {/* POINTS FAIBLES */}
            <div className="bg-red-50 p-5 rounded-[2rem] border border-red-100">
              <h4 className="text-[10px] font-black text-red-700 uppercase mb-3 flex items-center gap-2">
                <AlertCircle size={14}/> 03 Points Faibles
              </h4>
              {aiResults.pointsFaibles.map((pt, i) => (
                <p key={i} className="text-xs font-bold text-red-900 mb-2 flex gap-2"><span>•</span> {pt}</p>
              ))}
            </div>

            {/* RECOMMANDATIONS */}
            <div className="bg-slate-900 p-6 rounded-[2rem] text-white shadow-lg">
              <h4 className="text-[10px] font-black text-indigo-400 uppercase mb-4 flex items-center gap-2">
                <Target size={14}/> Top Recommandations
              </h4>
              {aiResults.recommandations.map((rec, i) => (
                <div key={i} className="mb-3 p-3 bg-white/5 rounded-xl text-xs border border-white/10">{rec}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
