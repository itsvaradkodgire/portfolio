'use client';

import { useState } from 'react';
import { scrollToElement } from '@/lib/scroll';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal } from '@/app/components/ui/ScrollReveal';
import { CircularGauge } from '@/app/components/ui/CircularGauge';
import type { TailorResponse, Project } from '@/lib/types';

// ─── Role selector ────────────────────────────────────────────────────────────
const ROLES = [
  { id: 'ai-engineer', label: 'AI Engineer', icon: '🧠' },
  { id: 'data-scientist', label: 'Data Scientist', icon: '📊' },
  { id: 'ml-engineer', label: 'ML Engineer', icon: '⚙️' },
  { id: 'llm-engineer', label: 'LLM / GenAI Engineer', icon: '🤖' },
  { id: 'fullstack-ai', label: 'Full-Stack AI Developer', icon: '🔧' },
];

// ─── Analysis loader steps ────────────────────────────────────────────────────
const LOADER_STEPS = [
  'Parsing job requirements...',
  'Matching skills to requirements...',
  'Analyzing project relevance...',
  'Generating tailored profile...',
  'Building custom resume...',
];

function AnalysisLoader({ done, error }: { done: boolean; error?: string }) {
  const [step, setStep] = useState(0);

  useState(() => {
    if (done) return;
    const interval = setInterval(() => {
      setStep((s) => {
        if (s >= LOADER_STEPS.length - 1) { clearInterval(interval); return s; }
        return s + 1;
      });
    }, 900);
    return () => clearInterval(interval);
  });

  return (
    <div className="rounded-xl border border-border-subtle bg-[#0d0d14] p-5 font-mono text-sm">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border-subtle">
        <div className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
        <span className="text-xs text-text-muted">analyzing...</span>
      </div>
      {LOADER_STEPS.map((s, i) => (
        <div key={i} className={`flex items-center gap-3 py-1.5 text-xs transition-colors ${i <= step ? 'text-text-secondary' : 'text-text-faint'}`}>
          <span className="w-4 text-center">
            {i < step || done ? (
              <span className="text-accent-green">✓</span>
            ) : i === step ? (
              <span className="text-accent-primary animate-pulse">→</span>
            ) : (
              <span className="text-text-faint">·</span>
            )}
          </span>
          {s}
        </div>
      ))}
      {error && (
        <div className="mt-3 pt-3 border-t border-border-subtle text-xs text-red-400">{error}</div>
      )}
    </div>
  );
}

// ─── Match results ─────────────────────────────────────────────────────────────
function MatchResults({
  result,
  projects,
}: {
  result: TailorResponse;
  projects: Project[];
}) {
  return (
    <div className="space-y-8">
      {/* Part A: Score & summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row items-center gap-8 p-6 rounded-2xl border border-border-subtle bg-bg-card"
      >
        <CircularGauge value={result.matchScore} label="Match" />
        <div>
          <p className="label-mono mb-3">match analysis</p>
          <p className="text-text-secondary text-sm leading-relaxed max-w-lg">{result.summary}</p>
        </div>
      </motion.div>

      {/* Part B: Requirements breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Requirements */}
        <div className="rounded-xl border border-border-subtle bg-bg-card p-5">
          <p className="label-mono mb-4">requirements analysis</p>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {result.matchedRequirements.map((req, i) => (
              <div key={i} className="flex gap-3">
                <span className={`mt-0.5 text-xs font-bold flex-shrink-0 ${req.matched ? 'text-accent-green' : 'text-text-faint'}`}>
                  {req.matched ? '✓' : '⟳'}
                </span>
                <div>
                  <p className="font-mono text-xs text-text-primary mb-0.5">{req.requirement}</p>
                  <p className="text-[11px] text-text-muted leading-relaxed">{req.evidence}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Relevant projects */}
        <div className="rounded-xl border border-border-subtle bg-bg-card p-5">
          <p className="label-mono mb-4">relevant projects</p>
          <div className="space-y-3">
            {result.relevantProjects.map((rp, i) => {
              const proj = projects.find((p) => p.id === rp.projectId);
              if (!proj) return null;
              return (
                <button
                  key={i}
                  onClick={() => {
                    const el = document.getElementById(`project-${proj.id}`);
                    if (el) scrollToElement(el);
                  }}
                  className="w-full text-left p-3 rounded-lg border border-border-subtle bg-bg-base
                             hover:border-border-dim hover:bg-bg-elevated transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs text-text-primary font-bold">{proj.title}</span>
                    <span className="font-mono text-[10px] text-accent-secondary">{rp.relevanceScore}% relevant</span>
                  </div>
                  <p className="text-[11px] text-text-muted">{rp.explanation}</p>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Part C: Tailored resume */}
      <TailoredResumePreview result={result} />
    </div>
  );
}

// ─── Tailored resume preview ──────────────────────────────────────────────────
function TailoredResumePreview({ result }: { result: TailorResponse }) {
  const [downloading, setDownloading] = useState<'pdf' | 'docx' | null>(null);

  const download = async (format: 'pdf' | 'docx') => {
    setDownloading(format);
    try {
      const res = await fetch(`/api/resume/generate-${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tailored: result.tailoredResume }),
      });
      if (!res.ok) throw new Error('Generation failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `varad-kodgire-resume.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Download failed. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const tr = result.tailoredResume;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="rounded-2xl border border-accent-primary/20 bg-bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border-subtle bg-bg-elevated flex items-center justify-between">
          <div>
            <p className="label-mono mb-1">your custom resume is ready</p>
            <p className="text-text-muted text-xs">Tailored in real-time by Claude AI</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => download('pdf')}
              disabled={!!downloading}
              className="font-mono text-xs px-4 py-2 rounded-lg bg-accent-primary/10 border border-accent-primary/30
                         text-accent-primary hover:bg-accent-primary/20 transition-all disabled:opacity-50"
            >
              {downloading === 'pdf' ? '...' : '↓ PDF'}
            </button>
            <button
              onClick={() => download('docx')}
              disabled={!!downloading}
              className="font-mono text-xs px-4 py-2 rounded-lg bg-bg-base border border-border-subtle
                         text-text-muted hover:text-text-primary hover:border-border-dim transition-all disabled:opacity-50"
            >
              {downloading === 'docx' ? '...' : '↓ DOCX'}
            </button>
          </div>
        </div>

        {/* Preview card (white/light theme to show it's the actual PDF) */}
        <div className="p-6 bg-[#f8f6f3]">
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg shadow-black/20 p-8 text-[#1a1a1a]">
            <h2 className="text-2xl font-bold text-[#0f0f0f] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              Varad Kodgire
            </h2>
            <p className="text-[#d4834e] font-semibold text-sm mb-3">{tr.title}</p>
            <div className="h-px bg-[#e8e0d8] mb-4" />
            <p className="text-[11px] text-[#555] leading-relaxed mb-5">{tr.summary}</p>

            {tr.skills.length > 0 && (
              <div className="mb-4">
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#d4834e] mb-2">Core Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {tr.skills.slice(0, 12).map((s, i) => (
                    <span key={i} className="text-[10px] bg-[#f5f0eb] text-[#555] rounded px-2 py-0.5 font-mono">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {tr.projects.length > 0 && (
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#d4834e] mb-2">Selected Projects</p>
                {tr.projects.slice(0, 2).map((p, i) => (
                  <div key={i} className="mb-2">
                    <p className="text-[11px] font-bold text-[#111]">{p.title}</p>
                    <p className="text-[10px] text-[#555] leading-relaxed">{p.description.slice(0, 140)}…</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-center font-mono text-[10px] text-text-faint mt-4">
            This resume was generated in real-time by AI, tailored specifically to the role you provided.
            <br />That&apos;s the kind of system I build.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main HireMe section ──────────────────────────────────────────────────────
interface HireMeProps {
  projects: Project[];
}

export function HireMe({ projects }: HireMeProps) {
  const [mode, setMode] = useState<'role' | 'jd'>('role');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [jdText, setJdText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingDone, setLoadingDone] = useState(false);
  const [result, setResult] = useState<TailorResponse | null>(null);
  const [error, setError] = useState('');

  const canSubmit = mode === 'role' ? !!selectedRole : jdText.trim().length > 50;

  const analyze = async () => {
    setLoading(true);
    setLoadingDone(false);
    setResult(null);
    setError('');

    try {
      const res = await fetch('/api/tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          input: mode === 'role' ? selectedRole : jdText,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Analysis failed. Please try again.');
        return;
      }

      setLoadingDone(true);
      setTimeout(() => {
        setResult(data);
        setLoading(false);
      }, 600);
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <section id="hire-me" className="py-section px-6">
      {/* Divider */}
      <div className="max-w-content mx-auto mb-16">
        <div className="h-px bg-gradient-to-r from-transparent via-accent-primary/20 to-transparent" />
      </div>

      <div className="max-w-content mx-auto">
        <ScrollReveal>
          <p className="label-mono mb-4">// find your fit</p>
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-3 tracking-tight">
            Tell me what you need. I&apos;ll show you I can build it.
          </h2>
          <p className="text-text-muted text-sm max-w-lg">
            Paste a job description or pick a role — and watch this portfolio adapt to you.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.15} className="mt-12">
          {/* Mode toggle */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => setMode('role')}
              className={`font-mono text-xs px-4 py-2 rounded-lg border transition-all ${mode === 'role'
                ? 'border-accent-primary/40 bg-accent-primary/10 text-accent-primary'
                : 'border-border-subtle text-text-muted hover:text-text-primary'
                }`}
            >
              quick select role
            </button>
            <span className="text-text-faint text-xs font-mono">or</span>
            <button
              onClick={() => setMode('jd')}
              className={`font-mono text-xs px-4 py-2 rounded-lg border transition-all ${mode === 'jd'
                ? 'border-accent-primary/40 bg-accent-primary/10 text-accent-primary'
                : 'border-border-subtle text-text-muted hover:text-text-primary'
                }`}
            >
              paste a job description →
            </button>
          </div>

          <AnimatePresence mode="wait">
            {mode === 'role' ? (
              <motion.div
                key="role"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6"
              >
                {ROLES.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.label)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all hover-glow
                      ${selectedRole === role.label
                        ? 'border-accent-primary/50 bg-accent-primary/10 shadow-[0_0_20px_rgba(212,131,78,0.1)]'
                        : 'border-border-subtle bg-bg-card hover:bg-bg-elevated'
                      }
                    `}
                  >
                    <span className="text-2xl">{role.icon}</span>
                    <span className="font-mono text-xs text-text-secondary text-center leading-tight">
                      {role.label}
                    </span>
                  </button>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="jd"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="mb-6"
              >
                <div className="relative">
                  <textarea
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    placeholder="Paste the full job description here..."
                    className="w-full h-48 bg-bg-card border border-border-subtle rounded-xl p-4 font-mono text-sm
                               text-text-secondary placeholder:text-text-faint resize-none outline-none
                               focus:border-border-medium transition-colors"
                  />
                  <div className="absolute bottom-3 right-3 font-mono text-[10px] text-text-faint">
                    {jdText.length} chars
                    {jdText.length < 50 && jdText.length > 0 && (
                      <span className="text-yellow-500/70 ml-1">(need 50+)</span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={analyze}
            disabled={!canSubmit || loading}
            className="font-mono text-sm px-6 py-3 rounded-xl bg-accent-primary text-bg-base font-bold
                       hover:bg-accent-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed
                       shadow-[0_4px_24px_rgba(212,131,78,0.2)] hover:shadow-[0_4px_32px_rgba(212,131,78,0.35)]"
          >
            {loading ? 'Analyzing...' : 'Analyze →'}
          </button>
        </ScrollReveal>

        {/* Loading state */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8 max-w-lg"
            >
              <AnalysisLoader done={loadingDone} error={error} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error state */}
        {!loading && error && (
          <div className="mt-6 p-4 rounded-xl border border-red-500/20 bg-red-500/5 font-mono text-sm text-red-400">
            {error}
            <button onClick={() => setError('')} className="ml-3 text-red-400/60 hover:text-red-400">dismiss</button>
          </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-12"
            >
              <MatchResults result={result} projects={projects} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
