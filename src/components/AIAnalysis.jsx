import React, { useState } from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import { generateAnalysisPrompt } from '../utils/aiAnalysis';
import { exportToPdf } from '../utils/exportPdf'; // Import de la fonction mise à jour
import { 
  BrainCircuit, 
  Sparkles, 
  Loader2, 
  AlertCircle, 
  RefreshCw, 
  FileDown, 
  ShieldCheck 
} from 'lucide-react';

const AIAnalysis = () => {
  const { responses, questionsConfig, selectedGaranties } = useInspectionStore();
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runAnalysis = async () => {
    if (Object.keys(responses).length === 0) {
      setError("Aucune donnée détectée. Veuillez remplir l'audit avant de lancer l'IA.");
      return;
    }

    setLoading(true);
    setError(null);
    
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
              content: "Tu es un expert senior en prévention des risques IARD. Ton analyse doit être structurée, technique et aider l'assureur à prendre une décision." 
            },
            { role: "user", content: promptText }
          ],
          temperature: 0.2
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Erreur API");

      if (data.choices && data.choices[0]?.message?.content) {
        setAnalysis(data.choices[0].message.content);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-28 animate-in fade-in duration-500">
      {/* Header Statut */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-indigo-600/20 blur-[50px] rounded-full"></div>
        <div className="flex items-center space-x-3 mb-2 relative z-10">
          <div className="p-2 bg-indigo-500/20 rounded-xl backdrop-blur-
