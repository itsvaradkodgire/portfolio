'use client';

import { useState, useEffect } from 'react';
import { saveContent } from '@/app/components/admin/saveContent';
import { Plus, X, ChevronUp, ChevronDown } from 'lucide-react';
import type { SkillCategory, Skill } from '@/lib/types';

const LEVEL_LABELS: Record<number, string> = { 1: 'learning', 2: 'familiar', 3: 'proficient', 4: 'advanced', 5: 'expert' };

export default function AdminSkills() {
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/content/skills').then((r) => r.json()).then(setCategories);
  }, []);

  const save = async (cats: SkillCategory[]) => {
    setSaving(true);
    const ok = await saveContent('/api/content/skills', cats, 'Skills saved');
    setSaving(false);
    if (ok) setCategories(cats);
  };

  const updateCategory = (i: number, cat: SkillCategory) => {
    const updated = [...categories];
    updated[i] = cat;
    setCategories(updated);
  };

  const addCategory = () => {
    setCategories([...categories, { id: `cat-${Date.now()}`, label: 'New Category', icon: '📦', items: [] }]);
  };

  const removeCategory = (i: number) => {
    const updated = [...categories];
    updated.splice(i, 1);
    setCategories(updated);
  };

  const addSkill = (catIdx: number) => {
    const updated = [...categories];
    updated[catIdx].items.push({ name: 'New Skill', level: 3, note: '' });
    setCategories(updated);
  };

  const updateSkill = (catIdx: number, skillIdx: number, skill: Skill) => {
    const updated = [...categories];
    updated[catIdx].items[skillIdx] = skill;
    setCategories(updated);
  };

  const removeSkill = (catIdx: number, skillIdx: number) => {
    const updated = [...categories];
    updated[catIdx].items.splice(skillIdx, 1);
    setCategories(updated);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">Tech Stack</h1>
          <p className="text-text-muted text-sm font-mono">{categories.reduce((n, c) => n + c.items.length, 0)} skills across {categories.length} categories</p>
        </div>
        <div className="flex gap-3">
          <button onClick={addCategory}
            className="flex items-center gap-2 font-mono text-sm px-4 py-2.5 rounded-lg border border-border-subtle text-text-muted hover:text-text-primary hover:border-border-dim transition-all">
            <Plus size={14} /> Category
          </button>
          <button onClick={() => save(categories)} disabled={saving}
            className="font-mono text-sm px-5 py-2.5 rounded-lg bg-accent-primary text-bg-base font-bold hover:bg-accent-primary/90 transition-all disabled:opacity-50">
            {saving ? 'Saving...' : 'Save All'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {categories.map((cat, catIdx) => (
          <div key={cat.id} className="bg-bg-card border border-border-subtle rounded-2xl p-5">
            {/* Category header */}
            <div className="flex items-center gap-3 mb-4">
              <input value={cat.icon ?? ''} onChange={(e) => updateCategory(catIdx, { ...cat, icon: e.target.value })}
                className="w-10 bg-bg-base border border-border-subtle rounded-lg p-2 font-mono text-sm text-text-secondary outline-none text-center" />
              <input value={cat.label} onChange={(e) => updateCategory(catIdx, { ...cat, label: e.target.value })}
                className="flex-1 bg-bg-base border border-border-subtle rounded-lg px-3 py-2 font-mono text-sm font-bold text-text-primary outline-none focus:border-border-medium" />
              <button onClick={() => addSkill(catIdx)}
                className="flex items-center gap-1 font-mono text-xs text-accent-primary hover:underline">
                <Plus size={12} /> Skill
              </button>
              <button onClick={() => removeCategory(catIdx)} className="text-text-faint hover:text-red-400 transition-colors">
                <X size={14} />
              </button>
            </div>

            {/* Skills */}
            <div className="space-y-2">
              {cat.items.map((skill, si) => (
                <div key={si} className="flex gap-2 items-center bg-bg-base border border-border-subtle rounded-lg p-3">
                  <input value={skill.name} onChange={(e) => updateSkill(catIdx, si, { ...skill, name: e.target.value })}
                    placeholder="Skill name"
                    className="w-32 bg-transparent font-mono text-xs text-text-primary outline-none border-b border-border-subtle pb-0.5" />
                  <select value={skill.level} onChange={(e) => updateSkill(catIdx, si, { ...skill, level: parseInt(e.target.value) as Skill['level'] })}
                    className="bg-bg-elevated border border-border-subtle rounded px-2 py-1 font-mono text-xs text-text-secondary outline-none">
                    {[1,2,3,4,5].map((l) => <option key={l} value={l}>{LEVEL_LABELS[l]}</option>)}
                  </select>
                  <input value={skill.note} onChange={(e) => updateSkill(catIdx, si, { ...skill, note: e.target.value })}
                    placeholder="Usage note (shown on hover)"
                    className="flex-1 bg-transparent font-mono text-xs text-text-muted outline-none border-b border-border-subtle pb-0.5" />
                  <button onClick={() => removeSkill(catIdx, si)} className="text-text-faint hover:text-red-400 transition-colors">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
