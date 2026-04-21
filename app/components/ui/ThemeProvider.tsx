'use client';

import { createContext, useContext, useCallback, useRef, useState, useEffect } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({ theme: 'dark', toggle: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [overlayPhase, setOverlayPhase] = useState<'idle' | 'in' | 'out'>('idle');
  const busyRef = useRef(false);

  // Sync to html data-theme on mount (respects stored preference)
  useEffect(() => {
    const stored = localStorage.getItem('lc-theme') as Theme | null;
    const resolved: Theme = (stored === 'light' || stored === 'dark') ? stored : 'dark';
    setTheme(resolved);
    document.documentElement.setAttribute('data-theme', resolved);
  }, []);

  const toggle = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;

    const next: Theme = theme === 'dark' ? 'light' : 'dark';

    // Phase 1: sweep in
    setOverlayPhase('in');

    // At animation peak (~420ms), flip the theme
    setTimeout(() => {
      setTheme(next);
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('lc-theme', next);
      // Phase 2: sweep out
      setOverlayPhase('out');
    }, 420);

    // Done
    setTimeout(() => {
      setOverlayPhase('idle');
      busyRef.current = false;
    }, 860);
  }, [theme]);

  // Overlay color is the *destination* bg so the sweep reveals the new theme
  const overlayBg = theme === 'dark' ? '#f5f4f2' : '#0a0a0f';

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
      {overlayPhase !== 'idle' && (
        <div
          key={overlayPhase}
          aria-hidden
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9998,
            pointerEvents: 'none',
            background: overlayBg,
          }}
          className={overlayPhase === 'in' ? 'theme-sweep-in' : 'theme-sweep-out'}
        />
      )}
    </ThemeContext.Provider>
  );
}
