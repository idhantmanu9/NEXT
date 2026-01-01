
import React from 'react';
import { ChatSession } from '../types';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  creatorName: string;
  onNewChat: () => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onDeleteSession: (e: React.MouseEvent, id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  setActiveView, 
  creatorName, 
  onNewChat,
  sessions,
  currentSessionId,
  onSelectSession,
  onDeleteSession
}) => {
  const navItems = [
    { id: 'chat', label: 'New Session', icon: 'fa-plus', action: onNewChat },
    { id: 'dashboard', label: 'Status Board', icon: 'fa-house', view: 'dashboard' },
    { id: 'settings', label: 'Settings', icon: 'fa-gear', view: 'settings' },
  ];

  return (
    <aside className="w-72 border-r border-zinc-800 bg-[#0c0c0e]/80 backdrop-blur-xl flex flex-col shrink-0 z-20">
      <div className="p-6 pb-2">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shadow-lg">
            <i className="fa-solid fa-bolt text-zinc-900 text-sm"></i>
          </div>
          <h1 className="text-lg font-bold tracking-tight">NEXT AI</h1>
        </div>

        <nav className="space-y-1 mb-8">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => item.view ? setActiveView(item.view) : item.action?.()}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeView === item.view 
                  ? 'bg-zinc-800 text-zinc-100' 
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
            >
              <i className={`fa-solid ${item.icon} w-5 text-center text-xs opacity-70`}></i>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center justify-between mb-4 px-2">
          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">History</span>
          <span className="text-[10px] text-zinc-700">{sessions.length} chats</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 space-y-1 scrollbar-hide">
        {sessions.map(session => (
          <div
            key={session.id}
            onClick={() => onSelectSession(session.id)}
            className={`group relative w-full flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all ${
              currentSessionId === session.id 
                ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400' 
                : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
            }`}
          >
            <i className="fa-regular fa-message text-[10px] opacity-50"></i>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-medium truncate pr-6">{session.title}</p>
            </div>
            
            <button 
              onClick={(e) => onDeleteSession(e, session.id)}
              className="absolute right-2 opacity-0 group-hover:opacity-100 p-1.5 text-zinc-600 hover:text-red-400 transition-all"
            >
              <i className="fa-solid fa-trash-can text-[10px]"></i>
            </button>
          </div>
        ))}
        {sessions.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-xs text-zinc-600 italic">No stored sessions</p>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-zinc-800/50">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <i className="fa-solid fa-user text-cyan-500 text-[10px]"></i>
          </div>
          <div className="overflow-hidden">
            <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider leading-none mb-1">Creator</p>
            <p className="text-xs font-semibold truncate text-zinc-300">{creatorName}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
