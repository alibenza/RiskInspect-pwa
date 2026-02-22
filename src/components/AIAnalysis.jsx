import React, { useState } from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import { 
  BrainCircuit, Loader2, ShieldCheck, Globe2, 
  ChevronDown, Target, SlidersHorizontal 
} from 'lucide-react';
import { exportToPdf } from '../utils/ExportPDF';

const AIAnalysis = () => {
  const { responses, questionsConfig, aiResults, setAiResults, auditorInfo } = useInspectionStore();
  const [loading, setLoading] = useState(false);
  const [selectedGaranties, setSelectedGaranties] = useState(['Incendie_explosion', 'Bris_De_Machine', 'RC']);
  const [isGarantiesOpen, setIsGarantiesOpen] = useState(false);

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
      const nomination = responses['nomination']?.value || "Site Client";
      const natureActivite = responses['activite_nature']?.value || "Non spécifiée";
      const siteAddress = responses['adress']?.value || "Algérie";
      
      const nomsGarantiesCochees = selectedGaranties
        .map(id => garantiesLib.find(g => g.id === id)?.label)
        .join(", ");

      // Préparation propre des données pour l'IA
      const allQuestionsData = Object.keys(responses).map(id => {
        const q = questionsConfig.flatMap(s => s.questions).find(qu => qu.id === id);
        if (!q) return null;
        return {
          id: id,
          label: q.label,
          val: responses[id].value || (responses[id].score + '/5'),
          obs: responses[id].comment || 'RAS'
        };
      }).filter(Boolean);

      const promptStrict = `
        Tu es un Ingénieur Expert en Risques Assuranciels. 
        CONTEXTE : Site "${nomination}" (${natureActivite}) à ${siteAddress}.
        DONNÉES : ${JSON.stringify(allQuestionsData)}
        
        MISSION : 
        1. Analyse l'exposition pour : ${nomsGarantiesCochees}.
        2. STRUCTURE NARRATIVE : Regroupe les IDs des questions en 3-4 sections thématiques logiques pour le rapport final.

        FORMAT JSON STRICT :
        {
          "score_global": 0-100,
          "synthese_executive": "Résumé pro",
          "analyse_nat_cat": {
            "exposition_sismique": "Texte",
            "exposition_hydrologique": "Texte",
            "score_catnat": 1-10
          },
          "analyses_par_garantie": [
            { "garantie": "Nom", "exposition": 1-10, "avis_technique": "...", "recommandations_standards": "..." }
          ],
          "report_narrative": [
            {
              "section_title": "Titre Thématique",
              "section_intro": "Phrase d'intro technique",
              "related_questions_ids": ["id1", "id2"]
            }
          ],
          "plan_actions": { "Action_1": "Description" }
        }
      `;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': 'Bearer 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' 
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: "Tu es un moteur d'expertise assurancielle. Réponds uniquement en JSON." },
            { role: "user", content: promptStrict }
          ],
          response_format: { type: "json_object" },
          temperature: 0.1
        })
      });

      const rawData = await response.json();
      const content = JSON.parse(rawData.choices[0].message.content);
      setAiResults(content);

    } catch (error) {
      console.error(error);
      alert("Erreur d'analyse.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6 max-w-5xl mx-auto">
      <div className="bg-slate-900 p-8 rounded-[2rem] text-white flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BrainCircuit className="text-indigo-400" />
            <h2 className="text-xl font-bold italic">RiskPro AI Console</h2>
          </div>
          <p className="text-xs text-slate-400 uppercase tracking-widest">Analyse Algorithmique de Souscription</p>
        </div>
        {aiResults && (
          <button 
            onClick={() => exportToPdf(responses, questionsConfig, aiResults, auditorInfo)}
            className="bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded-xl text-sm font-bold transition-all"
          >
            Télécharger le Rapport PDF
          </button>
        )}
      </div>

      {!aiResults ? (
        <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100">
          <button onClick={() => setIsGarantiesOpen(!isGarantiesOpen)} className="w-full flex justify-between font-bold text-sm mb-4">
            <span>Périmètre : {selectedGaranties.length} Garanties</span>
            <ChevronDown />
          </button>
          {isGarantiesOpen && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
              {garantiesLib.map(g => (
                <button key={g.id} onClick={() => setSelectedGaranties(prev => prev.includes(g.id) ? prev.filter(x => x !== g.id) : [...prev, g.id])} className={`p-2 rounded-lg border text-[11px] font-bold ${selectedGaranties.includes(g.id) ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white text-slate-500'}`}>{g.label}</button>
              ))}
            </div>
          )}
          <button onClick={runDetailedAnalysis} disabled={loading} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : "Lancer l'Analyse IA"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-indigo-600 p-6 rounded-[2rem] text-white text-center">
                <div className="text-4xl font-black">{aiResults.score_global}%</div>
                <div className="text-xs uppercase opacity-70">Score de Maîtrise</div>
            </div>
            <div className="md:col-span-2 bg-white p-6 rounded-[2rem] border border-slate-100 italic text-slate-600">
                "{aiResults.synthese_executive}"
            </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;
