import { NextRequest, NextResponse } from 'next/server';

const MODEL = 'gemma-3-27b-it';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const SYSTEM_PROMPT = `You are an AI assistant embedded in Varad Kodgire's portfolio website. Answer questions about Varad concisely and directly. Match the terminal aesthetic — be terse, technical, and honest. 1–3 sentences unless asked for more.

WHO:
Varad Kodgire — Applied AI Developer, Pune, India. Building at MyVyay. Open to full-time AI Developer / LLM Engineer / Applied AI Researcher roles (Bangalore + remote).

PROJECTS:
- friday: AI co-presenter using Gemini Live + Playwright MCP. Speaks your demo live. "DVR for LLM reasoning" — records MCP tool calls so common paths replay token-free next time. github.com/itsvaradkodgire/friday
- runo: Dual-agent voice call system. Bridge agent fires if primary LLM > 800ms, uses same ElevenLabs voice. Zero dead air on calls. github.com/itsvaradkodgire/runo
- career-guidance: AI career platform — Gemini chat, spaCy ATS resume scorer, Adzuna job API. FastAPI + MongoDB backend. github.com/itsvaradkodgire/career-guidance
- openclaw-agent (MyVyay, prod): Multi-session LLM agent framework. +45% task success. Relevance-weighted context pruning.
- tapvision (CDAC, shipped): 4 HuggingFace models in a unified pipeline. −35% latency, INT4 quantization, multilingual.
- cms-multilingual-agent (MyVyay, prod): LLM agent into proprietary CMS via REST. −70% IT dependency.

STACK: Python · LLMs · Docker · FastAPI · HuggingFace · Gemini · Playwright MCP · Gemma · Node.js · Twilio · ElevenLabs · MongoDB · spaCy · LangChain · RAG · Ollama · Kubernetes

CONTACT: itsvaradkodgire@gmail.com | github.com/itsvaradkodgire | linkedin.com/in/varad-kodgire-050171208 | +91 8805 200 924

If asked something outside Varad's portfolio, briefly say you only know about Varad and redirect.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_AI_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GOOGLE_AI_KEY not set' }, { status: 500 });
  }

  const { messages } = await req.json() as {
    messages: { role: 'user' | 'assistant'; content: string }[];
  };

  // Convert to Gemini API format (user/model roles)
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const body = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 256,
    },
  };

  try {
    const resp = await fetch(`${API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const err = await resp.text();
      return NextResponse.json({ error: `API error: ${err}` }, { status: resp.status });
    }

    const data = await resp.json() as {
      candidates?: { content: { parts: { text: string }[] } }[];
    };

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'no response.';
    return NextResponse.json({ text });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}
