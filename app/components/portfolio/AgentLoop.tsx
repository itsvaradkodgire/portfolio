'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  {
    id: 'problem',
    label: 'Problem Understanding',
    icon: '🔍',
    detail: 'I start by mapping unknowns. What data exists? What does success look like numerically? Who uses this and how? Every hour spent here saves three in debugging assumptions later. I write a one-page problem spec before touching code.',
  },
  {
    id: 'explore',
    label: 'Data Exploration',
    icon: '📊',
    detail: "EDA with a bias toward finding what's *wrong* with the data — missing values, label noise, distribution shifts, leakage. The interesting stuff is always in the tails. I use profiling + statistical tests, not just `.describe()`.",
  },
  {
    id: 'arch',
    label: 'Architecture Design',
    icon: '🏗️',
    detail: 'Baseline first, then complexity. Can a logistic regression solve 80% of this? If not, why not — and what does that tell me? I sketch the full system diagram before writing models: data flow, failure modes, latency budget, API contracts.',
  },
  {
    id: 'prototype',
    label: 'Rapid Prototyping',
    icon: '⚡',
    detail: 'Working code beats perfect plans. I build the smallest thing that can fail informatively — a 50-line chain, a quick fine-tune run, a dummy endpoint. Prototypes expose assumptions that specs miss. Fast iteration over long cycles.',
  },
  {
    id: 'eval',
    label: 'Evaluation & Benchmarking',
    icon: '🧪',
    detail: 'Evals are first-class code, not afterthoughts. I build evaluation harnesses before the model is done. For LLMs: structured LLM-as-judge + human spot-checking. For classical ML: held-out test sets, confusion matrix analysis, error case taxonomy.',
  },
  {
    id: 'deploy',
    label: 'Production Deployment',
    icon: '🚀',
    detail: "Containerize, load test, shadow deploy, then canary. I treat production as an experiment: instrument everything, define rollback criteria upfront, and deploy on Tuesday (not Friday). CI/CD gates on model performance, not just code tests.",
  },
  {
    id: 'monitor',
    label: 'Monitoring & Iteration',
    icon: '🔭',
    detail: 'Models degrade. I track input distribution shift, output quality, business metrics, and latency SLAs. Alerts are calibrated to avoid alert fatigue. Monitoring data feeds back into retraining — which brings us back to step one.',
  },
];

const NAV_H = 56;
// How many vh each step occupies while scrolling
const STEP_VH = 80;

export function AgentLoop() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const calc = () => {
      const el = sectionRef.current;
      if (!el) return;
      const { top, height } = el.getBoundingClientRect();
      const scrolled = -(top - NAV_H);
      if (scrolled < 0) { setActiveIdx(0); return; }
      const scrollable = height - (window.innerHeight - NAV_H);
      const progress = Math.min(Math.max(scrolled / scrollable, 0), 1);
      const idx = Math.min(Math.floor(progress * STEPS.length), STEPS.length - 1);
      setActiveIdx(idx);
    };

    // RAF throttle — calc runs at most once per animation frame
    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(calc);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    calc(); // initial
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const step = STEPS[activeIdx];
  const progressPct = ((activeIdx + 1) / STEPS.length) * 100;

  return (
    <section id="agent-loop" ref={sectionRef}
      style={{ height: `${STEPS.length * STEP_VH}vh` }}
      className="relative px-6"
    >
      {/* Sticky inner — pins while outer section scrolls */}
      <div
        className="sticky flex flex-col justify-center"
        style={{ top: NAV_H, height: `calc(100vh - ${NAV_H}px)` }}
      >
        <div className="max-w-content mx-auto w-full">
          {/* Header */}
          <div className="mb-10">
            <p className="label-mono mb-3">// how i work</p>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight">
              Every project follows a loop.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: active step detail */}
            <div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.28 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{step.icon}</span>
                    <div>
                      <p className="font-mono text-[10px] text-accent-primary uppercase tracking-widest mb-0.5">
                        step {activeIdx + 1} / {STEPS.length}
                      </p>
                      <h3 className="text-xl font-bold text-text-primary">{step.label}</h3>
                    </div>
                  </div>

                  <p className="text-text-secondary text-sm leading-relaxed max-w-md">
                    {step.detail}
                  </p>

                  {/* Progress bar */}
                  <div className="pt-2">
                    <div className="h-px bg-border-subtle rounded-full overflow-hidden max-w-xs">
                      <motion.div
                        className="h-full bg-accent-primary"
                        animate={{ width: `${progressPct}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className="font-mono text-[10px] text-text-faint mt-2">scroll to advance</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right: step list */}
            <div className="flex flex-col items-center gap-0">
              {STEPS.map((s, i) => {
                const isActive = i === activeIdx;
                const isPast   = i < activeIdx;
                return (
                  <div key={s.id} className="flex flex-col items-center w-full">
                    <motion.div
                      animate={isActive
                        ? { scale: 1.02, borderColor: 'rgba(212,131,78,0.55)' }
                        : { scale: 1,    borderColor: isPast ? 'rgba(91,168,160,0.35)' : 'rgba(255,255,255,0.07)' }
                      }
                      transition={{ duration: 0.2 }}
                      className={`
                        w-full max-w-[320px] flex items-center gap-3 px-4 py-2.5 rounded-xl border
                        transition-colors duration-200
                        ${isActive ? 'bg-bg-elevated shadow-[0_0_20px_rgba(212,131,78,0.10)]' : isPast ? 'bg-bg-card' : 'bg-bg-card opacity-50'}
                      `}
                    >
                      <span className={`text-sm ${isPast ? 'opacity-60' : ''}`}>{s.icon}</span>
                      <span className={`font-mono text-xs ${isActive ? 'text-text-primary' : isPast ? 'text-text-muted' : 'text-text-faint'}`}>
                        {s.label}
                      </span>
                      {isActive && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="ml-auto font-mono text-[9px] text-accent-primary"
                        >
                          ●
                        </motion.span>
                      )}
                      {isPast && (
                        <span className="ml-auto font-mono text-[9px] text-accent-secondary">✓</span>
                      )}
                    </motion.div>

                    {i < STEPS.length - 1 && (
                      <div className="flex flex-col items-center my-0.5">
                        <motion.div
                          className="w-px"
                          style={{ height: 14 }}
                          animate={{ background: isPast ? 'rgba(91,168,160,0.5)' : 'rgba(255,255,255,0.08)' }}
                          transition={{ duration: 0.3 }}
                        />
                        <div className="w-0 h-0" style={{
                          borderLeft: '3px solid transparent',
                          borderRight: '3px solid transparent',
                          borderTop: isPast ? '4px solid rgba(91,168,160,0.4)' : '4px solid rgba(255,255,255,0.07)',
                        }} />
                      </div>
                    )}

                    {i === STEPS.length - 1 && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-px w-6 bg-accent-primary/30" />
                        <span className="font-mono text-[9px] text-accent-primary/60">loops back to start</span>
                        <div className="h-px w-6 bg-accent-primary/30" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
