import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

const AIRedesignButton = ({ currentText, onUpdate }) => {
  const [loading, setLoading] = useState(false);

  const handleImprove = async () => {
    if (!currentText || currentText.length < 5) return;
    setLoading(true);

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': 'Bearer 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' 
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { 
              role: "system", 
              content: "Tu es un ingénieur expert en prévention des risques. Ton but est de reformuler les notes de l'inspecteur pour les rendre professionnelles, techniques et précises. Utilise un vocabulaire d'expert d'assurance (ex: 'dispositif' au lieu de 'truc', 'conforme' au lieu de 'ok'). Sois concis. Réponds UNIQUEMENT avec le texte corrigé." 
            },
            { role: "user", content: `Reformule cette note d'inspection : ${currentText}` }
          ],
          temperature: 0.3
        })
      });

      const data = await response.json();
      const result = data.choices[0].message.content.trim();
      onUpdate(result); // Met à jour le store
    } catch (error) {
      console.error("Erreur IA:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleImprove}
      disabled={loading || !currentText}
      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
        loading ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white'
      }`}
    >
      {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
      {loading ? "Optimisation..." : "Perfectionner l'observation"}
    </button>
  );
};

export default AIRedesignButton;
