'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

type Message = { role: 'user' | 'assistant' | 'system', content: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am AgriBot. How can I help you with your farming today? Ask me about crop diseases, fertilizers, or local farming schemes.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user' as const, content: input }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/chat`, {
        messages: newMessages
      }, { withCredentials: true });
      
      setMessages([...newMessages, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      toast.error("Failed to connect to AgriBot.");
      // Fallback for demo
      setTimeout(() => {
         setMessages([...newMessages, { 
           role: 'assistant', 
           content: "I'm currently running in offline demo mode. In a live environment, I would connect to the ML model to give you precise agricultural advice." 
         }]);
         setIsTyping(false);
      }, 1500);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-h-[800px] max-w-4xl mx-auto glass-panel rounded-2xl overflow-hidden border border-white/10 relative">
      <div className="absolute inset-0 bg-green-500/5 pointer-events-none" />
      
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-neutral-950/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-white flex items-center gap-2">
              AgriBot AI <Sparkles className="w-4 h-4 text-emerald-400" />
            </h2>
            <p className="text-xs text-neutral-400">Powered by OpenAI & Agronomy Data</p>
          </div>
        </div>
        <button 
          onClick={() => setMessages([messages[0]])}
          className="p-2 text-neutral-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title="Reset Chat"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 z-10 custom-scrollbar">
        {messages.map((msg, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center border ${
              msg.role === 'user' 
                ? 'bg-neutral-800 border-neutral-700 text-neutral-300' 
                : 'bg-green-500/20 border-green-500/30 text-green-400'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-green-600 text-white rounded-tr-sm'
                : 'bg-neutral-900/80 border border-white/5 text-neutral-200 rounded-tl-sm'
            }`}>
              {msg.content}
            </div>
          </motion.div>
        ))}
        
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3 max-w-[85%]">
            <div className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center bg-green-500/20 border border-green-500/30 text-green-400">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-neutral-900/80 border border-white/5 rounded-tl-sm flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-green-500/50 animate-bounce" style={{ animationDelay: '0ms' }} />
               <span className="w-2 h-2 rounded-full bg-green-500/50 animate-bounce" style={{ animationDelay: '150ms' }} />
               <span className="w-2 h-2 rounded-full bg-green-500/50 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10 bg-neutral-950/80 backdrop-blur-md z-10">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about crops, diseases, or farming..."
            className="w-full bg-neutral-900 border border-neutral-800 focus:border-green-500 rounded-full py-3.5 pl-5 pr-14 outline-none text-sm transition-colors text-white"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-2 bg-green-500 hover:bg-green-400 disabled:bg-neutral-800 disabled:text-neutral-600 text-neutral-950 rounded-full transition-colors"
          >
            {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
