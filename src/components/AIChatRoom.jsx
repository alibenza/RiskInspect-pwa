import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, RefreshCw, Search, BrainCircuit, AlertCircle } from 'lucide-react';
import { useInspectionStore } from '../hooks/useInspectionStore';

const AIChatRoom = () => {
  const { chatHistory, addChatMessage, responses, smpData, clearChat } = useInspectionStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errorStatus, setErrorStatus] = useState(null);
  const scrollRef = useRef(null);

  // AUTO-SCROLL : Utilisation de 'auto' au lieu de 'smooth' pour éviter de figer l'interface
  useEffect(() => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'auto' 
      });
    }
  }, [chatHistory, isTyping]);

  const getCleanContextAsText = () => {
    try {
      const observations = Object.values(responses)
        .filter(resp => resp && resp.comment && resp.comment.trim().length > 2)
        .map(resp => `- ${resp.questionLabel || "Observation"}: ${resp.comment.substring(0, 500)}`);
      return observations.length > 0 ? observations.join('\n') : "Aucune donnée terrain disponible.";
    } catch (err) {
      return "Erreur lors du traitement des données.";
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const currentMessage = input.trim();
    setErrorStatus(null);
    setIsTyping(true);
    setInput(''); // On vide immédiatement pour libérer l'UI

    // Ajout local
    addChatMessage({ role: 'user', content: currentMessage });

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey) throw new Error("Clé API manquante.");

      // Filtrage strict des propriétés (Anti-Erreur Timestamp)
      const cleanHistory = chatHistory.slice(-5).map(({ role, content }) => ({
        role: role === 'assistant' ? 'assistant' : 'user',
        content: String(content)
      }));

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${apiKey}` 
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { 
              role: "system", 
              content: `Tu es l'Expert Senior IARD CIAR. Contexte terrain :\n${getCleanContextAsText()}\nValeurs SMP : ${JSON.stringify(smpData?.valeurs || {})}` 
            },
            ...cleanHistory,
            { role: 'user', content: currentMessage }
          ],
          temperature: 0.3
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Erreur API");

      addChatMessage({ 
        role: 'assistant', 
        content: data.choices[0].message.content 
      });

    } catch (error) {
      setErrorStatus(error.message);
      setInput(currentMessage); // On restaure le texte en cas d'échec
    } finally {
      // ON DEBLOQUE L'INTERFACE QUOI QU'IL ARRIVE
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[650px] bg-slate-50 rounded-[2rem] border border-slate-200 shadow-2xl overflow-hidden font-sans">
      
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 p-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Bot size={24} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Intelligence CIAR</h3>
            <div className="flex items-center gap-1.5 text-[10px] text-indigo-600 font-bold uppercase">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Analyseur Actif
            </div>
          </div>
        </div>
        <button onClick={clearChat} className="p-2.5 text-slate-400 hover:text-rose-500 transition-all">
          <RefreshCw size={20} />
        </button>
      </div>

      {/* ZONE DE CHAT */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
      >
        {chatHistory.length === 0 && (
          <div className="text-center py-10 px-8 bg-white/50 rounded-[2rem] border-2 border-dashed border-slate-200">
            <BrainCircuit className="mx-auto text-indigo-400 mb-4" size={48} />
            <p className="text-slate-500 text-xs italic">Prêt pour l'expertise.</p>
          </div>
        )}

        {chatHistory.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-3xl text-sm shadow-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
            }`}>
              <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-3 rounded-2xl border border-slate-100 flex gap-1">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}

        {errorStatus && (
          <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-[11px] font-bold shadow-sm">
            <AlertCircle size={16} />
            <p>ERREUR : {errorStatus}</p>
          </div>
        )}
      </div>

      {/* ZONE INPUT */}
      <div className="p-5 bg-white border-t border-slate-100">
        <div className="flex items-center gap-3 bg-slate-100 p-2 rounded-2xl border-2 border-transparent focus-within:border-indigo-500 focus-within:bg-white transition-all">
          <textarea
            rows="1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder={isTyping ? "L'IA analyse..." : "Posez votre question..."}
            disabled={isTyping}
            className="flex-1 bg-transparent border-none focus:outline-none text-sm p-3 resize-none text-slate-700 disabled:opacity-50"
          />
          <button 
            onClick={handleSend} 
            disabled={!input.trim() || isTyping} 
            className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:bg-slate-300 transition-all"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

const QuickAction = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:border-indigo-500 transition-all">
    {icon} {label}
  </button>
);

export default AIChatRoom;
