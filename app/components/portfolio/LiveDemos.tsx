'use client';

import { SemanticSearchDemo } from './SemanticSearchDemo';
import { NeuralNetDemo } from './NeuralNetDemo';
import { WebcamEdgeDemo } from './WebcamEdgeDemo';
import type { Project } from '@/lib/types';

export function LiveDemos({ projects }: { projects: Project[] }) {
  return (
    <section id="demos" className="lc-section">
      <div className="lc-container">
        <div className="lc-section-head">
          <h2>
            <span className="lc-prompt">$</span>./run --demos
          </h2>
          <span className="lc-hint">3 demos · zero api calls · all client-side</span>
        </div>

        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 15,
          color: 'var(--text-secondary)',
          maxWidth: 620,
          marginBottom: 36,
          lineHeight: 1.65,
        }}>
          Don&apos;t take my word for it. Every demo below is the real algorithm running in your
          browser right now — no uploads, no api keys, no cold start. View source and check.
        </p>

        <div
          className="lc-grid-2"
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}
        >
          <SemanticSearchDemo projects={projects} />
          <NeuralNetDemo />
        </div>

        <WebcamEdgeDemo />
      </div>
    </section>
  );
}
