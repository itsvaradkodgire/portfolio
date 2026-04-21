import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { readContent } from '@/lib/content';
import { generateDocx } from '@/lib/docx-generator';
import type { ResumeData, TailoredResume } from '@/lib/types';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = await checkRateLimit(`docx:${ip}`);
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 });
  }

  const { tailored }: { tailored: TailoredResume } = await request.json();
  const baseData = await readContent<ResumeData>('resume');

  const buffer = await generateDocx(tailored, baseData);

  return new NextResponse(buffer as unknown as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': 'attachment; filename="varad-kodgire-resume.docx"',
    },
  });
}
