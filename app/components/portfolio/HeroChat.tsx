'use client';

import { useState, useRef, useEffect } from 'react';

type Message = { role: 'user' | 'assistant'; text: string };

const STARTERS = [
  'what are you building?',
  'what\'s your stack?',
  'tell me about friday',
  'open to work?',
];

export function HeroChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: 'hi. i\'m an AI trained on varad\'s work. ask me anything — projects, stack, availability.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Scroll ONLY the inner message list, never the page. Using
    // scrollIntoView() here would scroll the whole window and make the page
    // "bounce" up on each new message.
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const next: Message[] = [...messages, { role: 'user', text: trimmed }];
    setMessages(next);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/hero-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.text })),
        }),
      });

      if (!res.ok || !res.body) {
        // Error responses come back as JSON, not a stream.
        let msg = 'no response.';
        try {
          const data = await res.json() as { error?: string };
          msg = data.error ?? msg;
        } catch { /* ignore */ }
        setMessages([...next, { role: 'assistant', text: msg }]);
        return;
      }

      // Stream tokens into a single assistant message as they arrive.
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      setMessages([...next, { role: 'assistant', text: '' }]);
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages([...next, { role: 'assistant', text: acc }]);
      }
      if (!acc) {
        setMessages([...next, { role: 'assistant', text: 'no response.' }]);
      }
    } catch {
      setMessages([...next, { role: 'assistant', text: 'connection error — please try again.' }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus({ preventScroll: true });
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') send(input);
  };

  return (
    <div style={{
      background: 'var(--terminal-bg)',
      border: '1px solid var(--border-dim)',
      borderRadius: 6,
      overflow: 'hidden',
      fontSize: 12,
      lineHeight: 1.7,
      boxShadow: 'var(--terminal-shadow)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '9px 14px',
        background: 'rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        fontSize: 10, color: '#8a8690',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexShrink: 0,
      }}>
        <span>~/varad · ask me anything</span>
        <span style={{ color: '#5ba8a0', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="lc-status-dot" />
          gemini-2.5-flash
        </span>
      </div>

      {/* Starter chips */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 6, padding: '10px 14px 0',
        flexShrink: 0,
      }}>
        {STARTERS.map((s) => (
          <button
            key={s}
            onClick={() => send(s)}
            disabled={loading}
            style={{
              background: 'transparent',
              color: 'var(--text-faint)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 3,
              padding: '3px 8px',
              fontSize: 10,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-mono)',
              transition: 'color .15s, border-color .15s',
            }}
            onMouseEnter={e => {
              if (!loading) {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.borderColor = 'var(--border-dim)';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--text-faint)';
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }}
          >
            &gt; {s}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div ref={messagesRef} style={{
        padding: '14px 20px',
        minHeight: 280,
        maxHeight: 320,
        overflowY: 'auto',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}>
        {messages.map((m, i) => (
          <div key={i}>
            {m.role === 'user' ? (
              <div>
                <span style={{ color: '#5ba8a0' }}>you@varad</span>
                <span style={{ color: '#8a8690' }}>:~$ </span>
                <span style={{ color: '#e8e4e0' }}>{m.text}</span>
              </div>
            ) : (
              <div style={{ paddingLeft: 2 }}>
                <span style={{ color: '#8a8690' }}>{'>'} </span>
                <span style={{ color: '#b0acaa', whiteSpace: 'pre-wrap' }}>{m.text}</span>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div>
            <span style={{ color: '#8a8690' }}>{'>'} </span>
            <span className="lc-caret" style={{ background: 'var(--teal)' }} />
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        flexShrink: 0,
        background: 'rgba(255,255,255,0.02)',
      }}>
        <span style={{ color: '#5ba8a0', whiteSpace: 'nowrap', fontSize: 11.5 }}>you@varad</span>
        <span style={{ color: '#8a8690', fontSize: 11.5 }}>:~$</span>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder="type a question..."
          disabled={loading}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#e8e4e0',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            caretColor: 'var(--accent)',
          }}
        />
        <button
          onClick={() => send(input)}
          disabled={loading || !input.trim()}
          style={{
            background: 'transparent',
            border: 'none',
            color: input.trim() && !loading ? 'var(--accent)' : 'var(--text-faint)',
            cursor: input.trim() && !loading ? 'pointer' : 'default',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            padding: '2px 6px',
            transition: 'color .15s',
          }}
        >
          ↵
        </button>
      </div>
    </div>
  );
}
