'use client';

import { useEffect, useRef, useState } from 'react';
import type { DemosData, TerminalCommand } from '@/lib/types';

interface TerminalDemoProps {
  demos: DemosData;
}

interface Line {
  type: 'command' | 'output';
  text: string;
  status?: TerminalCommand['status'];
}

const STATUS_COLOR = {
  success: '#4ade80',
  error:   '#f87171',
  neutral: '#8a8690',
};

const TYPING_SPEED_CMD = 45;
const TYPING_SPEED_OUT = 24;
const LOOP_PAUSE = 3000;

export function TerminalDemo({ demos }: TerminalDemoProps) {
  const [lines, setLines] = useState<Line[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [phase, setPhase] = useState<'command' | 'output'>('command');
  const [cmdIdx, setCmdIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const bodyRef = useRef<HTMLDivElement>(null);
  const commands = demos.terminalCommands;

  // Scroll only the terminal body div — never touches the page scroll
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [lines, currentText]);

  useEffect(() => {
    if (commands.length === 0) return;

    const cmd = commands[cmdIdx];
    const targetText = phase === 'command' ? `$ ${cmd.command}` : cmd.output;
    const speed = phase === 'command' ? TYPING_SPEED_CMD : TYPING_SPEED_OUT;

    if (charIdx < targetText.length) {
      const t = setTimeout(() => {
        setCurrentText(targetText.slice(0, charIdx + 1));
        setCharIdx((c) => c + 1);
      }, speed + Math.random() * (speed * 0.3));
      return () => clearTimeout(t);
    }

    if (phase === 'command') {
      const t = setTimeout(() => {
        setLines((prev) => [...prev, { type: 'command', text: targetText }]);
        setCurrentText('');
        setCharIdx(0);
        setPhase('output');
      }, 180);
      return () => clearTimeout(t);
    }

    if (phase === 'output') {
      const isLast = cmdIdx === commands.length - 1;
      const delay = isLast ? LOOP_PAUSE : cmd.delayAfter;
      const t = setTimeout(() => {
        setLines((prev) => [
          ...prev,
          { type: 'output', text: targetText, status: cmd.status },
        ]);
        setCurrentText('');
        setCharIdx(0);
        if (isLast) {
          setLines([]);
          setCmdIdx(0);
        } else {
          setCmdIdx((i) => i + 1);
        }
        setPhase('command');
      }, delay);
      return () => clearTimeout(t);
    }
  }, [charIdx, phase, cmdIdx, commands]);

  return (
    <div className="rounded-2xl border border-border-subtle bg-[#0d0d14] overflow-hidden">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border-subtle bg-bg-elevated">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
        </div>
        <span className="font-mono text-xs text-text-muted ml-2">deploy-pipeline.sh</span>
        <span className="ml-auto font-mono text-[9px] text-accent-green">● live</span>
      </div>

      {/* Terminal body — overflow scroll is scoped to this div only */}
      <div
        ref={bodyRef}
        className="p-5 font-mono text-xs leading-relaxed h-72 overflow-y-auto space-y-1.5"
        style={{ color: '#b0acaa', scrollBehavior: 'auto' }}
      >
        {lines.map((line, i) => (
          line.type === 'command' ? (
            <div key={i} className="flex gap-2">
              <span className="text-accent-secondary select-none">$</span>
              <span className="text-text-primary">{line.text.slice(2)}</span>
            </div>
          ) : (
            <div key={i} style={{ color: STATUS_COLOR[line.status ?? 'neutral'] }}>
              {line.text.split('\n').map((l, j) => <div key={j}>{l}</div>)}
            </div>
          )
        ))}

        {currentText && (
          phase === 'command' ? (
            <div className="flex gap-2">
              <span className="text-accent-secondary select-none">$</span>
              <span className="text-text-primary">{currentText.slice(2)}</span>
              <span className="terminal-cursor" />
            </div>
          ) : (
            <div style={{ color: STATUS_COLOR[commands[cmdIdx]?.status ?? 'neutral'] }}>
              {currentText.split('\n').map((l, j, arr) => (
                <div key={j}>{l}{j === arr.length - 1 && <span className="terminal-cursor" />}</div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
