import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const StatCard = ({ title, value, icon, color, trend }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 500);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <motion.div 
      whileHover={{ scale: 1.02, translateY: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className="glass-card p-6 relative group overflow-hidden"
    >
      <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-[50px] opacity-10 group-hover:opacity-30 transition-all duration-700 ${color.replace('text-', 'bg-')}`}></div>
      
      <div className="flex justify-between items-start relative z-10">
        <div className="space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
          <div className="flex items-baseline space-x-2">
             <AnimatePresence mode="wait">
               <motion.h3 
                 key={value}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 transition={{ duration: 0.2 }}
                 className={`text-4xl font-black text-white tracking-tighter glow-text`}
               >
                 {value}
               </motion.h3>
             </AnimatePresence>
          </div>
          {trend && (
             <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black tracking-wider ${trend.startsWith('+') ? 'bg-accent-emerald/10 text-accent-emerald' : 'bg-accent-pink/10 text-accent-pink'}`}>
               {trend}
             </span>
          )}
        </div>
        <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${color}`}>
          {React.cloneElement(icon, { size: 24, strokeWidth: 2.5 })}
        </div>
      </div>
    </motion.div>
  );
};
