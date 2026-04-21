'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, X } from 'lucide-react';
import { FormField } from '@/app/components/admin/FormField';
import { TagInput } from '@/app/components/admin/TagInput';
import { ConfirmModal } from '@/app/components/admin/ConfirmModal';
import type { Project, DiagramNode, DiagramEdge } from '@/lib/types';

const EMPTY_PROJECT: Omit<Project, 'order'> = {
  id: '',
  title: '',
  description: '',
  stats: '',
  tags: [],
  diagramType: 'pipeline',
  nodes: [],
  edges: [],
  side: 'left',
  featured: false,
};

function ProjectForm({ project, onSave, onCancel }: {
  project: Partial<Project>;
  onSave: (p: Project) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Partial<Project>>({ ...project });

  const update = <K extends keyof Project>(k: K, v: Project[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const addNode = () => update('nodes', [...(form.nodes ?? []), {
    id: `node-${Date.now()}`, label: 'New Node', icon: '◆', description: ''
  }]);

  const updateNode = (i: number, n: DiagramNode) => {
    const nodes = [...(form.nodes ?? [])];
    nodes[i] = n;
    update('nodes', nodes);
  };

  const removeNode = (id: string) => update('nodes', (form.nodes ?? []).filter((n) => n.id !== id));

  const addEdge = () => {
    const nodes = form.nodes ?? [];
    if (nodes.length < 2) return;
    update('edges', [...(form.edges ?? []), { from: nodes[0].id, to: nodes[1].id, animated: true }]);
  };

  const removeEdge = (i: number) => {
    const edges = [...(form.edges ?? [])];
    edges.splice(i, 1);
    update('edges', edges);
  };

  const submit = () => {
    if (!form.title?.trim() || !form.id?.trim()) {
      toast.error('Title and ID are required');
      return;
    }
    onSave(form as Project);
  };

  return (
    <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 space-y-6">
      <h3 className="font-bold text-text-primary text-lg">
        {project.id ? 'Edit Project' : 'New Project'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Project ID" value={form.id ?? ''} required
          onChange={(e) => update('id', (e.target as HTMLInputElement).value.toLowerCase().replace(/\s+/g, '-'))}
          helpText="Unique slug, e.g. rag-pipeline" />
        <FormField label="Title" value={form.title ?? ''} required
          onChange={(e) => update('title', (e.target as HTMLInputElement).value)} />
      </div>

      <FormField as="textarea" rows={3} label="Description" value={form.description ?? ''}
        onChange={(e) => update('description', (e.target as HTMLTextAreaElement).value)} />

      <FormField label="Stats (shown as badge)" value={form.stats ?? ''}
        onChange={(e) => update('stats', (e.target as HTMLInputElement).value)}
        helpText='e.g. "10,000+ docs · <200ms latency"' />

      <TagInput label="Tech Tags" value={form.tags ?? []} onChange={(t) => update('tags', t)} />

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block font-mono text-xs text-text-muted uppercase tracking-wider mb-1.5">Diagram Type</label>
          <select value={form.diagramType ?? 'pipeline'} onChange={(e) => update('diagramType', e.target.value as Project['diagramType'])}
            className="w-full bg-bg-base border border-border-subtle rounded-lg px-3 py-2.5 font-mono text-sm text-text-secondary outline-none focus:border-border-medium">
            <option value="pipeline">pipeline</option>
            <option value="multi-agent">multi-agent</option>
            <option value="platform">platform</option>
            <option value="custom">custom</option>
          </select>
        </div>
        <div>
          <label className="block font-mono text-xs text-text-muted uppercase tracking-wider mb-1.5">Layout Side</label>
          <select value={form.side ?? 'left'} onChange={(e) => update('side', e.target.value as 'left' | 'right')}
            className="w-full bg-bg-base border border-border-subtle rounded-lg px-3 py-2.5 font-mono text-sm text-text-secondary outline-none focus:border-border-medium">
            <option value="left">diagram left</option>
            <option value="right">diagram right</option>
          </select>
        </div>
        <FormField label="Order" type="number" value={String(form.order ?? 99)}
          onChange={(e) => update('order', parseInt((e.target as HTMLInputElement).value))} />
      </div>

      {/* Nodes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="font-mono text-xs text-text-muted uppercase tracking-wider">Diagram Nodes</label>
          <button onClick={addNode} className="font-mono text-xs text-accent-primary flex items-center gap-1 hover:underline">
            <Plus size={12} /> Add Node
          </button>
        </div>
        <div className="space-y-2">
          {(form.nodes ?? []).map((node, i) => (
            <div key={node.id} className="flex gap-2 items-start bg-bg-base border border-border-subtle rounded-lg p-3">
              <div className="flex-1 grid grid-cols-4 gap-2">
                <input value={node.label} onChange={(e) => updateNode(i, { ...node, label: e.target.value })}
                  placeholder="Label" className="col-span-2 bg-transparent border-b border-border-subtle font-mono text-xs text-text-secondary outline-none px-1 py-1" />
                <input value={node.icon ?? ''} onChange={(e) => updateNode(i, { ...node, icon: e.target.value })}
                  placeholder="Icon" className="bg-transparent border-b border-border-subtle font-mono text-xs text-text-secondary outline-none px-1 py-1" />
                <input value={node.description ?? ''} onChange={(e) => updateNode(i, { ...node, description: e.target.value })}
                  placeholder="Tooltip" className="bg-transparent border-b border-border-subtle font-mono text-xs text-text-secondary outline-none px-1 py-1" />
              </div>
              <button onClick={() => removeNode(node.id)} className="text-text-faint hover:text-red-400 transition-colors mt-1">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Edges */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="font-mono text-xs text-text-muted uppercase tracking-wider">Connections</label>
          <button onClick={addEdge} className="font-mono text-xs text-accent-primary flex items-center gap-1 hover:underline">
            <Plus size={12} /> Add Edge
          </button>
        </div>
        <div className="space-y-2">
          {(form.edges ?? []).map((edge, i) => (
            <div key={i} className="flex gap-2 items-center bg-bg-base border border-border-subtle rounded-lg p-3">
              <select value={edge.from} onChange={(e) => { const edges = [...(form.edges ?? [])]; edges[i] = { ...edge, from: e.target.value }; update('edges', edges); }}
                className="flex-1 bg-transparent font-mono text-xs text-text-secondary outline-none border-b border-border-subtle">
                {(form.nodes ?? []).map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}
              </select>
              <span className="font-mono text-xs text-text-faint">→</span>
              <select value={edge.to} onChange={(e) => { const edges = [...(form.edges ?? [])]; edges[i] = { ...edge, to: e.target.value }; update('edges', edges); }}
                className="flex-1 bg-transparent font-mono text-xs text-text-secondary outline-none border-b border-border-subtle">
                {(form.nodes ?? []).map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}
              </select>
              <label className="flex items-center gap-1 font-mono text-[10px] text-text-faint">
                <input type="checkbox" checked={edge.animated ?? false}
                  onChange={(e) => { const edges = [...(form.edges ?? [])]; edges[i] = { ...edge, animated: e.target.checked }; update('edges', edges); }} />
                animated
              </label>
              <button onClick={() => removeEdge(i)} className="text-text-faint hover:text-red-400 transition-colors">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={submit}
          className="font-mono text-sm px-5 py-2.5 rounded-lg bg-accent-primary text-bg-base font-bold hover:bg-accent-primary/90 transition-all">
          Save Project
        </button>
        <button onClick={onCancel}
          className="font-mono text-sm px-5 py-2.5 rounded-lg border border-border-subtle text-text-muted hover:text-text-primary transition-all">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editing, setEditing] = useState<Partial<Project> | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/content/projects').then((r) => r.json()).then((d) => setProjects(d.sort((a: Project, b: Project) => a.order - b.order)));
  }, []);

  const save = async (updated: Project[]) => {
    await fetch('/api/content/projects', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    setProjects(updated);
  };

  const saveProject = async (p: Project) => {
    const existing = projects.find((x) => x.id === p.id);
    let updated: Project[];
    if (existing) {
      updated = projects.map((x) => (x.id === p.id ? p : x));
    } else {
      updated = [...projects, { ...p, order: projects.length + 1 }];
    }
    await save(updated);
    setEditing(null);
    toast.success('Project saved');
  };

  const deleteProject = async (id: string) => {
    const updated = projects.filter((p) => p.id !== id);
    await save(updated);
    setConfirmDelete(null);
    toast.success('Project deleted');
  };

  const move = async (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= projects.length) return;
    const updated = [...projects];
    [updated[i], updated[j]] = [updated[j], updated[i]];
    updated.forEach((p, idx) => (p.order = idx + 1));
    await save(updated);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">Projects</h1>
          <p className="text-text-muted text-sm font-mono">{projects.length} projects</p>
        </div>
        <button onClick={() => setEditing({ ...EMPTY_PROJECT })}
          className="flex items-center gap-2 font-mono text-sm px-4 py-2.5 rounded-lg bg-accent-primary text-bg-base font-bold hover:bg-accent-primary/90 transition-all">
          <Plus size={15} /> New Project
        </button>
      </div>

      {editing && (
        <div className="mb-8">
          <ProjectForm project={editing} onSave={saveProject} onCancel={() => setEditing(null)} />
        </div>
      )}

      <div className="space-y-3">
        {projects.map((p, i) => (
          <div key={p.id} className="flex items-center gap-3 bg-bg-card border border-border-subtle rounded-xl p-4 hover:border-border-dim transition-all">
            <div className="flex flex-col gap-0.5">
              <button onClick={() => move(i, -1)} disabled={i === 0} className="text-text-faint hover:text-text-muted disabled:opacity-30"><ChevronUp size={14} /></button>
              <button onClick={() => move(i, 1)} disabled={i === projects.length - 1} className="text-text-faint hover:text-text-muted disabled:opacity-30"><ChevronDown size={14} /></button>
            </div>
            <span className="font-mono text-xs text-text-faint w-6 text-center">{i + 1}</span>
            <div className="flex-1">
              <p className="font-mono text-sm text-text-primary font-bold">{p.title}</p>
              <p className="font-mono text-xs text-text-faint">{p.id} · {p.tags.slice(0, 3).join(', ')}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(p)} className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-elevated rounded-lg transition-all">
                <Pencil size={14} />
              </button>
              <button onClick={() => setConfirmDelete(p.id)} className="p-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal
        open={!!confirmDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${projects.find((p) => p.id === confirmDelete)?.title}"? This cannot be undone.`}
        onConfirm={() => confirmDelete && deleteProject(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
