"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { 
  BotMessageSquare, 
  X, 
  Send, 
  Loader2, 
  Sparkles, 
  Film,
  Popcorn
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/i18n/routing";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  movies?: any[];
  combos?: any[];
}

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Use a fallback translation if we don't want to create new locale keys right away
  const tTitle = "Lumière AI Assistant";
  const tPlaceholder = "Ask me for a movie recommendation...";
  const tSend = "Send";

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: "مرحباً! أنا لوميير. أي نوع من الأفلام تفضل مشاهدته اليوم؟ يمكنني أيضاً اقتراح بعض الوجبات الخفيفة اللذيذة!\n\nHi there! I'm Lumière. What kind of movie are you in the mood for today? I can also suggest some tasty snacks!"
        }
      ]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    const historyToSend = newMessages.map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historyToSend })
      });

      const data = await res.json();
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.text || "Sorry, I had trouble processing that.",
        movies: data.movies,
        combos: data.combos
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "عذراً، حدث خطأ أثناء الاتصال بالخادم. / Oops! Something went wrong connecting to my brain."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-4 sm:right-6 sm:bottom-24 w-[350px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[70vh] z-50 rounded-2xl border border-white/10 bg-black/95 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-gold/10 to-transparent">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gold/20 flex items-center justify-center border border-gold/30 relative">
                   <div className="absolute inset-0 bg-gold/20 rounded-full animate-ping opacity-20" />
                   <Sparkles className="h-4 w-4 text-gold" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">{tTitle}</h3>
                  <p className="text-[10px] text-gold">Online • Powered by AI</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white rounded-full" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div 
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.role === "user" 
                      ? "bg-gold text-black rounded-br-sm" 
                      : "bg-white/10 text-white rounded-bl-sm border border-white/5"
                    }`}
                  >
                    {msg.content}
                  </div>
                  
                  {/* Rich Cards for Assistant responses */}
                  {msg.role === "assistant" && msg.movies && msg.movies.length > 0 && (
                    <div className="mt-2 w-full max-w-[85%] space-y-2">
                      {msg.movies.map((m: any) => (
                        <Link key={m.id} href={`/movies/${m.id}`}>
                          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg p-2 hover:bg-white/10 transition cursor-pointer">
                            {m.posterUrl ? (
                              <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={m.posterUrl} alt={m.titleEn} className="w-10 h-14 object-cover rounded" />
                              </>
                            ) : (
                              <div className="w-10 h-14 bg-white/10 rounded flex items-center justify-center"><Film className="w-4 h-4 text-white/50" /></div>
                            )}
                            <div className="flex-1 overflow-hidden">
                              <p className="text-sm font-semibold text-white truncate">{m.titleEn}</p>
                              <p className="text-xs text-gold truncate">{m.genre}</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {msg.role === "assistant" && msg.combos && msg.combos.length > 0 && (
                     <div className="mt-2 w-full max-w-[85%] bg-gold/10 border border-gold/20 rounded-lg p-3">
                       <div className="flex items-center gap-1.5 mb-1.5"><Popcorn className="w-4 h-4 text-gold"/> <span className="text-xs font-semibold text-gold">Suggested Snacks</span></div>
                       {msg.combos.map((c: any) => (
                         <div key={c.id} className="text-xs text-white/80">• {c.nameEn} - EGP {c.price.toFixed(2)}</div>
                       ))}
                     </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start">
                  <div className="bg-white/10 text-white rounded-2xl rounded-bl-sm px-4 py-2.5 border border-white/5 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-gold" />
                    <span className="text-xs text-white/70">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-black/50 border-t border-white/10">
              <form onSubmit={handleSubmit} className="flex items-center gap-2 relative">
                <Input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={tPlaceholder}
                  className="bg-white/5 border-white/10 rounded-full pr-10 focus-visible:ring-gold text-sm"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={!input.trim() || isLoading}
                  className="absolute right-1 top-1 h-8 w-8 rounded-full bg-gold hover:bg-gold-light text-black disabled:bg-white/10 disabled:text-white/30"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 h-14 w-14 rounded-full bg-gold hover:scale-105 transition-transform shadow-[0_0_20px_rgba(234,179,8,0.4)] text-black z-50 hover:bg-gold-light"
      >
        {isOpen ? <X className="h-6 w-6" /> : <BotMessageSquare className="h-6 w-6" />}
      </Button>
    </>
  );
}
