
import React, { useState } from 'react';

interface SettingsProps {
  creatorName: string;
  onUpdateName: (name: string) => void;
  onClearHistory: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ creatorName, onUpdateName, onClearHistory }) => {
  const [tempName, setTempName] = useState(creatorName);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onUpdateName(tempName);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-8 h-full overflow-y-auto max-w-2xl mx-auto space-y-12 pb-24">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-zinc-500 mt-2">Personalize your NEXT Assistant experience.</p>
      </header>

      <section>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <i className="fa-solid fa-user-pen text-cyan-400"></i>
          User Profile
        </h2>
        
        <div className="glass p-8 rounded-3xl border border-zinc-800/50 space-y-6">
          <div>
            <label className="block text-xs mono text-zinc-500 uppercase tracking-widest mb-3">Your Name</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 outline-none text-zinc-200 transition-all shadow-inner"
                placeholder="How should NEXT address you?"
              />
              <button
                onClick={handleSave}
                className="px-8 py-3.5 bg-cyan-600 text-white rounded-2xl text-sm font-bold hover:bg-cyan-500 transition-all shadow-lg shadow-cyan-950/20 active:scale-95 shrink-0"
              >
                {saved ? 'UPDATED' : 'UPDATE'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <i className="fa-solid fa-database text-red-400"></i>
          Data Management
        </h2>
        <div className="glass p-8 rounded-3xl border border-zinc-800/50 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-zinc-200">Chat History</h4>
              <p className="text-xs text-zinc-500">Wipe all stored conversations and images from this device.</p>
            </div>
            <button
              onClick={() => {
                if(confirm("Are you sure you want to delete all chat history?")) {
                  onClearHistory();
                }
              }}
              className="px-5 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-all active:scale-95"
            >
              CLEAR ALL
            </button>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <i className="fa-solid fa-sliders text-zinc-400"></i>
          Assistant Behavior
        </h2>
        
        <div className="space-y-4">
          {[
            { label: 'Response Creativity', val: 'Balanced', icon: 'fa-wand-magic-sparkles' },
            { label: 'Thinking Depth', val: 'Advanced', icon: 'fa-brain' },
            { label: 'Image Engine', val: 'Flash 2.5', icon: 'fa-image' },
          ].map((s, i) => (
            <div key={i} className="glass p-6 rounded-3xl border border-zinc-800/50 flex items-center justify-between group hover:border-zinc-700/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-cyan-400 transition-colors">
                  <i className={`fa-solid ${s.icon}`}></i>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-200">{s.label}</h4>
                  <p className="text-xs text-zinc-500">Auto-tuned for optimal performance.</p>
                </div>
              </div>
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                {s.val}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="pt-12 border-t border-zinc-800 flex justify-between items-center text-zinc-600 mono text-[9px] uppercase tracking-[0.3em]">
        <span>NEXT Assistant</span>
        <span>Version 4.2.0</span>
        <span>Built by Idhant</span>
      </div>
    </div>
  );
};
