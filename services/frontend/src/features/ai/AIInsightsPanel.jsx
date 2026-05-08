import React, { useState } from 'react';
import { Sparkles, Send, BrainCircuit, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AIInsightsPanel = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleQuery = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8001/api/v1/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query, store_id: 1 }),
      });
      const data = await response.json();
      setResult(data.answer);
    } catch (err) {
      setResult("Failed to reach the AI Intelligence Service. Ensure ai_service is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card flex flex-col h-full relative group">
      {/* Background glow */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] group-hover:bg-primary-500/20 transition-all duration-1000 pointer-events-none"></div>

      <div className="p-6 border-b border-white/5 flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-primary-500/20 border border-primary-500/30 shadow-glow-primary">
            <BrainCircuit className="text-primary-400" size={18} />
          </div>
          <div>
            <h2 className="font-black text-white text-sm uppercase tracking-widest">AI Cognition</h2>
            <p className="text-[9px] text-slate-500 font-mono mt-0.5">Gemini Pro Integration</p>
          </div>
        </div>
        <div className="px-2 py-1 rounded bg-white/5 border border-white/10 flex items-center space-x-1.5">
          <Sparkles className="text-accent-cyan" size={10} />
          <span className="text-[9px] font-black text-accent-cyan uppercase tracking-widest">Active</span>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar relative z-10 flex flex-col">
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div 
              key="result"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-5 shadow-inner">
                 <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                   {result}
                 </p>
              </div>
              <button 
                onClick={() => {setResult(null); setQuery('');}}
                className="mt-4 self-end text-[10px] font-black text-primary-400 uppercase tracking-widest hover:text-primary-300 transition-colors"
              >
                Clear Buffer
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center text-center space-y-5 opacity-60 hover:opacity-100 transition-opacity"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary-500/20 blur-2xl rounded-full animate-pulse-fast"></div>
                <div className="p-5 bg-white/5 border border-white/10 rounded-full relative z-10">
                   <Sparkles className="text-primary-400" size={28} />
                </div>
              </div>
              <div>
                <p className="text-sm font-black text-white uppercase tracking-widest">Await Query</p>
                <p className="text-xs text-slate-400 max-w-[240px] mx-auto mt-2 leading-relaxed">
                  Query the spatial engine via natural language. E.g., "Which zone is currently the bottleneck?"
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <form onSubmit={handleQuery} className="p-4 bg-black/20 border-t border-white/5 relative z-10">
        <div className="relative flex items-center group/input">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Initialize cognitive query..."
            className="w-full pl-5 pr-14 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-inner font-mono"
          />
          <button 
            disabled={loading || !query.trim()}
            type="submit"
            className="absolute right-2 p-2.5 bg-primary-500/20 text-primary-400 rounded-xl hover:bg-primary-500 hover:text-white disabled:opacity-30 disabled:hover:bg-primary-500/20 disabled:hover:text-primary-400 transition-colors shadow-glow-primary"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </form>
    </div>
  );
};
