'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, X } from 'lucide-react';
import { FormField } from '@/app/components/admin/FormField';
import type { ContactData, ContactLink } from '@/lib/types';

const ICON_OPTIONS = ['Github', 'Linkedin', 'Mail', 'Twitter', 'ExternalLink', 'Globe'];

export default function AdminContact() {
  const [data, setData] = useState<ContactData | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/content/contact').then((r) => r.json()).then(setData);
  }, []);

  if (!data) return <div className="font-mono text-sm text-text-muted">Loading...</div>;

  const save = async () => {
    setSaving(true);
    const res = await fetch('/api/content/contact', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setSaving(false);
    res.ok ? toast.success('Contact saved') : toast.error('Save failed');
  };

  const updateLink = (i: number, link: ContactLink) => {
    const links = [...data.links];
    links[i] = link;
    setData({ ...data, links });
  };

  const addLink = () => setData({
    ...data,
    links: [...data.links, { id: `link-${Date.now()}`, label: 'New Link', url: '', icon: 'ExternalLink', visible: true }]
  });

  const removeLink = (i: number) => {
    const links = [...data.links];
    links.splice(i, 1);
    setData({ ...data, links });
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">Contact Links</h1>
          <p className="text-text-muted text-sm font-mono">Update your contact section</p>
        </div>
        <button onClick={save} disabled={saving}
          className="font-mono text-sm px-5 py-2.5 rounded-lg bg-accent-primary text-bg-base font-bold hover:bg-accent-primary/90 transition-all disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-6">
        <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 space-y-4">
          <FormField label="Section Heading" value={data.heading}
            onChange={(e) => setData({ ...data, heading: (e.target as HTMLInputElement).value })} />
          <FormField label="Subtext" value={data.subtext}
            onChange={(e) => setData({ ...data, subtext: (e.target as HTMLInputElement).value })} />
        </div>

        <div className="bg-bg-card border border-border-subtle rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-mono text-sm font-bold text-text-primary">Links</h3>
            <button onClick={addLink} className="flex items-center gap-1 font-mono text-xs text-accent-primary hover:underline">
              <Plus size={12} /> Add Link
            </button>
          </div>
          <div className="space-y-3">
            {data.links.map((link, i) => (
              <div key={link.id} className="flex gap-2 items-start bg-bg-base border border-border-subtle rounded-lg p-3">
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <FormField label="Label" value={link.label}
                    onChange={(e) => updateLink(i, { ...link, label: (e.target as HTMLInputElement).value })} />
                  <FormField label="URL" value={link.url} type="url"
                    onChange={(e) => updateLink(i, { ...link, url: (e.target as HTMLInputElement).value })} />
                  <div>
                    <label className="block font-mono text-xs text-text-muted uppercase tracking-wider mb-1.5">Icon</label>
                    <select value={link.icon} onChange={(e) => updateLink(i, { ...link, icon: e.target.value })}
                      className="w-full bg-bg-base border border-border-subtle rounded-lg px-3 py-2.5 font-mono text-xs text-text-secondary outline-none focus:border-border-medium">
                      {ICON_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={link.visible}
                        onChange={(e) => updateLink(i, { ...link, visible: e.target.checked })}
                        className="w-4 h-4 accent-orange-400" />
                      <span className="font-mono text-xs text-text-muted">Visible on site</span>
                    </label>
                  </div>
                </div>
                <button onClick={() => removeLink(i)} className="text-text-faint hover:text-red-400 transition-colors mt-1">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
