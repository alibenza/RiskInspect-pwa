import React from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import { Bar, Radar } from 'react-chartjs-2';
import { ShieldCheck, AlertTriangle, Activity, Trophy } from 'lucide-react';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Dashboard = () => {
  const { questionsConfig, responses } = useInspectionStore();

  const sectionScores = questionsConfig.map(section => {
    const scoredQuestions = section.questions.filter(q => responses[q.id]?.isScored);
    if (scoredQuestions.length === 0) return { label: section.title, score: 0 };
    const totalScore = scoredQuestions.reduce((acc, q) => acc + (Number(responses[q.id]?.score) || 0), 0);
    return { label: section.title, score: Math.round((totalScore / (scoredQuestions.length * 5)) * 100) };
  });

  const globalScore = sectionScores.length > 0 
    ? Math.round(sectionScores.reduce((acc, s) => acc + s.score, 0) / sectionScores.length) 
    : 0;

  const dataRadar = {
    labels: sectionScores.map(s => s.label),
    datasets: [{
      label: 'Maîtrise du Risque %',
      data: sectionScores.map(s => s.score),
      backgroundColor: 'rgba(79, 70, 229, 0.2)',
      borderColor: 'rgb(79, 70, 229)',
      borderWidth: 2,
    }]
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in">
      {/* SCORE GLOBAL D'ASSURABILITÉ */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Score d'Assurabilité</p>
          <h3 className="text-3xl font-black text-slate-900">{globalScore}%</h3>
        </div>
        <div className={`p-4 rounded-2xl ${globalScore > 70 ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
          {globalScore > 70 ? <ShieldCheck size={32} /> : <AlertTriangle size={32} />}
        </div>
      </div>

      {/* RADAR CHART */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Profil de Risque</h4>
        <div className="h-64">
          <Radar data={dataRadar} options={{ scales: { r: { min: 0, max: 100, ticks: { display: false } } }, plugins: { legend: { display: false } } }} />
        </div>
      </div>

      {/* LISTE DES POINTS CRITIQUES */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Points de vigilance</h4>
        {sectionScores.filter(s => s.score < 50).map(s => (
          <div key={s.label} className="bg-red-50 p-4 rounded-2xl border border-red-100 flex items-center space-x-3">
            <Activity className="text-red-500" size={18} />
            <span className="text-xs font-bold text-red-700">{s.label} à renforcer</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
