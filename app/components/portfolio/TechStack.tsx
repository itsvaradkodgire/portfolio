const STACK_DATA: [string, number][] = [
  ['LLMs', 5], ['Prompt Eng.', 5], ['Generative AI', 5],
  ['Python', 5], ['Hugging Face', 5], ['RAG', 4],
  ['NLP', 4], ['Deep Learning', 4], ['LangChain', 4],
  ['FastAPI', 4], ['Docker', 4], ['Ollama', 4],
  ['INT4 Quant.', 4], ['Fine-tuning', 4], ['Git', 4],
  ['SQL', 4], ['Linux', 4], ['Streamlit', 4],
  ['Comp. Vision', 3], ['JavaScript', 3], ['n8n', 3],
  ['FAISS', 3], ['AWS', 3], ['MLlib', 3],
  ['Data Pipes', 3], ['Kubernetes', 2], ['Azure', 2],
];

export function TechStack() {
  return (
    <section id="stack" className="lc-section">
      <div className="lc-container">
        <div className="lc-section-head">
          <h2><span className="lc-prompt">$</span>cat stack.yml</h2>
          <span className="lc-hint">27 tools · proficiency 1–5 · honest self-assessment</span>
        </div>

        <div
          className="lc-grid-3"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}
        >
          {STACK_DATA.map(([name, lvl]) => (
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
                      background: n <= lvl ? 'var(--accent)' : 'var(--border-subtle)',
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
