import React, { useState } from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import { 
  BrainCircuit, Loader2, ShieldCheck, Flame, Droplets, Lock, 
  Users, Activity, AlertTriangle, Globe2, MountainSnow, 
  Waves, Wind, Settings2, MapPin, BarChart4, ClipboardList
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
      const siteAddress = responses['site_adresse']?.value || "Algérie (Coordonnées générales)";
      const gpsCoords = responses['gps_coords']?.value || "N/A";
      
      const dataSummary = questionsConfig.map(section => {
        const sectionResponses = section.questions
          .map(q => {
            const r = responses[q.id];
            if (!r) return null;
            return `[${q.label}] : ${r.value || r.score + '/5'}. Obs: ${r.comment || 'N/A'}`;
          })
          .filter(Boolean).join('\n');
        return `### ${section.title}\n${sectionResponses}`;
      }).join('\n\n');

      const promptStrict = `
        Tu es un Ingénieur Souscripteur Senior spécialisé dans le marché Algérien et International. 
        Ta mission est de produire un rapport d'expertise technique pour un site industriel.

        CONTEXTE :
        - Pays : Algérie (Prendre en compte la sismicité du Nord, les normes de la Protection Civile, et le contexte économique local).
        - Activité : "${natureActivite}"
        - Localisation : ${siteAddress} (GPS: ${gpsCoords})

        RAISONNEMENT ATTENDU :
        1. ANALYSE DES ALÉAS NATURELS : Utilise tes connaissances basées sur MunichRe/SwissRe pour la zone ${siteAddress}. Précise les sources.
        2. ANALYSE SECTORIELLE : Croise l'accidentologie mondiale de "${natureActivite}" avec les scores terrain fournis ci-dessous.
        3. RÉFÉRENTIELS : Cite les normes (NFPA, APSAD, CEI) pour chaque recommandation.

        DONNÉES TERRAIN :
        ${dataSummary}

        FORMAT JSON REQUIS :
        {
          "score_global": 75,
          "synthese_executive": "...",
          "analyse_nat_cat": "Analyse précise sismicité/inondation avec sources...",
          "points_vigilance_majeurs": ["Action critique 1", "Action critique 2"],
          "analyses_par_garantie": [
            {
              "garantie": "Nom de la garantie",
              "exposition": 8,
              "avis_technique": "Analyse croisée terrain vs activité...",
              "points_vigilance": ["..."],
              "recommandations_standards": "Selon norme X, il faut..."
            }
          ],
          "plan_actions": { "P1": "Immédiat", "P2": "Court terme", "P3": "Amélioration" }
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
            { role: "system", content: "Tu es un Underwriter Expert IARD." }, 
            { role: "user", content: promptStrict }
          ],
          response_format: { type: "json_object" },
          temperature: 0.3
        })
      });

      const d = await r.json();
      setAiResults(JSON.parse(d.choices[0].message.content));
    } catch (e) {
      console.error(e);
      alert("Erreur lors de l'analyse.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* HEADER CONSOLE */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/20"><BrainCircuit size={24} /></div>
            <h2 className="text-xl font-black uppercase tracking-tighter">Underwriting AI</h2>
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10">
              <Globe2 size={12} className="text-indigo-400" />
              <span className="text-[9px] font-bold uppercase tracking-wider">{responses['activite_nature']?.value || "Secteur Inconnu"}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10">
              <MapPin size={12} className="text-rose-400" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Algérie</span>
            </div>
          </div>
        </div>
      </div>

      {/* SÉLECTEUR DE GARANTIES */}
      {!aiResults && (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm animate-in fade-in zoom-in duration-500">
           <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Périmètre de l'expertise</h3>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{selectedGaranties.length} Sélectionnées</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {garantiesLib.map(g => (
              <button
                key={g.id}
                onClick={() => setSelectedGaranties(prev => prev.includes(g.id) ? prev.filter(x => x !== g.id) : [...prev, g.id])}
                className={`flex flex-col gap-3 p-4 rounded-2xl text-[9px] font-black uppercase transition-all border-2 text-left ${
                  selectedGaranties.includes(g.id) 
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                  : 'bg-white border-slate-50 text-slate-400'
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
            className="w-full mt-6 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Calcul des probabilités..." : "Lancer l'expertise technique"}
          </button>
        </div>
      )}

      {/* RÉSULTATS DÉTAILLÉS */}
      {aiResults && (
        <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700">
          
          {/* SCORE GLOBAL & SYNTHESE */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col items-center justify-center">
              <div className="text-4xl font-black text-indigo-400">{aiResults.score_global}<span className="text-xl text-white/50">/100</span></div>
              <div className="text-[9px] font-bold uppercase mt-2 tracking-widest">Score Qualité Risque</div>
            </div>
            <div className="md:col-span-2 bg-indigo-600 p-8 rounded-[2.5rem] text-white flex items-center">
              <p className="text-sm font-medium leading-relaxed italic">"{aiResults.synthese_executive}"</p>
            </div>
          </div>

          {/* ANALYSE CAT NAT (MUNICH RE / SWISS RE) */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm border-l-4 border-l-cyan-500">
            <div className="flex items-center gap-3 mb-4 text-cyan-600">
              <Waves size={20} />
              <h3 className="font-black text-[10px] uppercase tracking-widest">Exposition Aléas Naturels (Ref. Réassureurs)</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{aiResults.analyse_nat_cat}</p>
          </div>

          {/* POINTS DE VIGILANCE MAJEURS */}
          <div className="bg-rose-50 p-8 rounded-[2.5rem] border border-rose-100">
             <div className="flex items-center gap-3 mb-4 text-rose-600">
              <AlertTriangle size={20} />
              <h3 className="font-black text-[10px] uppercase tracking-widest">Red Flags / Points Critiques</h3>
            </div>
            <div className="grid gap-2">
              {aiResults.points_vigilance_majeurs.map((v, i) => (
                <div key={i} className="flex items-center gap-3 text-xs font-bold text-rose-700 bg-white p-3 rounded-xl border border-rose-200/50">
                  <span className="w-5 h-5 flex items-center justify-center bg-rose-100 rounded-full text-[10px]">{i+1}</span>
                  {v}
                </div>
              ))}
            </div>
          </div>

          {/* ANALYSE PAR GARANTIE */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Analyse Détaillée par Garantie</h3>
            {aiResults.analyses_par_garantie.map((gar, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-900"><BarChart4 size={18} /></div>
                    <h4 className="font-black text-xs text-slate-900 uppercase tracking-widest">{gar.garantie}</h4>
                  </div>
                  <div className={`px-4 py-2 rounded-full font-black text-xs ${gar.exposition > 7 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    Exp: {gar.exposition}/10
                  </div>
                </div>
                <div className="space-y-4">
                   <div className="bg-slate-50 p-6 rounded-2xl">
                      <p className="text-xs text-slate-700 leading-relaxed leading-6"><span className="font-black uppercase text-[9px] block mb-1 text-indigo-500">Expertise Technique :</span>{gar.avis_technique}</p>
                   </div>
                   <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                      <p className="text-xs text-indigo-900 leading-relaxed font-bold"><span className="font-black uppercase text-[9px] block mb-1 text-indigo-400">Standard & Conformité :</span>{gar.recommandations_standards}</p>
                   </div>
                </div>
              </div>
            ))}
          </div>

          {/* PLAN D'ACTIONS FINAL */}
          <div className="bg-slate-900 p-8 rounded-[3rem] text-white">
            <div className="flex items-center gap-3 mb-8">
               <ClipboardList size={24} className="text-indigo-400" />
               <h3 className="font-black text-xs uppercase tracking-widest">Plan de Maîtrise des Risques</h3>
            </div>
            <div className="grid gap-6">
               {Object.entries(aiResults.plan_actions).map(([key, val]) => (
                 <div key={key} className="flex gap-4">
                   <div className="font-black text-indigo-400 text-lg">{key}</div>
                   <div className="text-sm text-slate-300 font-medium">{val}</div>
                 </div>
               ))}
            </div>
            <button 
              onClick={() => setAiResults(null)} 
              className="w-full mt-10 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all"
            >
              Réinitialiser l'expertise
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;
