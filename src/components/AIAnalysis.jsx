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
      // Construction d'un rapport textuel détaillé pour l'IA
      const dataSummary = questionsConfig.map(section => {
        const sectionResponses = section.questions
          .map(q => {
            const r = responses[q.id];
            if (!r) return null;
            return `[${q.label}] : Réponse=${r.value || r.score + '/5'}. Observation technique: ${r.comment || 'Aucune'}`;
          })
          .filter(Boolean)
          .join('\n');
        return `SECTION: ${section.title}\n${sectionResponses}`;
      }).join('\n\n');

      const promptStrict = `Tu es un Ingénieur Expert en Prévention des Risques IARD (Incendie, Accidents, Risques Divers) avec 20 ans d'expérience. 
      Ton rôle est de rédiger une synthèse d'expertise technique approfondie pour un assureur.

      VOICI LES DONNÉES DU SITE :
      ${dataSummary}

      DIRECTIVES DE RÉDACTION :
      1. SYNTHÈSE : Rédige un paragraphe de 10 à 15 lignes. Analyse la cohérence globale du risque. Ne te contente pas de lister, INTERPRÈTE (ex: "La faiblesse de la maintenance GMAO corrélée à l'ancienneté des transformateurs crée un risque majeur d'interruption d'activité").
      2. POINTS FORTS : Identifie 3 points techniques précis qui rassurent l'assureur.
      3. POINTS FAIBLES : Identifie 3 vulnérabilités critiques (techniques, organisationnelles ou humaines).
      4. RECOMMANDATIONS : Propose 3 actions prioritaires avec un argumentaire sur le retour sur investissement sécurité.

      Réponds EXCLUSIVEMENT au format JSON : 
      {
        "synthese": "Texte long et détaillé ici...",
        "pointsForts": ["...", "...", "..."],
        "pointsFaibles": ["...", "...", "..."],
        "recommandations": ["...", "...", "..."]
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
            { role: "system", content: "Tu es un expert en ingénierie du risque. Ton ton est formel, technique et analytique." }, 
            { role: "user", content: promptStrict }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7 // Augmenté pour plus de richesse rédactionnelle
        })
      });

      if (!r.ok) throw new Error('Erreur API Mistral');

      const d = await r.json();
      const content = JSON.parse(d.choices[0].message.content);
      setAiResults(content);
    } catch (e) {
      console.error(e);
      setError("Erreur lors de la génération de l'expertise.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl">
        <div className="flex items-center space-x-3">
          <BrainCircuit className="text-indigo-400" />
          <h2 className="text-xl font-bold uppercase tracking-tighter">Expertise IA Augmentée</h2>
        </div>
      </div>

      {!aiResults && !loading ? (
        <button 
          onClick={runAnalysis} 
          className="w-full py-12 border-2 border-dashed border-slate-200 rounded-[2rem] bg-white flex flex-col items-center gap-3 hover:border-indigo-400 transition-all group"
        >
          <Sparkles className="text-indigo-600 group-hover:animate-spin-slow" size={32} />
          <span className="font-bold uppercase text-[10px] tracking-[0.2em] text-slate-500">Générer le rapport d'expertise détaillé</span>
        </button>
      ) : loading ? (
        <div className="p-12 text-center bg-white rounded-[2rem] shadow-sm border border-slate-100">
          <Loader2 className="animate-spin mx-auto text-indigo-600 mb-4" size={32} />
          <p className="font-black text-[10px] uppercase tracking-widest text-slate-400">L'expert IA analyse les données techniques...</p>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm animate-in zoom-in-95 duration-500">
          <div className="flex items-center gap-2 mb-6 text-indigo-600">
            <ShieldCheck size={20} />
            <span className="text-xs font-black uppercase tracking-widest">Synthèse de l'Ingénieur Conseil</span>
          </div>
          
          {/* Affichage de la synthèse riche */}
          <div className="prose prose-slate">
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap first-letter:text-3xl first-letter:font-bold first-letter:mr-2 first-letter:float-left">
              {aiResults.synthese}
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-50">
            <button 
              onClick={() => setAiResults(null)}
              className="text-[10px] font-bold text-slate-300 uppercase hover:text-red-500 transition-colors"
            >
              ↻ Réinitialiser l'analyse
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;
