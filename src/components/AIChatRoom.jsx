import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, Calculator, RefreshCw, ChevronRight } from 'lucide-react';
import { useInspectionStore } from '../hooks/useInspectionStore';

const AIChatRoom = () => {
  const { chatHistory, addChatMessage, responses, smpData, setSmpData } = useInspectionStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll vers le bas à chaque nouveau message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // 1. Ajouter le message de l'utilisateur
    const userMsg = { role: 'user', content: input };
    addChatMessage(userMsg);
    setInput('');
    setIsTyping(true);

    try {
      // 2. Appel à l'API Groq (Simulé ici pour la structure, à lier à ton service API)
      // On envoie le contexte : Réponses terrain + Scénario actuel + Input
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
              content: `Tu es l'Expert IA de la CIAR. Ton rôle est d'assister l'ingénieur dans le calcul du SMP.
              Données terrain actuelles: ${JSON.stringify(responses)}
              Valeurs SMP actuelles: ${JSON.stringify(smpData.valeurs)}
              Sois technique, précis et suggère des chiffres si l'ingénieur te le demande.` 
            },
            ...chatHistory,
            userMsg
          ]
        })
      });

      const data = await response.json();
      const aiContent = data.choices[0].message.content;

      // 3. Ajouter la réponse de l'IA
      addChatMessage({ role: 'assistant', content: aiContent });
    } catch (error) {
      addChatMessage({ role: 'assistant', content: "Désolé, j'ai rencontré une erreur de connexion. Vérifiez votre clé API." });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-slate-50 rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
      {/* Header du Chat */}
      <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Bot size={22} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Assistant RiskInspect</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-slate-500 uppercase font-medium tracking-wider">Expertise IARD Active</span>
            </div>
          </div>
        </div>
        <button onClick={() => useInspectionStore.getState().clearChat()} className="text-slate-400 hover:text-rose-500 transition-colors">
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Zone des messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.length === 0 && (
          <div className="text-center py-10 px-6">
            <Sparkles className="mx-auto text-indigo-300 mb-3" size={40} />
            <p className="text-slate-500 text-sm italic">
              "Bonjour Ingénieur. Je suis prêt à vous assister pour le calcul du SMP. Quel scénario souhaitez-vous analyser aujourd'hui ?"
            </p>
          </div>
        )}

        {chatHistory.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
            }`}>
              <div className="flex items-center gap-2 mb-1 opacity-70">
                {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                <span className="text-[10px] font-bold uppercase">{msg.role === 'user' ? 'Vous' : 'RiskInspect AI'}</span>
              </div>
              <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Barre d'input */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-xl focus-within:ring-2 ring-indigo-500 transition-all">
          <textarea
            rows="1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Définissez votre scénario ou demandez une estimation..."
            className="flex-1 bg-transparent border-none focus:outline-none text-sm p-2 resize-none text-slate-700"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition-all"
          >
            <Send size={18} />
          </button>
        </div>
        
        {/* Suggestion d'actions rapides */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
          <QuickAction icon={<Calculator size={14}/>} label="Estimer Valeurs" onClick={() => setInput("Peux-tu me proposer une ventilation des valeurs pour ce site ?")} />
          <QuickAction icon={<Sparkles size={14}/>} label="Scénario Incendie" onClick={() => setInput("Je fixe un scénario d'incendie dans le stock principal. Quelles sont les hypothèses de propagation ?")} />
        </div>
      </div>
    </div>
  );
};

const QuickAction = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 bg-white border border-slate-200 rounded-full text-[11px] font-bold text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition-all shadow-sm"
  >
    {icon} {label}
  </button>
);

export default AIChatRoom;
