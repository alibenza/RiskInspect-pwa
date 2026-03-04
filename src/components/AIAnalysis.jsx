import React, { useState } from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import { 
  BrainCircuit, 
  Loader2, 
  ShieldCheck, 
  Target, 
  FileDown, 
  Zap, 
  AlertTriangle, 
  BarChart3,
  Building2, 
  Layers,
  MessageSquareText, // Nouveau : icône Chat
  LayoutDashboard // Nouveau : icône Dashboard
} from 'lucide-react';
import { exportToPdf } from './ExportPDF';
import AIChatRoom from './AIChatRoom';
import SMPPreview from './SMPPreview';

const AIAnalysis = () => {
  const { allSites, responses, questionsConfig, aiResults, setAiResults, auditorInfo } = useInspectionStore();
  
  const [loading, setLoading] = useState(false);
  const [selectedGaranties, setSelectedGaranties] = useState(['Incendie_explosion', 'Bris_De_Machine', 'RC']);
  const [expertSatisfaction, setExpertSatisfaction] = useState(80);
  const [severity, setSeverity] = useState('Moyenne');
  
  // NOUVEAU : État pour basculer entre l'analyse globale et la Co-rédaction SMP
  const [activeTab, setActiveTab] = useState('corporate'); // 'corporate' ou 'smp_chat'

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

        return { siteName: site.name, data: siteResponses };
      });

      const nomsGarantiesCochees = selectedGaranties.map(id => 
        garantiesLib.find(g => g.id === id)?.label
      ).join(", ");

      const promptStrict = `Expert IARD Algérie. Analyse Multi-sites (${multiSiteData.length} sites). Sévérité ${severity}, Satisfaction ${expertSatisfaction}%. Garanties : ${nomsGarantiesCochees}. JSON uniquement.`;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: 'POST',
        headers: { 
          'Content-Type': `application/json`, 
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}` 
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: "Tu es un Ingénieur Souscripteur Senior. Analyse les risques et réponds en JSON." },
            { role: "user", content: promptStrict + JSON.stringify(multiSiteData) }
          ],
          response_format: { type: "json_object" },
          temperature: 0.3
        })
      });

      const rawData = await response.json();
      setAiResults(JSON.parse(rawData.choices[0].message.content));
    } catch (error) {
      alert("Erreur lors de la génération : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6 pb-32 max-w-7xl mx-auto bg-slate-50/30 min-h-screen font-sans">
      
      {/* HEADER AVEC COMMUTATEUR DE MODE */}
      <div className="bg-slate-900 p-6 rounded-[2rem] text-white shadow-xl flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500 rounded-2xl shadow-lg shadow-indigo-500/20">
            <BrainCircuit size={28} />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tighter uppercase italic">RiskPro <span className="text-indigo-400">Intelligence</span></h2>
            <div className="flex bg-slate-800 p-1 rounded-xl mt-1 border border-slate-700">
              <button 
                onClick={() => setActiveTab('corporate')}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'corporate' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <LayoutDashboard size={12} /> Analyse Corporate
              </button>
              <button 
                onClick={() => setActiveTab('smp_chat')}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'smp_chat' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <MessageSquareText size={12} /> Co-rédaction SMP
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          {aiResults && (
            <button 
              onClick={() => exportToPdf(responses, questionsConfig, aiResults, auditorInfo)}
              className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase transition-all shadow-lg"
            >
              <FileDown size={16} /> Exporter Rapport
            </button>
          )}
        </div>
      </div>

      {/* CONTENU CONDITIONNEL : SOIT ANALYSE CORPORATE SOIT CHAT SMP */}
      {activeTab === 'corporate' ? (
        <div className="animate-in fade-in duration-500">
           {/* Ton code d'analyse initial (Score Global, Garanties, etc.) */}
           {!aiResults ? (
             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                {/* ... (Section Configuration / Bouton Générer Expertise) ... */}
                <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <Layers className="text-indigo-600" size={24} />
                  <p className="text-[11px] font-bold text-indigo-900 uppercase">
                    Analyse Multi-sites : <span className="text-indigo-600">{Object.keys(allSites).length} site(s)</span>.
                  </p>
                </div>
                {/* RE-INSERTION DU BOUTON GÉNÉRER ICI POUR LA COMPLÉTUDE */}
                <button onClick={runDetailedAnalysis} disabled={loading} className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase flex items-center justify-center gap-3">
                   {loading ? <Loader2 className="animate-spin" /> : <Zap size={20} />} Générer l'expertise Corporate
                </button>
             </div>
           ) : (
             <div className="space-y-6">
               {/* Affichage des résultats aiResults (Score, Synthèse, Garanties) */}
               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col justify-center items-center shadow-xl border-b-8 border-indigo-500">
                    <span className="text-6xl font-black">{aiResults?.score_global}%</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mt-2">Moyenne Groupe</span>
                  </div>
                  <div className="md:col-span-3 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center">
                    <p className="text-slate-600 italic text-sm"><Building2 className="inline mr-2 text-indigo-500" size={18} />{aiResults?.synthese_executive}</p>
                  </div>
               </div>
             </div>
           )}
        </div>
      ) : (
        /* MODE WAR ROOM : SPLIT SCREEN CHAT + PREVIEW */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in slide-in-from-right-4 duration-500">
          <div className="lg:col-span-7">
            <AIChatRoom />
          </div>
          <div className="lg:col-span-5">
            <SMPPreview />
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;
