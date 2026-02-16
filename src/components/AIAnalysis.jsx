import React, { useState } from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import { generateAnalysisPrompt } from '../utils/aiAnalysis';
import { BrainCircuit, Sparkles, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

const AIAnalysis = () => {
  const { responses, questionsConfig, selectedGaranties } = useInspectionStore();
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    const API_KEY = "AIzaSyAKC3reG2sXABFBacWyGG3UtiXm_PgIx-8"; 
    // On utilise v1 qui est plus stable que v1beta
    const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    try {
      const promptText = generateAnalysisPrompt(responses, questionsConfig, selectedGaranties);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }]
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // Cela affichera la vraie raison (ex: API_KEY_INVALID ou MODEL_NOT_FOUND)
        throw new Error(data.error?.message || `Erreur Serveur (${response.status})`);
      }

      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        setAnalysis(data.candidates[0].content.parts[0].text);
      } else {
        throw new Error("L'IA n'a pas retourné de texte. Vérifiez vos données d'entrée.");
      }

    } catch (err) {
      setError(err.message);
      console.error("Détails techniques:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in">
      <div className="bg-gradient-to-br from-slate-900 to-blue-900 p-8 rounded-[2.5rem] text-white shadow-xl">
        <div className="flex items-center space-x-3 mb-2">
          <BrainCircuit size={28} className="text-blue-400" />
          <h2 className="text-xl font-black uppercase tracking-tight">Expertise IA</h2>
        </div>
        <p className="text-blue-100/60 text-[10px] font-medium uppercase tracking-widest">Analyse de vulnérabilité instantanée</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-center space-x-3 animate-bounce">
          <AlertCircle className="text-red-500 shrink-0" size={20} />
          <div className="flex-1">
            <p className="text-[10px] font-black text-red-800 uppercase">Problème Technique</p>
            <p className="text-xs text-red-600 font-medium">{error}</p>
          </div>
          <button onClick={runAnalysis} className="p-2 bg-red-100 rounded-lg"><RefreshCw size={14} className="text-red-600"/></button>
        </div>
      )}

      {!analysis && !loading ? (
        <button onClick={runAnalysis} className="w-full py-16 border-2 border-dashed border-blue-200 rounded-[2.5rem] flex flex-col items-center justify-center space-y-4 bg-white hover:border-blue-400 transition-all group">
          <div className="p-4 bg-blue-50 rounded-full group-hover:scale-110 transition-transform"><Sparkles className="text-blue-600" /></div>
          <span className="font-black text-blue-600 text-xs uppercase tracking-[0.2em]">Générer le rapport</span>
        </button>
      ) : loading ? (
        <div className="bg-white p-16 rounded-[2.5rem] flex flex-col items-center justify-center space-y-6 shadow-sm border border-slate-100">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <div className="text-center">
            <p className="text-slate-900 font-black text-sm uppercase">Analyse en cours</p>
            <p className="text-slate-400 text-[10px] mt-1 font-medium italic">L'IA croise vos données et la sinistralité...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-50 relative overflow-hidden animate-in slide-in-from-bottom-8">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
          <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-700 font-medium whitespace-pre-wrap">
            {analysis}
          </div>
          <button onClick={() => setAnalysis("")} className="mt-10 w-full py-4 border border-slate-100 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-colors">Réinitialiser l'analyse</button>
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;
