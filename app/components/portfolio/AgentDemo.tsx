'use client';

import { useState, useEffect } from 'react';
import { DemoHead } from './SentimentDemo';

const RUNS = [
  {
    q: 'summarize my last 3 emails',
    steps: [
      { t: 'plan', m: 'decompose: fetch emails → extract → summarize' },
      { t: 'tool', m: 'gmail.list(n=3) → 3 messages' },
      { t: 'tool', m: 'llm.extract(subject, sender, body)' },
      { t: 'tool', m: 'llm.summarize(style=bullet)' },
      { t: 'done', m: '3 emails summarized · 1.8s · 1,240 tokens' },
    ],
  },
  {
    q: 'build a PR from my last commit',
    steps: [
      { t: 'plan', m: 'decompose: git.log → diff → pr.create' },
      { t: 'tool', m: 'git.log(n=1) → sha a7f2c' },
      { t: 'tool', m: 'git.diff(sha) → 47 lines' },
      { t: 'tool', m: 'github.pr.create(title, body)' },
      { t: 'done', m: 'PR #214 opened · 1.2s · 840 tokens' },
    ],
  },
];

function colorOf(t: string) {
  if (t === 'plan') return 'var(--teal)';
  if (t === 'done') return 'var(--green)';
  return 'var(--accent)';
}

export function AgentDemo() {
  const [runIdx, setRunIdx] = useState(0);
  const [step, setStep] = useState(0);
  const run = RUNS[runIdx];

  useEffect(() => {
    if (step >= run.steps.length) {
      const t = setTimeout(() => { setRunIdx((r) => (r + 1) % RUNS.length); setStep(0); }, 1800);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), 720);
    return () => clearTimeout(t);
  }, [step, runIdx, run.steps.length]);

  return (
    <div className="lc-card" style={{ padding: 22 }}>
      <DemoHead idx="02" kind="ai agents" title="OpenClaw Agent Simulator" desc="Natural language → plan → tool calls → result" />

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {RUNS.map((r, i) => (
          <button
            key={i}
            onClick={() => { setRunIdx(i); setStep(0); }}
            style={{
              background: i === runIdx ? 'var(--accent-soft)' : 'transparent',
              color: i === runIdx ? 'var(--accent)' : 'var(--text-muted)',
              border: `1px solid ${i === runIdx ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
              borderRadius: 3,
              padding: '5px 10px',
              fontSize: 10.5,
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
            }}
          >
            &gt; {r.q}
          </button>
        ))}
      </div>

      <div style={{
        background: 'var(--bg-deep)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 4,
        padding: 14,
        minHeight: 220,
        fontSize: 11.5,
      }}>
        <div style={{ color: 'var(--text-muted)', marginBottom: 10 }}>
          <span style={{ color: 'var(--teal)' }}>user</span>@agent: {run.q}
        </div>

        {run.steps.slice(0, step).map((s, i) => (
          <div
            key={i}
            style={{
              display: 'flex', gap: 10, marginBottom: 6,
              animation: 'lc-fadeUp .25s ease-out',
            }}
          >
            <span style={{
              color: colorOf(s.t),
              fontSize: 9.5,
              minWidth: 42,
              padding: '1px 6px',
              border: `1px solid ${colorOf(s.t)}`,
              borderRadius: 2,
              height: 'fit-content',
              textAlign: 'center' as const,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.08em',
              flexShrink: 0,
            }}>{s.t}</span>
            <span style={{ color: s.t === 'done' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
              {s.m}
            </span>
          </div>
        ))}

        {step < run.steps.length && (
          <div style={{ color: 'var(--text-faint)', marginTop: 4 }}>
            <span className="lc-caret" style={{ background: 'var(--teal)' }} />
          </div>
        )}
      </div>
    </div>
  );
}
