'use client';

import { useMemo, useState } from 'react';
import { DemoHead } from './DemoHead';
import type { Project } from '@/lib/types';

// ─── Tiny but REAL TF-IDF + cosine similarity search engine ───────────────────
// No API, no library — this is the actual math behind semantic/keyword retrieval,
// running live in your browser over Varad's real project data.

const STOP = new Set(['the', 'a', 'an', 'and', 'or', 'to', 'of', 'in', 'on', 'for', 'with', 'is', 'are', 'as', 'at', 'by', 'it', 'that', 'this', 'from', 'using', 'via']);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#. ]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP.has(w));
}

type Doc = { id: string; title: string; text: string; tf: Map<string, number>; norm: number };

function buildIndex(projects: Project[]) {
  const docs: Doc[] = projects.map((p) => {
    const text = [p.title, p.description, p.outcome, p.problem, p.approach, (p.stack ?? p.tags ?? []).join(' ')]
      .filter(Boolean).join(' ');
    const tokens = tokenize(text);
    const tf = new Map<string, number>();
    for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
    return { id: p.id, title: p.title, text, tf, norm: 0 };
  });

  // Document frequency → idf
  const df = new Map<string, number>();
  for (const d of docs) Array.from(d.tf.keys()).forEach((term) => df.set(term, (df.get(term) ?? 0) + 1));
  const N = docs.length;
  const idf = (term: string) => Math.log((N + 1) / ((df.get(term) ?? 0) + 1)) + 1;

  // Precompute tf-idf vector norms per doc
  for (const d of docs) {
    let sum = 0;
    Array.from(d.tf.entries()).forEach(([term, freq]) => { const w = freq * idf(term); sum += w * w; });
    d.norm = Math.sqrt(sum) || 1;
  }
  return { docs, idf };
}

export function SemanticSearchDemo({ projects }: { projects: Project[] }) {
  const [query, setQuery] = useState('real-time voice agent with low latency');
  const index = useMemo(() => buildIndex(projects), [projects]);

  const results = useMemo(() => {
    const qTokens = tokenize(query);
    if (qTokens.length === 0) return [];
    const qtf = new Map<string, number>();
    for (const t of qTokens) qtf.set(t, (qtf.get(t) ?? 0) + 1);
    let qnorm = 0;
    Array.from(qtf.entries()).forEach(([term, freq]) => { const w = freq * index.idf(term); qnorm += w * w; });
    qnorm = Math.sqrt(qnorm) || 1;

    return index.docs
      .map((d) => {
        // cosine similarity = dot(q, d) / (|q| * |d|)
        let dot = 0;
        Array.from(qtf.entries()).forEach(([term, qf]) => {
          const dfreq = d.tf.get(term);
          if (!dfreq) return;
          const idf = index.idf(term);
          dot += (qf * idf) * (dfreq * idf);
        });
        return { id: d.id, title: d.title, score: dot / (qnorm * d.norm) };
      })
      .sort((a, b) => b.score - a.score);
  }, [query, index]);

  const max = results[0]?.score || 1;

  return (
    <div className="lc-card" style={{ padding: 22 }}>
      <DemoHead idx="01" kind="retrieval / RAG" title="Semantic Project Search"
        desc="Live TF-IDF + cosine similarity over my real projects · client-side" />

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="describe what you're looking for..."
        style={{
          width: '100%', background: 'var(--bg-deep)', border: '1px solid var(--border-dim)',
          borderRadius: 4, padding: '10px 12px', color: 'var(--text-primary)',
          fontFamily: 'var(--font-mono)', fontSize: 12.5, outline: 'none', marginBottom: 14,
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {results.map((r, i) => {
          const rel = r.score / max;
          const pct = Math.round(r.score * 100);
          const isTop = i === 0 && r.score > 0;
          return (
            <div key={r.id} style={{ opacity: r.score > 0 ? 1 : 0.4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 3 }}>
                <span style={{ color: isTop ? 'var(--accent)' : 'var(--text-secondary)' }}>
                  {isTop ? '▸ ' : '  '}{r.title}
                </span>
                <span style={{ color: r.score > 0 ? 'var(--accent)' : 'var(--text-faint)', fontFamily: 'var(--font-mono)', fontSize: 10.5 }}>
                  {pct}% match
                </span>
              </div>
              <div style={{ height: 3, background: 'var(--border-subtle)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.max(2, rel * 100)}%`, height: '100%',
                  background: isTop ? 'var(--accent)' : 'var(--text-faint)',
                  transition: 'width .25s ease',
                }} />
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ fontSize: 10, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', margin: '14px 0 0' }}>
        vectorizes {projects.length} project docs, ranks by cosine similarity — the core of every RAG pipeline.
      </p>
    </div>
  );
}
