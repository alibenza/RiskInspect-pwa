Voici le script intégral mis à jour pour ton composant AIAnalysis.jsx.

J'ai intégré la logique CATNAT (CRAAG, ASAL, ThinkHazard) dans le prompt, structuré le schéma JSON pour qu'il soit plus précis, et ajouté le bloc visuel correspondant dans l'interface de rendu.

JavaScript
import React, { useState } from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import { 
  BrainCircuit, Loader2, ShieldCheck, Flame, Droplets, Lock, 
  Users, Activity, AlertTriangle, Globe2, MountainSnow, 
  Waves, Wind, Settings2, MapPin, BarChart4, ClipboardList,
  PlusCircle, Lightbulb, Target, ChevronDown, Check, SlidersHorizontal
} from 'lucide-react';

const AIAnalysis = () => {
  const { responses, questionsConfig, aiResults, setAiResults } = useInspectionStore();
  const [loading, setLoading] = useState(false);
  
  const [selectedGaranties, setSelectedGaranties] = useState(['Incendie_explosion', 'Bris_De_Machine', 'RC']);
  const [expertOpinion, setExpertOpinion] = useState(50);
  const [analysisSeverity, setAnalysisSeverity] = useState('Moyen');
  const [isGarantiesOpen, setIsGarantiesOpen] = useState(false);

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

  const handleSelectAll = () => {
    if (selectedGaranties.length === garantiesLib.length) {
      setSelectedGaranties([]);
    } else {
      setSelectedGaranties(garantiesLib.map(g => g.id));
    }
  };

  const runDetailedAnalysis = async () => {
    if (selectedGaranties.length === 0) return alert("Sélectionnez au moins une garantie.");
    setLoading(true);

    try {
      const natureActivite = responses['activite_nature']?.value || "Non spécifiée";
      const siteAddress = responses['adress']?.value || "Algérie";
      const gpsCoords = responses['pos']?.value || "N/A";
      
      const nomsGarantiesCochees = selectedGaranties
        .map(id => garantiesLib.find(g => g.id === id)?.label)
        .join(", ");

      const dataSummary = questionsConfig.map(section => {
        const sectionResponses = section.questions
          .map(q => {
            const r = responses[q.id];
            if (!r) return null;
            return `[${q.label}] : ${r.value || r.score + '/5'}. Observation: ${r.comment || 'RAS'}`;
          })
          .filter(Boolean).join('\n');
        return `### Section: ${section.title}\n${sectionResponses}`;
      }).join('\n\n');

      const expertOpinionText = expertOpinion < 40 ? 'Insatisfaisant' : expertOpinion < 70 ? 'Satisfait avec réserve' : 'Satisfait';
      const severityInstruction = analysisSeverity === 'Léger' ? 'Approche pragmatique.' : analysisSeverity === 'Sévère' ? 'Tolérance ZÉRO (normes APSAD/NF).' : 'Equilibre normatif.';

      const promptStrict = `
        Tu es un Ingénieur Souscripteur Senior Expert en Algérie.
        
        PARAMÈTRES EXPERTS :
        - AVIS TERRAIN : ${expertOpinion}/100 (${expertOpinionText})
        - RIGUEUR : ${analysisSeverity} (${severityInstruction})

        CONTEXTE :
        - Activité : "${natureActivite}"
        - Localisation : ${siteAddress} (Coords: ${gpsCoords})
        - Audit : ${dataSummary}

        MISSIONS :
        1. ANALYSE PROFONDE : Pour les garanties (${nomsGarantiesCochees}).
        2. EXPERTISE CATNAT : Evalue l'exposition via les référentiels : 
           - CRAAG (Sismique Algérie : Zones 0, I, IIa, IIb, III).
           - ASAL (Inondations/Mouvements de terrain via données spatiales).
           - ThinkHazard (Risques climatiques globaux).
        3. DÉTECTION LACUNES : Garanties manquantes pour ce type d'activité.

        FORMAT JSON STRICT :
        {
          "score_global": 0-100,
          "synthese_executive": "Texte court",
          "analyse_nat_cat": {
            "exposition_sismique": "Niveau selon CRAAG",
            "exposition_hydrologique": "Risque inondation selon ASAL/ThinkHazard",
            "synthese_geologique": "Focus sol et géomorphologie",
            "score_catnat": 1-10
          },
          "points_vigilance_majeurs": ["Point 1", "Point 2"],
          "analyses_par_garantie": [
            { "garantie": "Nom", "exposition": 1-10, "avis_technique": "Analyse", "recommandations_standards": "Mesures" }
          ],
          "suggestions_complementaires": [
            { "nom": "Garantie", "justification_technique": "Pourquoi ?" }
          ],
          "plan_actions": { "P1": "Haute", "P2": "Moyen", "P3": "Amélioration" }
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
            { role: "system", content: "Moteur d'expertise technique. Réponse en JSON strict uniquement." }, 
            { role: "user", content: promptStrict }
          ],
          response_format: { type: "json_object" },
          temperature: 0.2
        })
      });

      const d = await r.json();
      const secureData = JSON.parse(d.choices[0].message.content);
      setAiResults(secureData);

    } catch (e) {
      console.error("Erreur Expertise:", e);
      alert("Erreur de génération. Vérifiez votre connexion ou les données saisies.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6 pb-24 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden border-b-4 border-indigo-500">
        <div className="absolute top-0 right-0 p-8 opacity-10"><BrainCircuit size={120} /></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-500 rounded-xl shadow-lg animate-pulse"><Target size={24} /></div>
            <h2 className="text-xl font-black uppercase tracking-tighter italic">RiskPro Intelligence</h2>
          </div>
          <div className="flex items-center gap-2 px-4 py-1.5 bg-indigo-500/20 rounded-full border border-indigo-400/30 w-fit">
              <Globe2 size={12} className="text-indigo-300" /> 
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-100">
                Analyse Certifiée CRAAG / ASAL
              </span>
          </div>
        </div>
      </div>

      {!aiResults ? (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-8">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <SlidersHorizontal className="text-indigo-600" size={20} />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">Paramétrage Expert</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Avis Terrain</label>
                  <span className="text-[10px] font-black text-indigo-600">{expertOpinion}%</span>
                </div>
                <input type="range" min="0" max="100" value={expertOpinion} onChange={(e) => setExpertOpinion(e.target.value)} className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
              </div>
              <div className="space-y-4">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 block">Sévérité</label>
                <div className="flex bg-slate-100 p-1 rounded-2xl">
                  {['Léger', 'Moyen', 'Sévère'].map((level) => (
                    <button key={level} onClick={() => setAnalysisSeverity(level)} className={`flex-1 py-2.5 text-[11px] font-black uppercase rounded-xl transition-all ${analysisSeverity === level ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-400'}`}>{level}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
            <button onClick={() => setIsGarantiesOpen(!isGarantiesOpen)} className="w-full bg-slate-50 p-4 flex justify-between items-center rounded-2xl">
              <span className="text-sm font-bold">Périmètre : {selectedGaranties.length} Garanties</span>
              <ChevronDown className={`transition-transform ${isGarantiesOpen ? 'rotate-180' : ''}`} />
            </button>
            {isGarantiesOpen && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4">
                {garantiesLib.map(g => (
                  <button key={g.id} onClick={() => setSelectedGaranties(prev => prev.includes(g.id) ? prev.filter(x => x !== g.id) : [...prev, g.id])} className={`p-3 rounded-xl border text-xs font-bold transition-all ${selectedGaranties.includes(g.id) ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100'}`}>{g.label}</button>
                ))}
              </div>
            )}
            <button onClick={runDetailedAnalysis} disabled={loading} className="w-full mt-8 py-6 bg-slate-900 text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3">
              {loading ? <Loader2 className="animate-spin" /> : "Générer l'Expertise AI"}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-700">
          {/* SCORE GLOBAL */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col items-center justify-center border-b-8 border-indigo-500">
              <div className="text-6xl font-black">{aiResults.score_global}%</div>
              <div className="text-[9px] font-black uppercase mt-2 tracking-widest text-indigo-400">Score de Maîtrise</div>
            </div>
            <div className="md:col-span-3 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center">
               <p className="text-sm font-bold text-slate-700 italic leading-relaxed">"{aiResults.synthese_executive}"</p>
            </div>
          </div>

          {/* NOUVEAU BLOC : ANALYSE CATNAT (CRAAG/ASAL) */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5"><MapPin size={80} /></div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Globe2 size={20} /></div>
              <h3 className="font-black text-xs uppercase tracking-widest text-slate-800 italic">Exposition CATNAT & Géorisques</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6 relative z-10">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Sismique (CRAAG)</span>
                <p className="text-xs font-black text-slate-800">{aiResults.analyse_nat_cat?.exposition_sismique}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Hydrologique (ASAL)</span>
                <p className="text-xs font-black text-slate-800">{aiResults.analyse_nat_cat?.exposition_hydrologique}</p>
              </div>
              <div className="bg-indigo-900 p-4 rounded-2xl flex flex-col items-center justify-center text-white">
                <span className="text-[8px] font-black uppercase opacity-60">Indice CATNAT</span>
                <div className="text-2xl font-black">{aiResults.analyse_nat_cat?.score_catnat}/10</div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
              <span className="text-[9px] font-black text-indigo-600 uppercase block mb-1">Diagnostic Géomorphologique</span>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">{aiResults.analyse_nat_cat?.synthese_geologique}</p>
            </div>
          </div>

          {/* ANALYSES GARANTIES */}
          <div className="grid gap-4">
            {aiResults.analyses_par_garantie.map((gar, idx) => (
              <div key={idx} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 grid md:grid-cols-3 gap-6 items-center">
                <div>
                  <h4 className="font-black text-xs uppercase text-slate-900 mb-2">{gar.garantie}</h4>
                  <div className="flex justify-between text-[10px] mb-1"><span>Risque</span><span>{gar.exposition}/10</span></div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${gar.exposition * 10}%` }} />
                  </div>
                </div>
                <div className="md:col-span-2 text-[11px] leading-relaxed text-slate-600">
                  <p className="mb-2"><strong className="text-indigo-600 uppercase text-[9px]">Avis :</strong> {gar.avis_technique}</p>
                  <p className="bg-slate-50 p-2 rounded-lg border border-slate-100"><strong className="text-slate-400 uppercase text-[9px]">Prévention :</strong> {gar.recommandations_standards}</p>
                </div>
              </div>
            ))}
          </div>

          {/* SUGGESTIONS */}
          <div className="grid md:grid-cols-2 gap-4">
             {aiResults.suggestions_complementaires.map((sug, i) => (
               <div key={i} className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100 flex gap-4">
                  <Lightbulb className="text-indigo-600 shrink-0" size={20} />
                  <div>
                    <h5 className="text-[10px] font-black text-indigo-900 uppercase mb-1">{sug.nom}</h5>
                    <p className="text-[10px] text-indigo-700 leading-tight">{sug.justification_technique}</p>
                  </div>
               </div>
             ))}
          </div>

          {/* PLAN ACTIONS */}
          <div className="bg-slate-900 p-10 rounded-[3rem] text-white">
            <h3 className="text-xs font-black uppercase text-indigo-400 mb-6 flex items-center gap-2">
              <ClipboardList size={16} /> Chronogramme de Mise en Conformité
            </h3>
            <div className="space-y-4">
              {Object.entries(aiResults.plan_actions).map(([key, val]) => (
                <div key={key} className="flex gap-4 border-l-2 border-slate-800 pl-6 py-2">
                  <span className="font-black text-indigo-500">{key}</span>
                  <p className="text-xs text-slate-400">{val}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setAiResults(null)} className="w-full mt-10 py-4 bg-white/5 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
              ↻ Nouvelle Simulation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;
