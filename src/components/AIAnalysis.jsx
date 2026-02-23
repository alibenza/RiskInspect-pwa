import React, { useState } from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import { 
  BrainCircuit, Loader2, ShieldCheck, Globe2, Target, ChevronDown, FileDown, Zap, AlertTriangle
} from 'lucide-react';
import { exportToPdf } from './ExportPDF';

const AIAnalysis = () => {
  const { responses, questionsConfig, aiResults, setAiResults, auditorInfo } = useInspectionStore();
  const [loading, setLoading] = useState(false);
  const [selectedGaranties, setSelectedGaranties] = useState(['Incendie_explosion', 'Bris_De_Machine', 'RC']);
  const [isGarantiesOpen, setIsGarantiesOpen] = useState(false);

  const garantiesLib = [
    { id: 'Incendie_explosion', label: 'Incendie & Explosion' },
    { id: 'Degat_Des_Eaux', label: 'Dégâts des Eaux' },
    { id: 'Tremblement_de_Terre', label: 'Tremblement de terre' },
    { id: 'inondation', label: 'Inondations' },
    { id: 'Tempetes', label: 'Tempêtes' },
    { id: 'Vol', label: 'Vol & Vandalisme' },
    { id: 'Bris_De_Machine', label: 'Bris de Machines' },
    { id: 'Perte_Exploitation', label: 'Pertes d’Exploitation' },
    { id: 'RC', label: 'Resp. Civile' },
  ];

  const runDetailedAnalysis = async () => {
    if (selectedGaranties.length === 0) return alert("Sélectionnez au moins une garantie.");
    setLoading(true);

    try {
      const nomination = responses['nomination']?.value || "Site Industriel";
      const natureActivite = responses['activite_nature']?.value || "Non spécifiée";
      const siteAddress = responses['adress']?.value || "Algérie";
      const nomsGarantiesCochees = selectedGaranties.map(id => garantiesLib.find(g => g.id === id)?.label).join(", ");

      const allQuestionsData = Object.keys(responses).map(id => {
        const q = questionsConfig.flatMap(s => s.questions).find(qu => qu.id === id);
        if (!q) return null;
        return { id, label: q.label, val: responses[id].value || (responses[id].score + '/5'), obs: responses[id].comment || 'RAS' };
      }).filter(Boolean);

      const promptStrict = `
        Tu es un Ingénieur Expert en Risques Assuranciels (Risk Control Senior).
        CONTEXTE : Site "${nomination}" (${natureActivite}) à ${siteAddress}.
        DONNÉES D'INSPECTION : ${JSON.stringify(allQuestionsData)}

        MISSION :
        1. REFORMULATION EXPERTE : Pour chaque observation ("obs"), produis une version "obs_pro" rédigée comme un rapport d'audit.
        2. COHÉRENCE MÉTIER : Vérifie la logique entre l'activité et les risques (ex: Céramique/Fours).
        3. ANALYSE ET RECOMMANDATIONS : Évalue l'exposition (1-10) pour : ${nomsGarantiesCochees}.
        
        IMPORTANT : Ne limite pas le nombre de recommandations. Fournis autant de mesures de prévention que nécessaire pour couvrir tous les points faibles identifiés.

        FORMAT JSON STRICT :
        {
          "score_global": 0-100,
          "synthese_executive": "Résumé stratégique",
          "analyse_nat_cat": { 
            "exposition_sismique": "Texte", 
            "exposition_hydrologique": "Texte", 
            "synthese_geologique": "Texte",
            "score_catnat": 1-10 
          },
          "points_vigilance_majeurs": ["Alerte 1", "Alerte 2"],
          "analyses_par_garantie": [
            { 
              "garantie": "Nom", 
              "exposition": 1-10, 
              "avis_technique": "Rédaction pro", 
              "recommandations": ["Mesure 1", "Mesure 2", "Mesure 3", "Etc..."] 
            }
          ],
          "report_narrative": [
            {
              "section_title": "Chapitre",
              "questions_reformulees": [{ "label": "Nom", "obs_pro": "Texte" }]
            }
          ],
          "plan_actions": { "Priorité_1": "Action" }
        }
      `;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': 'Bearer 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' 
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: "Expert Assurance. Réponds uniquement en JSON." },
            { role: "user", content: promptStrict }
          ],
          response_format: { type: "json_object" },
          temperature: 0.2
        })
      });

      const rawData = await response.json();
      setAiResults(JSON.parse(rawData.choices[0].message.content));

    } catch (error) {
      console.error(error);
      alert("Erreur IA");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6 pb-24 max-w-5xl mx-auto font-sans bg-slate-50/30">
      {/* HEADER */}
      <div className="bg-slate-800 p-8 rounded-[2.5rem] text-white shadow-2xl flex justify-between items-center border-b-4 border-indigo-400">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-500 rounded-xl"><BrainCircuit size={24} /></div>
            <h2 className="text-xl font-black uppercase italic tracking-tighter">RiskPro Intelligence</h2>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Expertise Illimitée</span>
        </div>

        {aiResults && (
          <button 
            onClick={() => exportToPdf(responses, questionsConfig, aiResults, auditorInfo)}
            className="flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-2xl font-black text-xs uppercase hover:bg-indigo-50 transition-all shadow-lg"
          >
            <FileDown size={18} /> Télécharger Rapport
          </button>
        )}
      </div>

      {!aiResults ? (
        /* CONFIGURATION */
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <h3 className="font-black text-xs uppercase text-slate-500 tracking-widest">Configuration du périmètre</h3>
            <button onClick={() => setIsGarantiesOpen(!isGarantiesOpen)} className="text-slate-400">
              <ChevronDown className={`transition-transform ${isGarantiesOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
          
          {isGarantiesOpen && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 animate-in fade-in duration-300">
              {garantiesLib.map(g => (
                <button key={g.id} onClick={() => setSelectedGaranties(prev => prev.includes(g.id) ? prev.filter(x => x !== g.id) : [...prev, g.id])}
                  className={`p-3 rounded-xl border text-[11px] font-bold transition-all ${selectedGaranties.includes(g.id) ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'}`}>
                  {g.label}
                </button>
              ))}
            </div>
          )}

          <button onClick={runDetailedAnalysis} disabled={loading} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-600 transition-colors shadow-xl">
            {loading ? <Loader2 className="animate-spin" /> : "Lancer l'Analyse Experte"}
          </button>
        </div>
      ) : (
        /* RÉSULTATS */
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 p-6 rounded-[2rem] text-white text-center border-b-4 border-indigo-500 shadow-lg">
              <div className="text-5xl font-black">{aiResults.score_global}%</div>
              <div className="text-[9px] uppercase font-bold text-indigo-400">Maîtrise Globale</div>
            </div>
            <div className="md:col-span-3 bg-white p-6 rounded-[2rem] border border-slate-100 italic text-sm text-slate-600 flex items-center shadow-sm">
              "{aiResults.synthese_executive}"
            </div>
          </div>

          {/* LISTE DES ANALYSES PAR GARANTIE (RECOMMANDATIONS ILLIMITÉES) */}
          <div className="space-y-4">
            {aiResults.analyses_par_garantie.map((gar, idx) => (
              <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-black text-xs uppercase text-indigo-600">{gar.garantie}</h4>
                  <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500">Exposition: {gar.exposition}/10</span>
                </div>
                <p className="text-xs text-slate-700 mb-4 leading-relaxed"><span className="font-bold">Avis technique :</span> {gar.avis_technique}</p>
                
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Préconisations de l'expert :</p>
                  <ul className="space-y-1">
                    {gar.recommandations.map((rec, i) => (
                      <li key={i} className="text-[11px] text-slate-600 flex gap-2">
                        <span className="text-indigo-400">•</span> {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => setAiResults(null)} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold uppercase text-[10px] hover:bg-slate-50 transition-colors">
            Nouvelle analyse
          </button>
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;
