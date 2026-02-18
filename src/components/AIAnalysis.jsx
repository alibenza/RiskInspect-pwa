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
      // --- SYNCHRONISATION DES VARIABLES ---
      const natureActivite = responses['activite_nature']?.value || "Non spécifiée";
      const siteAddress = responses['adress']?.value || "Algérie (Zone non précisée)";
      const gpsCoords = responses['pos']?.value || "N/A"; // Utilisation de 'pos' comme défini dans ton script capture
      
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
        Tu es un Ingénieur Souscripteur Senior IARD spécialisé dans le risque industriel en Algérie.
        MISSION : Produire une analyse de souscription technique.

        CONTEXTE :
        - Pays : Algérie (Prendre en compte la réglementation locale et la sismicité du Nord).
        - Activité : "${natureActivite}"
        - Adresse/Site : ${siteAddress}
        - Coordonnées GPS : ${gpsCoords}

        RAISONNEMENT ATTENDU :
        1. ANALYSE NAT-CAT : Évalue l'exposition aux risques naturels (Séisme, Inondation) pour ces coordonnées selon MunichRe/SwissRe. Précise les sources.
        2. ANALYSE TECHNIQUE : Croise l'accidentologie mondiale de "${natureActivite}" avec les données terrain.
        3. RÉFÉRENTIELS : Cite impérativement les normes (NFPA, APSAD, CEI).

        DONNÉES TERRAIN :
        ${dataSummary}

        RETOURNE EXCLUSIVEMENT UN JSON :
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
              "points_vigilance": ["..."],
              "recommandations_standards": "..."
            }
          ],
          "plan_actions": { "P1 (Immédiat)": "...", "P2 (Court terme)": "...", "P3 (Amélioration)": "..." }
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
            { role: "system", content: "Tu es un expert en prévention industrielle. Réponds uniquement en JSON." }, 
            { role: "user", content: promptStrict }
          ],
          response_format: { type: "json_object" },
          temperature: 0.2
        })
      });

      const d = await r.json();
      const content = d.choices[0].message.content;
      
      // Sécurité pour le parsing JSON
      const parsedData = typeof content === 'string' ? JSON.parse(content) : content;
      setAiResults(parsedData);

    } catch (e) {
      console.error("Erreur IA:", e);
      alert("L'analyse a échoué. Vérifiez votre connexion ou les données saisies.");
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
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[9px] font-bold uppercase tracking-widest text-rose-300">
              <MapPin size={12} /> {responses['pos']?.value ? "GPS Actif" : "Sans GPS"}
            </div>
          </div>
        </div>
      </div>

      {!aiResults && (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm animate-in fade-in zoom-in duration-500">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Garanties à expertiser</h3>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{selectedGaranties.length}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {garantiesLib.map(g => (
              <button
                key={g.id}
                onClick={() => setSelectedGaranties(prev => prev.includes(g.id) ? prev.filter(x => x !== g.id) : [...prev, g.id])}
                className={`flex flex-col gap-3 p-4 rounded-2xl text-[9px] font-black uppercase transition-all border-2 text-left ${
                  selectedGaranties.includes(g.id) ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-50 text-slate-400 hover:border-slate-100'
                }`}
              >
                <div className={selectedGaranties.includes(g.id) ? g.color : 'text-slate-300'}>{g.icon}</div>
                {g.label}
              </button>
            ))}
          </div>
          <button 
            onClick={runDetailedAnalysis} 
            disabled={loading || selectedGaranties.length === 0}
            className="w-full mt-6 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-[0.98]"
          >
            {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" /> Analyse des bases MunichRe...</span> : "Générer le rapport d'expertise"}
          </button>
        </div>
      )}

      {aiResults && (
        <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700">
          
          {/* TOP DASHBOARD */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col items-center justify-center shadow-xl">
              <div className="text-5xl font-black text-indigo-400">{aiResults.score_global}</div>
              <div className="text-[9px] font-black uppercase mt-2 tracking-[0.2em] text-slate-500">Qualité Risque</div>
            </div>
            <div className="md:col-span-2 bg-indigo-600 p-8 rounded-[2.5rem] text-white flex items-center shadow-xl relative overflow-hidden">
               <ShieldCheck className="absolute right-[-10px] bottom-[-10px] text-white/10" size={120} />
               <p className="text-sm font-bold leading-relaxed relative z-10 italic">"{aiResults.synthese_executive}"</p>
            </div>
          </div>

          {/* NAT CAT BOX */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm border-l-8 border-l-cyan-500">
            <div className="flex items-center gap-3 mb-4 text-cyan-600">
              <Waves size={20} />
              <h3 className="font-black text-[10px] uppercase tracking-widest">Exposition Aléas Naturels (Ref. Réassureurs)</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl">{aiResults.analyse_nat_cat}</p>
          </div>

          {/* RED FLAGS */}
          <div className="bg-rose-50 p-8 rounded-[2.5rem] border border-rose-100 shadow-sm">
             <div className="flex items-center gap-3 mb-6 text-rose-600">
              <AlertTriangle size={20} />
              <h3 className="font-black text-[10px] uppercase tracking-widest">Points Critiques de Souscription</h3>
            </div>
            <div className="grid gap-3">
              {aiResults.points_vigilance_majeurs.map((v, i) => (
                <div key={i} className="flex items-center gap-4 text-xs font-bold text-rose-700 bg-white p-4 rounded-2xl border border-rose-200/50 shadow-sm">
                  <span className="w-6 h-6 flex items-center justify-center bg-rose-600 text-white rounded-lg text-[10px]">{i+1}</span>
                  {v}
                </div>
              ))}
            </div>
          </div>

          {/* GARANTIES DÉTAILLÉES */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-6">Analyse détaillée par garantie</h3>
            {aiResults.analyses_par_garantie.map((gar, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:border-indigo-100 transition-colors">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-900 text-white rounded-xl"><BarChart4 size={18} /></div>
                    <h4 className="font-black text-xs text-slate-900 uppercase tracking-widest">{gar.garantie}</h4>
                  </div>
                  <div className={`px-4 py-2 rounded-xl font-black text-[10px] ${gar.exposition > 6 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    EXPOSITION : {gar.exposition}/10
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                   <div className="bg-slate-50 p-6 rounded-3xl">
                      <p className="text-[11px] text-slate-700 leading-relaxed"><span className="font-black uppercase text-[8px] block mb-2 text-indigo-500">Expertise Terrain vs Activité</span>{gar.avis_technique}</p>
                   </div>
                   <div className="bg-indigo-50/30 p-6 rounded-3xl border border-indigo-50">
                      <p className="text-[11px] text-indigo-900 leading-relaxed font-bold"><span className="font-black uppercase text-[8px] block mb-2 text-indigo-400">Préconisation & Standards (NFPA/APSAD)</span>{gar.recommandations_standards}</p>
                   </div>
                </div>
              </div>
            ))}
          </div>

          {/* PLAN ACTIONS */}
          <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-3 mb-10">
               <ClipboardList size={28} className="text-indigo-400" />
               <h3 className="font-black text-xs uppercase tracking-[0.2em]">Plan de Maîtrise des Risques</h3>
            </div>
            <div className="space-y-8 relative z-10">
               {Object.entries(aiResults.plan_actions).map(([key, val]) => (
                 <div key={key} className="flex gap-6 items-start group">
                   <div className="font-black text-indigo-500 text-sm pt-1 group-hover:scale-110 transition-transform">{key}</div>
                   <div className="text-sm text-slate-300 font-medium leading-relaxed border-l border-slate-800 pl-6">{val}</div>
                 </div>
               ))}
            </div>
            <button 
              onClick={() => { setAiResults(null); window.scrollTo(0,0); }} 
              className="w-full mt-12 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] transition-all border border-white/5"
            >
              ↻ Nouvelle Expertise
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;
