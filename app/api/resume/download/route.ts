import { NextResponse } from 'next/server';
import { readContent } from '@/lib/content';
import type {
  ResumeData,
  Project,
  SkillCategory,
  TailoredResume,
} from '@/lib/types';

// Always render from live storage; never statically cache.
export const dynamic = 'force-dynamic';

// Builds a non-tailored "base" resume straight from stored content so the
// public "download resume.pdf" button always works, with no AI call required.
function buildBaseTailoredResume(
  resume: ResumeData,
  projects: Project[],
  skills: SkillCategory[]
): TailoredResume {
  const topProjects = [...projects]
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
    .filter((p) => p.featured !== false)
    .slice(0, 4)
    .map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      tags: p.tags,
    }));

  const flatSkills = skills.flatMap((cat) => cat.items.map((s) => s.name));

  return {
    title: resume.experience[0]?.title ?? 'Applied AI Developer',
    summary: resume.baseSummary,
    skills: flatSkills,
    experience: resume.experience.map((e) => ({
      company: e.company,
      title: e.title,
      startDate: e.startDate,
      endDate: e.endDate,
      bullets: e.bullets,
    })),
    projects: topProjects,
  };
}

export async function GET() {
  const [resume, projects, skills] = await Promise.all([
    readContent<ResumeData>('resume'),
    readContent<Project[]>('projects'),
    readContent<SkillCategory[]>('skills'),
  ]);

  const tailored = buildBaseTailoredResume(resume, projects, skills);
  const skillGroups = skills.map((cat) => ({
    label: cat.label,
    values: cat.items.map((s) => s.name),
  }));

  const { renderToBuffer } = await import('@react-pdf/renderer');
  const { ResumePDF } = await import('@/lib/pdf-generator');
  const React = await import('react');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(ResumePDF as any, { tailored, baseData: resume, skillGroups });
  const buffer = await (renderToBuffer as (e: unknown) => Promise<Buffer>)(element);

  return new NextResponse(buffer as unknown as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="varad-kodgire-resume.pdf"',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  });
}
