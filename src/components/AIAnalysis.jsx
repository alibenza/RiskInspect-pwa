import React, { useState } from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import { 
  BrainCircuit, Loader2, ShieldCheck, Flame, Droplets, Lock, 
  Users, Activity, AlertTriangle, Globe2, MountainSnow, 
  Waves, Wind, Settings2, MapPin, BarChart4, ClipboardList,
  PlusCircle, Lightbulb
} from 'lucide-react';

const AIAnalysis = () => {
  const { responses, questionsConfig, aiResults, setAiResults } = useInspectionStore();
  const [loading, setLoading] = useState(false);
  const [selectedGaranties, setSelectedGaranties] = useState(['Incendie_explosion', 'Bris_De_Machine', 'RC']);

  const garantiesLib = [
    { id: 'Incendie_explosion', label: 'Incendie & Explosion', icon: <Flame size={16} />, color: 'text-orange-500' },
    { id: 'Degat_Des_Eaux', label: 'Dégâts des Eaux', icon: <Droplets size={16} />, color: 'text-blue-500' },
    { id: 'Tremblement_de_Terre', label: 'Tremblement de terre', icon: <MountainSnow size={16} />, color: 'text-emerald-500' },
    { id: 'inondation', label: 'Inondations', icon: <Waves size={16} />, color: 'text-slate-500' },
    { id: 'Tempetes', label: 'Tempêtes', icon: <Wind size={16} />, color: 'text-cyan-500' },
    { id: 'Vol', label: 'Vol & Vandalisme', icon: <Lock size={16} />, color: 'text-slate-600' },
    { id: 'Bris_De_Machine', label: 'Bris de Machines', icon: <Settings2 size={16} />, color: 'text-blue-900' },
    { id: 'Perte_Exploitation', label: 'Pertes d’Exploitation', icon: <Activity size={16} />, color: 'text-emerald-500' },
    { id: 'RC', label: 'Resp. Civile', icon: <Users size={16} />, color: 'text-purple-500' },
  ];

  const runDetailedAnalysis = async () => {
    if (selectedGaranties.length === 0) return alert("Sélectionnez au moins une garantie.");
    setLoading(true);

    try {
      const natureActivite = responses['activite_nature']?.value || "Non spécifiée";
      const siteAddress = responses['adress']?.value || "Algérie";
      const gpsCoords = responses['pos']?.value || "N/A";
      
      // Traduction des IDs cochés en labels pour l'IA
      const nomsGarantiesCochees = selectedGaranties
        .map(id => garantiesLib.find(g => g.id === id)?.label)
        .join(", ");

      const dataSummary = questionsConfig.map(section => {
        const sectionResponses = section.questions
          .map(q => {
            const r = responses[q.id];
            if (!r) return null;
            return `[${q.label}] : ${r.value || r.score + '/5'}. Obs: ${r.comment || 'RAS'}`;
          })
          .filter(Boolean).join('\n');
        return `### ${section.title}\n${sectionResponses}`;
      }).join('\n\n');

      const promptStrict = `
        Tu es un Ingénieur Souscripteur Senior IARD (Algérie).
        
        DATA TERRAIN :
        - Activité : "${natureActivite}"
        - Localisation : ${siteAddress} (${gpsCoords})
        - Observations : ${dataSummary}

        LOGIQUE D'ANALYSE AMÉLIORÉE :
        1. ANALYSE COCHÉE : Examine PRIORITAIREMENT ces garanties : ${nomsGarantiesCochees}.
        2. ANALYSE ÉCART : Propose d'autres garanties cruciales pour l'activité "${natureActivite}" qui manquent à ma sélection.

        FORMAT DE RÉPONSE JSON STRICT :
        {
          "score_global": 0-100,
          "synthese_executive": "...",
          "analyse_nat_cat": "...",
          "points_vigilance_majeurs": ["..."],
          "analyses_par_garantie": [
            { "garantie": "Nom exact", "exposition": 1-10, "avis_technique": "...", "recommandations_standards": "..." }
          ],
          "suggestions_complementaires": [
            { "nom": "Garantie", "justification_technique": "..." }
          ],
          "plan_actions": { "P1": "...", "P2": "...", "P3": "..." }
        }
      `;

      const r = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': 'Bearer sxU5BJBbBa1NbKMLi5lssQYYBjaFZoPE' 
        },
        body: JSON.stringify({
          model: "mistral-small-latest",
          messages: [
            { role: "system", content: "Expert technique IARD. Réponds en JSON pur." }, 
            { role: "user", content: promptStrict }
          ],
          response_format: { type: "json_object" },
          temperature: 0.1
        })
      });

      const d = await r.json();
      let content = d.choices[0].message.content;
      const jsonString = content.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsedData = JSON.parse(jsonString);

      // Sécurisation des données reçues
      const secureData = {
        ...parsedData,
        analyses_par_garantie: parsedData.analyses_par_garantie || [],
        suggestions_complementaires: parsedData.suggestions_complementaires || [],
        plan_actions: parsedData.plan_actions || {}
      };

      setAiResults(secureData);

    } catch (e) {
      console.error("Erreur:", e);
      alert("Erreur d'analyse. Vérifiez vos données.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* HEADER */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-500 rounded-xl shadow-lg"><BrainCircuit size={24} /></div>
            <h2 className="text-xl font-black uppercase tracking-tighter italic">Risk Intelligence AI</h2>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 w-fit">
              <Globe2 size={12} className="text-indigo-400" /> 
              <span className="text-[9px] font-bold uppercase tracking-widest">{responses['activite_nature']?.value || "Activité non définie"}</span>
          </div>
        </div>
      </div>

      {!aiResults ? (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm animate-in fade-in duration-500">
          <div className="mb-6 px-2">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Périmètre de l'expertise</h3>
            <p className="text-[11px] text-slate-500 italic">Cochez les garanties à analyser via l'IA</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {garantiesLib.map(g => (
              <button
                key={g.id}
                onClick={() => setSelectedGaranties(prev => prev.includes(g.id) ? prev.filter(x => x !== g.id) : [...prev, g.id])}
                className={`flex flex-col gap-3 p-4 rounded-2xl text-[9px] font-black uppercase transition-all border-2 text-left ${
                  selectedGaranties.includes(g.id) ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-50 text-slate-400'
                }`}
              >
                <div className={selectedGaranties.includes(g.id) ? g.color : 'text-slate-300'}>{g.icon}</div>
                {g.label}
              </button>
            ))}
          </div>
          <button 
            onClick={runDetailedAnalysis} 
            disabled={loading}
            className="w-full mt-6 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-100 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" /> Analyse des risques en cours...</span> : "Générer le rapport IA"}
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700">
          
          {/* DASHBOARD SCORE */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col items-center justify-center">
              <div className="text-5xl font-black text-indigo-400">{aiResults.score_global}%</div>
              <div className="text-[9px] font-black uppercase mt-2 tracking-widest text-slate-500">Protection Global</div>
            </div>
            <div className="md:col-span-2 bg-indigo-600 p-8 rounded-[2.5rem] text-white flex items-center shadow-xl">
               <p className="text-sm font-bold italic leading-relaxed">"{aiResults.synthese_executive}"</p>
            </div>
          </div>

          {/* SUGGESTIONS INTELLIGENTES */}
          {aiResults.suggestions_complementaires?.length > 0 && (
            <div className="bg-amber-50 p-6 rounded-[2.5rem] border border-amber-100 border-l-8 border-l-amber-400">
              <div className="flex items-center gap-2 mb-4 text-amber-700">
                <Lightbulb size={18} />
                <h3 className="font-black text-[10px] uppercase tracking-widest">Conseils d'extension de garanties</h3>
              </div>
              <div className="grid gap-3">
                {aiResults.suggestions_complementaires.map((sug, i) => (
                  <div key={i} className="bg-white p-4 rounded-xl border border-amber-200/50">
                    <span className="text-[9px] font-black text-amber-600 uppercase block mb-1">{sug.nom}</span>
                    <p className="text-[11px] text-slate-600">{sug.justification_technique}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DÉTAILS PAR GARANTIE */}
          <div className="space-y-4">
            {(aiResults.analyses_par_garantie || []).map((gar, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:border-indigo-100 transition-all">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-100 rounded-lg"><BarChart4 size={14} className="text-slate-600" /></div>
                    <h4 className="font-black text-xs text-slate-900 uppercase tracking-tight">{gar.garantie}</h4>
                  </div>
                  <div className={`px-4 py-2 rounded-xl font-black text-[10px] ${gar.exposition > 6 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    RISQUE: {gar.exposition}/10
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                   <div className="bg-slate-50 p-6 rounded-3xl text-[11px] text-slate-700 border border-slate-100">
                     <span className="block text-[8px] font-black text-indigo-500 uppercase mb-2">Diagnostic Souscription</span>
                     {gar.avis_technique}
                   </div>
                   <div className="bg-indigo-50/30 p-6 rounded-3xl border border-indigo-100 text-[11px] text-indigo-900 font-bold">
                     <span className="block text-[8px] font-black text-indigo-400 uppercase mb-2">Mesures de Prévention</span>
                     {gar.recommandations_standards}
                   </div>
                </div>
              </div>
            ))}
          </div>

          {/* PLAN D'ACTION FINALE */}
          <div className="bg-slate-900 p-10 rounded-[3rem] text-white">
            <h3 className="font-black text-xs uppercase text-indigo-400 mb-10 flex items-center gap-2">
              <ClipboardList size={18} /> Recommandations Prioritaires
            </h3>
            <div className="space-y-6">
               {Object.entries(aiResults.plan_actions || {}).map(([key, val]) => (
                 <div key={key} className="flex gap-6 border-l border-slate-800 pl-6 group">
                   <div className="font-black text-indigo-500 text-sm group-hover:text-white transition-colors">{key}</div>
                   <div className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors leading-relaxed">{val}</div>
                 </div>
               ))}
            </div>
            <button 
              onClick={() => { setAiResults(null); window.scrollTo({top: 0, behavior: 'smooth'}); }} 
              className="w-full mt-10 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-white/5 transition-all"
            >
              ↻ Modifier le périmètre d'analyse
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;
