
import React, { useState, useRef, useEffect } from 'react';
import { Message, MessageRole } from '../types';

interface ChatAreaProps {
  messages: Message[];
  onSendMessage: (text: string, image?: string) => void;
  isTyping: boolean;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ messages, onSendMessage, isTyping }) => {
  const [input, setInput] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !imagePreview) return;
    onSendMessage(input, imagePreview || undefined);
    setInput('');
    setImagePreview(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerImagePrompt = () => {
    if (!input.toLowerCase().includes("generate")) {
      setInput("Generate an image of " + input);
    }
  };

  const handleDownload = (imageUrl: string, id: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `next-ai-gen-${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async (imageUrl: string, text: string) => {
    try {
      if (navigator.share) {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'next-ai-image.png', { type: 'image/png' });
        
        await navigator.share({
          title: 'NEXT AI Creation',
          text: text || 'Look at what NEXT AI created!',
          files: [file],
        });
      } else {
        // Fallback: Copy data URL to clipboard
        await navigator.clipboard.writeText(imageUrl);
        alert('Image link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing image:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-8 pb-32"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex flex-col ${msg.role === MessageRole.USER ? 'items-end' : 'items-start'}`}
          >
            <div className={`flex gap-4 max-w-[85%] ${msg.role === MessageRole.USER ? 'flex-row-reverse' : ''}`}>
              <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                msg.role === MessageRole.USER 
                ? 'bg-zinc-800 border border-zinc-700' 
                : 'bg-zinc-800 border border-zinc-700'
              }`}>
                <i className={`fa-solid ${msg.role === MessageRole.USER ? 'fa-user' : 'fa-robot'} text-[10px] ${
                  msg.role === MessageRole.USER ? 'text-zinc-400' : 'text-cyan-400'
                }`}></i>
              </div>
              
              <div className="space-y-2">
                <div className={`px-4 py-3 rounded-2xl leading-relaxed text-[15px] ${
                  msg.role === MessageRole.USER 
                  ? 'bg-zinc-100 text-zinc-900 font-medium' 
                  : 'bg-zinc-900/80 border border-zinc-800 backdrop-blur-sm text-zinc-300 shadow-sm'
                }`}>
                  {msg.content}
                  {msg.image && (
                    <div className="mt-3 relative group overflow-hidden rounded-xl border border-white/5 shadow-2xl bg-black/40">
                      <img src={msg.image} alt="Generated content" className="max-w-full h-auto block" loading="lazy" />
                      
                      {/* Image Action Overlay */}
                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        <button
                          onClick={() => handleDownload(msg.image!, msg.id)}
                          className="w-9 h-9 rounded-xl bg-black/60 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all shadow-xl"
                          title="Download Image"
                        >
                          <i className="fa-solid fa-download text-xs"></i>
                        </button>
                        <button
                          onClick={() => handleShare(msg.image!, msg.content)}
                          className="w-9 h-9 rounded-xl bg-black/60 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all shadow-xl"
                          title="Share Image"
                        >
                          <i className="fa-solid fa-share-nodes text-xs"></i>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className={`text-[10px] text-zinc-600 ${
                  msg.role === MessageRole.USER ? 'text-right' : 'text-left'
                }`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <i className="fa-solid fa-robot text-[10px] text-cyan-400 animate-pulse"></i>
            </div>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none">
        <div className="max-w-4xl mx-auto pointer-events-auto">
          <form 
            onSubmit={handleSubmit}
            className="glass p-2 rounded-2xl border border-zinc-700/50 shadow-2xl relative"
          >
            {imagePreview && (
              <div className="absolute bottom-full mb-4 left-0 p-2 glass rounded-xl border border-cyan-500/30 flex items-center gap-2 group">
                <img src={imagePreview} alt="Preview" className="h-20 rounded-lg shadow-lg" />
                <button 
                  type="button" 
                  onClick={() => setImagePreview(null)}
                  className="w-6 h-6 bg-red-500/20 border border-red-500/40 rounded-full flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                >
                  <i className="fa-solid fa-xmark text-[10px]"></i>
                </button>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 pl-1">
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload Image"
                  className="w-9 h-9 flex items-center justify-center text-zinc-500 hover:text-zinc-200 transition-colors"
                >
                  <i className="fa-solid fa-paperclip text-base"></i>
                </button>
                <button 
                  type="button"
                  onClick={triggerImagePrompt}
                  title="Generate Image Mode"
                  className={`w-9 h-9 flex items-center justify-center transition-colors ${input.toLowerCase().includes("generate") ? "text-cyan-400" : "text-zinc-500 hover:text-cyan-400"}`}
                >
                  <i className="fa-solid fa-wand-magic-sparkles text-base"></i>
                </button>
              </div>

              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileChange} 
                accept="image/*"
              />
              
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything or say 'Draw a...'"
                className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] text-zinc-200 placeholder:text-zinc-600 px-2"
              />

              <button
                type="submit"
                disabled={(!input.trim() && !imagePreview) || isTyping}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  (input.trim() || imagePreview) && !isTyping
                  ? 'bg-zinc-100 text-zinc-900 shadow-lg scale-100'
                  : 'bg-zinc-800 text-zinc-500 scale-95 opacity-50'
                }`}
              >
                <i className="fa-solid fa-arrow-up text-sm"></i>
              </button>
            </div>
          </form>
          <div className="text-[9px] text-zinc-600 text-center mt-3 tracking-widest uppercase font-medium">
            Powered by NEXT Multi-Modal Engine
          </div>
        </div>
      </div>
    </div>
  );
};
