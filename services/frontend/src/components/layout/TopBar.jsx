import React from 'react';
import { Search, Bell, Command, Radio, Globe, ShieldCheck } from 'lucide-react';

export const TopBar = ({ status }) => {
  return (
    <header className="dashboard-header glass-header flex items-center justify-between px-8 z-40">
      <div className="flex items-center space-x-6 flex-1">
        <div className="flex items-center space-x-3 bg-white/[0.03] border border-white/5 px-4 py-2 rounded-2xl w-full max-w-md group focus-within:border-primary-500/50 transition-all duration-300">
          <Search size={18} className="text-slate-500 group-focus-within:text-primary-400" />
          <input 
            type="text" 
            placeholder="Query edge nodes or system logs..." 
            className="bg-transparent border-none outline-none text-sm text-white placeholder-slate-500 w-full"
          />
          <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-slate-500 font-mono uppercase tracking-tighter">
            <Command size={10} />
            <span>K</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="hidden lg:flex items-center space-x-4 pr-6 border-r border-white/5">
           <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Security Protocol</span>
              <span className="text-xs font-bold text-emerald-400 mt-1 flex items-center">
                 <ShieldCheck size={12} className="mr-1" />
                 L3 Protected
              </span>
           </div>
           <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Regional Uplink</span>
              <span className="text-xs font-bold text-primary-400 mt-1 flex items-center">
                 <Globe size={12} className="mr-1" />
                 US-EAST-1
              </span>
           </div>
        </div>

        <div className="flex items-center space-x-4">
           <div className="relative p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] cursor-pointer transition-colors group">
              <Bell size={20} className="text-slate-400 group-hover:text-white" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-rose-500 ring-4 ring-background animate-pulse"></span>
           </div>
           
           <div className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl border transition-all duration-500 ${
              status === 'connected' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/5' 
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400 shadow-lg shadow-rose-500/5'
            }`}>
              <div className="relative flex items-center">
                <Radio size={16} className={status === 'connected' ? 'animate-pulse' : ''} />
                {status === 'connected' && (
                   <span className="absolute -inset-1 bg-emerald-400/20 blur-md rounded-full"></span>
                )}
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.1em]">{status === 'connected' ? 'Realtime Link Active' : 'Uplink Severed'}</span>
           </div>
        </div>
      </div>
    </header>
  );
};
