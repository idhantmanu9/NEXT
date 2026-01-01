
import React, { useState, useRef, useEffect } from 'react';
import { Message, MessageRole } from '../types';
import { gemini } from '../services/geminiService';

interface ChatAreaProps {
  messages: Message[];
  onSendMessage: (text: string, image?: string, video?: string) => void;
  isTyping: boolean;
}

const LOADING_MESSAGES = [
  "Initializing Veo Engine...",
  "Synthesizing motion vectors...",
  "Rendering cinematic lighting...",
  "Applying temporal consistency...",
  "Finalizing high-res output...",
  "Almost there, polishing frames..."
];

export const ChatArea: React.FC<ChatAreaProps> = ({ messages, onSendMessage, isTyping }) => {
  const [input, setInput] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isVideoGenerating]);

  useEffect(() => {
    let interval: any;
    if (isVideoGenerating) {
      interval = setInterval(() => {
        setLoadingMsgIdx(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 4000);
    } else {
      setLoadingMsgIdx(0);
    }
    return () => clearInterval(interval);
  }, [isVideoGenerating]);

  // Speech Recognition Initialization
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setInput(prev => prev + event.results[i][0].transcript);
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        // We can optionally show interim results in a separate small UI element
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !imagePreview) return;

    if (isListening) {
      recognitionRef.current.stop();
    }

    const lowerInput = input.toLowerCase();
    const isVideoReq = lowerInput.includes("generate a video") || lowerInput.includes("make a video");

    if (isVideoReq) {
      await handleVideoGeneration(input);
    } else {
      onSendMessage(input, imagePreview || undefined);
      setInput('');
      setImagePreview(null);
    }
  };

  const handleVideoGeneration = async (prompt: string) => {
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
      }
    }

    setIsVideoGenerating(true);
    setInput('');
    
    try {
      const response = await gemini.generateVideo(prompt);
      onSendMessage(prompt, undefined, response.video);
    } catch (err: any) {
      if (err.message === "API_KEY_REQUIRED" && window.aistudio) {
        await window.aistudio.openSelectKey();
      } else {
        onSendMessage("System Error: Video generation failed.", undefined, undefined);
      }
    } finally {
      setIsVideoGenerating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const triggerVideoPrompt = () => {
    if (!input.toLowerCase().includes("video")) {
      setInput("Generate a video of " + input);
    }
  };

  const triggerImagePrompt = () => {
    if (!input.toLowerCase().includes("image")) {
      setInput("Generate an image of " + input);
    }
  };

  const handleDownload = (url: string, id: string, type: 'img' | 'vid') => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `next-ai-${type}-${id}.${type === 'img' ? 'png' : 'mp4'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async (url: string, content: string, type: 'img' | 'vid') => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const ext = type === 'img' ? 'png' : 'mp4';
      const mime = type === 'img' ? 'image/png' : 'video/mp4';
      const file = new File([blob], `next-ai-creation.${ext}`, { type: mime });

      if (navigator.share) {
        await navigator.share({
          title: 'NEXT AI Creation',
          text: content || 'Look at what NEXT AI created!',
          files: [file],
        });
      } else {
        const shareUrl = window.URL.createObjectURL(blob);
        await navigator.clipboard.writeText(shareUrl);
        alert('Download link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      alert('Sharing is not supported in this environment, but you can still download!');
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === MessageRole.USER ? 'items-end' : 'items-start'}`}>
            <div className={`flex gap-4 max-w-[85%] ${msg.role === MessageRole.USER ? 'flex-row-reverse' : ''}`}>
              <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-800 border border-zinc-700">
                <i className={`fa-solid ${msg.role === MessageRole.USER ? 'fa-user' : 'fa-robot'} text-[10px] ${msg.role === MessageRole.USER ? 'text-zinc-400' : 'text-cyan-400'}`}></i>
              </div>
              <div className="space-y-2">
                <div className={`px-4 py-3 rounded-2xl leading-relaxed text-[15px] ${msg.role === MessageRole.USER ? 'bg-zinc-100 text-zinc-900 font-medium' : 'bg-zinc-900/80 border border-zinc-800 backdrop-blur-sm text-zinc-300 shadow-sm'}`}>
                  {msg.content}
                  
                  {msg.image && (
                    <div className="mt-3 relative group overflow-hidden rounded-xl border border-white/5 shadow-2xl bg-black/20">
                      <img src={msg.image} alt="Generated" className="max-w-full h-auto block" loading="lazy" />
                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto">
                        <button 
                          onClick={() => handleDownload(msg.image!, msg.id, 'img')} 
                          className="w-9 h-9 rounded-xl bg-black/60 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all shadow-xl"
                        >
                          <i className="fa-solid fa-download text-xs"></i>
                        </button>
                        <button 
                          onClick={() => handleShare(msg.image!, msg.content, 'img')} 
                          className="w-9 h-9 rounded-xl bg-black/60 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all shadow-xl"
                        >
                          <i className="fa-solid fa-share-nodes text-xs"></i>
                        </button>
                      </div>
                    </div>
                  )}

                  {msg.video && (
                    <div className="mt-3 relative group overflow-hidden rounded-xl border border-white/5 shadow-2xl bg-black">
                      <video src={msg.video} controls loop className="w-full aspect-video rounded-xl" />
                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto">
                        <button 
                          onClick={() => handleDownload(msg.video!, msg.id, 'vid')} 
                          className="w-9 h-9 rounded-xl bg-black/60 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all shadow-xl"
                        >
                          <i className="fa-solid fa-download text-xs"></i>
                        </button>
                        <button 
                          onClick={() => handleShare(msg.video!, msg.content, 'vid')} 
                          className="w-9 h-9 rounded-xl bg-black/60 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all shadow-xl"
                        >
                          <i className="fa-solid fa-share-nodes text-xs"></i>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className={`text-[10px] text-zinc-600 ${msg.role === MessageRole.USER ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Loading States */}
        {(isTyping || isVideoGenerating) && (
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <i className="fa-solid fa-robot text-[10px] text-cyan-400 animate-pulse"></i>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce"></div>
              </div>
              {isVideoGenerating && (
                <span className="text-[10px] text-cyan-500/70 font-medium animate-pulse tracking-wide">
                  {LOADING_MESSAGES[loadingMsgIdx]}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none">
        <div className="max-w-4xl mx-auto pointer-events-auto">
          <form onSubmit={handleSubmit} className="glass p-2 rounded-2xl border border-zinc-700/50 shadow-2xl relative">
            {imagePreview && (
              <div className="absolute bottom-full mb-4 left-0 p-2 glass rounded-xl border border-cyan-500/30 flex items-center gap-2">
                <img src={imagePreview} alt="Preview" className="h-20 rounded-lg shadow-lg" />
                <button type="button" onClick={() => setImagePreview(null)} className="w-6 h-6 bg-red-500/20 border border-red-500/40 rounded-full flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all">
                  <i className="fa-solid fa-xmark text-[10px]"></i>
                </button>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5 pl-1">
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()} 
                  title="Upload Image"
                  className="w-9 h-9 flex items-center justify-center text-zinc-500 hover:text-zinc-200 transition-colors"
                >
                  <i className="fa-solid fa-paperclip text-sm"></i>
                </button>
                <button 
                  type="button" 
                  onClick={toggleListening}
                  title={isListening ? "Stop Listening" : "Speak to NEXT"}
                  className={`w-9 h-9 flex items-center justify-center transition-all ${isListening ? 'text-cyan-400 animate-pulse drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]' : 'text-zinc-500 hover:text-cyan-400'}`}
                >
                  <i className={`fa-solid ${isListening ? 'fa-microphone-lines' : 'fa-microphone'} text-sm`}></i>
                </button>
                <button 
                  type="button" 
                  onClick={triggerImagePrompt}
                  title="Generate Image"
                  className={`w-9 h-9 flex items-center justify-center transition-colors ${input.toLowerCase().includes("image") ? "text-cyan-400" : "text-zinc-500 hover:text-cyan-400"}`}
                >
                  <i className="fa-solid fa-wand-magic-sparkles text-sm"></i>
                </button>
                <button 
                  type="button" 
                  onClick={triggerVideoPrompt}
                  title="Generate Video"
                  className={`w-9 h-9 flex items-center justify-center transition-colors ${input.toLowerCase().includes("video") ? "text-indigo-400" : "text-zinc-500 hover:text-indigo-400"}`}
                >
                  <i className="fa-solid fa-video text-sm"></i>
                </button>
              </div>

              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
              
              <input 
                type="text" 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                placeholder={isListening ? "Listening to your request..." : "Message NEXT or tap the mic..."} 
                className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] text-zinc-200 placeholder:text-zinc-600 px-2" 
              />

              <button 
                type="submit" 
                disabled={(!input.trim() && !imagePreview) || isTyping || isVideoGenerating} 
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${((input.trim() || imagePreview) && !isTyping && !isVideoGenerating) ? 'bg-zinc-100 text-zinc-900 shadow-lg scale-100' : 'bg-zinc-800 text-zinc-500 opacity-50 scale-95'}`}
              >
                <i className="fa-solid fa-arrow-up text-sm"></i>
              </button>
            </div>
          </form>
          <div className="text-[9px] text-zinc-600 text-center mt-3 tracking-widest uppercase font-medium">NEXT Multi-Modal Fusion Engine</div>
        </div>
      </div>
    </div>
  );
};
