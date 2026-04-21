'use client';

import { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  delay?: number;
}

export function Tooltip({ content, children, delay = 150 }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const show = (e: React.MouseEvent) => {
    clearTimeout(timer.current);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPos({ x: rect.left + rect.width / 2, y: rect.top - 8 });
    timer.current = setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    clearTimeout(timer.current);
    setVisible(false);
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <div ref={ref} onMouseEnter={show} onMouseLeave={hide} className="relative inline-flex">
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            className="fixed z-50 pointer-events-none"
            style={{ left: pos.x, top: pos.y, transform: 'translate(-50%, -100%)' }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18 }}
          >
            <div className="bg-bg-elevated border border-border-dim rounded-lg px-3 py-2 text-xs text-text-secondary font-mono max-w-[240px] text-center shadow-xl shadow-black/40 mb-2">
              {content}
            </div>
            <div
              className="absolute left-1/2 -translate-x-1/2 w-0 h-0"
              style={{
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderTop: '5px solid rgba(255,255,255,0.1)',
                bottom: '-5px',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
