import { useState } from 'react';

const API_BASE = 'http://localhost:5000/api';

const mockApi = {
  post: async (_url, data) => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const entities = [
      { type: 'PERSON', text: 'John', score: 0.98 },
      { type: 'PERSON', text: 'Mary', score: 0.95 },
      { type: 'LOCATION', text: 'New York', score: 0.99 },
    ];
    const anonymized =
      data.method === 'tags'
        ? data.text
            .replaceAll('John', '[PERSON_1]')
            .replaceAll('Mary', '[PERSON_2]')
            .replaceAll('New York', '[LOCATION_1]')
        : data.text
            .replaceAll('John', 'Alex')
            .replaceAll('Mary', 'Jordan')
            .replaceAll('New York', 'Metropolis');

    return {
      data: {
        original: { text: data.text, sentiment: { label: 'Neutral', score: '0.52' } },
        anonymized: { text: anonymized, sentiment: { label: 'Neutral', score: '0.51' } },
        entities,
      },
    };
  },
  get: async () => ({
    data: [
      {
        _id: '1',
        originalText: 'John called Mary from New York',
        anonymizedText: '[PERSON_1] called [PERSON_2] from [LOCATION_1]',
        method: 'tags',
        createdAt: new Date().toISOString(),
      },
    ],
  }),
};

const ENTITY_STYLES = {
  PERSON: { tint: '#f7d5bf', text: '#8f3e1f', bar: '#cb5c2d' },
  LOCATION: { tint: '#cfe4d4', text: '#2f5d50', bar: '#3f7a66' },
  PHONE_NUMBER: { tint: '#f0d8b7', text: '#8a5a19', bar: '#b87c2a' },
  EMAIL_ADDRESS: { tint: '#d8e4f7', text: '#3c597f', bar: '#597fb6' },
  DEFAULT: { tint: '#e8e1d3', text: '#5d6252', bar: '#7c836e' },
};

const METHODS = [
  {
    value: 'tags',
    label: 'Structured tags',
    helper: 'Best for logs, audits, and debugging outputs.',
    sample: '[PERSON_1] called [LOCATION_1]',
  },
  {
    value: 'pseudonyms',
    label: 'Natural pseudonyms',
    helper: 'Keeps the text easier to read for demos and reviews.',
    sample: 'Alex called Metropolis',
  },
];

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = 'Request failed';
    try {
      const data = await response.json();
      message = data.error || message;
    } catch {
      // Keep the generic error when the response body is not JSON.
    }
    throw new Error(message);
  }

  return response.json();
}

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Request failed');
  }
  return response.json();
}

function StatCard({ label, value, tone = 'neutral' }) {
  const colors = {
    neutral: 'var(--surface-muted)',
    accent: 'var(--accent-soft)',
    success: 'rgba(53, 106, 65, 0.14)',
  };

  return (
    <div
      style={{
        padding: '1rem 1.1rem',
        borderRadius: '18px',
        background: colors[tone],
        border: '1px solid var(--border)',
      }}
    >
      <div
        style={{
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: '0.72rem',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginBottom: '0.55rem',
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: '1.35rem', fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function Panel({ eyebrow, title, children, actions }) {
  return (
    <section
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '28px',
        backdropFilter: 'blur(18px)',
        boxShadow: 'var(--shadow)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '1.15rem 1.3rem 0',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: '0.72rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: '0.35rem',
            }}
          >
            {eyebrow}
          </div>
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{title}</h2>
        </div>
        {actions}
      </div>
      <div style={{ padding: '1.25rem 1.3rem 1.35rem' }}>{children}</div>
    </section>
  );
}

function MethodCard({ option, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(option.value)}
      style={{
        width: '100%',
        padding: '1rem',
        textAlign: 'left',
        borderRadius: '20px',
        border: active ? '1px solid var(--primary)' : '1px solid var(--border)',
        background: active ? 'rgba(47, 93, 80, 0.14)' : 'var(--surface-strong)',
        color: 'var(--text)',
        cursor: 'pointer',
        transition: 'transform 160ms ease, border-color 160ms ease, background 160ms ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '1rem',
          alignItems: 'center',
          marginBottom: '0.65rem',
        }}
      >
        <strong style={{ fontSize: '1rem' }}>{option.label}</strong>
        <span
          style={{
            width: '14px',
            height: '14px',
            borderRadius: '999px',
            background: active ? 'var(--accent)' : 'transparent',
            border: active ? 'none' : '1px solid var(--border-strong)',
            boxShadow: active ? '0 0 0 4px rgba(203, 92, 45, 0.16)' : 'none',
            flexShrink: 0,
          }}
        />
      </div>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.94rem', lineHeight: 1.5 }}>
        {option.helper}
      </div>
      <div
        style={{
          marginTop: '0.75rem',
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: '0.75rem',
          color: 'var(--primary-strong)',
          overflowWrap: 'anywhere',
        }}
      >
        {option.sample}
      </div>
    </button>
  );
}

function SentimentBadge({ sentiment }) {
  const toneMap = {
    Positive: { bg: 'rgba(53, 106, 65, 0.14)', color: 'var(--success)' },
    Negative: { bg: 'rgba(146, 61, 43, 0.14)', color: 'var(--danger)' },
    Neutral: { bg: 'rgba(86, 96, 74, 0.14)', color: 'var(--text-muted)' },
  };

  const tone = toneMap[sentiment.label] || toneMap.Neutral;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.45rem',
        padding: '0.45rem 0.8rem',
        borderRadius: '999px',
        background: tone.bg,
        color: tone.color,
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: '0.76rem',
      }}
    >
      <span
        style={{
          width: '0.42rem',
          height: '0.42rem',
          borderRadius: '999px',
          background: tone.color,
        }}
      />
      {sentiment.label} / {sentiment.score}
    </span>
  );
}

function EntityRow({ entity }) {
  const style = ENTITY_STYLES[entity.type] || ENTITY_STYLES.DEFAULT;
  return (
    <div
      style={{
        padding: '0.9rem 1rem',
        borderRadius: '18px',
        background: 'var(--surface-strong)',
        border: '1px solid var(--border)',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        gap: '1rem',
        alignItems: 'center',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            marginBottom: '0.4rem',
            padding: '0.24rem 0.55rem',
            borderRadius: '999px',
            background: style.tint,
            color: style.text,
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: '0.72rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          <span
            style={{
              width: '0.42rem',
              height: '0.42rem',
              borderRadius: '999px',
              background: style.bar,
            }}
          />
          {entity.type}
        </div>
        <div style={{ fontSize: '0.98rem', overflowWrap: 'anywhere' }}>{entity.text}</div>
      </div>
      <div style={{ minWidth: '92px' }}>
        <div
          style={{
            height: '8px',
            borderRadius: '999px',
            background: 'var(--surface-muted)',
            overflow: 'hidden',
            marginBottom: '0.35rem',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${Math.round(entity.score * 100)}%`,
              background: style.bar,
              borderRadius: '999px',
            }}
          />
        </div>
        <div
          style={{
            textAlign: 'right',
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}
        >
          {Math.round(entity.score * 100)}%
        </div>
      </div>
    </div>
  );
}

function HistoryItem({ item }) {
  return (
    <article
      style={{
        padding: '1rem',
        borderRadius: '20px',
        border: '1px solid var(--border)',
        background: 'var(--surface-strong)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: '0.9rem',
        }}
      >
        <span
          style={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: '0.72rem',
            color: 'var(--primary-strong)',
            background: 'rgba(47, 93, 80, 0.12)',
            padding: '0.35rem 0.55rem',
            borderRadius: '999px',
            textTransform: 'uppercase',
          }}
        >
          {item.method}
        </span>
        <span
          style={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
          }}
        >
          {new Date(item.createdAt).toLocaleString()}
        </span>
      </div>
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        <div>
          <div
            style={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '0.28rem',
            }}
          >
            Original
          </div>
          <div style={{ color: 'var(--text-muted)' }}>{item.originalText}</div>
        </div>
        <div>
          <div
            style={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '0.28rem',
            }}
          >
            Anonymized
          </div>
          <div>{item.anonymizedText}</div>
        </div>
      </div>
    </article>
  );
}

function LoadingDots() {
  return (
    <span style={{ display: 'inline-flex', gap: '0.35rem' }}>
      {[0, 1, 2].map((item) => (
        <span
          key={item}
          style={{
            width: '0.42rem',
            height: '0.42rem',
            borderRadius: '999px',
            background: 'currentColor',
            animation: 'pulse 1.1s ease-in-out infinite',
            animationDelay: `${item * 0.16}s`,
          }}
        />
      ))}
    </span>
  );
}

export default function AnonymizeApp() {
  const [text, setText] = useState('');
  const [method, setMethod] = useState('tags');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const stats = result
    ? [
        { label: 'Entities detected', value: result.entities.length, tone: 'accent' },
        { label: 'Method', value: method === 'tags' ? 'Tagged' : 'Pseudonyms', tone: 'neutral' },
        {
          label: 'Sentiment shift',
          value: `${result.original.sentiment.score} -> ${result.anonymized.sentiment.score}`,
          tone: 'success',
        },
      ]
    : [
        { label: 'Supported entities', value: 'Names, locations, phones, email', tone: 'neutral' },
        { label: 'Output styles', value: 'Readable or structured', tone: 'accent' },
        { label: 'Designed for', value: 'Review flows and privacy checks', tone: 'success' },
      ];

  const handleSubmit = async () => {
    if (!text.trim()) {
      return;
    }

    setLoading(true);
    setResult(null);
    setError('');

    try {
      const data = await postJson(`${API_BASE}/anonymize`, { text, method });
      setResult(data);
    } catch (submissionError) {
      try {
        const fallback = await mockApi.post(`${API_BASE}/anonymize`, { text, method });
        setResult(fallback.data);
        setError('Backend not reachable, showing a local preview response.');
      } catch {
        setError(submissionError.message || 'Unable to process text.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.anonymized?.text) {
      return;
    }

    await navigator.clipboard.writeText(result.anonymized.text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const handleHistory = async () => {
    setHistoryLoading(true);
    setError('');

    try {
      const data = await getJson(`${API_BASE}/history`);
      setHistory(data);
      setHistoryVisible(true);
    } catch {
      const fallback = await mockApi.get(`${API_BASE}/history`);
      setHistory(fallback.data);
      setHistoryVisible(true);
      setError('Backend history is unavailable, showing a local sample entry.');
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes floatIn {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.35; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-2px); }
        }

        .fade-in {
          animation: floatIn 420ms ease forwards;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 1.25rem;
          align-items: start;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.85rem;
        }

        .compare-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
        }

        .method-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.85rem;
        }

        textarea::placeholder {
          color: #7d856f;
        }

        textarea:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(47, 93, 80, 0.12);
        }

        @media (max-width: 980px) {
          .dashboard-grid,
          .compare-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 720px) {
          .stats-grid,
          .method-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <main style={{ padding: '32px 18px 56px' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <section className="fade-in" style={{ marginBottom: '1.1rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                padding: '0.5rem 0.7rem',
                borderRadius: '999px',
                background: 'rgba(255, 253, 248, 0.76)',
                border: '1px solid var(--border)',
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: '0.72rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}
            >
              <span
                style={{
                  width: '0.55rem',
                  height: '0.55rem',
                  borderRadius: '999px',
                  background: 'var(--accent)',
                }}
              />
              Privacy-aware NLP workspace
            </div>
            <div className="dashboard-grid">
              <div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 'clamp(2.8rem, 7vw, 5.4rem)',
                    lineHeight: 0.95,
                    letterSpacing: '-0.05em',
                    maxWidth: '10ch',
                  }}
                >
                  Anonymize text without flattening the story.
                </h1>
                <p
                  style={{
                    margin: '1rem 0 0',
                    maxWidth: '58ch',
                    color: 'var(--text-muted)',
                    fontSize: '1.04rem',
                    lineHeight: 1.7,
                  }}
                >
                  Detect sensitive entities, compare sentiment before and after masking, and keep a lightweight review
                  trail for repeated checks.
                </p>
              </div>
              <div
                style={{
                  padding: '1.2rem',
                  borderRadius: '28px',
                  background:
                    'linear-gradient(135deg, rgba(255, 252, 247, 0.82), rgba(215, 232, 212, 0.72))',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow)',
                }}
              >
                <div
                  style={{
                    fontFamily: '"IBM Plex Mono", monospace',
                    fontSize: '0.72rem',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    marginBottom: '0.7rem',
                  }}
                >
                  Workflow snapshot
                </div>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {['Paste text', 'Pick a masking style', 'Inspect entities and copy output'].map((step, index) => (
                    <div
                      key={step}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '34px 1fr',
                        gap: '0.8rem',
                        alignItems: 'center',
                        padding: '0.85rem 0.95rem',
                        borderRadius: '18px',
                        background: 'rgba(255, 253, 248, 0.92)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '12px',
                          display: 'grid',
                          placeItems: 'center',
                          background: index === 1 ? 'var(--accent-soft)' : 'rgba(47, 93, 80, 0.12)',
                          fontFamily: '"IBM Plex Mono", monospace',
                        }}
                      >
                        0{index + 1}
                      </div>
                      <div style={{ fontWeight: 500 }}>{step}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="stats-grid fade-in" style={{ animationDelay: '90ms', marginBottom: '1.2rem' }}>
            {stats.map((stat) => (
              <StatCard key={stat.label} label={stat.label} value={stat.value} tone={stat.tone} />
            ))}
          </section>

          <section className="dashboard-grid">
            <Panel eyebrow="Input" title="Source text">
              <div style={{ display: 'grid', gap: '1rem' }}>
                <textarea
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  rows={9}
                  placeholder="Try: John called Mary from New York at john@example.com and asked her to ring 9876543210."
                  style={{
                    width: '100%',
                    resize: 'vertical',
                    minHeight: '220px',
                    padding: '1rem 1.05rem',
                    borderRadius: '22px',
                    border: '1px solid var(--border)',
                    background: 'var(--surface-strong)',
                    color: 'var(--text)',
                    lineHeight: 1.7,
                  }}
                />

                <div className="method-grid">
                  {METHODS.map((option) => (
                    <MethodCard
                      key={option.value}
                      option={option}
                      active={method === option.value}
                      onSelect={setMethod}
                    />
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading || !text.trim()}
                    style={{
                      border: 'none',
                      borderRadius: '999px',
                      padding: '0.95rem 1.35rem',
                      background: loading || !text.trim() ? '#8d9485' : 'var(--primary)',
                      color: '#fff',
                      cursor: loading || !text.trim() ? 'not-allowed' : 'pointer',
                      fontWeight: 700,
                      minWidth: '190px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.55rem',
                    }}
                  >
                    {loading ? (
                      <>
                        <LoadingDots />
                        Analyzing
                      </>
                    ) : (
                      'Run anonymizer'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleHistory}
                    disabled={historyLoading}
                    style={{
                      borderRadius: '999px',
                      padding: '0.95rem 1.35rem',
                      background: 'transparent',
                      border: '1px solid var(--border-strong)',
                      color: 'var(--text)',
                      cursor: historyLoading ? 'progress' : 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    {historyLoading ? 'Loading history' : 'View recent history'}
                  </button>
                </div>

                {error ? (
                  <div
                    style={{
                      padding: '0.9rem 1rem',
                      borderRadius: '18px',
                      background: 'rgba(203, 92, 45, 0.12)',
                      border: '1px solid rgba(203, 92, 45, 0.2)',
                      color: '#8f3e1f',
                    }}
                  >
                    {error}
                  </div>
                ) : null}
              </div>
            </Panel>

            <div style={{ display: 'grid', gap: '1rem' }}>
              <Panel eyebrow="Why it matters" title="What this view gives you">
                <div style={{ display: 'grid', gap: '0.85rem' }}>
                  {[
                    'See what the model found before replacing anything.',
                    'Compare original and anonymized sentiment side by side.',
                    'Switch between machine-friendly tags and human-readable pseudonyms.',
                  ].map((line) => (
                    <div
                      key={line}
                      style={{
                        padding: '0.9rem 1rem',
                        borderRadius: '18px',
                        background: 'var(--surface-strong)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-muted)',
                        lineHeight: 1.6,
                      }}
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </Panel>

              {historyVisible ? (
                <Panel eyebrow="Recent" title="History">
                  <div style={{ display: 'grid', gap: '0.85rem' }}>
                    {history.length > 0 ? history.map((item) => <HistoryItem key={item._id} item={item} />) : 'No history yet.'}
                  </div>
                </Panel>
              ) : null}
            </div>
          </section>

          {result ? (
            <section className="fade-in" style={{ marginTop: '1.2rem', display: 'grid', gap: '1rem' }}>
              <div className="compare-grid">
                <Panel
                  eyebrow="Before"
                  title="Original text"
                  actions={<SentimentBadge sentiment={result.original.sentiment} />}
                >
                  <p style={{ margin: 0, lineHeight: 1.8, color: 'var(--text-muted)' }}>{result.original.text}</p>
                </Panel>

                <Panel
                  eyebrow="After"
                  title="Anonymized text"
                  actions={
                    <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <SentimentBadge sentiment={result.anonymized.sentiment} />
                      <button
                        type="button"
                        onClick={handleCopy}
                        style={{
                          border: '1px solid var(--border)',
                          background: copied ? 'rgba(53, 106, 65, 0.14)' : 'var(--surface-strong)',
                          color: copied ? 'var(--success)' : 'var(--text)',
                          borderRadius: '999px',
                          padding: '0.55rem 0.85rem',
                          cursor: 'pointer',
                          fontFamily: '"IBM Plex Mono", monospace',
                          fontSize: '0.72rem',
                          textTransform: 'uppercase',
                        }}
                      >
                        {copied ? 'Copied' : 'Copy text'}
                      </button>
                    </div>
                  }
                >
                  <p style={{ margin: 0, lineHeight: 1.8 }}>{result.anonymized.text}</p>
                </Panel>
              </div>

              <Panel eyebrow="Inspect" title="Detected entities">
                <div style={{ display: 'grid', gap: '0.85rem' }}>
                  {result.entities.length > 0 ? (
                    result.entities.map((entity, index) => <EntityRow key={`${entity.type}-${index}`} entity={entity} />)
                  ) : (
                    <div
                      style={{
                        padding: '1rem',
                        borderRadius: '18px',
                        background: 'var(--surface-strong)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      No entities detected.
                    </div>
                  )}
                </div>
              </Panel>
            </section>
          ) : null}
        </div>
      </main>
    </>
  );
}
