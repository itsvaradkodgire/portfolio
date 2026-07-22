'use client';

import { useState } from 'react';
import type { Project } from '@/lib/types';

function CSSection({ label, text }: { label: string; text: string }) {
  if (!text) return null;
  return (
    <div style={{ marginBottom: 18 }}>
      <p style={{
        fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent)',
        letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6,
      }}>
        {label}
      </p>
      <p style={{ margin: 0 }}>{text}</p>
    </div>
  );
}

function shortStack(p: Project): string {
  const s = (p.stack && p.stack.length ? p.stack : p.tags) ?? [];
  return s.slice(0, 2).join(' · ');
}

export function Work({ projects }: { projects: Project[] }) {
  const sorted = [...projects].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  const [active, setActive] = useState<string>(sorted[0]?.id ?? '');
  const p = sorted.find((x) => x.id === active) ?? sorted[0];

  if (!p) return null;

  const stack = (p.stack && p.stack.length ? p.stack : p.tags) ?? [];

  return (
    <section id="work" className="lc-section">
      <div className="lc-container">
        <div className="lc-section-head">
          <h2><span className="lc-prompt">$</span>ls -la ./systems</h2>
          <span className="lc-hint">{sorted.length} systems · built and shipped</span>
        </div>

        {/* Table */}
        <div className="lc-card" style={{ overflow: 'hidden', marginBottom: 32 }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '44px 2fr 1fr 1.4fr 1fr 1fr',
            padding: '10px 18px', borderBottom: '1px solid var(--border-subtle)',
            fontSize: 10, color: 'var(--text-faint)', letterSpacing: '0.1em',
            textTransform: 'uppercase', background: 'var(--bg-deep)',
          }}>
            <span>#</span><span>name</span><span>org</span><span>stack</span><span>impact</span><span>status</span>
          </div>

          {sorted.map((row, i) => {
            const isActive = row.id === active;
            const status = row.status ?? 'shipped';
            return (
              <div
                key={row.id}
                onClick={() => setActive(row.id)}
                style={{
                  display: 'grid', gridTemplateColumns: '44px 2fr 1fr 1.4fr 1fr 1fr',
                  padding: '14px 18px',
                  borderBottom: i === sorted.length - 1 ? 'none' : '1px solid var(--border-subtle)',
                  fontSize: 12.5, cursor: 'pointer',
                  background: isActive ? 'var(--bg-elevated)' : 'transparent',
                  borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                  paddingLeft: isActive ? 16 : 18,
                  transition: 'background .15s, border-color .15s',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ color: 'var(--text-faint)' }}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{ color: isActive ? 'var(--accent)' : 'var(--text-primary)' }}>{row.title}</span>
                <span style={{ color: 'var(--text-muted)' }}>{row.org ?? '—'}</span>
                <span style={{ color: 'var(--text-muted)' }}>{shortStack(row)}</span>
                <span style={{ color: 'var(--accent)' }}>{row.metric ?? ''}</span>
                <span style={{
                  color: status === 'production' ? 'var(--teal)'
                       : status === 'active' ? 'var(--green)'
                       : 'var(--text-secondary)',
                }}>
                  {status === 'production' ? '● ' : status === 'active' ? '● ' : '◐ '}{status}
                </span>
              </div>
            );
          })}
        </div>

        {/* Case study */}
        <div className="lc-card" style={{ padding: 32 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            marginBottom: 32, flexWrap: 'wrap', gap: 12,
          }}>
            <div>
              <p style={{
                fontSize: 10, color: 'var(--accent)', letterSpacing: '0.12em',
                textTransform: 'uppercase', marginBottom: 6,
              }}>
                case study{p.year ? ` · ${p.year}` : ''}
              </p>
              <h3 style={{
                fontSize: 24, color: 'var(--text-primary)', fontWeight: 500,
                letterSpacing: '-0.01em', lineHeight: 1.3, margin: 0,
              }}>
                {p.title}
              </h3>
              {p.org && (
                <p style={{ fontSize: 12, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', margin: '4px 0 0' }}>
                  / {p.org}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {p.metric && <span style={{ fontSize: 11, color: 'var(--accent)' }}>{p.metric}</span>}
              {p.githubUrl && (
                <a
                  href={p.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 11, color: 'var(--text-muted)', transition: 'color .15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  github ↗
                </a>
              )}
            </div>
          </div>

          <div
            className="lc-grid-2"
            style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 40 }}
          >
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.75, color: 'var(--text-secondary)' }}>
              <CSSection label="problem" text={p.problem ?? ''} />
              <CSSection label="approach" text={p.approach ?? ''} />
              <CSSection label="outcome" text={p.outcome ?? p.description} />

              {stack.length > 0 && (
                <div style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {stack.map((s) => (
                    <span key={s} style={{
                      fontFamily: 'var(--font-mono)', fontSize: 10.5,
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border-subtle)',
                      padding: '3px 8px', borderRadius: 3,
                    }}>{s}</span>
                  ))}
                </div>
              )}
            </div>

            {p.diagram && (
              <div>
                <p style={{
                  fontSize: 10, color: 'var(--text-faint)', letterSpacing: '0.12em',
                  textTransform: 'uppercase', marginBottom: 10,
                }}>
                  pipeline
                </p>
                <pre style={{
                  background: 'var(--bg-deep)', border: '1px solid var(--border-subtle)',
                  padding: 16, borderRadius: 4,
                  fontSize: 11, lineHeight: 1.75, color: 'var(--text-secondary)',
                  margin: 0, whiteSpace: 'pre', overflow: 'auto',
                }}>{p.diagram}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
