'use client';

import type { ContactData, Profile } from '@/lib/types';

export function Contact({ contact, profile }: { contact: ContactData; profile: Profile }) {
  const linkBy = (id: string) => contact.links.find((l) => l.id === id && l.visible);
  const email = linkBy('email');
  const github = linkBy('github');
  const linkedin = linkBy('linkedin');
  const phone = linkBy('phone');

  const emailAddr = email?.url.replace(/^mailto:/, '') ?? '';
  const phoneLabel = phone?.url.replace(/^tel:/, '') ?? '';

  const year = new Date().getFullYear();

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
              {contact.heading}
            </h2>
            <p style={{
              fontFamily: 'var(--font-sans)', fontSize: 15,
              color: 'var(--text-secondary)', maxWidth: 500, lineHeight: 1.65,
              margin: 0,
            }}>
              {contact.subtext}
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
            {email && (
              <a
                className="lc-btn-ghost"
                href={email.url}
                style={{ justifyContent: 'center' }}
              >
                {emailAddr}
              </a>
            )}
            <div style={{
              display: 'flex', gap: 14, fontSize: 11,
              color: 'var(--text-muted)', justifyContent: 'center', marginTop: 6,
              flexWrap: 'wrap',
            }}>
              {github && (
                <a
                  href={github.url}
                  target="_blank" rel="noopener noreferrer"
                  style={{ transition: 'color .15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  github ↗
                </a>
              )}
              {github && linkedin && <span>·</span>}
              {linkedin && (
                <a
                  href={linkedin.url}
                  target="_blank" rel="noopener noreferrer"
                  style={{ transition: 'color .15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  linkedin ↗
                </a>
              )}
              {linkedin && phone && <span>·</span>}
              {phone && (
                <a
                  href={phone.url}
                  style={{ transition: 'color .15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  {phoneLabel}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Footer line */}
        <div style={{
          marginTop: 32,
          display: 'flex', justifyContent: 'space-between',
          fontSize: 10.5, color: 'var(--text-faint)', letterSpacing: '0.08em',
        }}>
          <span>© {year} {(profile.name ?? '').toLowerCase()}{profile.location ? ` · ${profile.location.toLowerCase()}` : ''}</span>
          <span>exit 0</span>
        </div>
      </div>
    </section>
  );
}
