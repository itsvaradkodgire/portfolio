'use client';

export function Contact() {
  return (
    <section id="contact" className="lc-section" style={{ paddingBottom: 56 }}>
      <div className="lc-container">
        <div
          className="lc-grid-2"
          style={{
            border: '1px solid var(--accent-border)',
            background: 'linear-gradient(180deg, var(--accent-soft), transparent 80%)',
            padding: 40,
            borderRadius: 8,
            display: 'grid',
            gridTemplateColumns: '1.3fr 1fr',
            gap: 40,
            alignItems: 'center',
          }}
        >
          {/* Left */}
          <div>
            <p style={{
              fontSize: 11, color: 'var(--accent)', letterSpacing: '0.12em',
              textTransform: 'uppercase', marginBottom: 12,
            }}>
              &gt; connect --full-time
            </p>
            <h2 style={{
              fontSize: 32, fontFamily: 'var(--font-mono)', fontWeight: 500,
              color: 'var(--text-primary)', marginBottom: 12,
              lineHeight: 1.25, letterSpacing: '-0.01em',
            }}>
              Hiring someone<br />who actually ships?
            </h2>
            <p style={{
              fontFamily: 'var(--font-sans)', fontSize: 15,
              color: 'var(--text-secondary)', maxWidth: 500, lineHeight: 1.65,
              margin: 0,
            }}>
              Open to AI Developer, LLM Engineer, and Applied AI Researcher roles.
              Fast replies — usually within a day. Pune-based, remote-friendly,
              willing to relocate to Bangalore.
            </p>
          </div>

          {/* Right */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <a
              className="lc-btn-primary"
              href="/api/resume/download"
              download="varad-kodgire-resume.pdf"
              style={{ justifyContent: 'center', fontSize: 13, padding: '12px 16px' }}
            >
              $ download resume.pdf ↓
            </a>
            <a
              className="lc-btn-ghost"
              href="mailto:itsvaradkodgire@gmail.com"
              style={{ justifyContent: 'center' }}
            >
              itsvaradkodgire@gmail.com
            </a>
            <div style={{
              display: 'flex', gap: 14, fontSize: 11,
              color: 'var(--text-muted)', justifyContent: 'center', marginTop: 6,
            }}>
              <a
                href="https://github.com/itsvaradkodgire"
                target="_blank" rel="noopener noreferrer"
                style={{ transition: 'color .15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                github ↗
              </a>
              <span>·</span>
              <a
                href="https://linkedin.com/in/varad-kodgire-050171208"
                target="_blank" rel="noopener noreferrer"
                style={{ transition: 'color .15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                linkedin ↗
              </a>
              <span>·</span>
              <a
                href="tel:+918805200924"
                style={{ transition: 'color .15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                +91 8805 200 924
              </a>
            </div>
          </div>
        </div>

        {/* Footer line */}
        <div style={{
          marginTop: 32,
          display: 'flex', justifyContent: 'space-between',
          fontSize: 10.5, color: 'var(--text-faint)', letterSpacing: '0.08em',
        }}>
          <span>© 2026 varad kodgire · pune / bangalore</span>
          <span>exit 0</span>
        </div>
      </div>
    </section>
  );
}
