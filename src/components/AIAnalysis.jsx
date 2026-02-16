import React, { useState } from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import { generateAnalysisPrompt } from '../utils/aiAnalysis';
import { BrainCircuit, Sparkles, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';

const AIAnalysis = () => {
  const { responses, questionsConfig, selectedGaranties, aiResults, setAiResults } = useInspectionStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const promptBase = generateAnalysisPrompt(responses, questionsConfig, selectedGaranties);
      const promptStrict = `${promptBase} \n\n Réponds EXCLUSIVEMENT au format JSON suivant : 
      {
        "synthese": "Analyse globale en 5 lignes",
        "pointsForts": ["point1", "point2", "point3"],
        "pointsFaibles": ["point1", "point2", "point3"],
        "recommandations": ["rec1", "rec2", "rec3"]
      }`;

      const r = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer 3iLUdJmbLlNrXdjgUflUzZWx1HQUoxYx' },
        body: JSON.stringify({
          model: "mistral-small-latest",
          messages: [{ role: "system", content: "Tu es un expert en risque IARD. Tu ne parles qu'en JSON." }, { role: "user", content: promptStrict }],
          response_format: { type: "json_object" },
          temperature: 0.1
        })
      });

      const d = await r.json();
      const content = JSON.parse(d.choices[0].message.content);
      setAiResults(content);
    } catch (e) {
      setError("Erreur d'analyse. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl">
        <div className="flex items-center space-x-3">
          <BrainCircuit className="text-indigo-400" />
          <h2 className="text-xl font-bold uppercase">Expertise IA</h2>
        </div>
      </div>

      {!aiResults && !loading ? (
        <button onClick={runAnalysis} className="w-full py-12 border-2 border-dashed border-slate-200 rounded-[2rem] bg-white flex flex-col items-center gap-3">
          <Sparkles className="text-indigo-600" size={32} />
          <span className="font-bold uppercase text-xs tracking-widest">Lancer le diagnostic</span>
        </button>
      ) : loading ? (
        <div className="p-12 text-center bg-white rounded-[2rem] shadow-sm">
          <Loader2 className="animate-spin mx-auto text-indigo-600 mb-4" size={32} />
          <p className="font-black text-[10px] uppercase">Analyse Mistral en cours...</p>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-[2rem] border border-green-100 animate-in fade-in">
          <div className="flex items-center gap-2 mb-4 text-green-600">
            <ShieldCheck size={20} />
            <span className="text-xs font-black uppercase">Analyse Terminée</span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed italic">"{aiResults.synthese}"</p>
          <p className="mt-4 text-[10px] font-bold text-indigo-600 uppercase">→ Consultez le Dashboard pour le détail</p>
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;
