
import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { StatusBoard } from './components/StatusBoard';
import { Settings } from './components/Settings';
import { Message, MessageRole, AppState } from './types';
import { gemini } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    isSidebarOpen: true,
    activeView: 'chat',
    creatorName: 'Idhant'
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem('creatorName') || 'Idhant';
    setAppState(prev => ({ ...prev, creatorName: savedName }));
    
    // Updated welcome message to be more natural and friendly
    const welcome: Message = {
      id: 'welcome',
      role: MessageRole.ASSISTANT,
      content: `Hi, how can I help you today?`,
      timestamp: Date.now()
    };
    setMessages([welcome]);
  }, []);

  const handleSendMessage = useCallback(async (text: string, image?: string) => {
    if (!text.trim() && !image) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      content: text,
      timestamp: Date.now(),
      image
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await gemini.generateResponse(
        [...messages, userMsg],
        appState.creatorName,
        image
      );

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.ASSISTANT,
        content: response.text || "",
        image: response.image,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  }, [messages, appState.creatorName]);

  const updateCreatorName = (name: string) => {
    setAppState(prev => ({ ...prev, creatorName: name }));
    localStorage.setItem('creatorName', name);
  };

  return (
    <div className="flex h-screen w-full bg-[#09090b] text-zinc-100 selection:bg-cyan-500/30 overflow-hidden relative">
      {/* Background Layer: "NEXT" Watermark - Adjusted size to 24vw */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
        <h1 className="text-[24vw] font-[900] text-white/[0.025] tracking-[-0.05em] leading-none uppercase">
          NEXT
        </h1>
      </div>

      {/* Snowfall Layer */}
      <div className="snow-container pointer-events-none z-[1]">
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="snowflake" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 10}s`,
            opacity: Math.random() * 0.6,
            fontSize: `${10 + Math.random() * 15}px`
          }}>
            •
          </div>
        ))}
      </div>

      <Sidebar 
        isOpen={appState.isSidebarOpen} 
        activeView={appState.activeView}
        setActiveView={(view) => setAppState(prev => ({ ...prev, activeView: view as any }))}
        creatorName={appState.creatorName}
      />
      
      <main className="flex-1 flex flex-col relative overflow-hidden z-10 bg-transparent">
        {/* Header - Cleaned up to feel more like a standard AI tool */}
        <header className="h-14 border-b border-zinc-800/50 bg-[#09090b]/30 backdrop-blur-sm flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
            <span className="text-sm font-semibold tracking-tight text-zinc-300">
              NEXT AI
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-zinc-500">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></span>
              Connected
            </span>
          </div>
        </header>

        {/* Dynamic Views */}
        <div className="flex-1 overflow-hidden relative">
          {appState.activeView === 'chat' && (
            <ChatArea 
              messages={messages} 
              onSendMessage={handleSendMessage}
              isTyping={isTyping}
            />
          )}
          {appState.activeView === 'dashboard' && <StatusBoard creatorName={appState.creatorName} />}
          {appState.activeView === 'settings' && (
            <Settings 
              creatorName={appState.creatorName} 
              onUpdateName={updateCreatorName} 
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
