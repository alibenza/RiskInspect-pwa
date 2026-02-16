import React, { useState } from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import { BrainCircuit, Sparkles, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';

const AIAnalysis = () => {
  const { responses, questionsConfig, aiResults, setAiResults } = useInspectionStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      // Préparation des données pour l'IA
      const dataSummary = questionsConfig.map(section => {
        const sectionResponses = section.questions
          .map(q => {
            const r = responses[q.id];
            return r ? `- ${q.label} : ${r.value || r.score + '/5'} ${r.comment ? `(Note: ${r.comment})` : ''}` : null;
          })
          .filter(Boolean)
          .join('\n');
        return `### ${section.title}\n${sectionResponses}`;
      }).join('\n\n');

      const promptStrict = `Tu es un expert en audit de risques industriels IARD. 
      Voici les données relevées sur le site :
      
      ${dataSummary}

      Analyse ces données et réponds EXCLUSIVEMENT au format JSON suivant : 
      {
        "synthese": "Analyse globale de l'assurabilité en 5 lignes maximum",
        "pointsForts": ["point fort 1", "point fort 2", "point fort 3"],
        "pointsFaibles": ["point faible 1", "point faible 2", "point faible 3"],
        "recommandations": ["action 1", "action 2", "action 3"]
      }`;

      const r = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': 'Bearer sxU5BJBbBa1NbKMLi5lssQYYBjaFZoPE' 
        },
        body: JSON.stringify({
          model: "mistral-small-latest",
          messages: [
            { role: "system", content: "Tu es un expert en risque IARD. Tu ne parles qu'en JSON." }, 
            { role: "user", content: promptStrict }
          ],
          response_format: { type: "json_object" },
          temperature: 0.1
        })
      });

      if (!r.ok) throw new Error('Erreur API Mistral');

      const d = await r.json();
      const content = JSON.parse(d.choices[0].message.content);
      setAiResults(content);
    } catch (e) {
      console.error(e);
      setError("Erreur d'analyse. Vérifiez votre connexion ou la clé API.");
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

      {error && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 text-red-600 text-xs font-bold">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {!aiResults && !loading ? (
        <button 
          onClick={runAnalysis} 
          disabled={Object.keys(responses).length === 0}
          className={`w-full py-12 border-2 border-dashed rounded-[2rem] flex flex-col items-center gap-3 transition-all ${
            Object.keys(responses).length === 0 
            ? 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed' 
            : 'border-slate-200 bg-white hover:border-indigo-300 group'
          }`}
        >
          <Sparkles className={Object.keys(responses).length === 0 ? 'text-slate-300' : 'text-indigo-600 group-hover:scale-110 transition-transform'} size={32} />
          <span className="font-bold uppercase text-xs tracking-widest text-slate-500">
            {Object.keys(responses).length === 0 ? "Remplissez l'audit pour lancer l'IA" : "Lancer le diagnostic"}
          </span>
        </button>
      ) : loading ? (
        <div className="p-12 text-center bg-white rounded-[2rem] shadow-sm border border-slate-100">
          <Loader2 className="animate-spin mx-auto text-indigo-600 mb-4" size={32} />
          <p className="font-black text-[10px] uppercase tracking-widest text-slate-400">Analyse Mistral en cours...</p>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-[2rem] border border-green-100 animate-in fade-in duration-500">
          <div className="flex items-center gap-2 mb-4 text-green-600">
            <ShieldCheck size={20} />
            <span className="text-xs font-black uppercase tracking-widest">Analyse Terminée</span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed italic mb-6">"{aiResults.synthese}"</p>
          <button 
            onClick={() => setAiResults(null)}
            className="text-[10px] font-bold text-slate-400 uppercase hover:text-indigo-600 transition-colors"
          >
            ↻ Relancer une analyse
          </button>
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;
