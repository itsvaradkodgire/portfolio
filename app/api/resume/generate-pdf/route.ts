import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { readContent } from '@/lib/content';
import type { ResumeData, TailoredResume } from '@/lib/types';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = await checkRateLimit(`pdf:${ip}`);
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 });
  }

  const { tailored }: { tailored: TailoredResume } = await request.json();

  const baseData = await readContent<ResumeData>('resume');

  // Dynamic import to avoid bundling react-pdf on every route
  const { renderToBuffer } = await import('@react-pdf/renderer');
  const { ResumePDF } = await import('@/lib/pdf-generator');
  const React = await import('react');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(ResumePDF as any, { tailored, baseData });
  const buffer = await (renderToBuffer as (e: unknown) => Promise<Buffer>)(element);

  return new NextResponse(buffer as unknown as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="varad-kodgire-resume.pdf"',
    },
  });
}
