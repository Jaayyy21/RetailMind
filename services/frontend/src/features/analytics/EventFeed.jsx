import React, { memo } from 'react';
import { Activity, Clock, ArrowRight, ArrowLeft, Maximize } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const EventFeed = ({ events }) => {
  return (
    <div className="h-full flex flex-col relative group">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center">
          <Activity size={16} className="mr-2 text-primary-400" />
          Event Telemetry
        </h3>
        <div className="flex items-center space-x-1.5 px-2 py-1 rounded bg-accent-emerald/10 border border-accent-emerald/20">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse"></span>
          <span className="text-[9px] text-accent-emerald font-black uppercase tracking-[0.2em]">Live Stream</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-2 custom-scrollbar pr-2 relative no-scrollbar">
        {/* Top fade to emphasize newest items */}
        <div className="sticky top-0 left-0 right-0 h-4 bg-gradient-to-b from-[#020617] to-transparent z-10 pointer-events-none"></div>

        {events.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-3">
            <Clock size={32} strokeWidth={1} />
            <p className="text-[10px] uppercase tracking-[0.2em] font-black">Connecting to Edge Data...</p>
          </div>
        ) : (
          <div className="flex flex-col space-y-2">
            <AnimatePresence initial={false}>
              {events.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: -20, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto', marginBottom: 8 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30, opacity: { duration: 0.2 } }}
                >
                  <EventRow event={event} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#020617] to-transparent pointer-events-none z-10"></div>
      </div>
    </div>
  );
};

const EventRow = memo(({ event }) => {
  const isEntry = event.event_type.includes('ENTER') || event.event_type === 'ENTRY';
  const isExit = event.event_type.includes('EXIT');

  let Icon = Maximize;
  let color = 'text-primary-400';
  let bg = 'bg-primary-500/10';
  let border = 'border-primary-500/20';

  if (isEntry) {
    Icon = ArrowRight;
    color = 'text-accent-emerald'; bg = 'bg-accent-emerald/10'; border = 'border-accent-emerald/20';
  } else if (isExit) {
    Icon = ArrowLeft;
    color = 'text-accent-pink'; bg = 'bg-accent-pink/10'; border = 'border-accent-pink/20';
  }

  const time = new Date(event.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' });

  return (
    <div className={`p-3 rounded-2xl border ${border} ${bg} flex items-start space-x-3 hover:bg-white/5 transition-colors group/row w-full`}>
      <div className={`mt-0.5 ${color} p-1.5 bg-background/50 rounded-lg border ${border} flex-shrink-0 shadow-sm`}>
        <Icon size={12} strokeWidth={3} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1">
          <p className={`text-[11px] font-black ${color} uppercase tracking-wider truncate`}>
            {event.event_type.replace(/_/g, ' ')}
          </p>
          <span className="text-[9px] text-slate-500 font-mono shrink-0 ml-2 font-bold">{time}</span>
        </div>
        <div className="text-[10px] text-slate-400 flex justify-between items-center font-medium">
          <span className="truncate tracking-tight">NODE_ID: <span className="font-mono text-slate-300 font-black">{event.object_id}</span></span>
          {event.metadata?.dwell_time && (
            <span className="text-accent-purple font-black bg-accent-purple/10 px-1.5 py-0.5 rounded border border-accent-purple/20 ml-2">
              {event.metadata.dwell_time.toFixed(1)}s
            </span>
          )}
        </div>
      </div>
    </div>
  );
});
