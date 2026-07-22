import type { SkillCategory } from '@/lib/types';

export function TechStack({ skills }: { skills: SkillCategory[] }) {
  // Flatten categorized skills into the level-graded grid, preserving order.
  const items = skills.flatMap((cat) =>
    cat.items.map((s) => ({ name: s.name, level: s.level }))
  );

  return (
    <section id="stack" className="lc-section">
      <div className="lc-container">
        <div className="lc-section-head">
          <h2><span className="lc-prompt">$</span>cat stack.yml</h2>
          <span className="lc-hint">{items.length} tools · proficiency 1–5 · honest self-assessment</span>
        </div>

        <div
          className="lc-grid-3"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}
        >
          {items.map(({ name, level }) => (
            <div
              key={name}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px',
                border: '1px solid var(--border-subtle)',
                borderRadius: 3,
                background: 'var(--bg-card)',
                fontSize: 12.5,
              }}
            >
              <span style={{ color: 'var(--text-primary)' }}>{name}</span>
              <span style={{ display: 'flex', gap: 3 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    style={{
                      width: 14, height: 4, borderRadius: 1,
                      background: n <= level ? 'var(--accent)' : 'var(--border-subtle)',
                    }}
                  />
                ))}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
