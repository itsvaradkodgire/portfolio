import { NextRequest, NextResponse } from 'next/server';
import { getProfile, getProjects, getSkills } from '@/lib/content';
import type { Skill } from '@/lib/types';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
  }

  const { messages } = await req.json() as {
    messages: { role: 'user' | 'model'; parts: { text: string }[] }[];
  };

  // Build system context from portfolio content
  const [profile, projects, skills] = await Promise.all([
    getProfile(),
    getProjects(),
    getSkills(),
  ]);

  const systemContext = `You are Varad's portfolio assistant. Answer questions about Varad Kodgire's background, skills, projects, and experience. Be concise, friendly, and technically informed.

Here is Varad's profile:
Title: ${profile.title}
About: ${Array.isArray(profile.bio) ? profile.bio.join(' ') : profile.bio}

Projects: ${projects.map((p) => `• ${p.title}: ${p.description} (${p.tags.join(', ')})`).join('\n')}

Skills: ${skills.map((cat) => `${cat.label}: ${cat.items.map((s: Skill) => s.name).join(', ')}`).join(' | ')}

Keep answers under 3 sentences unless the user asks for more detail. If asked about contacting Varad, point them to the Connect section of this page. If asked something outside Varad's portfolio, gently redirect.`;

  const body = {
    system_instruction: { parts: [{ text: systemContext }] },
    contents: messages,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 512,
    },
  };

  const resp = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const err = await resp.text();
    return NextResponse.json({ error: err }, { status: resp.status });
  }

  const data = await resp.json() as {
    candidates?: { content: { parts: { text: string }[] } }[];
  };

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Sorry, I could not generate a response.';
  return NextResponse.json({ text });
}
