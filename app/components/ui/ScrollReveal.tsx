'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode, CSSProperties } from 'react';

// Pure CSS intersection observer — zero Framer Motion overhead on scroll
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const timeout = setTimeout(() => {
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible(true);
            obs.disconnect();
          }
        },
        { threshold, rootMargin: '0px 0px -40px 0px' }
      );

      obs.observe(el);
    }, 100); // ⬅️ delay avoids initial jump

    return () => clearTimeout(timeout);
  }, [threshold]);

  return { ref, visible };
}

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function ScrollReveal({
  children,
  delay = 0,
  duration = 0.45,
  className,
}: ScrollRevealProps) {
  const { ref, visible } = useInView(0.08);

  const style: CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? 'none' : 'translateY(14px)',
    transition: `opacity ${duration}s ease ${delay}s, transform ${duration}s ease ${delay}s`,
    willChange: visible ? 'auto' : 'opacity, transform',
  };

  return (
    <div ref={ref} style={style} className={className}>
      {children}
    </div>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

// Stagger just sets a CSS variable each child reads as its delay
export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.07,
}: StaggerContainerProps) {
  const { ref, visible } = useInView(0.05);

  return (
    <div
      ref={ref}
      className={className}
      data-visible={visible ? 'true' : 'false'}
      data-stagger={staggerDelay}
    >
      {children}
    </div>
  );
}

export function StaggerItem({
  children,
  className,
  index = 0,
}: {
  children: ReactNode;
  className?: string;
  index?: number;
}) {
  // Read parent's visibility via closest data attribute
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const parent = el.closest('[data-visible]');
    if (!parent) return;

    const stagger = parseFloat((parent as HTMLElement).dataset.stagger ?? '0.07');

    const obs = new MutationObserver(() => {
      if ((parent as HTMLElement).dataset.visible === 'true') {
        setTimeout(() => setVisible(true), index * stagger * 1000);
        obs.disconnect();
      }
    });
    obs.observe(parent, { attributes: true, attributeFilter: ['data-visible'] });

    // In case already visible
    if ((parent as HTMLElement).dataset.visible === 'true') {
      setTimeout(() => setVisible(true), index * stagger * 1000);
    }

    return () => obs.disconnect();
  }, [index]);

  const style: CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? 'none' : 'translateY(10px)',
    transition: `opacity 0.4s ease, transform 0.4s ease`,
    willChange: visible ? 'auto' : 'opacity, transform',
  };

  return (
    <div ref={ref} style={style} className={className}>
      {children}
    </div>
  );
}
