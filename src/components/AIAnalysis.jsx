import React, { useState } from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import { 
  BrainCircuit, Loader2, ShieldCheck, Target, ChevronDown, FileDown, Zap, AlertTriangle, Info, BarChart3
} from 'lucide-react';
import { exportToPdf } from './ExportPDF';

const AIAnalysis = () => {
  const { responses, questionsConfig, aiResults, setAiResults, auditorInfo } = useInspectionStore();
  
  const [loading, setLoading] = useState(false);
  const [selectedGaranties, setSelectedGaranties] = useState(['Incendie_explosion', 'Bris_De_Machine', 'RC']);
  
  // Nouveaux paramètres d'analyse
  const [expertSatisfaction, setExpertSatisfaction] = useState(80);
  const [severity, setSeverity] = useState('Moyenne');

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
      
      const nomsGarantiesCochees = selectedGaranties.map(id => 
        garantiesLib.find(g => g.id === id)?.label
      ).join(", ");

      const allQuestionsData = Object.keys(responses || {}).map(id => {
        const q = questionsConfig?.flatMap(s => s.questions).find(qu => qu.id === id);
        if (!q) return null;
        return { 
          label: q.label, 
          val: responses[id].value || (responses[id].score + '/5'), 
          obs: responses[id].comment || 'RAS' 
        };
      }).filter(Boolean);

      // Prompt mis à jour avec Satisfaction et Sévérité
      const promptStrict = `
        Tu es un Ingénieur Souscripteur Senior en Risques Industriels (Expert IARD Algérie).
        
        PARAMÈTRES CRITIQUES :
        - SÉVÉRITÉ DE L'ANALYSE : ${severity.toUpperCase()}
        - SATISFACTION GLOBALE DE L'EXPERT : ${expertSatisfaction}%

        Analyse le site : ${nomination} (${natureActivite}).
        Garanties : ${nomsGarantiesCochees}.
        Données d'audit : ${JSON.stringify(allQuestionsData)}

        MISSIONS :
        1. ANALYSE TECHNIQUE : Évalue la vulnérabilité selon le niveau de sévérité choisi.
        2. NAT-CAT : Spécificités Algérie (Zones CRAAG, RPA, risques inondations locaux).
        3. DÉCISIONNEL : Justifie l'acceptabilité en tenant compte du ressenti expert (${expertSatisfaction}%).
        4. PRÉVENTION : Mesures d'améliorations SMART.

        REPONDRE UNIQUEMENT EN JSON :
        {
          "score_global": 0-100,
          "synthese_executive": "...",
          "analyse_nat_cat": {
            "exposition_sismique": "...",
            "exposition_hydrologique": "...",
            "synthese_geologique": "...",
            "score_catnat": 1-10
          },
          "analyses_par_garantie": [
            {
              "garantie": "Nom",
              "exposition": 1-10,
              "avis_technique": "...",
              "recommandations": ["..."]
            }
          ]
        }`;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': 'Bearer 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' 
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: "Expert IARD Algérie. JSON uniquement." },
            { role: "user", content: promptStrict }
          ],
          response_format: { type: "json_object" },
          temperature: 0.3
        })
      });

      if (!response.ok) throw new Error(`Erreur API: ${response.status}`);

      const rawData = await response.json();
      const parsedResults = JSON.parse(rawData.choices[0].message.content);
      setAiResults(parsedResults);

    } catch (error) {
      console.error("Erreur Analyse IA:", error);
      alert("Erreur lors de la génération : " + error.message);
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
            <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Expertise Risques Industriels</p>
          </div>
        </div>

        {aiResults && (
          <button 
            onClick={() => exportToPdf(responses, questionsConfig, aiResults, auditorInfo)}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase transition-all shadow-lg"
          >
            <FileDown size={18} /> Télécharger Rapport PDF
          </button>
        )}
      </div>

      {!aiResults ? (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
          
          {/* CONFIGURATION DE L'ANALYSE (LES DEUX CURSEURS) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
            {/* Satisfaction Expert */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                  <BarChart3 size={14} className="text-indigo-500" /> Satisfaction Expert
                </label>
                <span className="text-sm font-black text-indigo-600 bg-white px-3 py-1 rounded-full border shadow-sm">
                  {expertSatisfaction}%
                </span>
              </div>
              <input 
                type="range" min="0" max="100" step="5"
                value={expertSatisfaction}
                onChange={(e) => setExpertSatisfaction(e.target.value)}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase">
                <span>Critique</span>
                <span>Excellent</span>
              </div>
            </div>

            {/* Sévérité */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                <Target size={14} className="text-indigo-500" /> Sévérité de l'Analyse
              </label>
              <div className="flex gap-2">
                {['Légère', 'Moyenne', 'Sévère'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSeverity(lvl)}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${
                      severity === lvl 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'bg-white text-slate-400 border border-slate-100 hover:border-indigo-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-black text-xs uppercase text-slate-400 tracking-widest flex items-center gap-2">
              <ShieldCheck size={14} /> Périmètre de l'expertise
            </h3>
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
          </div>

          <button 
            onClick={runDetailedAnalysis} 
            disabled={loading} 
            className="w-full py-6 bg-slate-900 hover:bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-sm tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl"
          >
            {loading ? (
              <><Loader2 className="animate-spin" /><span>Analyse en cours...</span></>
            ) : (
              <><Zap size={20} fill="currentColor" /><span>Générer l'expertise complète</span></>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* SCORE GLOBAL */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col justify-center items-center shadow-xl border-b-8 border-indigo-500">
              <span className="text-6xl font-black">{aiResults?.score_global}%</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mt-2">Maîtrise du Risque</span>
            </div>
            <div className="md:col-span-3 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center">
              <p className="text-slate-600 italic leading-relaxed text-sm">
                <Info className="inline mr-2 text-indigo-500" size={16} />
                {aiResults?.synthese_executive}
              </p>
            </div>
          </div>

          {/* ANALYSE PAR GARANTIE */}
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
                    <p className="text-[10px] font-black text-indigo-400 uppercase mb-2">Avis de l'Expert</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{gar.avis_technique}</p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-rose-400 uppercase mb-2 flex items-center gap-2">
                      <AlertTriangle size={12} /> Mesures de prévention
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
            className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold uppercase text-[10px] hover:bg-slate-50 transition-all"
          >
            Nouvelle analyse
          </button>
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;
