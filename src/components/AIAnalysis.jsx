import React, { useState } from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import { 
  BrainCircuit, Loader2, ShieldCheck, Target, ChevronDown, FileDown, Zap, AlertTriangle, Info
} from 'lucide-react';
import { exportToPdf } from './ExportPDF';

const AIAnalysis = () => {
  // Récupération sécurisée du store
  const { responses, questionsConfig, aiResults, setAiResults, auditorInfo } = useInspectionStore();
  
  const [loading, setLoading] = useState(false);
  const [selectedGaranties, setSelectedGaranties] = useState(['Incendie_explosion', 'Bris_De_Machine', 'RC']);
  const [isGarantiesOpen, setIsGarantiesOpen] = useState(true);

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
      const nomination = responses?.nomination?.value || "Site Industriel";
      const natureActivite = responses?.activite_nature?.value || "Non spécifiée";
      
      // Extraction des données pour le prompt
      const allQuestionsData = Object.keys(responses || {}).map(id => {
        const q = questionsConfig?.flatMap(s => s.questions).find(qu => qu.id === id);
        if (!q) return null;
        return { 
          label: q.label, 
          val: responses[id].value || (responses[id].score + '/5'), 
          obs: responses[id].comment || 'RAS' 
        };
      }).filter(Boolean);

      const promptStrict = `
        Tu es un Ingénieur souscripteur Expert en Risques IARD. 
        Analyse le site : ${nomination} (${natureActivite}).
        Données : ${JSON.stringify(allQuestionsData)}
        Garanties à analyser : ${selectedGaranties.join(', ')}.

       
        MISSION :
        1. REFORMULATION EXPERTE : Pour chaque observation ("obs"), produis une version "obs_pro" rédigée comme un rapport d'audit.
        2. COHÉRENCE MÉTIER : Vérifie la logique entre l'activité et les risques (ex: Céramique/Fours).
        3. ANALYSE ET RECOMMANDATIONS : Évalue l'exposition (1-10) pour : ${nomsGarantiesCochees}.
        4.STYLE : Rédige dans un style "Expert Senior" : professionnel, sans fautes, utilisant le vocabulaire de l'assurance (mesures de prévention, conformité).
        IMPORTANT : Pour la section "recommandations", ne te limite pas en nombre. Liste TOUTES les mesures de prévention nécessaires.

FORMAT DE RÉPONSE (JSON STRICT - RESPECTER CES CLÉS EXACTES POUR L'AFFICHAGE) :
  {
    "score_global": 0-100,
    "synthese_executive": "Ta synthèse enrichie et corrigée ici",
    "analyse_nat_cat": {
      "exposition_sismique": "Analyse technique (ex: Zone CRAAG)",
      "exposition_hydrologique": "Analyse technique (ex: Risque inondation ASAL)",
      "synthese_geologique": "Commentaire pro sur le sol/climat",
      "score_catnat": 1-10
    },
    "analyses_par_garantie": [
      {
        "garantie": "Nom exact de la garantie",
        "exposition": 1-10,
        "avis_technique": "C'est ici que tu reformules mes observations de façon pro et cohérente avec l'activité",
        "recommandations_standards": "Mesures de prévention concrètes et pertinentes"
      }
    ],
          "report_narrative": [
            { "section_title": "...", "questions_reformulees": [{ "label": "...", "obs_pro": "..." }] }
          ]
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
            { role: "system", content: "Tu es un expert en assurance en Algérie. Réponds uniquement en JSON pur." },
            { role: "user", content: promptStrict }
          ],
          response_format: { type: "json_object" },
          temperature: 0.1
        })
      });

      const rawData = await response.json();
      const parsedResults = JSON.parse(rawData.choices[0].message.content);
      setAiResults(parsedResults);

    } catch (error) {
      console.error("Erreur Analyse IA:", error);
      alert("Erreur lors de la génération. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6 pb-32 max-w-5xl mx-auto bg-slate-50/30 min-h-screen font-sans">
      
      {/* HEADER */}
      <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500 rounded-2xl shadow-lg shadow-indigo-500/20">
            <BrainCircuit size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tighter uppercase italic">RiskPro AI</h2>
            <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Analyse Expert Illimitée</p>
          </div>
        </div>

        {aiResults && (
          <button 
            onClick={() => exportToPdf(responses, questionsConfig, aiResults, auditorInfo)}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase transition-all shadow-lg"
          >
            <FileDown size={18} /> Télécharger le Rapport PDF
          </button>
        )}
      </div>

      {!aiResults ? (
        /* ECRAN DE CONFIGURATION */
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-xs uppercase text-slate-400 tracking-widest flex items-center gap-2">
              <ShieldCheck size={14} /> Périmètre de l'expertise
            </h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {garantiesLib.map(g => (
              <button 
                key={g.id} 
                onClick={() => setSelectedGaranties(prev => prev.includes(g.id) ? prev.filter(x => x !== g.id) : [...prev, g.id])}
                className={`p-4 rounded-2xl border-2 text-[10px] font-black uppercase transition-all ${
                  selectedGaranties.includes(g.id) 
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                  : 'border-slate-50 bg-slate-50 text-slate-400'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          <button 
            onClick={runDetailedAnalysis} 
            disabled={loading} 
            className="w-full py-6 bg-slate-900 hover:bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-sm tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                <span>Ingénierie en cours...</span>
              </>
            ) : (
              <>
                <Zap size={20} fill="currentColor" />
                <span>Générer l'expertise complète</span>
              </>
            )}
          </button>
        </div>
      ) : (
        /* ECRAN DE RESULTATS */
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* SCORE & SYNTHESE */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col justify-center items-center shadow-xl border-b-8 border-indigo-500">
              <span className="text-6xl font-black">{aiResults?.score_global}%</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mt-2">Score de Risque</span>
            </div>
            <div className="md:col-span-3 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center">
              <p className="text-slate-600 italic leading-relaxed text-sm">
                <Info className="inline mr-2 text-indigo-500" size={16} />
                {aiResults?.synthese_executive}
              </p>
            </div>
          </div>

          {/* RECOMMANDATIONS ILLIMITÉES PAR GARANTIE */}
          <div className="grid grid-cols-1 gap-6">
            {aiResults?.analyses_par_garantie?.map((gar, idx) => (
              <div key={idx} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 flex justify-between items-center">
                  <h4 className="font-black text-xs uppercase text-slate-700 tracking-wider">{gar.garantie}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Exposition</span>
                    <span className="px-3 py-1 bg-white border rounded-full text-xs font-black text-indigo-600">{gar.exposition}/10</span>
                  </div>
                </div>
                
                <div className="p-8 space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-indigo-400 uppercase mb-2">Analyse de l'expert</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{gar.avis_technique}</p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-rose-400 uppercase mb-2 flex items-center gap-2">
                      <AlertTriangle size={12} /> Mesures de prévention recommandées
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {gar.recommandations?.map((rec, i) => (
                        <div key={i} className="flex gap-3 items-start p-3 bg-slate-50 rounded-xl">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                          <p className="text-[11px] font-medium text-slate-700">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => setAiResults(null)}
            className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            Relancer une nouvelle analyse
          </button>
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;
