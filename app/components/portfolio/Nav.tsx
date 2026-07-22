'use client';

import { useEffect, useState } from 'react';

function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const stored = localStorage.getItem('lc-theme');
    const resolved = (stored === 'light' || stored === 'dark')
      ? stored
      : (document.documentElement.getAttribute('data-theme') as 'dark' | 'light' || 'dark');
    setTheme(resolved);
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('lc-theme', next); } catch (e) {}
    setTheme(next);
  };

  return (
    <button
      className="lc-theme-toggle"
      onClick={toggle}
      aria-label={`switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
    >
      <span className="lc-theme-toggle-knob">{theme === 'dark' ? '☾' : '☀'}</span>
    </button>
  );
}

export function Nav() {
  return (
    <div className="lc-topbar">
      <div className="lc-topbar-inner">
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
          <span style={{ display: 'inline-flex', gap: 6, flexShrink: 0 }}>
            <i style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56', display: 'inline-block' }}/>
            <i style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e', display: 'inline-block' }}/>
            <i style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f', display: 'inline-block' }}/>
          </span>
          <span style={{ color: 'var(--text-secondary)' }}>~/varad-kodgire</span>
          <span className="lc-hide-sm" style={{ color: 'var(--text-faint)' }}>·</span>
          <span className="lc-hide-sm">main</span>
          <span className="lc-hide-sm" style={{ color: 'var(--text-faint)' }}>·</span>
          <span className="lc-hide-sm" style={{ color: 'var(--teal)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="lc-status-dot"/>
            available for hire
          </span>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <a className="lc-hide-sm" href="#work" style={{ color: 'var(--text-muted)', transition: 'color .15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
            [ work ]
          </a>
          <a className="lc-hide-sm" href="#demos" style={{ color: 'var(--text-muted)', transition: 'color .15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
            [ demos ]
          </a>
          <a className="lc-hide-sm" href="#stack" style={{ color: 'var(--text-muted)', transition: 'color .15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
            [ stack ]
          </a>
          <a className="lc-hide-sm" href="#contact" style={{ color: 'var(--text-muted)', transition: 'color .15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
            [ contact ]
          </a>
          <ThemeToggle />
          <a href="/api/resume/download" download="varad-kodgire-resume.pdf" style={{ color: 'var(--accent)', transition: 'color .15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-hover)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--accent)')}>
            [ resume.pdf&nbsp;↓ ]
          </a>
        </div>
      </div>
    </div>
  );
}
