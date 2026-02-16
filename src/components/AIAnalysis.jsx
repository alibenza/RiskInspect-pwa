import React, { useState } from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import { generateAnalysisPrompt } from '../utils/aiAnalysis';
import { BrainCircuit, Sparkles, Loader2, AlertCircle, RefreshCw, FileText } from 'lucide-react';

const AIAnalysis = () => {
  const { responses, questionsConfig, selectedGaranties } = useInspectionStore();
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runAnalysis = async () => {
    // Vérification : y a-t-il des données à analyser ?
    if (Object.keys(responses).length === 0) {
      setError("Veuillez d'abord remplir l'audit dans l'onglet 'Audit'.");
      return;
    }

    setLoading(true);
    setError(null);
    
    // TA CLÉ MISTRAL INSÉRÉE
    const MISTRAL_API_KEY = "3iLUdJmbLlNrXdjgUflUzZWx1HQUoxYx"; 

    try {
      const promptText = generateAnalysisPrompt(responses, questionsConfig, selectedGaranties);
      
      const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${MISTRAL_API_KEY}`
        },
        body: JSON.stringify({
          model: "mistral-small-latest",
          messages: [
            { 
                role: "system", 
                content: "Tu es un expert en prévention des risques industriels et tertiaires pour une compagnie d'assurance. Ton rôle est d'analyser les rapports d'inspection et de donner un avis technique clair sur l'assurabilité du risque." 
            },
            { 
                role: "user", 
                content: promptText 
            }
          ],
          temperature: 0.2 // Température basse pour une analyse technique plus rigoureuse
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Erreur Mistral (${response.status})`);
      }

      if (data.choices && data.choices[0]?.message?.content) {
        setAnalysis(data.choices[0].message.content);
      } else {
        throw new Error("L'IA n'a pas retourné de réponse exploitable.");
      }

    } catch (err) {
      setError(err.message);
      console.error("Erreur technique:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      {/* En-tête Premium */}
      <div className="bg-gradient-to-br from-indigo-950 to-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl border border-indigo-500/20">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-indigo-500/20 rounded-lg backdrop-blur-md">
            <BrainCircuit size={28} className="text-indigo-400" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight">Rapport d'Exposition</h2>
        </div>
        <p className="text-indigo-200/60 text-[10px] font-bold uppercase tracking-[0.2em]">Propulsé par Mistral AI - Diagnostic Expert</p>
      </div>

      {/* Affichage des Erreurs */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-center space-x-3 shadow-sm">
          <AlertCircle className="text-red-500 shrink-0" size={20} />
          <div className="flex-1 text-xs text-red-700 font-bold">{error}</div>
          <button onClick={runAnalysis} className="p-2 bg-red-100 rounded-lg hover:bg-red-200 transition-colors">
            <RefreshCw size={14} className="text-red-600"/>
          </button>
        </div>
      )}

      {/* État Initial : Bouton de lancement */}
      {!analysis && !loading ? (
        <div className="space-y-4">
          <button 
            onClick={runAnalysis} 
            className="w-full py-20 border-2 border-dashed border-indigo-200 rounded-[3rem] flex flex-col items-center justify-center space-y-4 bg-white hover:bg-indigo-50/30 hover:border-indigo-400 transition-all group"
          >
            <div className="p-5 bg-indigo-50 rounded-full group-hover:scale-110 group-hover:bg-indigo-100 transition-all duration-300 shadow-sm">
              <Sparkles className="text-indigo-600" size={32} />
            </div>
            <div className="text-center">
              <span className="block font-black text-indigo-900 text-sm uppercase tracking-widest">Générer l'expertise</span>
              <span className="text-[10px] text-slate-400 font-medium">Analyse complète des données saisies</span>
            </div>
          </button>
          <p className="text-center text-[9px] text-slate-400 uppercase font-black tracking-widest px-10">Assurez-vous d'avoir rempli les rubriques de l'audit et le volet REx avant de lancer.</p>
        </div>
      ) : loading ? (
        /* État de Chargement */
        <div className="bg-white p-20 rounded-[3rem] flex flex-col items-center justify-center space-y-6 shadow-xl border border-slate-50">
          <div className="relative">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
            <BrainCircuit className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-300" size={20} />
          </div>
          <div className="text-center space-y-2">
            <p className="text-slate-900 font-black text-xs uppercase tracking-widest animate-pulse">L'IA étudie le risque...</p>
            <p className="text-slate-400 text-[9px] font-medium italic">Calcul des scores techniques et croisement REx</p>
          </div>
        </div>
      ) : (
        /* Affichage du Rapport Généré */
        <div className="animate-in slide-in-from-bottom-10 duration-700">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-600 to-blue-500"></div>
            
            <div className="flex items-center space-x-2 mb-6 text-indigo-600">
              <FileText size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Synthèse de l'Expert</span>
            </div>

            <div className="prose prose-indigo max-w-none text-sm leading-relaxed text-slate-700 font-medium whitespace-pre-wrap selection:bg-indigo-100">
              {analysis}
            </div>

            <div className="mt-10 pt-6 border-t border-slate-50 flex flex-col space-y-3">
               <button 
                onClick={() => window.print()} 
                className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors"
               >
                 Exporter en PDF
               </button>
               <button 
                onClick={() => setAnalysis("")} 
                className="w-full py-4 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-red-500 transition-colors"
               >
                 Supprimer et recommencer
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;
