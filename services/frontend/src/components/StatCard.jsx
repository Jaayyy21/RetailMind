import React from 'react';

export const StatCard = ({ title, value, icon, color, trend }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
      <h3 className="text-3xl font-bold mt-2 text-slate-900">{value}</h3>
      {trend && (
        <p className={`text-xs mt-2 font-medium ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
          {trend} <span className="text-slate-400 font-normal ml-1 text-[10px]">vs last hour</span>
        </p>
      )}
    </div>
    <div className={`p-3 rounded-lg ${color}`}>
      {React.cloneElement(icon, { size: 24, className: 'text-white' })}
    </div>
  </div>
);
