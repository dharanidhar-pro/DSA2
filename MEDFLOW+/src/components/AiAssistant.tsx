import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Sparkles, AlertTriangle, ShieldCheck, HeartPulse, Stethoscope } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I am your MedFlow+ AI Health Assistant. Ask me anything about symptoms triage, clinical department recommendations, live emergency support, or sequenced first-aid guidance.'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    "🚨 First-aid steps for severe breathing difficulties",
    "🏥 Symptoms: Recommend department for pediatric chest pain",
    "🛏️ Explain how to find nearby hospitals with open ICU beds",
    "🧑‍⚕️ Where should I go for acute joint swelling?"
  ];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage = textToSend.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/health-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          chatHistory: messages.slice(-10) // Send current conversation context
        })
      });

      const data = await response.json();
      if (!response.ok) {
        setMessages(prev => [
          ...prev, 
          { 
            role: 'assistant', 
            content: `⚠️ Note: ${data.error || 'No active connection to Gemini core.'}` 
          }
        ]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: '⚠️ Failed to reach MedFlow+ assistant core. Please ensure GEMINI_API_KEY is configured under Settings > Secrets.' 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="mb-4 w-96 max-w-[calc(100vw-2rem)] h-[580px] bg-slate-900/95 dark:bg-slate-950/95 light:bg-white border border-slate-700/50 dark:border-white/10 light:border-slate-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col backdrop-blur-xl"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-between text-white">
              <div className="flex items-center space-x-2.5">
                <div className="bg-white/15 p-1.5 rounded-xl">
                  <Stethoscope className="w-5 h-5 text-emerald-300 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-sm tracking-tight flex items-center">
                    AI Health Assistant
                    <span className="ml-2 px-1.5 py-0.5 text-[9px] bg-emerald-500 rounded text-slate-950 font-extrabold uppercase tracking-wide">Live</span>
                  </h4>
                  <p className="text-[10px] text-white/80">Secured with Gemini Clinical Core</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg cursor-pointer transition-colors"
                title="Minimize chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Warning banner */}
            <div className="bg-amber-500/10 dark:bg-amber-500/10 light:bg-amber-50/70 border-b border-amber-550/10 p-2.5 flex items-start space-x-2 text-amber-500 dark:text-amber-400 light:text-amber-700 text-[11px] leading-relaxed">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 animate-bounce" />
              <div>
                <strong>Medical AI Notice:</strong> Triage results are virtual guidance. For active life-threatening emergencies, dial <strong>911</strong> or find your nearest hospital immediately.
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed transition-all ${
                      m.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none shadow-lg shadow-blue-500/10'
                        : 'bg-slate-800/80 dark:bg-slate-900/85 light:bg-slate-100 text-slate-200 dark:text-slate-100 light:text-slate-800 rounded-bl-none border border-white/5 dark:border-white/5 light:border-slate-200'
                    }`}
                  >
                    {/* Render newlines */}
                    <div className="whitespace-pre-line">{m.content}</div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-850 dark:bg-slate-900 light:bg-slate-100 text-slate-400 rounded-2xl px-4 py-3 text-xs flex items-center space-x-2 rounded-bl-none animate-pulse">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                    <span>MedFlow clinician thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestion Prompt Chips */}
            {messages.length === 1 && (
              <div className="p-3 border-t border-white/5 dark:border-white/5 light:border-slate-250 bg-slate-950/10 light:bg-slate-50">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Suggested Prompts</p>
                <div className="flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto pr-1">
                  {suggestedPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(p)}
                      className="text-[10px] cursor-pointer text-left py-1.5 px-2.5 bg-slate-800/50 hover:bg-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-900 light:bg-white light:hover:bg-slate-100 border border-white/5 dark:border-white/5 light:border-slate-250 rounded-xl text-slate-300 dark:text-slate-300 light:text-slate-705 transition-all text-ellipsis max-w-full"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputValue);
              }}
              className="p-3 border-t border-white/10 dark:border-white/10 light:border-slate-200 bg-slate-950/30 dark:bg-slate-950/30 light:bg-white flex items-center space-x-2"
            >
              <input
                type="text"
                placeholder="Describe your medical symptoms or inquiry..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 bg-slate-800/50 dark:bg-slate-900/40 light:bg-slate-100 border border-white/5 dark:border-white/5 light:border-slate-200 text-slate-100 dark:text-slate-100 light:text-slate-900 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
                disabled={isLoading}
              />
              <button
                type="submit"
                className={`p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white cursor-pointer hover:opacity-90 active:scale-95 transition-all flex-shrink-0 ${
                  isLoading ? 'opacity-50 pointer-events-none' : ''
                }`}
                title="Send clinical prompt"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 p-4 rounded-full text-white shadow-2xl flex items-center justify-center cursor-pointer relative group border border-blue-550/30 ring-4 ring-blue-500/15"
        title="Open AI Health Assistant"
      >
        <div className="absolute inset-0 bg-blue-450/45 rounded-full filter blur opacity-30 group-hover:opacity-50 animate-pulse" />
        {isOpen ? (
          <X className="w-6 h-6 z-10" />
        ) : (
          <MessageSquare className="w-6 h-6 z-10 animate-bounce" />
        )}
        {!isOpen && (
          <span className="absolute right-12 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity translate-x-1 whitespace-nowrap">
            Need symptom assistance?
          </span>
        )}
      </motion.button>
    </div>
  );
}
