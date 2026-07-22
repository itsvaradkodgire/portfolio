import { NextRequest, NextResponse } from 'next/server';
import { getProfile, getProjects, getSkills, getResume, getContact } from '@/lib/content';
import type { Profile, Project, SkillCategory, ResumeData, ContactData } from '@/lib/types';

// Always read the latest content so the assistant reflects admin edits.
export const dynamic = 'force-dynamic';

const MODEL = 'gemini-2.5-flash';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent`;

// Build the system prompt from LIVE content, so the chatbot's knowledge always
// matches what's in the admin panel instead of a stale hardcoded blob.
function buildSystemPrompt(
  profile: Profile,
  projects: Project[],
  skills: SkillCategory[],
  resume: ResumeData,
  contact: ContactData
): string {
  const projectLines = [...projects]
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
    .map((p) => {
      const meta = [p.org, p.status].filter(Boolean).join(', ');
      const impact = p.metric ? ` ${p.metric}.` : '';
      const stack = (p.stack && p.stack.length ? p.stack : p.tags) ?? [];
      const gh = p.githubUrl ? ` ${p.githubUrl.replace(/^https?:\/\//, '')}` : '';
      return `- ${p.title}${meta ? ` (${meta})` : ''}: ${p.outcome || p.description}${impact}${stack.length ? ` [${stack.join(', ')}]` : ''}${gh}`;
    })
    .join('\n');

  const stackLine = skills.flatMap((c) => c.items.map((s) => s.name)).join(' · ');

  const experienceLines = (resume.experience ?? [])
    .map((e) => `- ${e.title} at ${e.company} (${e.startDate}–${e.endDate}): ${e.bullets[0] ?? ''}`)
    .join('\n');

  const educationLine = (resume.education ?? [])
    .map((e) => `${e.degree}, ${e.school} (${e.year})`)
    .join(' · ');

  const contactLine = contact.links
    .filter((l) => l.visible)
    .map((l) => `${l.label}: ${l.url.replace(/^(mailto:|tel:)/, '')}`)
    .join(' | ');

  return `You are an AI assistant embedded in ${profile.name}'s portfolio website. Answer questions about ${profile.name} concisely and directly. Match the terminal aesthetic — be terse, technical, and honest. 1–3 sentences unless asked for more. Only use the facts below; if something isn't covered, say you only know about ${profile.name} and redirect. Never invent projects, numbers, or contact details.

WHO:
${profile.name} — ${profile.title}. ${profile.location ? `Based in ${profile.location}. ` : ''}${resume.baseSummary ?? ''}

PROJECTS:
${projectLines || '(none listed)'}

EXPERIENCE:
${experienceLines || '(none listed)'}

EDUCATION:
${educationLine || '(none listed)'}

STACK: ${stackLine}

CONTACT: ${contactLine}`;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_AI_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GOOGLE_AI_KEY not set' }, { status: 500 });
  }

  const { messages } = await req.json() as {
    messages: { role: 'user' | 'assistant'; content: string }[];
  };

  // Load live content and build the grounded system prompt.
  let systemPrompt: string;
  try {
    const [profile, projects, skills, resume, contact] = await Promise.all([
      getProfile(),
      getProjects(),
      getSkills(),
      getResume(),
      getContact(),
    ]);
    systemPrompt = buildSystemPrompt(profile, projects, skills, resume, contact);
  } catch {
    systemPrompt = `You are an AI assistant on Varad Kodgire's portfolio. Answer briefly and honestly. If unsure, say you only know about Varad.`;
  }

  // Convert to Gemini API format (user/model roles)
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 256,
    },
  };

  try {
    const resp = await fetch(`${API_URL}?alt=sse&key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!resp.ok || !resp.body) {
      const err = await resp.text();
      return NextResponse.json({ error: `API error: ${err}` }, { status: resp.status });
    }

    // Transform Gemini's SSE stream into a plain text token stream the client
    // can append as it arrives, so replies render token-by-token.
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let buffer = '';

    const stream = new ReadableStream({
      async pull(controller) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }
        buffer += decoder.decode(value, { stream: true });
        // SSE frames are separated by blank lines; each data line is JSON.
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
            if (chunk) controller.enqueue(encoder.encode(chunk));
          } catch {
            /* ignore partial/non-JSON keepalive lines */
          }
        }
      },
      cancel() {
        reader.cancel();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}
