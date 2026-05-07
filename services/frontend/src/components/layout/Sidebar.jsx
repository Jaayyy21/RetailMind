import React from 'react';
import { Users, Activity, Signal, LayoutDashboard, Camera as CameraIcon, BarChart3 } from 'lucide-react';

export const Sidebar = () => (
  <div className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0">
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-400">RetailMind</h1>
      <p className="text-xs text-slate-400">Smart Intelligence v1.0</p>
    </div>
    
    <nav className="flex-1 px-4 space-y-2">
      <NavItem icon={<LayoutDashboard size={20}/>} label="Dashboard" active />
      <NavItem icon={<BarChart3 size={20}/>} label="Analytics" />
      <NavItem icon={<CameraIcon size={20}/>} label="Cameras" />
      <NavItem icon={<Activity size={20}/>} label="Activity Log" />
    </nav>

    <div className="p-4 border-t border-slate-800">
      <div className="flex items-center space-x-2 text-sm text-slate-400">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        <span>System Online</span>
      </div>
    </div>
  </div>
);

const NavItem = ({ icon, label, active = false }) => (
  <div className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${active ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}>
    {icon}
    <span className="font-medium">{label}</span>
  </div>
);
