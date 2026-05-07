import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { StatCard } from './components/StatCard';
import { EventFeed } from './features/analytics/EventFeed';
import { useWebSocket } from './hooks/useWebSocket';
import { Users, LogIn, LogOut, Radio, Clock, BarChart3 } from 'lucide-react';
import { AIInsightsPanel } from './features/ai/AIInsightsPanel';

function App() {
  const [occupancy, setOccupancy] = useState(0);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({ entries: 0, exits: 0 });
  const [zoneOccupancy, setZoneOccupancy] = useState({ 1: 0, 2: 0, 3: 0 });
  const [dwellTimes, setDwellTimes] = useState([]);

  // Connect to global store analytics (store_id: 1)
  const { data, status } = useWebSocket('1');

  useEffect(() => {
    if (data && data.message) {
      const msg = data.message;
      
      // Update global occupancy
      if (msg.event_type === 'OCCUPANCY_UPDATE') {
        setOccupancy(msg.metadata.count);
      }

      // Track Zone Transitions
      if (msg.event_type === 'ZONE_ENTER') {
        const zoneId = msg.zone_id;
        setZoneOccupancy(prev => ({ ...prev, [zoneId]: (prev[zoneId] || 0) + 1 }));
      }
      if (msg.event_type === 'ZONE_EXIT') {
        const zoneId = msg.zone_id;
        setZoneOccupancy(prev => ({ ...prev, [zoneId]: Math.max(0, (prev[zoneId] || 0) - 1) }));
        
        if (msg.metadata.dwell_time) {
          setDwellTimes(prev => [msg.metadata.dwell_time, ...prev].slice(0, 20));
        }
      }

      // Update local traffic stats
      if (msg.event_type === 'ENTRY') {
        setStats(prev => ({ ...prev, entries: prev.entries + 1 }));
      }
      if (msg.event_type === 'EXIT') {
        setStats(prev => ({ ...prev, exits: prev.exits + 1 }));
      }

      // Add to event feed
      setEvents(prev => [msg, ...prev].slice(0, 50));
    }
  }, [data]);

  const avgDwell = dwellTimes.length > 0 
    ? (dwellTimes.reduce((a, b) => a + b, 0) / dwellTimes.length).toFixed(1) 
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-10 max-w-[1600px]">
        {/* Top Navigation / Header */}
        <header className="flex justify-between items-center mb-10 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center space-x-2 text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] mb-1">
               <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
               <span>Operational Intelligence</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Main Flagship Store</h1>
            <p className="text-slate-500 text-sm mt-1">Monitoring live traffic and behavioral patterns across 3 zones.</p>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-right border-r border-slate-200 pr-6 hidden sm:block">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Local Time</p>
               <p className="text-sm font-bold text-slate-700">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            </div>
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl shadow-sm border ${
              status === 'connected' ? 'bg-white border-green-100 text-green-700' : 'bg-white border-red-100 text-red-700'
            }`}>
              <Radio size={16} className={status === 'connected' ? 'animate-pulse' : ''} />
              <span className="text-xs font-bold uppercase tracking-wider">{status === 'connected' ? 'Live Stream' : 'Disconnected'}</span>
            </div>
          </div>
        </header>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <StatCard 
            title="Current Occupancy" 
            value={occupancy} 
            icon={<Users />} 
            color="bg-blue-600"
          />
          <StatCard 
            title="Avg. Dwell Time" 
            value={`${avgDwell}s`} 
            icon={<Clock size={24}/>} 
            color="bg-purple-600"
          />
          <StatCard 
            title="Total Entries" 
            value={stats.entries} 
            icon={<LogIn />} 
            color="bg-green-500"
          />
          <StatCard 
            title="Total Exits" 
            value={stats.exits} 
            icon={<LogOut />} 
            color="bg-orange-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
               <h3 className="font-bold text-slate-800 mb-6 flex items-center">
                 <Radio size={18} className="mr-2 text-blue-500" />
                 Real-time Zone Occupancy
               </h3>
               <div className="grid grid-cols-3 gap-6">
                  <ZoneStat label="Entrance" value={zoneOccupancy[1]} total={occupancy} color="bg-blue-500" />
                  <ZoneStat label="Main Aisle" value={zoneOccupancy[2]} total={occupancy} color="bg-green-500" />
                  <ZoneStat label="Checkout" value={zoneOccupancy[3]} total={occupancy} color="bg-orange-500" />
               </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-64 flex flex-col items-center justify-center text-slate-400 text-center">
               <BarChart3 size={48} className="opacity-10 mb-4" />
               <p className="font-medium text-slate-600">Behavioral Heatmap</p>
               <span className="text-[10px] uppercase tracking-widest mt-2">X/Y Distribution Layer (Phase 2.5)</span>
               <div className="mt-6 flex space-x-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
                  <span className="w-3 h-3 bg-yellow-500 rounded-full animate-ping delay-75"></span>
                  <span className="w-3 h-3 bg-green-500 rounded-full animate-ping delay-150"></span>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <AIInsightsPanel />
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4 uppercase tracking-tighter text-xs">System Health</h3>
                <div className="space-y-3">
                  <HealthRow label="CV Pipeline" status="online" />
                  <HealthRow label="Spatial Engine" status="online" />
                  <HealthRow label="AI Intelligence" status="online" />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <EventFeed events={events} />
          </div>
        </div>
      </main>
    </div>
  );
}

const ZoneStat = ({ label, value, total, color }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">{label}</p>
      <div className="flex items-baseline space-x-2">
        <h4 className="text-2xl font-bold text-slate-900">{value}</h4>
        <span className="text-xs text-slate-400">people</span>
      </div>
      <div className="mt-3">
        <div className="flex justify-between text-[10px] mb-1">
          <span className="text-slate-400">Share</span>
          <span className="text-slate-600 font-bold">{percentage.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <div className={`${color} h-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
        </div>
      </div>
    </div>
  );
};

const HealthRow = ({ label, status }) => (
  <div className="flex justify-between items-center p-2 bg-slate-50 rounded border border-slate-100">
    <span className="text-[10px] text-slate-500 uppercase font-bold">{label}</span>
    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-black uppercase tracking-tighter">{status}</span>
  </div>
);

export default App;
