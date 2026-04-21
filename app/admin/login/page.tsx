'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push('/admin');
    } else {
      setError('Invalid password. Try again.');
    }
    setLoading(false);
  };

  return (
    // Override admin layout for login page
    <div className="min-h-screen bg-bg-base flex items-center justify-center px-6 -mx-6 -my-6">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <p className="font-mono text-xs text-text-faint uppercase tracking-widest mb-2">admin portal</p>
          <h1 className="text-2xl font-bold text-text-primary">Sign in</h1>
          <p className="text-text-muted text-sm mt-1">varad kodgire · portfolio</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block font-mono text-xs text-text-muted uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
              className="w-full bg-bg-card border border-border-subtle rounded-lg px-4 py-3
                         font-mono text-sm text-text-primary placeholder:text-text-faint
                         outline-none focus:border-border-medium transition-colors"
            />
          </div>

          {error && (
            <p className="font-mono text-xs text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full font-mono text-sm py-3 rounded-lg bg-accent-primary text-bg-base
                       font-bold hover:bg-accent-primary/90 transition-all
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>
        </form>

        <p className="font-mono text-[10px] text-text-faint mt-6 text-center">
          Set ADMIN_PASSWORD in your .env.local
        </p>
      </div>
    </div>
  );
}
