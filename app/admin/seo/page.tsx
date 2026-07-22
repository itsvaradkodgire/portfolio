'use client';

import { useState, useEffect } from 'react';
import { saveContent } from '@/app/components/admin/saveContent';
import { FormField } from '@/app/components/admin/FormField';
import type { MetaData } from '@/lib/types';

export default function AdminSEO() {
  const [data, setData] = useState<MetaData | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/content/meta').then((r) => r.json()).then(setData);
  }, []);

  if (!data) return <div className="font-mono text-sm text-text-muted">Loading...</div>;

  const save = async () => {
    setSaving(true);
    await saveContent('/api/content/meta', data, 'SEO settings saved');
    setSaving(false);
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">SEO & Meta</h1>
          <p className="text-text-muted text-sm font-mono">Page title, description, Open Graph tags</p>
        </div>
        <button onClick={save} disabled={saving}
          className="font-mono text-sm px-5 py-2.5 rounded-lg bg-accent-primary text-bg-base font-bold hover:bg-accent-primary/90 transition-all disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 space-y-5">
        <FormField label="Page Title" value={data.title} required
          onChange={(e) => setData({ ...data, title: (e.target as HTMLInputElement).value })}
          helpText="Shown in browser tab and search results" />
        <FormField as="textarea" rows={3} label="Meta Description" value={data.description} required
          onChange={(e) => setData({ ...data, description: (e.target as HTMLTextAreaElement).value })}
          helpText="Target 150-160 characters" />
        <div className="h-px bg-border-subtle" />
        <FormField label="OG Title" value={data.ogTitle}
          onChange={(e) => setData({ ...data, ogTitle: (e.target as HTMLInputElement).value })} />
        <FormField as="textarea" rows={2} label="OG Description" value={data.ogDescription}
          onChange={(e) => setData({ ...data, ogDescription: (e.target as HTMLTextAreaElement).value })} />
        <FormField label="OG Image URL" value={data.ogImageUrl} type="url"
          onChange={(e) => setData({ ...data, ogImageUrl: (e.target as HTMLInputElement).value })} />
        <div className="h-px bg-border-subtle" />
        <FormField label="Google Analytics ID (optional)" value={data.gaId ?? ''} placeholder="G-XXXXXXXXXX"
          onChange={(e) => setData({ ...data, gaId: (e.target as HTMLInputElement).value })} />
        <FormField label="Twitter Handle (optional)" value={data.twitterHandle ?? ''} placeholder="@yourhandle"
          onChange={(e) => setData({ ...data, twitterHandle: (e.target as HTMLInputElement).value })} />
      </div>
    </div>
  );
}
