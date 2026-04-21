'use client';

import { useState } from 'react';

const PROJECTS = {
  friday: {
    id: 'friday', title: 'friday', org: 'personal', year: '2026',
    metric: 'token-free replays', status: 'active',
    problem: 'Live demos are fragile. You\'re juggling speaking, clicking, and audience engagement — one wrong click breaks the flow in front of everyone.',
    approach: 'Gemini Live API for continuous speech recognition. Playwright MCP server as the browser automation layer. Orchestrator matches spoken intent to pre-recorded browser flows — never generates actions dynamically. Core innovation: a "DVR for LLM reasoning" — records exact MCP tool calls and decisions so identical intents replay without invoking the model at all.',
    outcome: 'Demos run without click-juggling. Common paths become token-free (replay trace). Genuinely new situations still go live to the model. Speaker stays focused on the story.',
    stack: ['Node.js', 'Electron', 'Gemini Live', 'Playwright MCP', 'Chrome'],
    diagram: `[you speak]
     │
[electron — gemini live API]
     │  hears intent → match flow
     │
[orchestrator]
     │  execute steps
     │
[playwright MCP — :8931]
     │
[chrome — visible to audience]
     │
[demo site]`,
  },
  runo: {
    id: 'runo', title: 'runo', org: 'personal', year: '2026',
    metric: '0ms dead air', status: 'active',
    problem: 'Single-agent voice AI stalls > 800ms on heavy queries — dead air on a live call, which kills the conversation and makes the AI feel broken.',
    approach: 'Dual-agent architecture: primary agent handles the LLM call, bridge agent activates if latency exceeds 800ms using the exact same ElevenLabs cloned voice. Bridge fills time naturally while collecting qualifying data. When primary is ready, bridge finishes its sentence and hands off. Twilio WebSocket streams audio both directions. Callers never notice the switch.',
    outcome: 'Zero audible dead-air even on slow primary responses. Bridge also collects useful data during the gap, making latency productive. One voice, two engines, seamless.',
    stack: ['Node.js', 'Twilio', 'ElevenLabs', 'LLM API', 'WebSocket', 'Railway'],
    diagram: `caller speaks
     │
[primary agent — STT → LLM → TTS]
     │ if > 800ms
[bridge agent — same voice]
     │ collects data, fills gap
     │ primary ready →
[bridge finishes sentence]
     │
[primary takes over]
     │
caller never notices`,
  },
  'career-guidance': {
    id: 'career-guidance', title: 'career-guidance', org: 'personal', year: '2026',
    metric: 'full AI career stack', status: 'shipped',
    problem: 'Job seekers had no structured way to understand where they stood, what to learn next, or whether their resume actually matched the roles they were targeting.',
    approach: 'Conversational Gemini-powered chat extracts a structured user profile across multiple turns. spaCy-based ATS scorer benchmarks resume keywords against JD. Adzuna API for real-time job recommendations. FastAPI backend + MongoDB for session and profile persistence. Google OAuth for frictionless onboarding.',
    outcome: 'Profile, roadmap, ATS score, and live job matches — all personalized from a single conversation. Resume scorer gives actionable gap analysis, not vague scores.',
    stack: ['FastAPI', 'Python', 'MongoDB', 'Gemini', 'spaCy', 'React', 'Adzuna API'],
    diagram: `user chat
     │
[gemini — profile extractor]
     │
[profile builder → MongoDB]
     │
 ┌───┴────────────────┐
 ▼                    ▼
[roadmap gen]   [resume scorer]
                      │
               [spaCy ATS match]
                      │
               [adzuna job API]`,
  },
  openclaw: {
    id: 'openclaw', title: 'openclaw-agent', org: 'MyVyay', year: '2026',
    metric: '+45% task success', status: 'production',
    problem: 'One session worked. Five in parallel? Tokens ballooned, memory bled between sessions, failures were unreproducible. Logs were tarballed stdout.',
    approach: 'Split into six skill domains with typed tool schemas — IDE, GitHub, memory, logger, planner, router. Replaced greedy history truncation with relevance-weighted pruning, evaluated offline against a replay corpus. Made the logger first-class: structured, indexed by session, 30s to repro any failure locally.',
    outcome: 'Task success up 45%. 5+ concurrent sessions stable. Token cost per turn measurably down. Incident MTTR dropped from hours to minutes.',
    stack: ['Python', 'LLMs', 'GitHub API', 'Prompt Eng.', 'Context Pruning'],
    diagram: `user ──▶ planner
       │
       ▼
    memory ◀── context-prune
       │
 ┌─────┼─────┐
 ▼     ▼     ▼
ide   github logger
 │     │     │
 └─────┴─────┴──▶ result`,
  },
  tapvision: {
    id: 'tapvision', title: 'tapvision', org: 'CDAC', year: '2025',
    metric: '−35% latency', status: 'shipped',
    problem: "Users needed to feed PDFs, URLs, and raw text into a stack that could summarize, translate, and speak back — on hardware that couldn't hold full-precision models.",
    approach: 'Orchestrated 4 Hugging Face models (TTS, STT, MarianMT, summarizer) in a unified pipeline. Ollama INT4 quantization cut model footprint in half. Streamlit frontend for fast internal iteration.',
    outcome: '35% lower latency end-to-end. 50% smaller model footprint. Multilingual output across 3+ target languages.',
    stack: ['HF Transformers', 'Ollama', 'MarianMT', 'gTTS', 'Streamlit', 'Docker'],
    diagram: `pdf/url/text ──▶ summarise ──▶ translate
                │            │
                ▼            ▼
             speech ──▶ quantize ──▶ ui`,
  },
  cms: {
    id: 'cms', title: 'cms-multilingual-agent', org: 'MyVyay', year: '2025',
    metric: '−70% IT dependency', status: 'production',
    problem: 'Content teams waited on IT for every CMS change. Multilingual content meant multiple round-trips per asset.',
    approach: 'Piloted an LLM agent into the proprietary CMS via REST APIs. Adapted the NLP layer for 3+ languages and multi-format inputs. Ollama INT4 for local inference — no external API costs.',
    outcome: '50% faster setup per content asset. 70% reduction in IT dependency. Agent now handles routine CMS operations end-to-end.',
    stack: ['Python', 'LLMs', 'REST APIs', 'NLP', 'Hugging Face', 'Ollama'],
    diagram: `cms user ──▶ rest ──▶ nlp ──▶ multilingual
                            │
                            ▼
                        llm agent ──▶ cms backend`,
  },
};

const TABLE_ROWS: [string, keyof typeof PROJECTS, string, string, string, string][] = [
  ['01', 'friday',           'personal', 'Electron · Gemini',  'token-free demos', 'active'],
  ['02', 'runo',             'personal', 'Node.js · Twilio',   '0ms dead air',     'active'],
  ['03', 'career-guidance',  'personal', 'FastAPI · Gemini',   'full AI stack',    'shipped'],
  ['04', 'openclaw',         'MyVyay',   'Python · LLMs',      '+45% success',     'production'],
  ['05', 'tapvision',        'CDAC',     'HF · Ollama',        '−35% latency',     'shipped'],
  ['06', 'cms',              'MyVyay',   'Python · REST',      '−70% IT dep',      'production'],
];

function CSSection({ label, text }: { label: string; text: string }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <p style={{
        fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent)',
        letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6,
      }}>
        {label}
      </p>
      <p style={{ margin: 0 }}>{text}</p>
    </div>
  );
}

const GITHUB_LINKS: Record<string, string> = {
  friday:           'https://github.com/itsvaradkodgire/friday',
  runo:             'https://github.com/itsvaradkodgire/runo',
  'career-guidance':'https://github.com/itsvaradkodgire/career-guidance',
  openclaw:         'https://github.com/itsvaradkodgire',
  tapvision:        'https://github.com/itsvaradkodgire/Tapvision',
  cms:              'https://github.com/itsvaradkodgire',
};

export function Work() {
  const [active, setActive] = useState<keyof typeof PROJECTS>('friday');
  const p = PROJECTS[active];

  return (
    <section id="work" className="lc-section">
      <div className="lc-container">
        <div className="lc-section-head">
          <h2><span className="lc-prompt">$</span>ls -la ./systems</h2>
          <span className="lc-hint">6 systems · built and shipped</span>
        </div>

        {/* Table */}
        <div className="lc-card" style={{ overflow: 'hidden', marginBottom: 32 }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '44px 2fr 1fr 1.4fr 1fr 1fr',
            padding: '10px 18px', borderBottom: '1px solid var(--border-subtle)',
            fontSize: 10, color: 'var(--text-faint)', letterSpacing: '0.1em',
            textTransform: 'uppercase', background: 'var(--bg-deep)',
          }}>
            <span>#</span><span>name</span><span>org</span><span>stack</span><span>impact</span><span>status</span>
          </div>

          {TABLE_ROWS.map((r, i) => {
            const id = r[1];
            const isActive = id === active;
            return (
              <div
                key={id}
                onClick={() => setActive(id)}
                style={{
                  display: 'grid', gridTemplateColumns: '44px 2fr 1fr 1.4fr 1fr 1fr',
                  padding: '14px 18px',
                  borderBottom: i === TABLE_ROWS.length - 1 ? 'none' : '1px solid var(--border-subtle)',
                  fontSize: 12.5, cursor: 'pointer',
                  background: isActive ? 'var(--bg-elevated)' : 'transparent',
                  borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                  paddingLeft: isActive ? 16 : 18,
                  transition: 'background .15s, border-color .15s',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ color: 'var(--text-faint)' }}>{r[0]}</span>
                <span style={{ color: isActive ? 'var(--accent)' : 'var(--text-primary)' }}>{r[1]}</span>
                <span style={{ color: 'var(--text-muted)' }}>{r[2]}</span>
                <span style={{ color: 'var(--text-muted)' }}>{r[3]}</span>
                <span style={{ color: 'var(--accent)' }}>{r[4]}</span>
                <span style={{
                  color: r[5] === 'production' ? 'var(--teal)'
                       : r[5] === 'active' ? 'var(--green)'
                       : 'var(--text-secondary)',
                }}>
                  {r[5] === 'production' ? '● ' : r[5] === 'active' ? '● ' : '◐ '}{r[5]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Case study */}
        <div className="lc-card" style={{ padding: 32 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            marginBottom: 32, flexWrap: 'wrap', gap: 12,
          }}>
            <div>
              <p style={{
                fontSize: 10, color: 'var(--accent)', letterSpacing: '0.12em',
                textTransform: 'uppercase', marginBottom: 6,
              }}>
                case study · {p.year}
              </p>
              <h3 style={{
                fontSize: 24, color: 'var(--text-primary)', fontWeight: 500,
                letterSpacing: '-0.01em', lineHeight: 1.3, margin: 0,
              }}>
                {p.title}
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', margin: '4px 0 0' }}>
                / {p.org}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 11, color: 'var(--accent)' }}>{p.metric}</span>
              <a
                href={GITHUB_LINKS[p.id]}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 11, color: 'var(--text-muted)', transition: 'color .15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                github ↗
              </a>
            </div>
          </div>

          <div
            className="lc-grid-2"
            style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 40 }}
          >
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.75, color: 'var(--text-secondary)' }}>
              <CSSection label="problem" text={p.problem} />
              <CSSection label="approach" text={p.approach} />
              <CSSection label="outcome" text={p.outcome} />

              <div style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {p.stack.map((s) => (
                  <span key={s} style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10.5,
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-subtle)',
                    padding: '3px 8px', borderRadius: 3,
                  }}>{s}</span>
                ))}
              </div>
            </div>

            <div>
              <p style={{
                fontSize: 10, color: 'var(--text-faint)', letterSpacing: '0.12em',
                textTransform: 'uppercase', marginBottom: 10,
              }}>
                pipeline
              </p>
              <pre style={{
                background: 'var(--bg-deep)', border: '1px solid var(--border-subtle)',
                padding: 16, borderRadius: 4,
                fontSize: 11, lineHeight: 1.75, color: 'var(--text-secondary)',
                margin: 0, whiteSpace: 'pre', overflow: 'auto',
              }}>{p.diagram}</pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
