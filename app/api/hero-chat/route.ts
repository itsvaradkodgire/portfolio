import { NextRequest, NextResponse } from 'next/server';
import { getProfile, getProjects, getSkills, getResume, getContact } from '@/lib/content';
import type { Profile, Project, SkillCategory, ResumeData, ContactData } from '@/lib/types';

// Always read the latest content so the assistant reflects admin edits.
export const dynamic = 'force-dynamic';

// Try these models in order. If one is rate-limited (429) we fall through to the
// next, then finally to a local grounded answer — so visitors never see a raw
// provider/quota error.
const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash-lite'];

type Content = {
  profile: Profile;
  projects: Project[];
  skills: SkillCategory[];
  resume: ResumeData;
  contact: ContactData;
};

// ─── System prompt (grounded in live content) ────────────────────────────────
function buildSystemPrompt(c: Content): string {
  const projectLines = [...c.projects]
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
    .map((p) => {
      const meta = [p.org, p.status].filter(Boolean).join(', ');
      const impact = p.metric ? ` ${p.metric}.` : '';
      const stack = (p.stack && p.stack.length ? p.stack : p.tags) ?? [];
      const gh = p.githubUrl ? ` ${p.githubUrl.replace(/^https?:\/\//, '')}` : '';
      return `- ${p.title}${meta ? ` (${meta})` : ''}: ${p.outcome || p.description}${impact}${stack.length ? ` [${stack.join(', ')}]` : ''}${gh}`;
    })
    .join('\n');

  const stackLine = c.skills.flatMap((cat) => cat.items.map((s) => s.name)).join(' · ');

  const experienceLines = (c.resume.experience ?? [])
    .map((e) => `- ${e.title} at ${e.company} (${e.startDate}–${e.endDate}): ${e.bullets[0] ?? ''}`)
    .join('\n');

  const educationLine = (c.resume.education ?? [])
    .map((e) => `${e.degree}, ${e.school} (${e.year})`)
    .join(' · ');

  const contactLine = c.contact.links
    .filter((l) => l.visible)
    .map((l) => `${l.label}: ${l.url.replace(/^(mailto:|tel:)/, '')}`)
    .join(' | ');

  return `You are an AI assistant embedded in ${c.profile.name}'s portfolio website. Answer questions about ${c.profile.name} concisely and directly. Match the terminal aesthetic — be terse, technical, and honest. 1–3 sentences unless asked for more. Only use the facts below; if something isn't covered, say you only know about ${c.profile.name} and redirect. Never invent projects, numbers, or contact details.

WHO:
${c.profile.name} — ${c.profile.title}. ${c.profile.location ? `Based in ${c.profile.location}. ` : ''}${c.resume.baseSummary ?? ''}

PROJECTS:
${projectLines || '(none listed)'}

EXPERIENCE:
${experienceLines || '(none listed)'}

EDUCATION:
${educationLine || '(none listed)'}

STACK: ${stackLine}

CONTACT: ${contactLine}`;
}

// ─── Local grounded fallback ─────────────────────────────────────────────────
// When the AI provider is unavailable (e.g. daily quota hit), we still answer
// using a lightweight keyword match over the same content, so the assistant
// never looks broken and never leaks a provider error.
function localAnswer(question: string, c: Content): string {
  const q = question.toLowerCase();
  const has = (...words: string[]) => words.some((w) => q.includes(w));

  if (has('contact', 'email', 'reach', 'hire', 'available', 'work', 'phone')) {
    const links = c.contact.links.filter((l) => l.visible)
      .map((l) => `${l.label}: ${l.url.replace(/^(mailto:|tel:)/, '')}`).join(' · ');
    return `${c.profile.name} is open to full-time AI/LLM roles. Reach out — ${links}`;
  }

  if (has('stack', 'skill', 'tech', 'tool', 'language', 'framework')) {
    const top = c.skills.flatMap((cat) => cat.items).slice(0, 12).map((s) => s.name).join(', ');
    return `Core stack: ${top}.`;
  }

  if (has('experience', 'work', 'job', 'intern', 'company', 'where')) {
    const exp = (c.resume.experience ?? []).slice(0, 2)
      .map((e) => `${e.title} at ${e.company} (${e.startDate}–${e.endDate})`).join('; ');
    return exp ? `Experience: ${exp}.` : `See the experience section for details.`;
  }

  // Try to match a specific project by id, name, or tag.
  const words = q.split(/[^a-z0-9]+/).filter((w) => w.length > 2);
  const matched = c.projects.find((p) => {
    const hay = `${p.id} ${p.title}`.toLowerCase();
    if (words.some((w) => hay.includes(w))) return true;
    return (p.tags ?? []).some((t) => q.includes(t.toLowerCase()));
  });
  if (matched) {
    const impact = matched.metric ? ` ${matched.metric}.` : '';
    return `${matched.title}${matched.org ? ` (${matched.org})` : ''}: ${matched.outcome || matched.description}${impact}`;
  }

  if (has('project', 'built', 'build', 'made', 'portfolio')) {
    const names = [...c.projects].sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
      .slice(0, 6).map((p) => p.title).join(', ');
    return `Selected projects: ${names}. Ask about any one for details.`;
  }

  return `I can tell you about ${c.profile.name}'s projects, stack, experience, or how to get in touch. What would you like to know?`;
}

function textStream(text: string): ReadableStream<Uint8Array> {
  // Emit the fallback text in small chunks so it still "types" like a stream.
  const encoder = new TextEncoder();
  const words = text.split(' ');
  let i = 0;
  return new ReadableStream({
    async pull(controller) {
      if (i >= words.length) {
        controller.close();
        return;
      }
      const slice = words.slice(i, i + 3).join(' ') + (i + 3 < words.length ? ' ' : '');
      controller.enqueue(encoder.encode(slice));
      i += 3;
      await new Promise((r) => setTimeout(r, 40));
    },
  });
}

function streamHeaders() {
  return {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
  };
}

// Attempt one model; returns a token stream on success, or null if it failed
// (rate-limited / error) so the caller can try the next model or fall back.
async function tryModelStream(
  model: string,
  apiKey: string,
  body: unknown
): Promise<ReadableStream<Uint8Array> | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
  let resp: Response;
  try {
    resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    return null;
  }

  if (!resp.ok || !resp.body) {
    return null; // 429 / 5xx / etc. → let caller fall through
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = '';
  let emitted = false;

  return new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        if (!emitted) controller.enqueue(encoder.encode('…'));
        controller.close();
        return;
      }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const json = trimmed.slice(5).trim();
        if (!json || json === '[DONE]') continue;
        try {
          const parsed = JSON.parse(json) as {
            candidates?: { content?: { parts?: { text?: string }[] } }[];
          };
          const chunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (chunk) {
            emitted = true;
            controller.enqueue(encoder.encode(chunk));
          }
        } catch {
          /* ignore partial/keepalive */
        }
      }
    },
    cancel() {
      reader.cancel();
    },
  });
}

export async function POST(req: NextRequest) {
  const { messages } = await req.json() as {
    messages: { role: 'user' | 'assistant'; content: string }[];
  };
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';

  // Load live content (used by both the AI prompt and the local fallback).
  let content: Content | null = null;
  try {
    const [profile, projects, skills, resume, contact] = await Promise.all([
      getProfile(), getProjects(), getSkills(), getResume(), getContact(),
    ]);
    content = { profile, projects, skills, resume, contact };
  } catch {
    content = null;
  }

  const apiKey = process.env.GOOGLE_AI_KEY;

  // If we can serve AI, try each model in order.
  if (apiKey && content) {
    const body = {
      system_instruction: { parts: [{ text: buildSystemPrompt(content) }] },
      contents: messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      generationConfig: { temperature: 0.7, maxOutputTokens: 256 },
    };

    for (const model of MODELS) {
      const stream = await tryModelStream(model, apiKey, body);
      if (stream) {
        return new Response(stream, { headers: streamHeaders() });
      }
      // else: model unavailable (likely rate-limited) → try next
    }
  }

  // Fallback: local grounded answer (AI unavailable or not configured).
  const answer = content
    ? localAnswer(lastUser, content)
    : 'The assistant is briefly unavailable — please use the contact links below to reach Varad.';
  return new Response(textStream(answer), { headers: streamHeaders() });
}
