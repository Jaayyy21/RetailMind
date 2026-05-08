import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { StatCard } from './components/StatCard';
import { EventFeed } from './features/analytics/EventFeed';
import { useWebSocket } from './hooks/useWebSocket';
import { AIInsightsPanel } from './features/ai/AIInsightsPanel';
import { 
  Users, LogIn, LogOut, Radio, Clock, 
  BarChart3, Activity, Zap, TrendingUp,
  Box, MousePointer2, AlertCircle
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [occupancy, setOccupancy] = useState(0);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({ entries: 0, exits: 0 });
  const [zoneOccupancy, setZoneOccupancy] = useState({ 1: 0, 2: 0, 3: 0 });
  const [dwellTimes, setDwellTimes] = useState([]);
  const [timelineData, setTimelineData] = useState([
    { time: '10:00', count: 12 }, { time: '11:00', count: 18 }, { time: '12:00', count: 25 },
    { time: '13:00', count: 32 }, { time: '14:00', count: 28 }, { time: '15:00', count: 45 }
  ]);

  const { data, status } = useWebSocket('1');

  useEffect(() => {
    if (data && data.message) {
      const msg = data.message;
      if (msg.event_type === 'OCCUPANCY_UPDATE') {
        setOccupancy(msg.metadata.count);
        // Append to chart data for real-time feel
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setTimelineData(prev => [...prev.slice(-15), { time: now, count: msg.metadata.count }]);
      }
      if (msg.event_type === 'ZONE_ENTER') {
        const zoneId = msg.zone_id;
        setZoneOccupancy(prev => ({ ...prev, [zoneId]: (prev[zoneId] || 0) + 1 }));
      }
      if (msg.event_type === 'ZONE_EXIT') {
        const zoneId = msg.zone_id;
        setZoneOccupancy(prev => ({ ...prev, [zoneId]: Math.max(0, (prev[zoneId] || 0) - 1) }));
        if (msg.metadata.dwell_time) setDwellTimes(prev => [msg.metadata.dwell_time, ...prev].slice(0, 20));
      }
      if (msg.event_type === 'ENTRY') setStats(prev => ({ ...prev, entries: prev.entries + 1 }));
      if (msg.event_type === 'EXIT') setStats(prev => ({ ...prev, exits: prev.exits + 1 }));

      // MAINTAIN STRICT 200-EVENT ROLLING BUFFER (NEWEST AT TOP)
      setEvents(prev => {
        const updated = [msg, ...prev];
        return updated.slice(0, 200);
      });
      }
      }, [data]);

  const avgDwell = dwellTimes.length > 0 
    ? (dwellTimes.reduce((a, b) => a + b, 0) / dwellTimes.length).toFixed(1) 
    : 0;

  return (
    <div className="dashboard-layout">
      {/* Background Mesh */}
      <div className="absolute inset-0 bg-mesh-gradient pointer-events-none opacity-40 z-0"></div>
      
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <TopBar status={status} />

      <main className="dashboard-main relative z-10 custom-scrollbar">
        {activeTab === 'overview' && (
          <div className="max-w-[1800px] mx-auto space-y-6 animate-fade-in pb-12">
            
            {/* Executive Summary Header */}
            <div className="flex justify-between items-end mb-4">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter glow-text">Command Center</h2>
                <p className="text-slate-400 text-xs font-medium mt-1 flex items-center uppercase tracking-widest">
                  <Zap size={12} className="mr-1.5 text-primary-400" />
                  Global Intelligence Node <span className="text-white ml-2 px-1.5 py-0.5 rounded bg-white/10 font-mono">NY-WTC-01</span>
                </p>
              </div>
              <div className="flex space-x-3">
                <button className="px-5 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:border-white/20 transition-all text-slate-300">Export</button>
                <button className="px-5 py-2 rounded-xl bg-primary-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary-500 transition-all">Sync</button>
              </div>
            </div>

            {/* KPI Grid (Top Row) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Real-time Occupancy" value={occupancy} icon={<Users />} color="text-primary-400" trend="+12.5%" />
              <StatCard title="Avg Dwell Time" value={`${avgDwell}s`} icon={<Clock />} color="text-cyan-400" trend="-4.2%" />
              <StatCard title="Total Entries" value={stats.entries} icon={<LogIn />} color="text-emerald-400" trend="+201" />
              <StatCard title="Total Exits" value={stats.exits} icon={<LogOut />} color="text-pink-400" trend="+185" />
            </div>

            {/* Main Content Matrix (Middle Rows) */}
            <div className="grid grid-cols-12 gap-6 h-auto lg:h-[450px]">
              
              {/* Timeline Chart (Col 1-8) */}
              <div className="col-span-12 lg:col-span-8 premium-card p-6 flex flex-col group">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center uppercase tracking-wider">
                      <Activity size={16} className="mr-2 text-primary-400" />
                      Traffic Density Timeline
                    </h3>
                  </div>
                  <div className="flex space-x-1 bg-black/40 p-1 rounded-lg border border-white/5">
                    {['1H', '6H', '24H'].map(t => (
                      <button key={t} className={`px-2.5 py-1 rounded-md text-[9px] font-black transition-all ${t === '1H' ? 'bg-primary-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>{t}</button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 w-full min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timelineData}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 600}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 600}} dx={-10} />
                      <Tooltip 
                        contentStyle={{backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px'}}
                        itemStyle={{color: '#818cf8', fontWeight: 'bold'}}
                      />
                      <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Real-time Stream (Col 9-12) */}
              <div className="col-span-12 lg:col-span-4 premium-card p-6 overflow-hidden">
                 <EventFeed events={events} />
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-12 gap-6 h-auto lg:h-[350px]">
               {/* Zone Stats */}
               <div className="col-span-12 lg:col-span-4 premium-card p-6 flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                     <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center">
                        <Box size={14} className="mr-2 text-cyan-400" />
                        Zone Distribution
                     </h3>
                     <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  </div>
                  <div className="flex-1 flex flex-col justify-between space-y-4">
                     <ZoneIndicator label="Portal A" value={zoneOccupancy[1]} color="bg-primary-500" />
                     <ZoneIndicator label="Central" value={zoneOccupancy[2]} color="bg-emerald-500" />
                     <ZoneIndicator label="Checkout" value={zoneOccupancy[3]} color="bg-pink-500" />
                  </div>
               </div>

               {/* AI Assistant */}
               <div className="col-span-12 lg:col-span-5 premium-card">
                  <AIInsightsPanel />
               </div>

               {/* Node Health */}
               <div className="col-span-12 lg:col-span-3 premium-card p-6 flex flex-col">
                  <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center">
                    <TrendingUp size={14} className="mr-2 text-orange-400" />
                    Node Health
                  </h3>
                  <div className="flex-1 flex flex-col justify-between space-y-4">
                     <HealthBar label="Inference Edge" status="Optimal" health={98} color="emerald" />
                     <HealthBar label="Socket Layer" status="Active" health={100} color="primary" />
                     <HealthBar label="AI Cognition" status="Standby" health={92} color="cyan" />
                     <HealthBar label="Storage Vol" status="Stable" health={85} color="orange" />
                  </div>
               </div>
            </div>

          </div>
        )}

        {activeTab !== 'overview' && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
             <AlertCircle size={48} className="text-slate-600 animate-pulse-slow" />
             <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-widest italic">Segment Locked</h3>
                <p className="text-xs text-slate-400 mt-2 font-mono">Module '{activeTab}' is initializing for Phase 4 deployment.</p>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}

const ZoneIndicator = ({ label, value, color }) => (
  <div className="bg-black/20 border border-white/5 p-4 rounded-2xl hover:border-white/10 transition-all text-center">
    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
    <div className="text-2xl font-black text-white glow-text">{value}</div>
    <div className="mt-3 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
       <div className={`${color} h-full w-full transition-all duration-1000 shadow-glow-primary`}></div>
    </div>
  </div>
);

const HealthBar = ({ label, status, health, color }) => {
  const colorMap = {
    emerald: 'bg-emerald-500 shadow-glow-emerald',
    primary: 'bg-primary-500 shadow-glow-primary',
    cyan: 'bg-accent-cyan shadow-glow-cyan',
    orange: 'bg-accent-orange shadow-glow-orange',
  };
  return (
    <div className="group">
       <div className="flex justify-between items-end mb-2">
          <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-200 transition-colors uppercase tracking-tight">{label}</span>
          <span className="text-[9px] font-mono text-slate-500">{status}</span>
       </div>
       <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
          <div className={`h-full ${colorMap[color]} transition-all duration-1000`} style={{width: `${health}%`}}></div>
       </div>
    </div>
  );
};

export default App;
