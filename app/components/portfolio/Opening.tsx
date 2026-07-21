'use client';

import { useEffect, useState } from 'react';
import { HeroChat } from './HeroChat';

const TERMINAL_LINES = [
  { c: 'docker build -t openclaw-agent:v2.1 .', o: '✓ image built (14.2s) — 1.24gb, 12 layers' },
  { c: 'python evaluate.py --model v2.1 --dataset test', o: '✓ 847 tests · accuracy 99.2% · f1 0.941 · p95 18ms' },
  { c: 'kubectl apply -f deploy/production.yaml', o: '✓ deployed · 3 replicas · rolling update complete' },
  { c: 'curl -s api.internal/v2/health | jq .status', o: '"healthy"' },
  { c: 'python monitor.py --check-drift', o: '✓ psi 0.08 (threshold 0.20) · all features stable' },
];

function LCTerminal() {
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (step > TERMINAL_LINES.length) return;
    const t = setTimeout(() => setStep((s) => s + 1), 1400);
    return () => clearTimeout(t);
  }, [step]);

  useEffect(() => {
    if (step > TERMINAL_LINES.length) {
      const t = setTimeout(() => setStep(1), 2500);
      return () => clearTimeout(t);
    }
  }, [step]);

  return (
    <div style={{
      background: 'var(--terminal-bg)',
      border: '1px solid var(--border-dim)',
      borderRadius: 6,
      overflow: 'hidden',
      fontSize: 12,
      lineHeight: 1.7,
      boxShadow: 'var(--terminal-shadow)',
    }}>
      {/* Header */}
      <div style={{
        padding: '9px 14px',
        background: 'rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        fontSize: 10,
        color: '#8a8690',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span>~/openclaw · production deploy</span>
        <span style={{ color: '#5ba8a0', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="lc-status-dot"/>live
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: 20, minHeight: 360 }}>
        {TERMINAL_LINES.slice(0, step).map((l, i) => (
          <div key={i} style={{ marginBottom: 11 }}>
            <div>
              <span style={{ color: '#5ba8a0' }}>varad@prod</span>
              <span style={{ color: '#8a8690' }}>:~$ </span>
              <span style={{ color: '#e8e4e0' }}>{l.c}</span>
            </div>
            <div style={{ color: '#8a8690', marginTop: 2 }}>{l.o}</div>
          </div>
        ))}
        {step <= TERMINAL_LINES.length && (
          <div>
            <span style={{ color: '#5ba8a0' }}>varad@prod</span>
            <span style={{ color: '#8a8690' }}>:~$ </span>
            <span className="lc-caret"/>
          </div>
        )}
      </div>
    </div>
  );
}

export function Opening() {
  return (
    <section style={{ paddingTop: 64, paddingBottom: 56 }}>
      <div className="lc-container">
        <div
          className="lc-grid-2"
          style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 56, alignItems: 'center' }}
        >
          {/* Identity block */}
          <div>
            <p style={{
              fontSize: 11, color: 'var(--accent)', marginBottom: 22,
              letterSpacing: '0.14em', textTransform: 'uppercase',
            }}>
              &gt; whoami
            </p>

            <h1
              className="lc-hero-title"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 46, fontWeight: 500, lineHeight: 1.14,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
                marginBottom: 24,
              }}
            >
              varad kodgire<br/>
              <span style={{ color: 'var(--accent)' }}>applied ai developer</span><br/>
              <span style={{ color: 'var(--text-muted)', fontSize: 26 }}>// llm systems · agent builder</span>
            </h1>

            <div style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 15,
              color: 'var(--text-secondary)',
              lineHeight: 1.65,
              marginBottom: 28,
              maxWidth: 480,
            }}>
              I build LLM pipelines, tool-calling agents, and workflow automation that run
              in production — not just notebooks. Currently shipping OpenClaw agent skills
              at MyVyay.
            </div>

            {/* Metadata grid */}
            <div style={{
              display: 'grid', gridTemplateColumns: '80px 1fr', rowGap: 7,
              fontSize: 11.5, marginBottom: 30,
            }}>
              <span style={{ color: 'var(--text-muted)' }}>location</span>
              <span>pune, in · open to bangalore + remote</span>
              <span style={{ color: 'var(--text-muted)' }}>role</span>
              <span>full-time · ai dev · llm eng · applied researcher</span>
              <span style={{ color: 'var(--text-muted)' }}>stack</span>
              <span>python · llms · docker · fastapi · huggingface</span>
              <span style={{ color: 'var(--text-muted)' }}>updated</span>
              <span>2026-04-21</span>
            </div>

            {/* CTA row */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a className="lc-btn-primary" href="/api/resume/download" download="varad-kodgire-resume.pdf">$ download resume.pdf ↓</a>
              <a className="lc-btn-ghost" href="#demos">$ run live demos</a>
            </div>
          </div>

          {/* Hero chat */}
          <HeroChat />
        </div>
      </div>
    </section>
  );
}
