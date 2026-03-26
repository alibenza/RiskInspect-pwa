import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, RefreshCw, BrainCircuit, AlertCircle, CheckCheck, Loader2 } from 'lucide-react';
import { useInspectionStore } from '../hooks/useInspectionStore';

const AIChatRoom = () => {
  const { chatHistory, addChatMessage, responses, smpData, clearChat, setSmpData } = useInspectionStore();
  const [input, setInput]             = useState('');
  const [isTyping, setIsTyping]       = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationDone, setValidationDone] = useState(false);
  const [errorStatus, setErrorStatus] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'auto' });
    }
  }, [chatHistory, isTyping]);

  const getCleanContextAsText = () => {
    try {
      const observations = Object.values(responses)
        .filter(r => r && r.comment && r.comment.trim().length > 2)
        .map(r => `- ${r.questionLabel || 'Observation'}: ${r.comment.substring(0, 500)}`);
      return observations.length > 0 ? observations.join('\n') : 'Aucune donnée terrain disponible.';
    } catch {
      return 'Erreur lors du traitement des données.';
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const currentMessage = input.trim();
    setErrorStatus(null);
    setIsTyping(true);
    setInput('');
    setValidationDone(false);
    addChatMessage({ role: 'user', content: currentMessage });

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey) throw new Error('Clé API manquante.');

      const cleanHistory = chatHistory.slice(-6).map(({ role, content }) => ({
        role: role === 'assistant' ? 'assistant' : 'user',
        content: String(content),
      }));

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `Tu es l'Expert Senior IARD CIAR. Contexte terrain :\n${getCleanContextAsText()}\nValeurs SMP actuelles : ${JSON.stringify(smpData?.valeurs || {})}`,
            },
            ...cleanHistory,
            { role: 'user', content: currentMessage },
          ],
          temperature: 0.3,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Erreur API');
      addChatMessage({ role: 'assistant', content: data.choices[0].message.content });
    } catch (err) {
      setErrorStatus(err.message);
      setInput(currentMessage);
    } finally {
      setIsTyping(false);
    }
  };

  // ── Bouton Valider ────────────────────────────────────────────────────────
  const handleValidate = async () => {
    if (chatHistory.length === 0 || isValidating) return;
    setIsValidating(true);
    setErrorStatus(null);

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey) throw new Error('Clé API manquante.');

      const conversationText = chatHistory
        .map(m => `${m.role === 'user' ? 'Expert' : 'IA'}: ${m.content}`)
        .join('\n\n');

      const prompt = `
Sur la base de cette discussion entre un expert IARD et l'assistant IA, génère un récapitulatif structuré pour le Rapport de Scénario SMP.

DISCUSSION :
${conversationText}

CONTEXTE TERRAIN :
${getCleanContextAsText()}

Réponds UNIQUEMENT en JSON valide avec exactement cette structure :
{
  "scenario": "Description narrative du scénario de sinistre retenu (2-4 phrases)",
  "smpFinal": <montant numérique en DZD, ex: 150000000>,
  "valeurs": {
    "batiment": <valeur numérique en DZD>,
    "materiel": <valeur numérique en DZD>,
    "stocks": <valeur numérique en DZD>,
    "pe": <valeur numérique en DZD>
  },
  "hypotheses": [
    "Hypothèse technique 1",
    "Hypothèse technique 2",
    "Hypothèse technique 3"
  ]
}
Si une valeur n'a pas été discutée, utilise 0 pour les montants et des hypothèses génériques. Ne génère que le JSON, rien d'autre.`;

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: 'Tu es un expert IARD senior. Tu réponds uniquement en JSON valide, sans texte autour.' },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Erreur API');

      const extracted = JSON.parse(data.choices[0].message.content);

      setSmpData({
        scenario:    extracted.scenario    || '',
        smpFinal:    Number(extracted.smpFinal) || 0,
        valeurs: {
          batiment: Number(extracted.valeurs?.batiment) || 0,
          materiel: Number(extracted.valeurs?.materiel) || 0,
          stocks:   Number(extracted.valeurs?.stocks)   || 0,
          pe:       Number(extracted.valeurs?.pe)       || 0,
        },
        hypotheses: Array.isArray(extracted.hypotheses) ? extracted.hypotheses : [],
      });

      setValidationDone(true);

      addChatMessage({
        role: 'assistant',
        content: `✅ Rapport de Scénario mis à jour :\n\n**Scénario :** ${extracted.scenario}\n\n**SMP Final :** ${new Intl.NumberFormat('fr-DZ').format(extracted.smpFinal || 0)} DZD`,
      });

    } catch (err) {
      setErrorStatus('Erreur lors de la validation : ' + err.message);
    } finally {
      setIsValidating(false);
    }
  };

  const hasMessages = chatHistory.length > 0;

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
        <button onClick={clearChat} className="p-2.5 text-slate-400 hover:text-rose-500 transition-all" title="Réinitialiser la discussion">
          <RefreshCw size={20} />
        </button>
      </div>

      {/* ZONE DE CHAT */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        {!hasMessages && (
          <div className="text-center py-10 px-8 bg-white/50 rounded-[2rem] border-2 border-dashed border-slate-200">
            <BrainCircuit className="mx-auto text-indigo-400 mb-4" size={48} />
            <p className="text-slate-500 text-xs font-semibold mb-1">Prêt pour l'expertise.</p>
            <p className="text-slate-400 text-[11px] italic">Décrivez le scénario de sinistre, les valeurs exposées ou posez vos questions. Une fois satisfait, cliquez sur <strong>Valider la discussion</strong>.</p>
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
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <p>{errorStatus}</p>
          </div>
        )}
      </div>

      {/* BOUTON VALIDER */}
      {hasMessages && (
        <div className="px-5 pt-3 pb-1">
          <button
            onClick={handleValidate}
            disabled={isValidating || isTyping}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-[11px] uppercase tracking-wider transition-all shadow-sm
              ${validationDone
                ? 'bg-green-500 text-white'
                : 'bg-slate-900 hover:bg-indigo-700 text-white disabled:bg-slate-300 disabled:text-slate-500'
              }`}
          >
            {isValidating ? (
              <><Loader2 size={15} className="animate-spin" /> Génération du rapport...</>
            ) : validationDone ? (
              <><CheckCheck size={15} /> Rapport de Scénario mis à jour</>
            ) : (
              <><CheckCheck size={15} /> Valider la discussion → Rapport de Scénario</>
            )}
          </button>
        </div>
      )}

      {/* ZONE INPUT */}
      <div className="p-5 bg-white border-t border-slate-100 mt-2">
        <div className="flex items-center gap-3 bg-slate-100 p-2 rounded-2xl border-2 border-transparent focus-within:border-indigo-500 focus-within:bg-white transition-all">
          <textarea
            rows="1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder={isTyping ? "L'IA analyse..." : "Décrivez le scénario, les valeurs, les hypothèses..."}
            disabled={isTyping || isValidating}
            className="flex-1 bg-transparent border-none focus:outline-none text-sm p-3 resize-none text-slate-700 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping || isValidating}
            className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:bg-slate-300 transition-all"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatRoom;
