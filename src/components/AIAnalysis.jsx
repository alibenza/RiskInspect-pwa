import React, { useState } from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import { BrainCircuit, Sparkles, Loader2, AlertCircle, ShieldCheck, Globe2 } from 'lucide-react';

const AIAnalysis = () => {
  const { responses, questionsConfig, aiResults, setAiResults } = useInspectionStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Extraction de la Nature de l'Activité (Valeur Pivot)
      const natureActivite = responses['activite_nature']?.value || "Non spécifiée";

      // 2. Extraction du contexte géographique (via la première photo avec GPS)
      const photoWithGPS = Object.values(responses).find(r => r.photos?.length > 0)?.photos[0];
      const gpsContext = photoWithGPS 
        ? `Coordonnées GPS: Lat ${photoWithGPS.coords.lat.toFixed(4)}, Lon ${photoWithGPS.coords.lng.toFixed(4)}` 
        : "Localisation exacte non fournie (utiliser le contexte général)";

      // 3. Construction du résumé des données terrain
      const dataSummary = questionsConfig.map(section => {
        const sectionResponses = section.questions
          .map(q => {
            const r = responses[q.id];
            if (!r) return null;
            return `[${q.label}] : Réponse=${r.value || r.score + '/5'}. Obs: ${r.comment || 'N/A'}`;
          })
          .filter(Boolean)
          .join('\n');
        return `SECTION: ${section.title}\n${sectionResponses}`;
      }).join('\n\n');

      const promptStrict = `Tu es un Ingénieur Expert en Prévention des Risques IARD. 
      Ton analyse doit croiser les données de terrain avec des recherches contextuelles externes.

      CONTEXTE MAÎTRE :
      - NATURE DE L'ACTIVITÉ : "${natureActivite}"
      - EMPLACEMENT : ${gpsContext}

      DONNÉES DU SITE :
      ${dataSummary}

      TES MISSIONS D'ANALYSE :
      1. ACCIDENTOLOGIE & BENCHMARK : Analyse les statistiques d'accidents et de sinistres (incendie, explosion, bris de machine) spécifiquement pour la nature d'activité "${natureActivite}". Quelles sont les causes racines les plus fréquentes dans ce secteur ?
      2. EXPOSITION ALÉAS NATURELS (NAT-CAT) : En te basant sur la localisation et ton expertise, évalue l'exposition aux risques naturels (Séisme, Inondation, Retrait-Gonflement des Argiles, vents cycloniques).
      3. INTERPRÉTATION CROISÉE : Relie les manquements observés sur le terrain (données fournies) aux risques majeurs identifiés pour cette activité.

      FORMAT DE RÉPONSE JSON EXCLUSIF :
      {
        "synthese": "Rédaction professionnelle (15 lignes) incluant l'accidentologie secteur et l'exposition géographique...",
        "pointsForts": ["Technique/Humain", "Technique/Humain", "Technique/Humain"],
        "pointsFaibles": ["Vulnérabilité sectorielle", "Faille terrain", "Risque externe"],
        "recommandations": ["Priorité 1 (Impact ROI)", "Priorité 2", "Priorité 3"]
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
            { role: "system", content: "Tu es un expert en ingénierie du risque. Ton ton est formel, technique et analytique. Tu intègres des données de benchmark sectoriel et d'exposition NAT-CAT." }, 
            { role: "user", content: promptStrict }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7
        })
      });

      if (!r.ok) throw new Error('Erreur API Mistral');

      const d = await r.json();
      const content = JSON.parse(d.choices[0].message.content);
      setAiResults(content);
    } catch (e) {
      console.error(e);
      setError("Erreur lors de la génération de l'expertise contextuelle.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header avec indicateur de Nature d'Activité */}
      <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BrainCircuit className="text-indigo-400" />
            <h2 className="text-xl font-bold uppercase tracking-tighter">Analyse Contextuelle IA</h2>
          </div>
          {responses['activite_nature']?.value && (
            <div className="bg-indigo-500/20 px-4 py-1 rounded-full border border-indigo-500/30 flex items-center gap-2">
              <Globe2 size={12} className="text-indigo-300" />
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">
                {responses['activite_nature'].value}
              </span>
            </div>
          )}
        </div>
        <div className="absolute -right-10 -bottom-10 opacity-10">
          <BrainCircuit size={160} />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-bold border border-red-100 animate-shake">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {!aiResults && !loading ? (
        <button 
          onClick={runAnalysis} 
          className="w-full py-12 border-2 border-dashed border-slate-200 rounded-[2rem] bg-white flex flex-col items-center gap-3 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group"
        >
          <div className="p-4 bg-indigo-50 rounded-full group-hover:scale-110 transition-transform">
            <Sparkles className="text-indigo-600" size={32} />
          </div>
          <div className="text-center">
            <span className="block font-black uppercase text-[10px] tracking-[0.2em] text-slate-800">Lancer l'expertise métier</span>
            <span className="text-[10px] text-slate-400 italic">Croisement Accidentologie & NAT-CAT</span>
          </div>
        </button>
      ) : loading ? (
        <div className="p-12 text-center bg-white rounded-[2rem] shadow-sm border border-slate-100">
          <Loader2 className="animate-spin mx-auto text-indigo-600 mb-4" size={32} />
          <p className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-2">Analyse de la nature d'activité : "{responses['activite_nature']?.value}"</p>
          <div className="w-48 h-1 bg-slate-100 mx-auto rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 animate-progress"></div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in zoom-in-95 duration-500 pb-20">
          {/* Synthèse Principale */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-2 mb-6 text-indigo-600">
              <ShieldCheck size={20} />
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Rapport de Prévention Décisionnel</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap relative z-10">
              {aiResults.synthese}
            </p>
          </div>

          {/* Grille de détails IA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100">
              <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-4">Points de Rassurance</h4>
              <ul className="space-y-3">
                {aiResults.pointsForts.map((pt, i) => (
                  <li key={i} className="text-xs text-emerald-800 flex gap-2">
                    <span className="opacity-50">•</span> {pt}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-red-50/50 p-6 rounded-[2rem] border border-red-100">
              <h4 className="text-[10px] font-black text-red-700 uppercase tracking-widest mb-4">Vulnérabilités Métier</h4>
              <ul className="space-y-3">
                {aiResults.pointsFaibles.map((pt, i) => (
                  <li key={i} className="text-xs text-red-800 flex gap-2">
                    <span className="opacity-50">•</span> {pt}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
             <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-6">Actions de Maîtrise Prioritaires</h4>
             <div className="space-y-4">
               {aiResults.recommandations.map((rec, i) => (
                 <div key={i} className="flex gap-4 items-start p-4 bg-slate-50 rounded-2xl">
                   <span className="bg-indigo-600 text-white text-[10px] font-black h-5 w-5 flex items-center justify-center rounded-lg flex-shrink-0">{i+1}</span>
                   <p className="text-xs text-slate-700 font-medium">{rec}</p>
                 </div>
               ))}
             </div>
          </div>

          <button 
            onClick={() => setAiResults(null)}
            className="w-full py-4 text-[10px] font-bold text-slate-300 uppercase hover:text-red-500 transition-colors"
          >
            ↻ Relancer une nouvelle analyse
          </button>
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;
