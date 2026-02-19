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
  
  // Nouveaux States
  const [selectedGaranties, setSelectedGaranties] = useState(['Incendie_explosion', 'Bris_De_Machine', 'RC']);
  const [expertOpinion, setExpertOpinion] = useState(50);
  const [analysisSeverity, setAnalysisSeverity] = useState('Moyen');
  const [isGarantiesOpen, setIsGarantiesOpen] = useState(false); // Gère l'ouverture du menu déroulant

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

  // Gestion du "Tout Sélectionner"
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
            return `[${q.label}] : ${r.value || r.score + '/5'}. Observation terrain: ${r.comment || 'RAS'}`;
          })
          .filter(Boolean).join('\n');
        return `### Section: ${section.title}\n${sectionResponses}`;
      }).join('\n\n');

      // Traduction des paramètres experts pour l'IA
      const expertOpinionText = expertOpinion < 40 ? 'Insatisfaisant (Cherche les failles majeures)' : expertOpinion < 70 ? 'Satisfait avec réserve (Points d\'amélioration attendus)' : 'Satisfait (Validation des acquis)';
      const severityInstruction = analysisSeverity === 'Léger' ? 'Sois indulgent sur les écarts mineurs, privilégie une approche pragmatique.' : analysisSeverity === 'Sévère' ? 'Tolérance ZÉRO. Applique strictement les normes (APSAD, NF, etc.). Sois intransigeant.' : 'Garde un équilibre entre rigueur normative et réalité terrain.';

      const promptStrict = `
        Tu es un Ingénieur Souscripteur Senior spécialisé dans le marché de l'assurance IARD en Algérie.
        Ton objectif est de fournir une analyse de risque prédictive et ultra-technique.

        PARAMÈTRES DE L'EXPERT TERRAIN (IMPORTANT) :
        - AVIS PRÉLIMINAIRE DE L'EXPERT : ${expertOpinion}/100 -> ${expertOpinionText}
        - NIVEAU DE RIGUEUR ATTENDU : ${analysisSeverity} -> ${severityInstruction}
        Ajuste ton score_global et la sévérité de tes recommandations en fonction de ces deux paramètres.

        CONTEXTE DU SITE :
        - Nature de l'activité : "${natureActivite}"
        - Localisation précise : ${siteAddress} (Coordonnées : ${gpsCoords})
        - Audit Terrain : ${dataSummary}

        TES MISSIONS D'EXPERT :
        1. ANALYSE PROFONDE : Pour chaque garantie sélectionnée (${nomsGarantiesCochees}), évalue le risque en croisant l'activité et les observations terrain.
        2. VIGILANCE GÉOGRAPHIQUE : Intègre les spécificités locales algériennes.
        3. DÉTECTION DE LACUNES : Identifie les garanties indispensables pour un(e) "${natureActivite}" que je n'ai PAS sélectionnées.

        FORMAT DE RÉPONSE JSON (STRICT ET VALIDE) :
        {
          "score_global": 0-100,
          "synthese_executive": "Analyse de haut niveau sur la pérennité du site.",
          "analyse_nat_cat": "Focus géologique et climatique spécifique au site.",
          "points_vigilance_majeurs": ["Point critique 1", "Point critique 2"],
          "analyses_par_garantie": [
            { "garantie": "Nom", "exposition": 1-10, "avis_technique": "Analyse croisée", "recommandations_standards": "Mesures concrètes" }
          ],
          "suggestions_complementaires": [
            { "nom": "Garantie manquante", "justification_technique": "Pourquoi est-ce vital pour ce métier ?" }
          ],
          "plan_actions": { "P1": "Priorité Haute", "P2": "Moyen Terme", "P3": "Amélioration Continue" }
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
            { role: "system", content: "Tu es un moteur d'expertise assurantielle. Tu ne parles qu'en JSON technique strict. Ne génère aucun texte en dehors du bloc JSON." }, 
            { role: "user", content: promptStrict }
          ],
          response_format: { type: "json_object" },
          temperature: 0.3
        })
      });

      const d = await r.json();
      let content = d.choices[0].message.content;
      const jsonString = content.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsedData = JSON.parse(jsonString);

      const secureData = {
        ...parsedData,
        score_global: parseInt(parsedData.score_global) || 0,
        analyses_par_garantie: (parsedData.analyses_par_garantie || []).map(a => ({
            ...a,
            exposition: parseInt(a.exposition) || 5
        })),
        suggestions_complementaires: parsedData.suggestions_complementaires || [],
        plan_actions: parsedData.plan_actions || {}
      };

      setAiResults(secureData);

    } catch (e) {
      console.error("Erreur Expertise:", e);
      alert("L'analyse technique a rencontré une erreur de format. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6 pb-24 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden border-b-4 border-indigo-500">
        <div className="absolute top-0 right-0 p-8 opacity-10">
            <BrainCircuit size={120} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-500 rounded-xl shadow-lg animate-pulse"><Target size={24} /></div>
            <h2 className="text-xl font-black uppercase tracking-tighter italic">Precision Risk Engine</h2>
          </div>
          <div className="flex items-center gap-2 px-4 py-1.5 bg-indigo-500/20 rounded-full border border-indigo-400/30 w-fit">
              <Globe2 size={12} className="text-indigo-300" /> 
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-100">
                {responses['activite_nature']?.value || "Analyse Multisectorielle"}
              </span>
          </div>
        </div>
      </div>

      {!aiResults ? (
        <div className="space-y-6">
          
          {/* NOUVEAU BLOC : PARAMÉTRAGE EXPERT */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-8">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <SlidersHorizontal className="text-indigo-600" size={20} />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">Paramétrage de l'IA</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* CURSEUR DE SATISFACTION */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Avis Préliminaire</label>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    expertOpinion < 40 ? 'bg-red-100 text-red-700' : 
                    expertOpinion < 70 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {expertOpinion < 40 ? 'Insatisfaisant' : expertOpinion < 70 ? 'Satisfait avec réserve' : 'Satisfait'}
                  </span>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={expertOpinion}
                  onChange={(e) => setExpertOpinion(e.target.value)}
                  className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  style={{
                    background: `linear-gradient(to right, #ef4444, #eab308, #10b981)`
                  }}
                />
              </div>

              {/* NIVEAU DE SÉVÉRITÉ */}
              <div className="space-y-4">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 block">Sévérité de l'analyse</label>
                <div className="flex bg-slate-100 p-1 rounded-2xl">
                  {['Léger', 'Moyen', 'Sévère'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setAnalysisSeverity(level)}
                      className={`flex-1 py-2.5 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all ${
                        analysisSeverity === level 
                          ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' 
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* BLOC : SÉLECTION DES GARANTIES (MENU DÉROULANT) */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
            <div className="mb-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 mb-1">Périmètre de l'Expertise</h3>
              <p className="text-[11px] text-slate-400">Sélectionnez les garanties à soumettre à l'analyse.</p>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <button 
                onClick={() => setIsGarantiesOpen(!isGarantiesOpen)}
                className="w-full bg-slate-50 p-4 flex justify-between items-center hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center font-black text-xs">
                    {selectedGaranties.length}
                  </div>
                  <span className="text-sm font-bold text-slate-700">Garanties sélectionnées</span>
                </div>
                <ChevronDown className={`text-slate-400 transition-transform ${isGarantiesOpen ? 'rotate-180' : ''}`} />
              </button>

              {isGarantiesOpen && (
                <div className="p-4 bg-white border-t border-slate-200">
                  <button 
                    onClick={handleSelectAll}
                    className="mb-4 text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-2"
                  >
                    <Check size={16} /> 
                    {selectedGaranties.length === garantiesLib.length ? "Tout désélectionner" : "Tout sélectionner"}
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {garantiesLib.map(g => {
                      const isSelected = selectedGaranties.includes(g.id);
                      return (
                        <button
                          key={g.id}
                          onClick={() => setSelectedGaranties(prev => isSelected ? prev.filter(x => x !== g.id) : [...prev, g.id])}
                          className={`flex items-center gap-3 p-3 rounded-xl text-left border transition-all ${
                            isSelected 
                              ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' 
                              : 'border-slate-200 hover:border-indigo-300'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded flex items-center justify-center ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-100 ' + g.color}`}>
                            {isSelected ? <Check size={14} /> : g.icon}
                          </div>
                          <span className={`text-xs font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-600'}`}>
                            {g.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={runDetailedAnalysis} 
              disabled={loading}
              className="w-full mt-8 py-6 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl hover:bg-indigo-600 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                  <>
                      <Loader2 className="animate-spin" size={20} /> 
                      Génération du rapport IA...
                  </>
              ) : "Lancer l'Expertise IA"}
            </button>
          </div>

        </div>
      ) : (
        /* LE DASHBOARD RESTE INCHANGÉ ICI (Copie ton code existant à partir du Dashboard principal) */
        <div className="space-y-6 animate-in slide-in-from-bottom-10 duration-1000">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col items-center justify-center border-b-8 border-indigo-500">
              <div className="text-6xl font-black text-white">{aiResults.score_global}%</div>
              <div className="text-[9px] font-black uppercase mt-3 tracking-widest text-indigo-400 text-center">Indice de Maîtrise</div>
            </div>
            <div className="md:col-span-3 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center">
               <div className="space-y-2">
                 <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Synthèse Décisionnelle</span>
                 <p className="text-sm font-bold text-slate-700 italic leading-relaxed">"{aiResults.synthese_executive}"</p>
               </div>
            </div>
          </div>

          {/* SUGGESTIONS DE L'IA */}
          {aiResults.suggestions_complementaires?.length > 0 && (
            <div className="bg-indigo-50 p-8 rounded-[2.5rem] border border-indigo-100 border-l-8 border-l-indigo-600">
              <div className="flex items-center gap-3 mb-6 text-indigo-900">
                <Lightbulb className="text-indigo-600" />
                <h3 className="font-black text-xs uppercase tracking-widest">Conseils d'Expertise Sectorielle</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {aiResults.suggestions_complementaires.map((sug, i) => (
                  <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-indigo-200/50">
                    <span className="text-[10px] font-black text-indigo-600 uppercase block mb-2">{sug.nom}</span>
                    <p className="text-[11px] text-slate-600 leading-normal">{sug.justification_technique}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ANALYSES DÉTAILLÉES */}
          <div className="grid gap-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 flex items-center gap-2">
                <ShieldCheck size={14} /> Revue technique par garantie
            </h3>
            {aiResults.analyses_par_garantie.map((gar, idx) => (
              <div key={idx} className="bg-white overflow-hidden rounded-[2.5rem] border border-slate-100 shadow-sm group hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-50">
                    <div className="p-8 md:w-1/3 bg-slate-50/50">
                        <h4 className="font-black text-xs text-slate-900 uppercase mb-4">{gar.garantie}</h4>
                        <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase">
                                <span>Exposition</span>
                                <span>{gar.exposition}/10</span>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-1000 ${gar.exposition > 7 ? 'bg-rose-500' : gar.exposition > 4 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${gar.exposition * 10}%` }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="p-8 md:w-2/3 space-y-4">
                        <div className="text-[11px] text-slate-600">
                             <strong className="text-indigo-600 uppercase text-[9px] block mb-1">Analyse du Risque</strong>
                             {gar.avis_technique}
                        </div>
                        <div className="text-[11px] text-indigo-900 font-bold bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50">
                             <strong className="text-indigo-400 uppercase text-[9px] block mb-1">Standard de Prévention Préconisé</strong>
                             {gar.recommandations_standards}
                        </div>
                    </div>
                </div>
              </div>
            ))}
          </div>

          {/* RECOMMANDATIONS FINALES */}
          <div className="bg-slate-900 p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
                <h3 className="font-black text-xs uppercase text-indigo-400 mb-10 flex items-center gap-3">
                <ClipboardList size={20} /> Plan d'Action Prioritaire
                </h3>
                <div className="grid gap-6">
                {Object.entries(aiResults.plan_actions).map(([key, val]) => (
                    <div key={key} className="flex gap-8 group">
                    <div className="font-black text-indigo-500 text-lg opacity-50 group-hover:opacity-100 transition-opacity">{key}</div>
                    <div className="text-sm text-slate-300 border-l border-slate-800 pl-8 leading-relaxed group-hover:text-white transition-colors">{val}</div>
                    </div>
                ))}
                </div>
                <button 
                onClick={() => { setAiResults(null); window.scrollTo({top: 0, behavior: 'smooth'}); }} 
                className="w-full mt-12 py-5 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all flex items-center justify-center gap-2"
                >
                ↻ Réinitialiser l'analyse
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;
