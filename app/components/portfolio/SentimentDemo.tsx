'use client';

import { useState, useMemo } from 'react';

const EMOTION_KEYWORDS: Record<string, string[]> = {
  joy:      ['love', 'amazing', 'great', 'happy', 'excited', 'held', 'shipped', 'awesome', 'thrilled', 'brilliant', 'perfect'],
  anger:    ['hate', 'angry', 'frustrating', 'broken', 'awful', 'terrible', 'useless'],
  fear:     ['scared', 'afraid', 'risk', 'anxious', 'worried'],
  sadness:  ['sad', 'regret', 'disappointed', 'sorry', 'miss'],
  surprise: ['wow', 'surprise', 'unexpected', 'whoa', 'incredible'],
  disgust:  ['disgust', 'gross', 'ugh'],
  neutral:  [],
};

const ROWS = ['joy', 'anger', 'fear', 'sadness', 'surprise', 'disgust', 'neutral'] as const;

function score(text: string): Record<string, number> {
  const t = text.toLowerCase();
  const out: Record<string, number> = {};
  let total = 0;
  for (const k of ROWS) {
    if (k === 'neutral') continue;
    const c = EMOTION_KEYWORDS[k].filter((w) => t.includes(w)).length;
    out[k] = c;
    total += c;
  }
  if (total === 0) return { ...Object.fromEntries(ROWS.map(r => [r, 0])), neutral: 1 };
  for (const k of ROWS) {
    if (k === 'neutral') { out[k] = 0; continue; }
    out[k] = out[k] / total;
  }
  return out;
}

export function SentimentDemo() {
  const [text, setText] = useState(
    'shipped the agent on tuesday — it held through 5 concurrent sessions, love it'
  );
  const result = useMemo(() => score(text), [text]);

  return (
    <div className="lc-card" style={{ padding: 22 }}>
      <DemoHead idx="01" kind="nlp" title="Multi-Emotion Detector" desc="Lexicon-based · 7 categories · client-side" />

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        style={{
          width: '100%',
          background: 'var(--bg-deep)',
          border: '1px solid var(--border-dim)',
          borderRadius: 4,
          padding: 12,
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-mono)',
          fontSize: 12.5,
          resize: 'vertical',
          outline: 'none',
          marginBottom: 14,
        }}
      />

      <div>
        {ROWS.map((e) => {
          const v = result[e] || 0;
          return (
            <div key={e} style={{ marginBottom: 7 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, marginBottom: 3 }}>
                <span style={{ color: 'var(--text-muted)' }}>{e}</span>
                <span style={{ color: v > 0.15 ? 'var(--accent)' : 'var(--text-faint)' }}>
                  {(v * 100).toFixed(0)}%
                </span>
              </div>
              <div style={{ height: 3, background: 'var(--border-subtle)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  width: `${v * 100}%`, height: '100%',
                  background: v > 0.15 ? 'var(--accent)' : 'var(--text-faint)',
                  transition: 'width .25s ease',
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DemoHead({ idx, kind, title, desc }: { idx: string; kind: string; title: string; desc: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
        <span style={{ color: 'var(--accent)', fontSize: 10.5, letterSpacing: '0.1em' }}>{idx} /</span>
        <span className="lc-label-mono">{kind}</span>
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>
        {title}
      </h3>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', margin: 0 }}>{desc}</p>
    </div>
  );
}
