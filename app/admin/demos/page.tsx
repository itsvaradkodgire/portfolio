'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, X, ChevronUp, ChevronDown } from 'lucide-react';
import { TagInput } from '@/app/components/admin/TagInput';
import type { DemosData, TerminalCommand } from '@/lib/types';

export default function AdminDemos() {
  const [data, setData] = useState<DemosData | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/content/demos').then((r) => r.json()).then(setData);
  }, []);

  if (!data) return <div className="font-mono text-sm text-text-muted">Loading...</div>;

  const save = async () => {
    setSaving(true);
    const res = await fetch('/api/content/demos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setSaving(false);
    res.ok ? toast.success('Demos saved') : toast.error('Save failed');
  };

  const updateCmd = (i: number, cmd: TerminalCommand) => {
    const cmds = [...data.terminalCommands];
    cmds[i] = cmd;
    setData({ ...data, terminalCommands: cmds });
  };

  const addCmd = () => setData({
    ...data,
    terminalCommands: [...data.terminalCommands, {
      id: `cmd-${Date.now()}`, command: '', output: '', status: 'success', delayAfter: 1000
    }]
  });

  const removeCmd = (i: number) => {
    const cmds = [...data.terminalCommands];
    cmds.splice(i, 1);
    setData({ ...data, terminalCommands: cmds });
  };

  const moveCmd = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= data.terminalCommands.length) return;
    const cmds = [...data.terminalCommands];
    [cmds[i], cmds[j]] = [cmds[j], cmds[i]];
    setData({ ...data, terminalCommands: cmds });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">Demo Config</h1>
          <p className="text-text-muted text-sm font-mono">Terminal animation and sentiment keywords</p>
        </div>
        <button onClick={save} disabled={saving}
          className="font-mono text-sm px-5 py-2.5 rounded-lg bg-accent-primary text-bg-base font-bold hover:bg-accent-primary/90 transition-all disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Terminal */}
      <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-mono text-sm font-bold text-text-primary">Terminal Commands</h3>
          <button onClick={addCmd} className="flex items-center gap-1 font-mono text-xs text-accent-primary hover:underline">
            <Plus size={12} /> Add Command
          </button>
        </div>
        <div className="space-y-3">
          {data.terminalCommands.map((cmd, i) => (
            <div key={cmd.id} className="flex gap-2 items-start bg-bg-base border border-border-subtle rounded-lg p-3">
              <div className="flex flex-col gap-0.5 mt-1">
                <button onClick={() => moveCmd(i, -1)} disabled={i === 0} className="text-text-faint hover:text-text-muted disabled:opacity-30"><ChevronUp size={12} /></button>
                <button onClick={() => moveCmd(i, 1)} disabled={i === data.terminalCommands.length - 1} className="text-text-faint hover:text-text-muted disabled:opacity-30"><ChevronDown size={12} /></button>
              </div>
              <div className="flex-1 space-y-2">
                <input value={cmd.command} onChange={(e) => updateCmd(i, { ...cmd, command: e.target.value })}
                  placeholder="$ command"
                  className="w-full bg-transparent border-b border-border-subtle font-mono text-xs text-accent-secondary outline-none pb-1" />
                <textarea value={cmd.output} onChange={(e) => updateCmd(i, { ...cmd, output: e.target.value })}
                  placeholder="Command output..."
                  rows={2}
                  className="w-full bg-transparent border-b border-border-subtle font-mono text-xs text-text-muted outline-none pb-1 resize-none" />
                <div className="flex gap-3">
                  <select value={cmd.status} onChange={(e) => updateCmd(i, { ...cmd, status: e.target.value as TerminalCommand['status'] })}
                    className="bg-bg-elevated border border-border-subtle rounded px-2 py-1 font-mono text-xs text-text-secondary outline-none">
                    <option value="success">success</option>
                    <option value="error">error</option>
                    <option value="neutral">neutral</option>
                  </select>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-[10px] text-text-faint">delay (ms)</span>
                    <input type="number" value={cmd.delayAfter} onChange={(e) => updateCmd(i, { ...cmd, delayAfter: parseInt(e.target.value) })}
                      className="w-20 bg-bg-elevated border border-border-subtle rounded px-2 py-1 font-mono text-xs text-text-secondary outline-none" />
                  </div>
                </div>
              </div>
              <button onClick={() => removeCmd(i)} className="text-text-faint hover:text-red-400 transition-colors mt-1">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Sentiment keywords */}
      <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 space-y-4">
        <h3 className="font-mono text-sm font-bold text-text-primary mb-2">Sentiment Keywords</h3>
        <TagInput label="Positive Keywords" value={data.sentimentKeywords.positive}
          onChange={(t) => setData({ ...data, sentimentKeywords: { ...data.sentimentKeywords, positive: t } })} />
        <TagInput label="Negative Keywords" value={data.sentimentKeywords.negative}
          onChange={(t) => setData({ ...data, sentimentKeywords: { ...data.sentimentKeywords, negative: t } })} />
        <TagInput label="Neutral Keywords" value={data.sentimentKeywords.neutral}
          onChange={(t) => setData({ ...data, sentimentKeywords: { ...data.sentimentKeywords, neutral: t } })} />
      </div>
    </div>
  );
}
