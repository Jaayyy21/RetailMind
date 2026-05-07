import React, { useState } from 'react';
import { Sparkles, Send, BrainCircuit, Loader2 } from 'lucide-react';

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
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center space-x-2">
          <BrainCircuit className="text-purple-600" size={20} />
          <h2 className="font-bold text-slate-800">Retail AI Assistant</h2>
        </div>
        <Sparkles className="text-amber-400" size={16} />
      </div>

      <div className="flex-1 p-4 overflow-y-auto min-h-[200px]">
        {result ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {result}
            </p>
            <button 
              onClick={() => {setResult(null); setQuery('');}}
              className="mt-4 text-[10px] font-bold text-purple-600 uppercase tracking-widest hover:text-purple-700"
            >
              New Analysis
            </button>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-3 bg-purple-50 rounded-full">
               <Sparkles className="text-purple-400" size={32} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">Ask about your store</p>
              <p className="text-xs text-slate-500 max-w-[200px] mx-auto mt-1">
                "Which zone is busiest?" or "What is the average dwell time in the checkout?"
              </p>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleQuery} className="p-4 bg-slate-50 border-t border-slate-100">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your query..."
            className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm"
          />
          <button 
            disabled={loading || !query.trim()}
            type="submit"
            className="absolute right-2 top-2 p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </form>
    </div>
  );
};
