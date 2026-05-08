import React from 'react';
import { 
  Users, Activity, LayoutDashboard, Camera, 
  BrainCircuit, ShieldAlert, Settings, 
  BarChart3, MousePointer2, Zap, Search, Bell
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'overview', label: 'Command Center', icon: LayoutDashboard, category: 'Analytics' },
    { id: 'live', label: 'Edge Intelligence', icon: Zap, category: 'Analytics' },
    { id: 'spatial', label: 'Spatial Flow', icon: BarChart3, category: 'Analytics' },
    { id: 'ai', label: 'AI Reasoning', icon: BrainCircuit, category: 'Cognitive' },
    { id: 'nodes', label: 'Edge Nodes', icon: Camera, category: 'Infrastructure' },
    { id: 'alerts', label: 'Security & Alerts', icon: ShieldAlert, category: 'Infrastructure' },
  ];

  return (
    <aside className="dashboard-sidebar bg-slate-950/50 backdrop-blur-2xl border-r border-white/5 flex flex-col relative z-50">
      {/* Branding */}
      <div className="h-[72px] flex items-center px-6 space-x-3 border-b border-white/5">
        <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center shadow-glow-primary transform -rotate-6">
          <Zap size={18} className="text-white fill-white" />
        </div>
        <div>
          <h1 className="text-lg font-black text-white tracking-tight leading-none">RetailMind</h1>
          <p className="text-[9px] text-primary-400 font-bold tracking-[0.2em] uppercase mt-0.5">Enterprise OS</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-6 space-y-8 overflow-y-auto no-scrollbar">
        {['Analytics', 'Cognitive', 'Infrastructure'].map((cat) => (
          <div key={cat} className="space-y-1.5">
            <p className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">{cat}</p>
            <nav className="space-y-0.5">
              {tabs.filter(t => t.category === cat).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full group flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative ${
                    activeTab === tab.id 
                    ? 'bg-primary-500/10 text-primary-400 font-bold' 
                    : 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-200 font-medium'
                  }`}
                >
                  {activeTab === tab.id && (
                    <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary-500 rounded-r-full shadow-glow-primary"></div>
                  )}
                  <tab.icon size={18} className={`${activeTab === tab.id ? 'text-primary-400' : 'group-hover:scale-110 transition-transform'}`} />
                  <span className="text-sm">{tab.label}</span>
                  {activeTab === tab.id && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></div>
                  )}
                </button>
              ))}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer Profile */}
      <div className="p-4 border-t border-white/5 bg-white/[0.01]">
        <div className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/[0.03] cursor-pointer transition-colors">
          <div className="w-8 h-8 rounded-lg bg-surface-200 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
             <img src="https://ui-avatars.com/api/?name=Admin&background=6366f1&color=fff" alt="Avatar" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate leading-none">System Admin</p>
            <p className="text-[10px] text-slate-500 font-mono mt-1">L3 Clearance</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
