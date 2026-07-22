'use client';

import type { ResumeData } from '@/lib/types';

export function Experience({ resume }: { resume: ResumeData }) {
  const experience = resume.experience ?? [];
  if (experience.length === 0) return null;

  return (
    <section id="experience" className="lc-section">
      <div className="lc-container">
        <div className="lc-section-head">
          <h2><span className="lc-prompt">$</span>cat experience.log</h2>
          <span className="lc-hint">{experience.length} roles · most recent first</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {experience.map((exp) => (
            <div key={exp.id} className="lc-card" style={{ padding: 28 }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                flexWrap: 'wrap', gap: 8, marginBottom: 4,
              }}>
                <h3 style={{
                  fontSize: 18, fontFamily: 'var(--font-mono)', fontWeight: 500,
                  color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em',
                }}>
                  {exp.title}
                  <span style={{ color: 'var(--accent)' }}> @ {exp.company}</span>
                </h3>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--text-faint)',
                }}>
                  {exp.startDate} – {exp.endDate}
                </span>
              </div>

              {exp.location && (
                <p style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11.5,
                  color: 'var(--text-muted)', margin: '0 0 14px',
                }}>
                  / {exp.location}
                </p>
              )}

              <ul style={{
                margin: 0, paddingLeft: 0, listStyle: 'none',
                display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                {exp.bullets.map((b, j) => (
                  <li key={j} style={{
                    display: 'flex', gap: 10,
                    fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.65,
                    color: 'var(--text-secondary)',
                  }}>
                    <span style={{ color: 'var(--accent)', flexShrink: 0 }}>▸</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
