'use client';

import { useRef, useState, useEffect } from 'react';
import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext';

/**
 * Renders a heading with a cycling animated underline under key words.
 * Uses Pretext to measure each word's exact pixel width — no getBoundingClientRect,
 * no DOM layout reflow. On resize, only layout() re-runs (not prepare()).
 */

interface WordMeasure {
  word: string;
  width: number; // Pretext-measured, pixel-exact
}

interface PretextHeadingProps {
  text: string;
  highlightWords?: string[]; // which words to animate the underline on
  className?: string;
  cycleInterval?: number; // ms between highlight advances
}

export function PretextHeading({
  text,
  highlightWords,
  className = '',
  cycleInterval = 1800,
}: PretextHeadingProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [measures, setMeasures] = useState<WordMeasure[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);

  const words = text.split(' ');

  // Which words should get underlines
  const targets = highlightWords ?? words.filter(w => w.length > 3);
  // Map to word indices
  const targetIndices = targets
    .map(t => words.findIndex(w => w.replace(/[.,!?]/, '') === t.replace(/[.,!?]/, '')))
    .filter(i => i !== -1);

  useEffect(() => {
    if (targetIndices.length === 0) return;
    const id = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % targetIndices.length);
    }, cycleInterval);
    return () => clearInterval(id);
  }, [targetIndices.length, cycleInterval]);

  // One-time prepare per word (cached by Pretext), re-layout on resize
  useEffect(() => {
    let preparedWords: ReturnType<typeof prepareWithSegments>[] = [];

    const layout = () => {
      const el = headingRef.current;
      if (!el) return;
      // One DOM read for font — not a layout reflow, just style lookup
      const font = getComputedStyle(el).font;
      if (!font) return;

      if (preparedWords.length === 0) {
        // prepare() is the expensive pass — run once
        preparedWords = words.map(w => prepareWithSegments(w, font));
      }

      // layout() is pure arithmetic — cheap, safe to run on every resize
      const measured = preparedWords.map((prepared, i) => {
        const result = layoutWithLines(prepared, 99999, 99999);
        return {
          word: words[i],
          width: result.lines[0]?.width ?? 0,
        };
      });
      setMeasures(measured);
    };

    // Wait for fonts to load before first measure
    if (document.fonts?.ready) {
      document.fonts.ready.then(layout);
    } else {
      layout();
    }

    window.addEventListener('resize', layout, { passive: true });
    return () => window.removeEventListener('resize', layout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const activeWordIdx = targetIndices[activeIdx] ?? -1;

  return (
    <h1 ref={headingRef} className={className}>
      {words.map((word, i) => {
        const isActive = i === activeWordIdx;
        const w = measures[i]?.width ?? 0;

        return (
          <span key={i} style={{ position: 'relative', display: 'inline' }}>
            {word}
            {/* Pretext-measured underline — width is exact, not guessed */}
            {w > 0 && targetIndices.includes(i) && (
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  bottom: '-3px',
                  left: 0,
                  height: '2px',
                  width: `${w}px`,
                  background: '#d4834e',
                  borderRadius: '1px',
                  transformOrigin: 'left center',
                  transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                  opacity: isActive ? 1 : 0,
                  transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1), opacity 0.2s ease',
                  willChange: 'transform',
                }}
              />
            )}
            {i < words.length - 1 ? ' ' : ''}
          </span>
        );
      })}
    </h1>
  );
}
