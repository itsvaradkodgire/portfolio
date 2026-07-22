'use client';

/** Shared header for the live demo cards. */
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
