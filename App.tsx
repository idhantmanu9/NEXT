
import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { StatusBoard } from './components/StatusBoard';
import { Settings } from './components/Settings';
import { Message, MessageRole, AppState, ChatSession } from './types';
import { gemini } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    isSidebarOpen: true,
    activeView: 'chat',
    creatorName: 'Idhant'
  });

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Initial Load
  useEffect(() => {
    const savedName = localStorage.getItem('creatorName') || 'Idhant';
    const savedSessions = localStorage.getItem('next_sessions');
    const lastSessionId = localStorage.getItem('next_active_session_id');

    setAppState(prev => ({ ...prev, creatorName: savedName }));
    
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        setSessions(parsed);
        if (lastSessionId && parsed.find((s: ChatSession) => s.id === lastSessionId)) {
          setCurrentSessionId(lastSessionId);
        } else if (parsed.length > 0) {
          setCurrentSessionId(parsed[0].id);
        }
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // Sync sessions to localStorage
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('next_sessions', JSON.stringify(sessions));
    }
    if (currentSessionId) {
      localStorage.setItem('next_active_session_id', currentSessionId);
    }
  }, [sessions, currentSessionId]);

  const currentSession = sessions.find(s => s.id === currentSessionId);

  const handleSendMessage = useCallback(async (text: string, image?: string, video?: string) => {
    if (!text.trim() && !image && !video) return;

    let sessionId = currentSessionId;
    let updatedSessions = [...sessions];

    // Create session if none exists
    if (!sessionId) {
      sessionId = Date.now().toString();
      const newSession: ChatSession = {
        id: sessionId,
        title: text.slice(0, 30) + (text.length > 30 ? '...' : ''),
        messages: [],
        updatedAt: Date.now()
      };
      updatedSessions = [newSession, ...updatedSessions];
      setSessions(updatedSessions);
      setCurrentSessionId(sessionId);
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      content: text,
      timestamp: Date.now(),
      image,
      video
    };

    // Update session with user message
    updatedSessions = updatedSessions.map(s => {
      if (s.id === sessionId) {
        return {
          ...s,
          messages: [...s.messages, userMsg],
          updatedAt: Date.now(),
          title: s.messages.length === 0 ? (text.slice(0, 30) || "Image Creation") : s.title
        };
      }
      return s;
    });
    setSessions(updatedSessions);

    if (video) {
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.ASSISTANT,
        content: "I've rendered that video for you.",
        video,
        timestamp: Date.now()
      };
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, messages: [...s.messages, assistantMsg], updatedAt: Date.now() } : s));
      return;
    }

    setIsTyping(true);
    try {
      const sessionMessages = updatedSessions.find(s => s.id === sessionId)?.messages || [];
      const response = await gemini.generateResponse(sessionMessages, appState.creatorName, image);
      
      const assistantMsg: Message = {
        id: (Date.now() + 2).toString(),
        role: MessageRole.ASSISTANT,
        content: response.text || "",
        image: response.image,
        timestamp: Date.now()
      };

      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, messages: [...s.messages, assistantMsg], updatedAt: Date.now() } : s));
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  }, [sessions, currentSessionId, appState.creatorName]);

  const handleNewChat = () => {
    const id = Date.now().toString();
    const newSession: ChatSession = {
      id,
      title: 'New Conversation',
      messages: [],
      updatedAt: Date.now()
    };
    setSessions([newSession, ...sessions]);
    setCurrentSessionId(id);
    setAppState(prev => ({ ...prev, activeView: 'chat' }));
  };

  const handleSelectSession = (id: string) => {
    setCurrentSessionId(id);
    setAppState(prev => ({ ...prev, activeView: 'chat' }));
  };

  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    if (currentSessionId === id) {
      setCurrentSessionId(updated.length > 0 ? updated[0].id : null);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#09090b] text-zinc-100 selection:bg-cyan-500/30 overflow-hidden relative">
      {/* Shifted the background text slightly to the right using translate-x */}
      <div className="absolute inset-0 flex items-center justify-center translate-x-[8vw] pointer-events-none select-none z-0">
        <h1 className="text-[24vw] font-[900] text-white/[0.025] tracking-[-0.05em] leading-none uppercase">NEXT</h1>
      </div>

      <Sidebar 
        activeView={appState.activeView} 
        setActiveView={(view) => setAppState(prev => ({ ...prev, activeView: view as any }))} 
        creatorName={appState.creatorName} 
        onNewChat={handleNewChat}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
      />
      
      <main className="flex-1 flex flex-col relative overflow-hidden z-10 bg-transparent">
        <header className="h-14 border-b border-zinc-800/50 bg-[#09090b]/30 backdrop-blur-sm flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
            <span className="text-sm font-semibold tracking-tight text-zinc-300">
              {currentSession ? currentSession.title : 'NEXT AI'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-zinc-500">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></span>
              Core Synced
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
          {appState.activeView === 'chat' && (
            <ChatArea 
              messages={currentSession?.messages || []} 
              onSendMessage={handleSendMessage}
              isTyping={isTyping}
            />
          )}
          {appState.activeView === 'dashboard' && <StatusBoard creatorName={appState.creatorName} />}
          {appState.activeView === 'settings' && (
            <Settings 
              creatorName={appState.creatorName} 
              onUpdateName={(name) => {
                setAppState(prev => ({ ...prev, creatorName: name }));
                localStorage.setItem('creatorName', name);
              }} 
              onClearHistory={() => {
                setSessions([]);
                setCurrentSessionId(null);
                localStorage.removeItem('next_sessions');
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
