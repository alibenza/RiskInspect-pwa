import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, RefreshCw, Search, BrainCircuit } from 'lucide-react';
import { useInspectionStore } from '../hooks/useInspectionStore';

const AIChatRoom = () => {
  const { chatHistory, addChatMessage, responses, smpData, clearChat } = useInspectionStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll vers le bas
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isTyping]);

  /**
   * Fonction de préparation du contexte : 
   * On extrait uniquement les réponses qui contiennent des commentaires écrits.
   */
  const getExtractedContext = () => {
    return Object.values(responses)
      .filter(resp => resp.comment && resp.comment.trim() !== '')
      .map(resp => ({
        section: resp.questionLabel,
        observation: resp.comment
      }));
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    addChatMessage(userMsg);
    setInput('');
    setIsTyping(true);

    const observationsBrutes = getExtractedContext();

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}` 
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { 
              role: "system", 
              content: `Tu es l'Expert Senior IARD de la CIAR (Algérie). 
              
              CONTEXTE EXTRAIT DES OBSERVATIONS TERRAIN :
              ${JSON.stringify(observationsBrutes)}

              VALEURS SMP ACTUELLES : ${JSON.stringify(smpData.valeurs)}

              MISSION D'ANALYSE ET RECHERCHE :
              1. SCAN TECHNIQUE : Analyse les observations fournies ci-dessus. Identifie les marques, années (ex: 2006), origines (ex: Italie) et capacités de production.
              2. RECHERCHE DE VALEUR : En te basant sur ces indices, estime la Valeur à Neuf de Remplacement (VHR) au prix du marché de 2026.
              3. CALCULS : Propose des estimations pour les Bâtiments, Matériels et Stocks. Justifie tes chiffres (ex: coût au m² pour la céramique en Algérie).
              4. CONSEIL : Si une machine est ancienne, mentionne l'impact de la vétusté sur la prime mais reste sur la valeur à neuf pour le SMP.

              TON TON : Professionnel, précis, axé sur les chiffres et la souscription.` 
            },
            ...chatHistory,
            userMsg
          ],
          temperature: 0.4
        })
      });

      if (!response.ok) throw new Error("Erreur API");

      const data = await response.json();
      const aiContent = data.choices[0].message.content;

      addChatMessage({ role: 'assistant', content: aiContent });
    } catch (error) {
      addChatMessage({ role: 'assistant', content: "Désolé, je n'ai pas pu analyser ces données. Vérifiez votre connexion." });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[650px] bg-slate-50 rounded-[2rem] border border-slate-200 shadow-2xl overflow-hidden font-sans">
      
      {/* HEADER DYNAMIQUE */}
      <div className="bg-white border-b border-slate-200 p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Bot size={24} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Intelligence Risques CIAR</h3>
            <div className="flex items-center gap-1.5 text-[10px] text-indigo-600 font-bold uppercase">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Analyseur d'observations actif
            </div>
          </div>
        </div>
        <button 
          onClick={clearChat} 
          className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
          title="Réinitialiser la discussion"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      {/* ZONE DE CHAT */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {chatHistory.length === 0 && (
          <div className="text-center py-10 px-8 bg-indigo-50/50 rounded-[2rem] border-2 border-dashed border-indigo-100">
            <BrainCircuit className="mx-auto text-indigo-400 mb-4" size={48} />
            <p className="text-slate-600 text-sm font-bold uppercase mb-2">Analyseur de rapport prêt</p>
            <p className="text-slate-500 text-xs leading-relaxed">
              "J'ai scanné vos {getExtractedContext().length} observations. 
              Posez-moi une question sur les valeurs des équipements ou sur un scénario de sinistre."
            </p>
          </div>
        )}

        {chatHistory.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-3xl text-sm shadow-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-100' 
                : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
            }`}>
              <div className="flex items-center gap-2 mb-2 opacity-50 text-[10px] font-black uppercase">
                {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                {msg.role === 'user' ? 'Ingénieur CIAR' : 'Analyste IA'}
              </div>
              <p className="whitespace-pre-line leading-relaxed font-medium">{msg.content}</p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start items-center gap-3">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-1">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recherche en cours...</span>
          </div>
        )}
      </div>

      {/* INPUT ET ACTIONS RAPIDES */}
      <div className="p-5 bg-white border-t border-slate-100">
        <div className="flex items-center gap-3 bg-slate-100 p-2 rounded-2xl border border-transparent focus-within:border-indigo-500 focus-within:bg-white transition-all shadow-inner">
          <textarea
            rows="1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Posez une question sur le matériel ou le calcul du SMP..."
            className="flex-1 bg-transparent border-none focus:outline-none text-sm p-3 resize-none text-slate-700 font-medium"
          />
          <button 
            onClick={handleSend} 
            disabled={!input.trim() || isTyping} 
            className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-30 shadow-lg shadow-indigo-100 transition-all"
          >
            <Send size={20} />
          </button>
        </div>
        
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 no-scrollbar">
          <QuickAction 
            icon={<Search size={14}/>} 
            label="Extraire valeurs machines" 
            onClick={() => setInput("Analyse mes observations et fais-moi une proposition de Valeur à Neuf (VHR) pour les machines mentionnées.")} 
          />
          <QuickAction 
            icon={<Sparkles size={14}/>} 
            label="Estimer SMP" 
            onClick={() => setInput("Selon mes notes sur le stockage et les équipements, quel serait le montant du SMP pour un incendie majeur ?")} 
          />
        </div>
      </div>
    </div>
  );
};

const QuickAction = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick} 
    className="flex items-center gap-2 whitespace-nowrap px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:border-indigo-500 hover:text-indigo-600 hover:shadow-md transition-all"
  >
    {icon} {label}
  </button>
);

export default AIChatRoom;
