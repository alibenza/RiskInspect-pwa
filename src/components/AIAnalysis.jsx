import React, { useState } from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import { 
  BrainCircuit, Sparkles, Loader2, ShieldCheck, 
  Flame, Droplets, Lock, Users, Activity, Check,
  AlertTriangle, Gauge, Globe2
} from 'lucide-react';

const AIAnalysis = () => {
  const { responses, questionsConfig, aiResults, setAiResults } = useInspectionStore();
  const [loading, setLoading] = useState(false);
  const [selectedGaranties, setSelectedGaranties] = useState(['Incendie', 'PE']);

  const garantiesLib = [
    { id: 'Incendie', label: 'Incendie & Explosion', icon: <Flame size={16} />, color: 'text-orange-500' },
    { id: 'DDE', label: 'Dégâts des Eaux', icon: <Droplets size={16} />, color: 'text-blue-500' },
    { id: 'Vol', label: 'Vol & Vandalisme', icon: <Lock size={16} />, color: 'text-slate-600' },
    { id: 'RC', label: 'Resp. Civile', icon: <Users size={16} />, color: 'text-purple-500' },
    { id: 'PE', label: 'Pertes d’Exploitation', icon: <Activity size={16} />, color: 'text-emerald-500' },
  ];

  const toggleGarantie = (id) => {
    setSelectedGaranties(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const runDetailedAnalysis = async () => {
    setLoading(true);
    try {
      const natureActivite = responses['activite_nature']?.value || "Non spécifiée";
      
      // Extraction du résumé technique pour le prompt
      const dataSummary = questionsConfig.map(section => {
        const sectionResponses = section.questions
          .map(q => {
            const r = responses[q.id];
            if (!r) return null;
            return `[${q.label}] : ${r.value || r.score + '/5'}. Obs: ${r.comment || 'N/A'}. Photos: ${r.photos?.length || 0}`;
          })
          .filter(Boolean).join('\n');
        return `SECTION: ${section.title}\n${sectionResponses}`;
      }).join('\n\n');

      const promptStrict = `
        En tant qu'Ingénieur Souscripteur Senior, analyse le risque suivant :
        ACTIVITÉ : "${natureActivite}"
        GARANTIES CIBLÉES : ${selectedGaranties.join(', ')}
        DONNÉES TERRAIN : ${dataSummary}

        CONSIGNES POUR CHAQUE GARANTIE :
        1. EXPOSITION : Note de 1 à 10 (10=Risque critique).
        2. ANALYSE : Croise l'accidentologie de "${natureActivite}" avec les preuves terrain.
        3. CONFIDENCE SCORE : De 0 à 100%. Évalue si les données fournies (réponses + photos) sont suffisantes pour conclure.
        
        FORMAT JSON REQUIS :
        {
          "introduction": "Synthèse globale du profil...",
          "analyses": [
            {
              "garantie": "Nom",
              "exposition": 7,
              "confidence": 85,
              "avis": "Détail technique...",
              "points_noirs": ["..."]
            }
          ],
          "recommandation_maitresse": "L'action n°1 à exiger..."
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
            { role: "system", content: "Tu es un expert en tarification et prévention des risques industriels. Ton analyse est stricte et basée sur des preuves." }, 
            { role: "user", content: promptStrict }
          ],
          response_format: { type: "json_object" },
          temperature: 0.4
        })
      });

      const d = await r.json();
      setAiResults(JSON.parse(d.choices[0].message.content));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6 pb-20">
      {/* HEADER CONSOLE */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500 rounded-xl"><BrainCircuit size={24} /></div>
            <h2 className="text-xl font-black uppercase tracking-tighter">Console de Souscription IA</h2>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
            <Globe2 size={12} /> Analyse dynamique : {responses['activite_nature']?.value || "Activité non définie"}
          </p>
        </div>
      </div>

      {/* SÉLECTEUR DE GARANTIES */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <label className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-4 block">Périmètres de l'analyse</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {garantiesLib.map(g => (
            <button
              key={g.id}
              onClick={() => toggleGarantie(g.id)}
              className={`flex items-center gap-2 p-3 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${
                selectedGaranties.includes(g.id) 
                ? 'bg-indigo-50 border-indigo-200 text-indigo-600' 
                : 'bg-white border-slate-50 text-slate-400 hover:border-slate-100'
              }`}
            >
              <span className={selectedGaranties.includes(g.id) ? g.color : 'text-slate-300'}>{g.icon}</span>
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {!aiResults && !loading ? (
        <button 
          onClick={runDetailedAnalysis}
          className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-[0.3em] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 animate-pulse"
        >
          Générer l'expertise de souscription
        </button>
      ) : loading ? (
        <div className="p-12 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin mx-auto text-indigo-600 mb-4" size={40} />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Recherche d'accidentologie sectorielle...</p>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
          {/* INTRO IA */}
          <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-lg">
            <ShieldCheck className="mb-4 opacity-50" size={32} />
            <p className="text-sm font-medium leading-relaxed italic opacity-90">"{aiResults.introduction}"</p>
          </div>

          {/* ANALYSES PAR GARANTIE */}
          <div className="grid gap-4">
            {aiResults.analyses.map((gar, idx) => (
              <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="font-black text-xs text-slate-900 uppercase tracking-wider">{gar.garantie}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Gauge size={12} className="text-slate-300" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Fiabilité des données : {gar.confidence}%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[20px] font-black text-slate-900 leading-none">{gar.exposition}<span className="text-[10px] text-slate-300">/10</span></div>
                    <div className="text-[8px] font-black uppercase text-slate-400">Exposition</div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl mb-4">
                  <p className="text-xs text-slate-600 leading-relaxed italic">{gar.avis}</p>
                </div>

                <div className="space-y-2">
                  {gar.points_noirs.map((pn, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] font-bold text-red-500 bg-red-50 p-2 rounded-lg border border-red-100/50">
                      <AlertTriangle size={12} /> {pn}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* RECOMMANDATION MAITRESSE */}
          <div className="bg-slate-900 p-8 rounded-[2rem] text-white">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="text-indigo-400" size={20} />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Action Corrective Prioritaire</h4>
            </div>
            <p className="text-sm font-bold leading-relaxed">{aiResults.recommandation_maitresse}</p>
            <button 
              onClick={() => setAiResults(null)}
              className="mt-8 text-[9px] font-black uppercase text-slate-500 hover:text-white transition-colors"
            >
              ↻ Relancer l'agent IA
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;
