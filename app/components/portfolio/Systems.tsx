'use client';

import { ScrollReveal, StaggerContainer, StaggerItem } from '@/app/components/ui/ScrollReveal';
import { AnimatedDiagram } from '@/app/components/ui/AnimatedDiagram';
import type { Project } from '@/lib/types';

interface SystemsProps {
  projects: Project[];
}

function TagPill({ tag }: { tag: string }) {
  return (
    <span className="font-mono text-[10px] text-accent-secondary bg-accent-secondary/8 border border-accent-secondary/20 rounded px-2 py-0.5">
      {tag}
    </span>
  );
}

function SystemEntry({ project, idx }: { project: Project; idx: number }) {
  const isLeft = project.side === 'left';

  return (
    <div
      id={`project-${project.id}`}
      className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-center ${idx > 0 ? 'mt-24' : ''}`}
    >
      {/* Diagram side */}
      <div className={`${isLeft ? 'order-first' : 'order-first lg:order-last'}`}>
        <ScrollReveal delay={0.1}>
          <div className="rounded-2xl border border-border-subtle bg-bg-card p-6 hover-glow">
            <AnimatedDiagram nodes={project.nodes} edges={project.edges} />
          </div>
        </ScrollReveal>
      </div>

      {/* Text side */}
      <div className={`${isLeft ? 'order-last' : 'order-last lg:order-first'}`}>
        <ScrollReveal delay={0.15}>
          <p className="label-mono mb-3">
            0{idx + 1} / {project.diagramType}
          </p>
          <h3 className="text-2xl md:text-3xl font-bold text-text-primary mb-4 tracking-tight">
            {project.title}
          </h3>

          {project.stats && (
            <p className="font-mono text-xs text-accent-primary mb-4 border border-accent-primary/20 bg-accent-primary/5 rounded px-3 py-1.5 inline-block">
              {project.stats}
            </p>
          )}

          <p className="text-text-secondary text-sm leading-relaxed mb-6">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <TagPill key={tag} tag={tag} />
            ))}
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}

export function Systems({ projects }: SystemsProps) {
  const sorted = [...projects].sort((a, b) => a.order - b.order);

  return (
    <section id="systems" className="py-section px-6">
      {/* Divider */}
      <div className="max-w-content mx-auto mb-16">
        <div className="h-px bg-gradient-to-r from-transparent via-border-subtle to-transparent" />
      </div>

      <div className="max-w-content mx-auto">
        <ScrollReveal>
          <p className="label-mono mb-4">// systems i've built</p>
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4 tracking-tight">
            Real systems. Mapped from source.
          </h2>
          <p className="text-text-muted text-sm max-w-lg">
            Each diagram below is the actual architecture — not a wireframe. Click nodes to explore.
          </p>
        </ScrollReveal>

        <div className="mt-16">
          {sorted.map((project, i) => (
            <SystemEntry key={project.id} project={project} idx={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
