import React from 'react';
import { Clock } from 'lucide-react';

export const EventFeed = ({ events }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-100 h-[500px] flex flex-col">
    <div className="p-4 border-b border-slate-100 flex justify-between items-center">
      <h2 className="font-bold text-slate-800">Live Activity Feed</h2>
      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase tracking-tighter">Real-time</span>
    </div>
    
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {events.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
          <Clock size={40} className="opacity-20" />
          <p className="text-sm">Waiting for events...</p>
        </div>
      ) : (
        events.map((event, idx) => (
          <div key={event.id || idx} className="flex space-x-3 border-l-2 border-blue-500 pl-3 py-1">
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <p className="text-sm font-semibold text-slate-800">{event.event_type.replace('_', ' ')}</p>
                <span className="text-[10px] text-slate-400">{new Date(event.timestamp).toLocaleTimeString()}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Object ID: {event.object_id}</p>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);
