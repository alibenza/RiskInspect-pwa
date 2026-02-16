import React, { useState } from 'react';import { useInspectionStore } from '../hooks/useInspectionStore';import { generateAnalysisPrompt } from '../utils/aiAnalysis';import { BrainCircuit, Sparkles, Loader2, AlertTriangle } from 'lucide-react';

const AIAnalysis = () => {
  const { responses, questionsConfig, selectedGaranties } = useInspectionStore();
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    setLoading(true);
    const prompt = generateAnalysisPrompt(responses, questionsConfig, selectedGaranties);
    
    try {
      // Remplace CLÉ_API par ta vraie clé Gemini
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBrcwChIN180XVYoXJDKoS03RizlHV3CJw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await response.json();
      setAnalysis(data.candidates[0].content.parts[0].text);
    } catch (error) {
      setAnalysis("Erreur lors de l'analyse. Vérifiez votre connexion et votre clé API.");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in">
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[2.5rem] text-white shadow-xl">
        <div className="flex items-center space-x-3 mb-4">
          <BrainCircuit size={32} className="text-blue-200" />
          <h2 className="text-2xl font-black">Expertise IA</h2>
        </div>
        <p className="text-blue-100 text-sm leading-relaxed opacity-90 italic">
          Analyse croisée des protections en place et de la sinistralité déclarée.
        </p>
      </div>

      {!analysis && !loading ? (
        <button onClick={runAnalysis} className="w-full py-10 border-2 border-dashed border-blue-200 rounded-[2rem] flex flex-col items-center justify-center space-y-4 bg-white hover:bg-blue-50 transition-colors group">
          <div className="p-4 bg-blue-100 rounded-full group-hover:scale-110 transition-transform"><Sparkles className="text-blue-600" /></div>
          <span className="font-black text-blue-600 tracking-widest text-sm uppercase">Générer le diagnostic IA</span>
        </button>
      ) : loading ? (
        <div className="bg-white p-12 rounded-[2rem] flex flex-col items-center justify-center space-y-4 shadow-inner">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Analyse en cours...</p>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 animate-in slide-in-from-bottom-4">
          <div className="prose prose-slate max-w-none whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
            {analysis}
          </div>
          <button onClick={() => setAnalysis("")} className="mt-8 text-[10px] font-black text-slate-300 uppercase underline">Refaire une analyse</button>
        </div>
      )}
    </div>
  );
};
export default AIAnalysis;
