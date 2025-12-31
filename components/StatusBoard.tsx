
import React, { useState, useEffect } from 'react';

interface StatusBoardProps {
  creatorName: string;
}

export const StatusBoard: React.FC<StatusBoardProps> = ({ creatorName }) => {
  const [cpuUsage, setCpuUsage] = useState(8);
  const [memoryUsage, setMemoryUsage] = useState(1.4);

  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(Math.floor(Math.random() * 15) + 5);
      setMemoryUsage(parseFloat((Math.random() * 0.5 + 1.2).toFixed(1)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 h-full overflow-y-auto max-w-6xl mx-auto space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Core Identity */}
        <div className="glass p-8 rounded-3xl border border-zinc-800/50 col-span-1 md:col-span-2">
          <h2 className="text-zinc-500 mono text-[10px] mb-6 uppercase tracking-[0.2em]">Assistant Profile</h2>
          <div className="flex items-center gap-8">
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 flex items-center justify-center relative group overflow-hidden">
               <div className="absolute inset-0 bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors"></div>
               <i className="fa-solid fa-microchip text-5xl text-cyan-400 z-10"></i>
            </div>
            <div>
              <h3 className="text-4xl font-bold tracking-tight">NEXT Assistant</h3>
              <p className="text-zinc-400 text-lg mb-4">Personal AI for {creatorName}</p>
              <div className="flex gap-3">
                <span className="bg-emerald-950/30 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-bold border border-emerald-900/50">ONLINE</span>
                <span className="bg-zinc-800/60 text-zinc-300 px-3 py-1 rounded-full text-[10px] font-bold border border-zinc-700">VERSION 4.2</span>
              </div>
            </div>
          </div>
        </div>

        {/* Load Stats */}
        <div className="glass p-8 rounded-3xl border border-zinc-800/50">
          <h2 className="text-zinc-500 mono text-[10px] mb-6 uppercase tracking-[0.2em]">Performance</h2>
          <div className="space-y-8">
            <div>
              <div className="flex justify-between mb-3">
                <span className="text-sm text-zinc-400 font-medium">Thought Process</span>
                <span className="text-sm mono text-cyan-400">{cpuUsage}%</span>
              </div>
              <div className="h-2 w-full bg-zinc-800/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(6,182,212,0.5)]" 
                  style={{ width: `${cpuUsage}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-3">
                <span className="text-sm text-zinc-400 font-medium">Active Memory</span>
                <span className="text-sm mono text-blue-400">{memoryUsage} GB</span>
              </div>
              <div className="h-2 w-full bg-zinc-800/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                  style={{ width: `${(memoryUsage/4) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Origin info */}
        <div className="glass p-8 rounded-3xl border border-zinc-800/50">
          <h2 className="text-zinc-500 mono text-[10px] mb-6 uppercase tracking-[0.2em]">System Feed</h2>
          <div className="space-y-4 mono text-xs">
            <div className="flex gap-4 items-start">
              <span className="text-zinc-600 shrink-0">12:00</span>
              <span className="text-zinc-400">NEXT Assistant initialized successfully.</span>
            </div>
            <div className="flex gap-4 items-start">
              <span className="text-zinc-600 shrink-0">12:05</span>
              <span className="text-zinc-400">Connecting to multimodal processing nodes.</span>
            </div>
            <div className="flex gap-4 items-start">
              <span className="text-zinc-600 shrink-0">12:10</span>
              <span className="text-cyan-400 font-medium">Ready for input from {creatorName}.</span>
            </div>
          </div>
        </div>

        {/* Capabilities */}
        <div className="glass p-8 rounded-3xl border border-zinc-800/50">
          <h2 className="text-zinc-500 mono text-[10px] mb-6 uppercase tracking-[0.2em]">Active Capabilities</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Visual Input', active: true, icon: 'fa-eye' },
              { label: 'Creative Image Gen', active: true, icon: 'fa-palette' },
              { label: 'Code Analysis', active: true, icon: 'fa-code' },
              { label: 'Web Research', active: false, icon: 'fa-globe' },
            ].map((p, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/60">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${p.active ? 'text-cyan-400 bg-cyan-950/20' : 'text-zinc-600 bg-zinc-800/50'}`}>
                  <i className={`fa-solid ${p.icon} text-sm`}></i>
                </div>
                <div className="flex-1">
                  <span className="text-[13px] text-zinc-300 font-medium block leading-tight">{p.label}</span>
                  <span className={`text-[10px] font-bold ${p.active ? 'text-emerald-500' : 'text-zinc-600'}`}>{p.active ? 'ENABLED' : 'OFFLINE'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
