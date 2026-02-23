import React, { useState } from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import { 
  BrainCircuit, Loader2, ShieldCheck, Flame, Droplets, Lock, 
  Users, Activity, AlertTriangle, Globe2, MountainSnow, 
  Waves, Wind, Settings2, MapPin, BarChart4, ClipboardList,
  PlusCircle, Lightbulb, Target, ChevronDown, Check, SlidersHorizontal,
  FileDown // Ajout de l'icône pour le téléchargement
} from 'lucide-react';

// IMPORTATION DU SCRIPT PDF (Situé dans le même dossier)
import { exportToPdf } from './ExportPDF';

const AIAnalysis = () => {
  const { responses, questionsConfig, aiResults, setAiResults, auditorInfo } = useInspectionStore();
  const [loading, setLoading] = useState(false);
  const [selectedGaranties, setSelectedGaranties] = useState(['Incendie_explosion', 'Bris_De_Machine', 'RC']);
  const [expertOpinion, setExpertOpinion] = useState(50);
  const [analysisSeverity, setAnalysisSeverity] = useState('Moyen');
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
      
      const nomsGarantiesCochees = selectedGaranties
        .map(id => garantiesLib.find(g => g.id === id)?.label)
        .join(", ");

      // Extraction propre des données pour l'IA
      const allQuestionsData = Object.keys(responses).map(id => {
        const q = questionsConfig.flatMap(s => s.questions).find(qu => qu.id === id);
        if (!q) return null;
        return {
          id: id,
          label: q.label,
          val: responses[id].value || (responses[id].score + '/5'),
          obs: responses[id].comment || 'RAS'
        };
      }).filter(Boolean);

      const promptStrict = `
  Tu es un Ingénieur Souscripteur Senior en Assurance IARD, en Algérie. 
  CONTEXTE : Site "${nomination}" (${natureActivite}) à ${siteAddress}.

  DONNÉES D'INSPECTION (Brutes) : 
  ${JSON.stringify(allQuestionsData)}

  MISSION DE RÉDACTION PROFESSIONNELLE :
  1. REFORMULATION : Reprends chaque observation ("obs") pour la rendre professionnelle, concise et sans fautes.
  2. COHÉRENCE MÉTIER : Analyse la pertinence technique. 
     - Exemple : Pour la céramique, l'incendie n'est pas lié à des "matières inflammables" (argile/sable), mais à la charge thermique des fours (gaz/électricité) et au stockage des emballages (palettes/plastiques). 
     - Si une observation humaine semble illogique, corrige-la techniquement tout en restant fidèle à l'esprit du constat.
  3. ENRICHISSEMENT : Ajoute du vocabulaire technique, tout en restant dans le contexte assurentiel.
  4. Analyser l'exposition pour ces garanties : ${nomsGarantiesCochees}.

  FORMAT JSON :
  {
    "score_global": 0-100,
    "synthese_executive": "Résumé Enrichi stratégique pour un souscripteur",
    "analyse_nat_cat": { "exposition_sismique": "Analyse CRAAG", "exposition_hydrologique": " Analyse ASAL", "score_catnat": 1-10 },
    "analyses_par_garantie": [
      { "garantie": "Nom", "exposition": 1-10, "avis_technique": "Rédaction enrichie ici", "recommandations_standards": "Mesures concrètes reflètant le plus possible la réalité du terrain" }
    ],
    "report_narrative": [
      {
        "section_title": "Titre du Chapitre",
        "section_intro": "Analyse contextuelle du risque lié à l'activité ${natureActivite}",
        "questions_reformulees": [
           { "label": "Nom question", "val": "Valeur", "obs_pro": "Texte corrigé et enrichi par l'IA" }
        ]
      }
    ],
    "plan_actions": { "Priorité 1": "Description" }
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
            { role: "system", content: "Tu es un moteur d'expertise en assurance. Réponds uniquement en JSON." },
            { role: "user", content: promptStrict }
          ],
          response_format: { type: "json_object" },
          temperature: 0.3
        })
      });

      if (!response.ok) throw new Error("Erreur IA");

      const rawData = await response.json();
      const content = JSON.parse(rawData.choices[0].message.content);
      
      setAiResults(content);

    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'analyse.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6 pb-24 max-w-5xl mx-auto font-sans">
      {/* HEADER AVEC BOUTON TÉLÉCHARGEMENT */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative border-b-4 border-indigo-500 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-500 rounded-xl"><Target size={24} /></div>
            <h2 className="text-xl font-black uppercase italic">RiskPro Intelligence</h2>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Expertise Augmentée</span>
        </div>

        {aiResults && (
          <button 
            onClick={() => exportToPdf(responses, questionsConfig, aiResults, auditorInfo)}
            className="flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-tighter hover:bg-indigo-500 hover:text-white transition-all shadow-lg"
          >
            <FileDown size={18} />
            Télécharger Rapport
          </button>
        )}
      </div>

      {!aiResults ? (
        <div className="space-y-6">
          {/* CONFIGURATION ET GARANTIES (Gardé identique à ton original) */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase text-slate-500">Avis Terrain ({expertOpinion}%)</label>
                  <input type="range" min="0" max="100" value={expertOpinion} onChange={(e) => setExpertOpinion(e.target.value)} className="w-full accent-indigo-600" />
                </div>
                <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase text-slate-500">Sévérité</label>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    {['Léger', 'Moyen', 'Sévère'].map(l => (
                      <button key={l} onClick={() => setAnalysisSeverity(l)} className={`flex-1 py-2 text-xs font-bold rounded-lg ${analysisSeverity === l ? 'bg-white text-indigo-600 shadow' : 'text-slate-400'}`}>{l}</button>
                    ))}
                  </div>
                </div>
             </div>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl">
            <button onClick={() => setIsGarantiesOpen(!isGarantiesOpen)} className="w-full flex justify-between font-bold text-sm mb-4">
              <span>Périmètre : {selectedGaranties.length} Garanties</span>
              <ChevronDown />
            </button>
            {isGarantiesOpen && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {garantiesLib.map(g => (
                  <button key={g.id} onClick={() => setSelectedGaranties(prev => prev.includes(g.id) ? prev.filter(x => x !== g.id) : [...prev, g.id])} className={`p-2 rounded-lg border text-[11px] font-bold ${selectedGaranties.includes(g.id) ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white text-slate-500'}`}>{g.label}</button>
                ))}
              </div>
            )}
            <button onClick={runDetailedAnalysis} disabled={loading} className="w-full mt-6 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" /> : "Générer l'Expertise"}
            </button>
          </div>
        </div>
      ) : (
        /* RÉSULTATS VISUELS (Gardé identique à ton original pour la cohérence DASHBOARD) */
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 p-6 rounded-[2rem] text-white text-center border-b-4 border-indigo-500">
              <div className="text-5xl font-black">{aiResults.score_global}%</div>
              <div className="text-[9px] uppercase font-bold text-indigo-400">Maîtrise Globale</div>
            </div>
            <div className="md:col-span-3 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm italic text-sm text-slate-600 flex items-center">
              "{aiResults.synthese_executive}"
            </div>
          </div>

          {/* SECTION CATNAT ET ANALYSES PAR GARANTIE */}
          {/* ... ton code original de rendu ... */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl">
            <h3 className="text-xs font-black uppercase mb-4 text-slate-800 flex items-center gap-2"><Globe2 size={16}/> Risques Géo-Climatiques</h3>
            <div className="grid md:grid-cols-3 gap-4">
               <div className="p-4 bg-slate-50 rounded-xl">
                 <span className="text-[9px] font-bold text-slate-400 uppercase">Sismique</span>
                 <p className="text-xs font-bold">{aiResults.analyse_nat_cat?.exposition_sismique || "N/A"}</p>
               </div>
               <div className="p-4 bg-slate-50 rounded-xl">
                 <span className="text-[9px] font-bold text-slate-400 uppercase">Inondation</span>
                 <p className="text-xs font-bold">{aiResults.analyse_nat_cat?.exposition_hydrologique || "N/A"}</p>
               </div>
               <div className="p-4 bg-indigo-900 text-white rounded-xl text-center">
                 <span className="text-[9px] uppercase opacity-60">Indice CATNAT</span>
                 <div className="text-xl font-black">{aiResults.analyse_nat_cat?.score_catnat || 0}/10</div>
               </div>
            </div>
          </div>

          <div className="space-y-3">
            {aiResults.analyses_par_garantie.map((gar, i) => (
               <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm grid md:grid-cols-3 gap-4 items-center">
                <div className="font-black text-xs uppercase text-indigo-600">{gar.garantie}</div>
                <div className="md:col-span-2 text-[11px] text-slate-600">
                  <p><strong>Expertise :</strong> {gar.avis_technique}</p>
                  <p className="mt-1 text-slate-400 italic">Prév : {gar.recommandations_standards}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white">
            <h3 className="text-xs font-black uppercase mb-4 text-indigo-400">Plan d'action prioritaire</h3>
            <div className="space-y-3">
              {Object.entries(aiResults.plan_actions).map(([label, desc], i) => (
                <div key={i} className="flex gap-3 text-xs border-l border-slate-700 pl-4">
                  <span className="text-indigo-500 font-bold min-w-[80px]">{label.replace('_', ' ')}</span>
                  <p className="text-slate-400">{desc}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setAiResults(null)} className="w-full mt-6 py-3 bg-white/5 rounded-xl text-[10px] uppercase font-bold">Nouvelle analyse</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;
