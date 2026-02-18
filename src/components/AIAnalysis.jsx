import React, { useState } from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import { 
  BrainCircuit, Loader2, ShieldCheck, Flame, Droplets, Lock, 
  Users, Activity, AlertTriangle, Globe2, MountainSnow, 
  Waves, Wind, Settings2, MapPin, BarChart4, ClipboardList,
  PlusCircle, Lightbulb, Target
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

      const promptStrict = `
        Tu es un Ingénieur Souscripteur Senior spécialisé dans le marché de l'assurance IARD en Algérie.
        Ton objectif est de fournir une analyse de risque prédictive et ultra-technique.

        CONTEXTE DU SITE :
        - Nature de l'activité : "${natureActivite}"
        - Localisation précise : ${siteAddress} (Coordonnées : ${gpsCoords})
        - Audit Terrain : ${dataSummary}

        TES MISSIONS D'EXPERT :
        1. ANALYSE PROFONDE : Pour chaque garantie sélectionnée (${nomsGarantiesCochees}), évalue le risque en croisant l'activité et les observations terrain.
        2. VIGILANCE GÉOGRAPHIQUE : Intègre les spécificités locales algériennes (zones sismiques du nord, risques inondation oueds, exposition sirocco/tempêtes).
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
            { role: "system", content: "Tu es un moteur d'expertise assurantielle. Tu ne parles qu'en JSON technique. Ta précision sauve des actifs." }, 
            { role: "user", content: promptStrict }
          ],
          response_format: { type: "json_object" },
          temperature: 0.3 // Légère augmentation pour plus de profondeur sans perte de structure
        })
      });

      const d = await r.json();
      let content = d.choices[0].message.content;
      const jsonString = content.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsedData = JSON.parse(jsonString);

      // Sécurisation et formatage des données numériques
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
      {/* HEADER AMÉLIORÉ */}
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
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
          <div className="mb-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 mb-1">Configuration de l'Expertise</h3>
            <p className="text-xs text-slate-400">Sélectionnez les garanties à soumettre à l'analyse prédictive.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {garantiesLib.map(g => (
              <button
                key={g.id}
                onClick={() => setSelectedGaranties(prev => prev.includes(g.id) ? prev.filter(x => x !== g.id) : [...prev, g.id])}
                className={`flex flex-col gap-4 p-5 rounded-[1.5rem] text-[9px] font-black uppercase transition-all border-2 text-left group ${
                  selectedGaranties.includes(g.id) 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' 
                    : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200'
                }`}
              >
                <div className={`${selectedGaranties.includes(g.id) ? 'text-white' : g.color} group-hover:scale-110 transition-transform`}>
                    {g.icon}
                </div>
                {g.label}
              </button>
            ))}
          </div>
          <button 
            onClick={runDetailedAnalysis} 
            disabled={loading}
            className="w-full mt-8 py-6 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl hover:bg-indigo-600 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? (
                <>
                    <Loader2 className="animate-spin" size={20} /> 
                    Analyse Technique Mistral-AI...
                </>
            ) : "Lancer l'Expertise Souscription"}
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-bottom-10 duration-1000">
          
          {/* DASHBOARD PRINCIPAL */}
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
