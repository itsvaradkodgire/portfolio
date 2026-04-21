'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FormField } from '@/app/components/admin/FormField';
import type { Profile } from '@/lib/types';

export default function AdminProfile() {
  const [data, setData] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/content/profile').then((r) => r.json()).then(setData);
  }, []);

  if (!data) return <div className="font-mono text-sm text-text-muted">Loading...</div>;

  const save = async () => {
    setSaving(true);
    const res = await fetch('/api/content/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setSaving(false);
    if (res.ok) toast.success('Profile saved');
    else toast.error('Save failed');
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">Edit Profile</h1>
          <p className="text-text-muted text-sm font-mono">Update your displayed name, title, and bio</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="font-mono text-sm px-5 py-2.5 rounded-lg bg-accent-primary text-bg-base
                     font-bold hover:bg-accent-primary/90 transition-all disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 space-y-5">
        <FormField
          label="Display Name"
          value={data.name}
          onChange={(e) => setData({ ...data, name: (e.target as HTMLInputElement).value })}
          required
        />
        <FormField
          label="Title / Role Line"
          value={data.title}
          onChange={(e) => setData({ ...data, title: (e.target as HTMLInputElement).value })}
          helpText='Shown under the name in nav, e.g. "ai engineer · data scientist · builder"'
          required
        />
        <FormField
          label="Main Heading"
          value={data.heading}
          onChange={(e) => setData({ ...data, heading: (e.target as HTMLInputElement).value })}
          required
        />
        <FormField
          label="Sub-Heading"
          value={data.subheading}
          onChange={(e) => setData({ ...data, subheading: (e.target as HTMLInputElement).value })}
        />
        <FormField
          as="textarea"
          rows={6}
          label="Bio (one paragraph per line)"
          value={data.bio.join('\n\n')}
          onChange={(e) => setData({ ...data, bio: (e.target as HTMLTextAreaElement).value.split('\n\n').filter(Boolean) })}
          helpText="Separate paragraphs with a blank line"
        />
        <FormField
          as="textarea"
          rows={4}
          label="About Text (one paragraph per line)"
          value={data.about.join('\n\n')}
          onChange={(e) => setData({ ...data, about: (e.target as HTMLTextAreaElement).value.split('\n\n').filter(Boolean) })}
        />
      </div>
    </div>
  );
}
