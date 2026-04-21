import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base:    'var(--bg-base)',
          deep:    'var(--bg-deep)',
          surface: 'var(--bg-surface)',
          card:    'var(--bg-card)',
          elevated:'var(--bg-elevated)',
        },
        border: {
          subtle: 'var(--border-subtle)',
          dim:    'var(--border-dim)',
          medium: 'var(--border-medium)',
        },
        accent: {
          primary:   '#d4834e',
          secondary: '#5ba8a0',
          warm:      '#f5c97e',
          green:     '#4ade80',
        },
        text: {
          primary:   'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted:     'var(--text-muted)',
          faint:     'var(--text-faint)',
        },
      },
      fontFamily: {
        sans:  ['var(--font-geist-sans)', 'Inter', 'system-ui', 'sans-serif'],
        mono:  ['var(--font-geist-mono)', 'JetBrains Mono', 'Fira Code', 'monospace'],
      },
      spacing: {
        section: '120px',
        'section-sm': '80px',
      },
      maxWidth: {
        content: '1100px',
      },
      animation: {
        'flow':       'flow 2s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'draw':       'draw 1.5s ease-out forwards',
        'fade-up':    'fadeUp 0.6s ease-out forwards',
        'type':       'type 0.05s steps(1) infinite',
      },
      keyframes: {
        flow: {
          '0%':   { strokeDashoffset: '20' },
          '100%': { strokeDashoffset: '0' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', boxShadow: '0 0 8px rgba(212,131,78,0.2)' },
          '50%':      { opacity: '1',   boxShadow: '0 0 20px rgba(212,131,78,0.5)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
