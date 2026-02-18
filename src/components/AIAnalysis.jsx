import React, { useState } from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import { 
  BrainCircuit, Loader2, ShieldCheck, Flame, Droplets, Lock, 
  Users, Activity, AlertTriangle, Globe2, MountainSnow, 
  Waves, Wind, Settings2, MapPin, BarChart4, ClipboardList,
  ChevronRight 
} from 'lucide-react';

const AIAnalysis = () => {
  const { responses, questionsConfig, aiResults, setAiResults, auditorInfo } = useInspectionStore();
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
        Tu es un Ingénieur Souscripteur Senior IARD spécialisé en Algérie.
        MISSION : Analyse technique basée sur :
        - Activité : "${natureActivite}"
        - Site : ${siteAddress} (${gpsCoords})
        - Terrain : ${dataSummary}

        RETOURNE EXCLUSIVEMENT UN JSON SANS TEXTE AUTOUR :
        {
          "score_global": 0-100,
          "synthese_executive": "...",
          "analyse_nat_cat": "...",
          "points_vigilance_majeurs": ["..."],
          "analyses_par_garantie": [
            {
              "garantie": "...",
              "exposition": 1-10,
              "avis_technique": "...",
              "recommandations_standards": "..."
            }
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
            { role: "system", content: "Expert en JSON technique. Pas de blabla, juste le code." }, 
            { role: "user", content: promptStrict }
          ],
          response_format: { type: "json_object" },
          temperature: 0.1
        })
      });

      const d = await r.json();
      let content = d.choices[0].message.content;

      // --- NETTOYAGE ROBUSTE DU JSON ---
      // On retire les balises Markdown si l'IA en a mis
      const jsonString = content.replace(/```json/g, "").replace(/```/g, "").trim();
      
      const parsedData = JSON.parse(jsonString);

      // --- SÉCURISATION DES CLÉS (Fallback) ---
      // On s'assure que les tableaux existent pour éviter le crash des .map()
      const secureData = {
        score_global: parsedData.score_global || 0,
        synthese_executive: parsedData.synthese_executive || "Analyse indisponible.",
        analyse_nat_cat: parsedData.analyse_nat_cat || "Non évalué.",
        points_vigilance_majeurs: parsedData.points_vigilance_majeurs || [],
        analyses_par_garantie: parsedData.analyses_par_garantie || [],
        plan_actions: parsedData.plan_actions || {}
      };

      setAiResults(secureData);

    } catch (e) {
      console.error("Erreur critique IA:", e);
      alert("Erreur lors de l'analyse. L'IA a renvoyé un format corrompu.");
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
            <h2 className="text-xl font-black uppercase tracking-tighter">Underwriting AI</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[9px] font-bold uppercase tracking-widest text-indigo-300">
              <Globe2 size={12} /> {responses['activite_nature']?.value || "Activité ?"}
            </div>
          </div>
        </div>
      </div>

      {!aiResults ? (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
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
            className="w-full mt-6 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl disabled:opacity-50"
          >
            {loading ? "Analyse en cours..." : "Lancer l'expertise"}
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col items-center justify-center">
              <div className="text-5xl font-black text-indigo-400">{aiResults?.score_global || 0}%</div>
              <div className="text-[9px] font-black uppercase mt-2 tracking-widest text-slate-500">Qualité Risque</div>
            </div>
            <div className="md:col-span-2 bg-indigo-600 p-8 rounded-[2.5rem] text-white flex items-center shadow-xl">
               <p className="text-sm font-bold italic">"{aiResults?.synthese_executive}"</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm border-l-8 border-l-cyan-500">
            <h3 className="font-black text-[10px] uppercase text-cyan-600 mb-2">Exposition Aléas Naturels</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{aiResults?.analyse_nat_cat}</p>
          </div>

          {/* SÉCURISÉ : Protection par || [] */}
          <div className="bg-rose-50 p-8 rounded-[2.5rem] border border-rose-100">
            <h3 className="font-black text-[10px] uppercase text-rose-600 mb-6">Points Critiques</h3>
            <div className="grid gap-3">
              {(aiResults?.points_vigilance_majeurs || []).map((v, i) => (
                <div key={i} className="text-xs font-bold text-rose-700 bg-white p-4 rounded-2xl border border-rose-200/50 shadow-sm flex gap-3">
                  <span className="text-rose-400">#0{i+1}</span> {v}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {(aiResults?.analyses_par_garantie || []).map((gar, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-black text-xs text-slate-900 uppercase">{gar.garantie}</h4>
                  <div className={`px-4 py-2 rounded-xl font-black text-[10px] ${gar.exposition > 6 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    EXP: {gar.exposition}/10
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                   <div className="bg-slate-50 p-6 rounded-3xl text-[11px] text-slate-700">{gar.avis_technique}</div>
                   <div className="bg-indigo-50/30 p-6 rounded-3xl border border-indigo-50 text-[11px] text-indigo-900 font-bold">{gar.recommandations_standards}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 p-10 rounded-[3rem] text-white">
            <h3 className="font-black text-xs uppercase text-indigo-400 mb-10">Plan de Maîtrise des Risques</h3>
            <div className="space-y-6">
               {Object.entries(aiResults?.plan_actions || {}).map(([key, val]) => (
                 <div key={key} className="flex gap-6 border-l border-slate-800 pl-6">
                   <div className="font-black text-indigo-500 text-sm">{key}</div>
                   <div className="text-sm text-slate-300">{val}</div>
                 </div>
               ))}
            </div>
            <button onClick={() => setAiResults(null)} className="w-full mt-10 py-4 bg-white/5 rounded-2xl text-[9px] font-black uppercase">Nouvelle Expertise</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;
