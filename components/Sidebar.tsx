
import React from 'react';

interface SidebarProps {
  isOpen: boolean;
  activeView: string;
  setActiveView: (view: string) => void;
  creatorName: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, creatorName }) => {
  const navItems = [
    { id: 'chat', label: 'Chat', icon: 'fa-message' },
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-house' },
    { id: 'settings', label: 'Settings', icon: 'fa-gear' },
  ];

  return (
    <aside className="w-64 border-r border-zinc-800 bg-[#0c0c0e] flex flex-col shrink-0">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shadow-lg">
            <i className="fa-solid fa-bolt text-zinc-900 text-sm"></i>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">NEXT AI</h1>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeView === item.id 
                  ? 'bg-zinc-800 text-zinc-100' 
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
            >
              <i className={`fa-solid ${item.icon} w-5 text-center text-xs opacity-70`}></i>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-zinc-800/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <i className="fa-solid fa-user text-zinc-500 text-[10px]"></i>
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider leading-none mb-1">Creator</p>
            <p className="text-xs font-semibold truncate text-zinc-300">{creatorName}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
