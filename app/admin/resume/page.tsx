'use client';

import { useState, useEffect } from 'react';
import { saveContent } from '@/app/components/admin/saveContent';
import { Plus, X, ChevronUp, ChevronDown } from 'lucide-react';
import { FormField } from '@/app/components/admin/FormField';
import { TagInput } from '@/app/components/admin/TagInput';
import type { ResumeData, EducationEntry, ExperienceEntry, CertificationEntry } from '@/lib/types';

export default function AdminResume() {
  const [data, setData] = useState<ResumeData | null>(null);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'basic' | 'experience' | 'ai'>('basic');

  useEffect(() => {
    fetch('/api/content/resume').then((r) => r.json()).then(setData);
  }, []);

  if (!data) return <div className="font-mono text-sm text-text-muted">Loading...</div>;

  const save = async () => {
    setSaving(true);
    await saveContent('/api/content/resume', data, 'Resume settings saved');
    setSaving(false);
  };

  // Reorder an experience entry up (-1) or down (+1). The public site renders
  // experience in this array order, so this controls the on-page position.
  const moveExp = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= data.experience.length) return;
    const arr = [...data.experience];
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setData({ ...data, experience: arr });
  };

  const TABS = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'experience', label: 'Experience' },
    { id: 'ai', label: 'AI Settings' },
  ] as const;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">Resume & AI Tailor</h1>
          <p className="text-text-muted text-sm font-mono">Base resume data and AI generation settings</p>
        </div>
        <button onClick={save} disabled={saving}
          className="font-mono text-sm px-5 py-2.5 rounded-lg bg-accent-primary text-bg-base font-bold hover:bg-accent-primary/90 transition-all disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border-subtle pb-0">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`font-mono text-xs px-4 py-2.5 -mb-px border-b-2 transition-colors ${
              tab === t.id ? 'border-accent-primary text-accent-primary' : 'border-transparent text-text-muted hover:text-text-primary'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'basic' && (
        <div className="space-y-6">
          <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Full Name" value={data.fullName}
              onChange={(e) => setData({ ...data, fullName: (e.target as HTMLInputElement).value })} />
            <FormField label="Email" value={data.email} type="email"
              onChange={(e) => setData({ ...data, email: (e.target as HTMLInputElement).value })} />
            <FormField label="Phone" value={data.phone}
              onChange={(e) => setData({ ...data, phone: (e.target as HTMLInputElement).value })} />
            <FormField label="Location" value={data.location}
              onChange={(e) => setData({ ...data, location: (e.target as HTMLInputElement).value })} />
            <FormField label="LinkedIn URL" value={data.linkedinUrl} type="url"
              onChange={(e) => setData({ ...data, linkedinUrl: (e.target as HTMLInputElement).value })} />
            <FormField label="GitHub URL" value={data.githubUrl} type="url"
              onChange={(e) => setData({ ...data, githubUrl: (e.target as HTMLInputElement).value })} />
          </div>
          <div className="bg-bg-card border border-border-subtle rounded-2xl p-6">
            <FormField as="textarea" rows={4} label="Base Professional Summary"
              helpText="AI will tailor this per JD. Write a strong general-purpose summary."
              value={data.baseSummary}
              onChange={(e) => setData({ ...data, baseSummary: (e.target as HTMLTextAreaElement).value })} />
          </div>

          {/* Education */}
          <div className="bg-bg-card border border-border-subtle rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-mono text-sm font-bold text-text-primary">Education</h3>
              <button onClick={() => setData({ ...data, education: [...data.education, { id: `edu-${Date.now()}`, degree: '', school: '', year: '' }] })}
                className="flex items-center gap-1 font-mono text-xs text-accent-primary hover:underline">
                <Plus size={12} /> Add
              </button>
            </div>
            {data.education.map((edu, i) => (
              <div key={edu.id} className="mb-4 p-4 bg-bg-base border border-border-subtle rounded-lg">
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <FormField label="Degree" value={edu.degree}
                    onChange={(e) => { const arr = [...data.education]; arr[i].degree = (e.target as HTMLInputElement).value; setData({ ...data, education: arr }); }} />
                  <FormField label="School" value={edu.school}
                    onChange={(e) => { const arr = [...data.education]; arr[i].school = (e.target as HTMLInputElement).value; setData({ ...data, education: arr }); }} />
                  <FormField label="Year" value={edu.year}
                    onChange={(e) => { const arr = [...data.education]; arr[i].year = (e.target as HTMLInputElement).value; setData({ ...data, education: arr }); }} />
                  <FormField label="GPA (optional)" value={edu.gpa ?? ''}
                    onChange={(e) => { const arr = [...data.education]; arr[i].gpa = (e.target as HTMLInputElement).value; setData({ ...data, education: arr }); }} />
                </div>
                <button onClick={() => setData({ ...data, education: data.education.filter((_, j) => j !== i) })}
                  className="font-mono text-xs text-red-400 hover:underline">Remove</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'experience' && (
        <div className="space-y-4">
          <button onClick={() => setData({ ...data, experience: [...data.experience, { id: `exp-${Date.now()}`, company: '', title: '', startDate: '', endDate: 'Present', bullets: [] }] })}
            className="flex items-center gap-2 font-mono text-sm px-4 py-2.5 rounded-lg border border-border-subtle text-text-muted hover:text-text-primary hover:border-border-dim transition-all">
            <Plus size={14} /> Add Experience
          </button>
          {data.experience.map((exp, i) => (
            <div key={exp.id} className="bg-bg-card border border-border-subtle rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs text-text-muted uppercase tracking-wider">
                  {String(i + 1).padStart(2, '0')} · {exp.company || 'New role'}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveExp(i, -1)}
                    disabled={i === 0}
                    title="Move up"
                    className="p-1.5 rounded-md border border-border-subtle text-text-muted hover:text-text-primary hover:border-border-dim transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                    <ChevronUp size={14} />
                  </button>
                  <button
                    onClick={() => moveExp(i, 1)}
                    disabled={i === data.experience.length - 1}
                    title="Move down"
                    className="p-1.5 rounded-md border border-border-subtle text-text-muted hover:text-text-primary hover:border-border-dim transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                    <ChevronDown size={14} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <FormField label="Company" value={exp.company}
                  onChange={(e) => { const arr = [...data.experience]; arr[i].company = (e.target as HTMLInputElement).value; setData({ ...data, experience: arr }); }} />
                <FormField label="Title" value={exp.title}
                  onChange={(e) => { const arr = [...data.experience]; arr[i].title = (e.target as HTMLInputElement).value; setData({ ...data, experience: arr }); }} />
                <FormField label="Start Date" value={exp.startDate}
                  onChange={(e) => { const arr = [...data.experience]; arr[i].startDate = (e.target as HTMLInputElement).value; setData({ ...data, experience: arr }); }} />
                <FormField label="End Date" value={exp.endDate}
                  onChange={(e) => { const arr = [...data.experience]; arr[i].endDate = (e.target as HTMLInputElement).value; setData({ ...data, experience: arr }); }} />
              </div>
              <div>
                <label className="block font-mono text-xs text-text-muted uppercase tracking-wider mb-2">Bullet Points</label>
                {exp.bullets.map((b, j) => (
                  <div key={j} className="flex gap-2 mb-2">
                    <input value={b}
                      onChange={(e) => { const arr = [...data.experience]; arr[i].bullets[j] = (e.target as HTMLInputElement).value; setData({ ...data, experience: arr }); }}
                      className="flex-1 bg-bg-base border border-border-subtle rounded-lg px-3 py-2 font-mono text-xs text-text-secondary outline-none focus:border-border-medium" />
                    <button onClick={() => { const arr = [...data.experience]; arr[i].bullets.splice(j, 1); setData({ ...data, experience: arr }); }}
                      className="text-text-faint hover:text-red-400"><X size={14} /></button>
                  </div>
                ))}
                <button onClick={() => { const arr = [...data.experience]; arr[i].bullets.push(''); setData({ ...data, experience: arr }); }}
                  className="font-mono text-xs text-accent-primary hover:underline flex items-center gap-1"><Plus size={12} /> Add bullet</button>
              </div>
              <button onClick={() => setData({ ...data, experience: data.experience.filter((_, j) => j !== i) })}
                className="mt-4 font-mono text-xs text-red-400 hover:underline">Remove Experience</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'ai' && (
        <div className="space-y-6">
          <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 space-y-4">
            <TagInput label="Always Emphasize" value={data.aiSettings.alwaysEmphasize}
              onChange={(t) => setData({ ...data, aiSettings: { ...data.aiSettings, alwaysEmphasize: t } })} />
            <TagInput label="Never Include" value={data.aiSettings.neverInclude}
              onChange={(t) => setData({ ...data, aiSettings: { ...data.aiSettings, neverInclude: t } })} />
            <div>
              <label className="block font-mono text-xs text-text-muted uppercase tracking-wider mb-1.5">Tone</label>
              <select value={data.aiSettings.tone}
                onChange={(e) => setData({ ...data, aiSettings: { ...data.aiSettings, tone: e.target.value as ResumeData['aiSettings']['tone'] } })}
                className="w-full bg-bg-base border border-border-subtle rounded-lg px-3 py-2.5 font-mono text-sm text-text-secondary outline-none focus:border-border-medium">
                <option value="confident">Confident</option>
                <option value="humble">Humble</option>
                <option value="technical">Technical</option>
                <option value="balanced">Balanced</option>
              </select>
            </div>
            <FormField as="textarea" rows={5} label="System Prompt Override (advanced)"
              helpText="Leave blank to use the default AI prompt."
              value={data.aiSettings.systemPromptOverride ?? ''}
              onChange={(e) => setData({ ...data, aiSettings: { ...data.aiSettings, systemPromptOverride: (e.target as HTMLTextAreaElement).value } })} />
          </div>
        </div>
      )}
    </div>
  );
}
