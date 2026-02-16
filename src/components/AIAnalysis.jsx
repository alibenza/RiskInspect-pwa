import React, { useState } from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import { generateAnalysisPrompt } from '../utils/aiAnalysis';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { BrainCircuit, Sparkles, Loader2, AlertCircle, RefreshCw, FileDown, ShieldCheck } from 'lucide-react';

// SUPPRESSION TOTALE DES IMPORTS EXTERNES VERS EXPORTPDF
// LA LOGIQUE EST MAINTENANT CI-DESSOUS

const AIAnalysis = () => {
  const { responses, questionsConfig, selectedGaranties } = useInspectionStore();
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleExport = () => {
    try {
      const doc = new jsPDF();
      const date = new Date().toLocaleDateString();
      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.text("RAPPORT D'EXPERTISE IARD", 15, 25);
      
      let y = 50;
      if (analysis) {
        doc.setTextColor(79, 70, 229);
        doc.text("ANALYSE EXPERT IA", 15, y);
        y += 10;
        doc.setTextColor(40, 40, 40);
        doc.setFontSize(10);
        const lines = doc.splitTextToSize(analysis, 180);
        doc.text(lines, 15, y);
        y += (lines.length * 5) + 10;
      }

      const rows = [];
      questionsConfig.forEach(s => {
        rows.push([{ content: s.title, colSpan: 3, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' } }]);
        s.questions.forEach(q => {
          const r = responses[q.id];
          if (r && r.value) rows.push([q.label, r.score || '-', r.value]);
        });
      });

      doc.autoTable({ startY: y, head: [['Point', 'Note', 'Détails']], body: rows });
      doc.save(`Expertise_${date}.pdf`);
    } catch (err) {
      alert("Erreur lors de la génération du PDF");
    }
  };

  const runAnalysis = async () => {
    if (Object.keys(responses).length === 0) {
      setError("Veuillez remplir l'audit d'abord.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer 3iLUdJmbLlNrXdjgUflUzZWx1HQUoxYx' },
        body: JSON.stringify({
          model: "mistral-small-latest",
          messages: [
            { role: "system", content: "Expert en assurance IARD." },
            { role: "user", content: generateAnalysisPrompt(responses, questionsConfig, selectedGaranties) }
          ],
          temperature: 0.2
        })
      });
      const d = await r.json();
      if (d.choices) setAnalysis(d.choices[0].message.content);
      else throw new Error("Réponse IA vide");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6 pb-24 animate-in fade-in">
      <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl border border-white/5">
        <div className="flex items-center space-x-3 mb-2">
          <BrainCircuit size={24} className="text-indigo-400" />
          <h2 className="text-xl font-black uppercase">Intelligence Risque</h2>
        </div>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Mistral AI Expert</p>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-2xl flex items-center space-x-3 text-red-600 text-xs font-bold border border-red-100">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {!analysis && !loading ? (
        <button onClick={runAnalysis} className="w-full py-16 border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center space-y-4 bg-white hover:bg-slate-50 transition-all group">
          <Sparkles className="text-indigo-600 group-hover:scale-110 transition-transform" size={30} />
          <span className="font-black text-slate-900 text-sm uppercase">Lancer l'expertise IA</span>
        </button>
      ) : loading ? (
        <div className="bg-white p-20 rounded-[3rem] flex flex-col items-center justify-center space-y-4 shadow-sm border border-slate-50">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
          <p className="text-slate-900 font-black text-[10px] uppercase tracking-[0.3em]">Analyse en cours...</p>
        </div>
      ) : (
        <div className="space-y-4 animate-in slide-in-from-bottom-8 duration-500">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex items-center space-x-2 mb-6 text-slate-400">
              <ShieldCheck className="text-green-500" size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Conclusions de l'expert</span>
            </div>
            <div className="prose prose-slate text-sm leading-relaxed text-slate-700 whitespace-pre-wrap font-medium">
              {analysis}
            </div>
          </div>

          <button onClick={handleExport} className="w-full py-5 bg-indigo-600 text-white rounded-2xl flex items-center justify-center space-x-3 shadow-lg active:scale-95 transition-all">
            <FileDown size={20} />
            <span className="font-black text-xs uppercase tracking-widest">Télécharger le Rapport PDF</span>
          </button>
          
          <button onClick={() => setAnalysis("")} className="w-full py-4 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-red-500">
            Réinitialiser
          </button>
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;
