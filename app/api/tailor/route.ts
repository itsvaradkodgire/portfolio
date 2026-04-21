import { NextResponse } from 'next/server';
import { tailorProfile } from '@/lib/tailor';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { readContent, writeContent } from '@/lib/content';
import type { TailorRequest, AnalyticsData } from '@/lib/types';

export async function POST(request: Request) {
  // Rate limit
  const ip = getClientIp(request);
  const limit = await checkRateLimit(ip);

  if (!limit.allowed) {
    return NextResponse.json(
      { error: `Rate limit exceeded. Try again after ${new Date(limit.resetAt).toLocaleTimeString()}.` },
      { status: 429 }
    );
  }

  const body: TailorRequest = await request.json();

  if (!body.mode || !body.input?.trim()) {
    return NextResponse.json({ error: 'Missing mode or input' }, { status: 400 });
  }

  if (body.mode === 'jd' && body.input.trim().length < 50) {
    return NextResponse.json({ error: 'Job description too short (need 50+ chars)' }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'AI service not configured. Please add ANTHROPIC_API_KEY to your environment.' },
      { status: 503 }
    );
  }

  try {
    const [profile, projects, skills, resume] = await Promise.all([
      readContent<import('@/lib/types').Profile>('profile'),
      readContent<import('@/lib/types').Project[]>('projects'),
      readContent<import('@/lib/types').SkillCategory[]>('skills'),
      readContent<import('@/lib/types').ResumeData>('resume'),
    ]);

    const result = await tailorProfile(body, profile, projects, skills, resume);

    // Track analytics (best-effort)
    try {
      const analytics = await readContent<AnalyticsData>('analytics');
      const inputSummary = body.mode === 'role' ? body.input : body.input.slice(0, 60) + '…';
      analytics.totalGenerations += 1;
      analytics.entries.push({
        timestamp: new Date().toISOString(),
        mode: body.mode,
        inputSummary,
        matchScore: result.matchScore,
      });
      // Keep top roles list updated
      if (body.mode === 'role') {
        const existing = analytics.topRoles.find((r) => r.role === body.input);
        if (existing) {
          existing.count += 1;
        } else {
          analytics.topRoles.push({ role: body.input, count: 1 });
        }
        analytics.topRoles.sort((a, b) => b.count - a.count);
        analytics.topRoles = analytics.topRoles.slice(0, 20);
      }
      // Recalculate avg
      const scores = analytics.entries.map((e) => e.matchScore);
      analytics.avgMatchScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      // Keep entries capped
      analytics.entries = analytics.entries.slice(-500);
      await writeContent('analytics', analytics);
    } catch {
      // Non-critical — don't fail the request
    }

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[tailor] Error:', message);
    return NextResponse.json(
      { error: 'Analysis failed. Please try again.' },
      { status: 500 }
    );
  }
}
