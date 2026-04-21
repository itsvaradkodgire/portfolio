import Link from 'next/link';
import { readContent } from '@/lib/content';
import type { Project, SkillCategory, AnalyticsData } from '@/lib/types';

export default async function AdminDashboard() {
  const [projects, skills, analytics] = await Promise.all([
    readContent<Project[]>('projects'),
    readContent<SkillCategory[]>('skills'),
    readContent<AnalyticsData>('analytics'),
  ]);

  const totalSkills = skills.reduce((n, c) => n + c.items.length, 0);

  const cards = [
    { label: 'Projects',     value: projects.length,              href: '/admin/projects' },
    { label: 'Skill Items',  value: totalSkills,                  href: '/admin/skills' },
    { label: 'AI Resumes',   value: analytics.totalGenerations,   href: '/admin/analytics' },
    { label: 'Avg Match',    value: `${analytics.avgMatchScore}%`,href: '/admin/analytics' },
  ];

  const quickLinks = [
    { label: 'Edit Profile',    href: '/admin/profile' },
    { label: 'Add Project',     href: '/admin/projects' },
    { label: 'Edit Skills',     href: '/admin/skills' },
    { label: 'Resume Settings', href: '/admin/resume' },
    { label: 'Edit Contact',    href: '/admin/contact' },
    { label: 'SEO Settings',    href: '/admin/seo' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary mb-1">Dashboard</h1>
        <p className="text-text-muted text-sm font-mono">Overview of your portfolio content</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-bg-card border border-border-subtle rounded-xl p-5 hover:border-border-dim
                       hover:bg-bg-elevated transition-all"
          >
            <p className="font-mono text-xs text-text-faint uppercase tracking-wider mb-2">{card.label}</p>
            <p className="text-3xl font-bold text-text-primary font-mono">{card.value}</p>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div className="mb-8">
        <h2 className="font-mono text-xs text-text-faint uppercase tracking-wider mb-4">Quick access</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {quickLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="bg-bg-card border border-border-subtle rounded-xl px-4 py-3
                         font-mono text-sm text-text-muted hover:text-text-primary
                         hover:bg-bg-elevated hover:border-border-dim transition-all"
            >
              {l.label} →
            </Link>
          ))}
        </div>
      </div>

      {/* Top roles */}
      {analytics.topRoles.length > 0 && (
        <div>
          <h2 className="font-mono text-xs text-text-faint uppercase tracking-wider mb-4">Most analyzed roles</h2>
          <div className="bg-bg-card border border-border-subtle rounded-xl divide-y divide-border-subtle">
            {analytics.topRoles.slice(0, 5).map((r, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3">
                <span className="font-mono text-sm text-text-secondary">{r.role}</span>
                <span className="font-mono text-xs text-accent-primary bg-accent-primary/10 rounded px-2 py-0.5">
                  {r.count}×
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
