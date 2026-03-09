import { useState } from 'react';

// Mock axios for demo — replace with: import axios from 'axios';
const axios = {
  post: async (url, data) => {
    await new Promise(r => setTimeout(r, 1400));
    const entities = [
      { type: 'PERSON', text: 'John', score: 0.98 },
      { type: 'PERSON', text: 'Mary', score: 0.95 },
      { type: 'LOCATION', text: 'New York', score: 0.99 },
    ];
    const anonymized = data.method === 'tags'
      ? data.text.replace('John', '[PERSON_1]').replace('Mary', '[PERSON_2]').replace('New York', '[LOCATION_1]')
      : data.text.replace('John', 'Alex').replace('Mary', 'Jordan').replace('New York', 'Metropolis');
    return {
      data: {
        original: { text: data.text, sentiment: { label: 'Neutral', score: '0.52' } },
        anonymized: { text: anonymized, sentiment: { label: 'Neutral', score: '0.51' } },
        entities,
      }
    };
  },
  get: async () => ({
    data: [
      { _id: '1', originalText: 'John called Mary from New York', anonymizedText: '[PERSON_1] called [PERSON_2] from [LOCATION_1]', method: 'tags', createdAt: new Date().toISOString() },
    ]
  })
};

const ENTITY_COLORS = {
  PERSON: { bg: '#FFF3E0', border: '#FF6D00', text: '#E65100', dot: '#FF6D00' },
  LOCATION: { bg: '#E8F5E9', border: '#2E7D32', text: '#1B5E20', dot: '#43A047' },
  ORG: { bg: '#E3F2FD', border: '#1565C0', text: '#0D47A1', dot: '#1E88E5' },
  DATE: { bg: '#F3E5F5', border: '#6A1B9A', text: '#4A148C', dot: '#8E24AA' },
  DEFAULT: { bg: '#FAFAFA', border: '#9E9E9E', text: '#424242', dot: '#9E9E9E' },
};

function EntityBadge({ entity }) {
  const colors = ENTITY_COLORS[entity.type] || ENTITY_COLORS.DEFAULT;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 14px', borderRadius: '8px',
      background: colors.bg, border: `1.5px solid ${colors.border}`,
      fontFamily: "'DM Mono', monospace",
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors.dot, flexShrink: 0 }} />
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: colors.text }}>{entity.type}</span>
        <span style={{ fontSize: 13, color: '#212121', fontWeight: 500 }}>{entity.text}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ height: 4, width: 48, background: '#E0E0E0', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${entity.score * 100}%`, background: colors.dot, borderRadius: 2 }} />
        </div>
        <span style={{ fontSize: 11, color: '#757575', minWidth: 32, textAlign: 'right' }}>
          {(entity.score * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  );
}

function SentimentChip({ label, score }) {
  const map = { Positive: '#2E7D32', Negative: '#B71C1C', Neutral: '#546E7A' };
  const color = map[label] || '#546E7A';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 10px', borderRadius: 20,
      background: color + '18', border: `1px solid ${color}40`,
      fontSize: 12, fontWeight: 600, color,
      fontFamily: "'DM Mono', monospace",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
      {label} · {score}
    </span>
  );
}

function Panel({ title, icon, children, accent = '#1A1A2E' }) {
  return (
    <div style={{
      background: '#FFFFFF',
      border: '1.5px solid #E8E8E8',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
    }}>
      <div style={{
        padding: '14px 20px',
        borderBottom: '1.5px solid #F0F0F0',
        display: 'flex', alignItems: 'center', gap: 10,
        background: '#FAFAFA',
      }}>
        <span style={{
          width: 28, height: 28, borderRadius: 8,
          background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, flexShrink: 0,
        }}>{icon}</span>
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', color: '#1A1A1A', fontFamily: "'DM Mono', monospace" }}>
          {title}
        </span>
      </div>
      <div style={{ padding: '18px 20px' }}>{children}</div>
    </div>
  );
}

function MethodToggle({ method, setMethod }) {
  const opts = [
    { value: 'tags', label: 'REPLACE WITH TAGS', eg: '→ [PERSON_1]' },
    { value: 'pseudonyms', label: 'REPLACE WITH PSEUDONYMS', eg: '→ Alex' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {opts.map(opt => (
        <button
          key={opt.value}
          onClick={() => setMethod(opt.value)}
          style={{
            padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
            border: method === opt.value ? '2px solid #1A1A2E' : '2px solid #E0E0E0',
            background: method === opt.value ? '#1A1A2E' : '#FAFAFA',
            color: method === opt.value ? '#FFFFFF' : '#757575',
            textAlign: 'left', transition: 'all 0.15s ease',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', fontFamily: "'DM Mono', monospace" }}>
            {opt.label}
          </div>
          <div style={{ fontSize: 11, marginTop: 3, opacity: 0.7, fontFamily: "'DM Mono', monospace" }}>
            {opt.eg}
          </div>
        </button>
      ))}
    </div>
  );
}

function LoadingDots() {
  return (
    <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 6, height: 6, borderRadius: '50%', background: 'white',
          animation: 'pulse 1.2s ease-in-out infinite',
          animationDelay: `${i * 0.2}s`,
          display: 'inline-block',
        }} />
      ))}
    </span>
  );
}

export default function AnonymizeApp() {
  const [text, setText] = useState('');
  const [method, setMethod] = useState('tags');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [histLoading, setHistLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const response = await axios.post('http://localhost:5000/api/anonymize', { text, method });
      setResult(response.data);
    } catch {
      alert('Error processing text');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result?.anonymized?.text) {
      navigator.clipboard.writeText(result.anonymized.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const loadHistory = async () => {
    setHistLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/history');
      setHistory(response.data);
      setShowHistory(true);
    } catch {
      alert('Could not load history');
    } finally {
      setHistLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F2F1EE; }
        textarea:focus { outline: none; border-color: #1A1A2E !important; box-shadow: 0 0 0 3px rgba(26,26,46,0.1) !important; }
        textarea::placeholder { color: #BDBDBD; }
        @keyframes pulse { 0%,100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1); } }
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .result-panel { animation: fadeSlideUp 0.4s ease forwards; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #C8C8C8; border-radius: 3px; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: '#F2F1EE',
        fontFamily: "'DM Sans', sans-serif",
        padding: '40px 20px 60px',
      }}>
        {/* Header */}
        <div style={{ maxWidth: 680, margin: '0 auto 32px', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#1A1A2E', color: '#FFFFFF',
            padding: '5px 14px 5px 8px', borderRadius: 20,
            marginBottom: 16,
          }}>
            <span style={{
              background: '#FF6D00', borderRadius: 12, padding: '2px 8px',
              fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
              fontFamily: "'DM Mono', monospace",
            }}>NLP</span>
            <span style={{ fontSize: 11, letterSpacing: '0.08em', fontFamily: "'DM Mono', monospace" }}>
              PRIVACY TOOL
            </span>
          </div>
          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 800,
            color: '#1A1A2E',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}>
            Text Anonymizer
          </h1>
          <p style={{ marginTop: 10, color: '#757575', fontSize: 15, lineHeight: 1.6 }}>
            Detect and redact personally identifiable information<br />from any text using NER models.
          </p>
        </div>

        {/* Main card */}
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Input */}
          <div style={{
            background: '#FFFFFF',
            border: '1.5px solid #E8E8E8',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
          }}>
            <div style={{ padding: '14px 20px 0' }}>
              <label style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
                color: '#9E9E9E', fontFamily: "'DM Mono', monospace",
                display: 'block', marginBottom: 10,
              }}>INPUT TEXT</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder='e.g. "John called Mary from New York on Monday."'
                rows={5}
                style={{
                  width: '100%', border: '1.5px solid #E8E8E8',
                  borderRadius: 10, padding: '12px 14px',
                  fontSize: 14, lineHeight: 1.7, color: '#212121',
                  resize: 'vertical', fontFamily: "'DM Sans', sans-serif",
                  background: '#FAFAFA', transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
              />
            </div>
            <div style={{ padding: '14px 20px 18px' }}>
              <label style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
                color: '#9E9E9E', fontFamily: "'DM Mono', monospace",
                display: 'block', marginBottom: 10,
              }}>ANONYMIZATION METHOD</label>
              <MethodToggle method={method} setMethod={setMethod} />
            </div>
            <div style={{ padding: '0 20px 20px' }}>
              <button
                onClick={handleSubmit}
                disabled={loading || !text.trim()}
                style={{
                  width: '100%', padding: '14px',
                  background: loading ? '#424242' : '#1A1A2E',
                  color: '#FFFFFF', border: 'none', borderRadius: 10,
                  fontSize: 13, fontWeight: 700, letterSpacing: '0.06em',
                  fontFamily: "'DM Mono', monospace",
                  cursor: loading || !text.trim() ? 'not-allowed' : 'pointer',
                  opacity: !text.trim() && !loading ? 0.5 : 1,
                  transition: 'background 0.2s, transform 0.1s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
                onMouseDown={e => { if (!loading && text.trim()) e.currentTarget.style.transform = 'scale(0.99)'; }}
                onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                {loading ? <><LoadingDots /><span style={{ marginLeft: 6 }}>ANALYZING...</span></> : 'ANONYMIZE TEXT →'}
              </button>
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className="result-panel" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* Side by side comparison */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Panel title="ORIGINAL" icon="📄" accent="#546E7A">
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: '#424242', marginBottom: 12 }}>
                    {result.original.text}
                  </p>
                  <SentimentChip label={result.original.sentiment.label} score={result.original.sentiment.score} />
                </Panel>

                <Panel title="ANONYMIZED" icon="🔒" accent="#2E7D32">
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: '#212121', marginBottom: 12, fontWeight: 500 }}>
                    {result.anonymized.text}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <SentimentChip label={result.anonymized.sentiment.label} score={result.anonymized.sentiment.score} />
                    <button
                      onClick={handleCopy}
                      style={{
                        padding: '4px 10px', borderRadius: 6, border: '1px solid #E0E0E0',
                        background: copied ? '#E8F5E9' : '#FAFAFA',
                        color: copied ? '#2E7D32' : '#757575',
                        fontSize: 11, cursor: 'pointer', fontFamily: "'DM Mono', monospace",
                        fontWeight: 600, transition: 'all 0.15s',
                      }}
                    >
                      {copied ? '✓ COPIED' : 'COPY'}
                    </button>
                  </div>
                </Panel>
              </div>

              {/* Entities */}
              <Panel title="DETECTED ENTITIES" icon="🔍" accent="#FF6D00">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {result.entities.length > 0 ? result.entities.map((entity, idx) => (
                    <EntityBadge key={idx} entity={entity} />
                  )) : (
                    <p style={{ color: '#9E9E9E', fontSize: 13, fontFamily: "'DM Mono', monospace" }}>
                      No entities detected.
                    </p>
                  )}
                </div>
                <div style={{
                  marginTop: 14, padding: '10px 14px',
                  background: '#F5F5F5', borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: 11, color: '#9E9E9E', fontFamily: "'DM Mono', monospace" }}>TOTAL ENTITIES FOUND</span>
                  <span style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: '#1A1A2E' }}>
                    {result.entities.length}
                  </span>
                </div>
              </Panel>
            </div>
          )}

          {/* History */}
          <div style={{ marginTop: 4 }}>
            <button
              onClick={loadHistory}
              disabled={histLoading}
              style={{
                width: '100%', padding: '12px',
                background: 'transparent',
                color: '#757575', border: '1.5px dashed #C8C8C8', borderRadius: 10,
                fontSize: 12, fontWeight: 700, letterSpacing: '0.06em',
                fontFamily: "'DM Mono', monospace",
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#1A1A2E'; e.currentTarget.style.color = '#1A1A2E'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#C8C8C8'; e.currentTarget.style.color = '#757575'; }}
            >
              {histLoading ? 'LOADING...' : '↑ LOAD HISTORY'}
            </button>

            {showHistory && history.length > 0 && (
              <div className="result-panel" style={{ marginTop: 12 }}>
                <Panel title="HISTORY" icon="📜" accent="#1A1A2E">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {history.map((item) => (
                      <div key={item._id} style={{
                        padding: '12px 14px', borderRadius: 10,
                        background: '#FAFAFA', border: '1.5px solid #F0F0F0',
                      }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#9E9E9E', fontFamily: "'DM Mono', monospace", paddingTop: 1 }}>ORIGINAL</span>
                          <span style={{ fontSize: 13, color: '#424242' }}>{item.originalText}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 8, marginBottom: 8 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#9E9E9E', fontFamily: "'DM Mono', monospace", paddingTop: 1 }}>ANON.</span>
                          <span style={{ fontSize: 13, color: '#212121', fontWeight: 500 }}>{item.anonymizedText}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{
                            fontSize: 10, padding: '2px 8px', borderRadius: 4,
                            background: '#1A1A2E', color: '#FFFFFF',
                            fontFamily: "'DM Mono', monospace", fontWeight: 700,
                          }}>{item.method.toUpperCase()}</span>
                          <span style={{ fontSize: 11, color: '#BDBDBD', fontFamily: "'DM Mono', monospace" }}>
                            {new Date(item.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}