import { readContent } from '@/lib/content';
import type { AnalyticsData } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminAnalytics() {
  const analytics = await readContent<AnalyticsData>('analytics');

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary mb-1">Analytics</h1>
        <p className="text-text-muted text-sm font-mono">AI resume tailor usage statistics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Total Resumes Generated', value: analytics.totalGenerations },
          { label: 'Average Match Score', value: `${analytics.avgMatchScore}%` },
          { label: 'Unique Roles Analyzed', value: analytics.topRoles.length },
        ].map((stat) => (
          <div key={stat.label} className="bg-bg-card border border-border-subtle rounded-xl p-5">
            <p className="font-mono text-xs text-text-faint uppercase tracking-wider mb-2">{stat.label}</p>
            <p className="text-3xl font-bold text-text-primary font-mono">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Top roles */}
      {analytics.topRoles.length > 0 && (
        <div className="mb-8">
          <h2 className="font-mono text-xs text-text-faint uppercase tracking-wider mb-4">Most searched roles</h2>
          <div className="bg-bg-card border border-border-subtle rounded-xl divide-y divide-border-subtle">
            {analytics.topRoles.map((r, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3">
                <span className="font-mono text-xs text-text-faint w-5">{i + 1}</span>
                <span className="flex-1 font-mono text-sm text-text-secondary">{r.role}</span>
                <div className="flex items-center gap-3">
                  <div className="h-1.5 bg-accent-primary/20 rounded-full w-24 overflow-hidden">
                    <div
                      className="h-full bg-accent-primary rounded-full"
                      style={{ width: `${(r.count / (analytics.topRoles[0]?.count ?? 1)) * 100}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs text-accent-primary w-8 text-right">{r.count}×</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent entries */}
      {analytics.entries.length > 0 && (
        <div>
          <h2 className="font-mono text-xs text-text-faint uppercase tracking-wider mb-4">Recent activity</h2>
          <div className="bg-bg-card border border-border-subtle rounded-xl divide-y divide-border-subtle overflow-hidden">
            {[...analytics.entries].reverse().slice(0, 20).map((entry, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3 text-xs font-mono">
                <span className="text-text-faint w-32 flex-shrink-0">
                  {new Date(entry.timestamp).toLocaleDateString()}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] flex-shrink-0 ${
                  entry.mode === 'role' ? 'bg-accent-primary/10 text-accent-primary' : 'bg-accent-secondary/10 text-accent-secondary'
                }`}>
                  {entry.mode}
                </span>
                <span className="flex-1 text-text-muted truncate">{entry.inputSummary}</span>
                <span className="text-accent-green flex-shrink-0">{entry.matchScore}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {analytics.entries.length === 0 && (
        <div className="text-center py-20">
          <p className="font-mono text-text-faint text-sm">No resume generations yet.</p>
          <p className="font-mono text-text-faint text-xs mt-2">Data appears here after visitors use the AI tailor.</p>
        </div>
      )}
    </div>
  );
}
