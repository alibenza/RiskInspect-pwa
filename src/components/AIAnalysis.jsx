import React, { useState } from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import { 
  BrainCircuit, 
  Loader2, 
  ShieldCheck, 
  Target, 
  ChevronDown, 
  FileDown, 
  Zap, 
  AlertTriangle, 
  Info, 
  BarChart3,
  FileJson,
  Building2, // Ajouté
  Layers // Ajouté
} from 'lucide-react';
import { exportToPdf } from './ExportPDF';

const AIAnalysis = () => {
  // Récupération de allSites pour l'analyse globale
  const { allSites, responses, questionsConfig, aiResults, setAiResults, auditorInfo } = useInspectionStore();
  
  const [loading, setLoading] = useState(false);
  const [selectedGaranties, setSelectedGaranties] = useState(['Incendie_explosion', 'Bris_De_Machine', 'RC']);
  
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
      const nomination = responses?.nomination?.value || "Entreprise Multi-sites";
      
      // --- PRÉPARATION DES DONNÉES MULTI-SITES ---
      const multiSiteData = Object.entries(allSites).map(([id, site]) => {
        const siteResponses = Object.keys(site.responses || {}).map(qId => {
          const q = questionsConfig?.flatMap(s => s.questions).find(qu => qu.id === qId);
          if (!q) return null;
          return {
            label: q.label,
            val: site.responses[qId].value || (site.responses[qId].score + '/5'),
            obs: site.responses[qId].comment || 'RAS'
          };
        }).filter(Boolean);

        return {
          siteName: site.name,
          data: siteResponses
        };
      });

      const nomsGarantiesCochees = selectedGaranties.map(id => 
        garantiesLib.find(g => g.id === id)?.label
      ).join(", ");

      const promptStrict = `
        Tu es un Ingénieur Souscripteur Senior en Risques Industriels (Expert IARD Algérie).
        
        CONTEXTE : Analyse d'une entreprise assurée possédant ${multiSiteData.length} sites distincts.
        PARAMÈTRES CRITIQUES : SÉVÉRITÉ ${severity.toUpperCase()}, SATISFACTION GLOBALE ${expertSatisfaction}%.

        DONNÉES MULTI-SITES : ${JSON.stringify(multiSiteData)}
        Garanties à analyser : ${nomsGarantiesCochees}.

        MISSIONS :
        1. SYNTHÈSE CORPORATE : Compare les sites entre eux. Identifie le site le plus vulnérable.
        2. ANALYSE NAT-CAT : Risques transversaux en Algérie (Sismicité, Inondations) impactant le groupe.
        3. DÉCISIONNEL : Établis un score global consolidé basé sur la moyenne pondérée des sites et ton ressenti (${expertSatisfaction}%).
        4. PRÉVENTION : Plan d'action prioritaire pour homogénéiser la sécurité sur tous les sites.

        REPONDRE UNIQUEMENT EN JSON :
        {
          "score_global": 0-100,
          "synthese_executive": "Analyse comparative globale...",
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
              "avis_technique": "Avis consolidé pour le groupe...",
              "recommandations": ["Mesure site A", "Mesure site B", "Mesure Groupe"]
            }
          ]
        }`;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: 'POST',
        headers: { 
          'Content-Type': `application/json`, 
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}` 
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: "Expert IARD Algérie. Analyse Multi-sites. JSON uniquement." },
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
            <h2 className="text-2xl font-black tracking-tighter uppercase italic">RiskPro AI <span className="text-indigo-400">Corporate</span></h2>
            <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest italic">Analyse Consolidée Multi-Sites</p>
          </div>
        </div>

        {aiResults && (
          <button 
            onClick={() => exportToPdf(responses, questionsConfig, aiResults, auditorInfo)}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase transition-all shadow-lg"
          >
            <FileDown size={18} /> Rapport Global PDF
          </button>
        )}
      </div>

      {!aiResults ? (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
          
          {/* INFO BULLE MULTI-SITES */}
          <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
            <Layers className="text-indigo-600" size={24} />
            <p className="text-[11px] font-bold text-indigo-900 uppercase">
              L'analyse portera sur <span className="text-indigo-600 underline">{Object.keys(allSites).length} site(s)</span> actuellement enregistrés.
            </p>
          </div>

          {/* CONFIGURATION DE L'ANALYSE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
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
            </div>

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
              <ShieldCheck size={14} /> Garanties souscription
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
              <><Loader2 className="animate-spin" /><span>Analyse comparative en cours...</span></>
            ) : (
              <><Zap size={20} fill="currentColor" /><span>Générer l'expertise Corporate</span></>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* SCORE GLOBAL CONSOLIDÉ */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col justify-center items-center shadow-xl border-b-8 border-indigo-500">
              <span className="text-6xl font-black">{aiResults?.score_global}%</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mt-2">Moyenne Groupe</span>
            </div>
            <div className="md:col-span-3 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center">
              <p className="text-slate-600 italic leading-relaxed text-sm">
                <Building2 className="inline mr-2 text-indigo-500" size={18} />
                <span className="font-black text-indigo-600 not-italic mr-2">SYNTHÈSE MULTI-SITES :</span>
                {aiResults?.synthese_executive}
              </p>
            </div>
          </div>

          {/* ANALYSE PAR GARANTIE (VERSION GROUPE) */}
          <div className="grid grid-cols-1 gap-6">
            {aiResults?.analyses_par_garantie?.map((gar, idx) => (
              <div key={idx} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 flex justify-between items-center">
                  <h4 className="font-black text-xs uppercase text-slate-700 tracking-wider">{gar.garantie}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Exposition Moyenne</span>
                    <span className="px-3 py-1 bg-white border rounded-full text-xs font-black text-indigo-600">{gar.exposition}/10</span>
                  </div>
                </div>
                
                <div className="p-8 space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-indigo-400 uppercase mb-2 italic">Avis Technique Consolidé</p>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">{gar.avis_technique}</p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-rose-400 uppercase mb-2 flex items-center gap-2">
                      <AlertTriangle size={12} /> Plan d'action Groupe
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {gar.recommandations?.map((rec, i) => (
                        <div key={i} className="flex gap-3 items-start p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                          <p className="text-[11px] font-medium text-slate-700 leading-tight">{rec}</p>
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
            Nouvelle analyse Groupe
          </button>
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;
