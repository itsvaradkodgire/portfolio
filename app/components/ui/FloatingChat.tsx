'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageSquare, X, Send, Bot } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const SUGGESTIONS = [
  "What projects has Varad built?",
  "What's his tech stack?",
  "Tell me about his ML experience.",
];

export function FloatingChat() {
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef             = useRef<HTMLDivElement>(null);
  const inputRef              = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });

      const data = await res.json() as { text?: string; error?: string };
      setMessages((prev) => [
        ...prev,
        { role: 'model', text: data.text ?? data.error ?? 'Something went wrong.' },
      ]);
    } catch {
      setMessages((prev) => [...prev, { role: 'model', text: 'Network error — please try again.' }]);
    } finally {
      setLoading(false);
    }
  }, [messages, loading]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open chat"
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-accent-primary
                   flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        whileTap={{ scale: 0.95 }}
        style={{ boxShadow: '0 0 20px rgba(212,131,78,0.4)' }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? 'x' : 'msg'}
            initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
            transition={{ duration: 0.15 }}
          >
            {open ? <X size={18} color="#fff" /> : <MessageSquare size={18} color="#fff" />}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-2xl overflow-hidden
                       border border-border-subtle shadow-2xl flex flex-col"
            style={{ background: 'var(--bg-card)', maxHeight: '520px' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle"
                 style={{ background: 'var(--bg-elevated)' }}>
              <div className="w-7 h-7 rounded-full bg-accent-primary/20 flex items-center justify-center">
                <Bot size={14} color="#d4834e" />
              </div>
              <div>
                <p className="font-mono text-xs font-semibold text-text-primary">Ask about Varad</p>
                <p className="font-mono text-[10px] text-text-faint">Powered by Gemini</p>
              </div>
              <button onClick={() => setOpen(false)} className="ml-auto text-text-faint hover:text-text-muted transition-colors">
                <X size={14} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <p className="font-mono text-[11px] text-text-muted text-center py-2">
                    Hi! Ask me anything about Varad's work.
                  </p>
                  <div className="space-y-1.5">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="w-full text-left font-mono text-[10px] text-text-faint
                                   border border-border-subtle rounded-lg px-3 py-2
                                   hover:border-border-dim hover:text-text-muted transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 font-mono text-[11px] leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-accent-primary/20 text-text-primary ml-4'
                        : 'border border-border-subtle text-text-secondary mr-4'
                    }`}
                    style={m.role !== 'user' ? { background: 'var(--bg-elevated)' } : {}}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="border border-border-subtle rounded-xl px-3 py-2 font-mono text-[11px]"
                       style={{ background: 'var(--bg-elevated)' }}>
                    <span className="text-text-faint animate-pulse">thinking…</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-3 pb-3 pt-2 border-t border-border-subtle"
                 style={{ background: 'var(--bg-elevated)' }}>
              <div className="flex items-end gap-2 border border-border-subtle rounded-xl px-3 py-2"
                   style={{ background: 'var(--bg-base)' }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask something..."
                  rows={1}
                  className="flex-1 font-mono text-[11px] text-text-secondary placeholder:text-text-faint
                             bg-transparent resize-none outline-none"
                  style={{ maxHeight: '80px' }}
                />
                <button
                  onClick={() => send(input)}
                  disabled={!input.trim() || loading}
                  className="text-accent-primary disabled:text-text-faint transition-colors"
                >
                  <Send size={14} />
                </button>
              </div>
              <p className="font-mono text-[9px] text-text-faint mt-1.5 text-center">
                Press Enter to send · Shift+Enter for new line
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
