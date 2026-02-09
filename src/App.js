import React, { useState } from 'react';
import { Shield, Code, AlertTriangle, CheckCircle, Loader, Lock, Brain } from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('code');
  const [input, setInput] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_ENDPOINT_CODE = 'https://subzero-hyperprophetically-marylou.ngrok-free.dev/analyze';
  const API_ENDPOINT_SPEC = 'https://subzero-hyperprophetically-marylou.ngrok-free.dev/analyze';

  // Normalize backend responses (JSON or raw text) into the shape the UI expects
  const normalizeResponseData = (raw, status) => {
    // If raw is already an object (some code paths might supply an object),
    // try to return a reasonable shape.
    if (raw && typeof raw === 'object') {
      if (raw.analysis) return raw;
      // Attempt common field mappings
      if (raw.vulnerabilities || raw.security_concerns) {
        return {
          analysis: {
            summary: raw.summary || raw.analysis?.summary || 'Analysis results',
            security_score: raw.security_score || raw.security_score || 'N/A',
            vulnerabilities: raw.vulnerabilities || raw.security_concerns || []
          },
          model: raw.model || 'Unknown'
        };
      }
    }

    // If raw is a string (non-JSON), create a fallback analysis object
    let rawText = '';
    try {
      rawText = String(raw || '').trim();
    } catch (e) {
      rawText = 'Unparseable response from server';
    }

    return {
      analysis: {
        summary: rawText || `Server returned status ${status}`,
        security_score: 'N/A',
        vulnerabilities: [
          {
            name: 'Parsing Error',
            severity: 'High',
            lines: null,
            description: 'Model returned invalid or malformed JSON output.',
            risk: 'Security findings may be incomplete.',
            fix: 'Improve prompt to enforce JSON-only output or enforce a strict response parser.'
          }
        ]
      },
      warning: 'Model output could not be parsed as structured JSON',
      model: 'Unknown'
    };
  };

  const analyzeCode = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch(API_ENDPOINT_CODE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'code_analysis',
          code: input
        })
      });

      const raw = await response.text();

      // Try to parse as JSON; if parsing fails, normalize into expected shape
      try {
        const data = JSON.parse(raw);
        if (!response.ok) {
          // server returned an error payload
          setError((data && data.error) || `Server error: ${response.status}`);
        } else {
          setResults(data);
        }
      } catch (parseErr) {
        // Non-JSON response from backend / LLM; show structured fallback
        const fallback = normalizeResponseData(raw, response.status);
        setResults(fallback);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const analyzeSpecs = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch(API_ENDPOINT_SPEC, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'spec_analysis',
          specs: input
        })
      });

      const raw = await response.text();

      try {
        const data = JSON.parse(raw);
        if (!response.ok) {
          setError((data && data.error) || `Server error: ${response.status}`);
        } else {
          setResults(data);
        }
      } catch (parseErr) {
        const fallback = normalizeResponseData(raw, response.status);
        setResults(fallback);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = () => {
    if (!input.trim()) {
      setError('Please enter some input to analyze');
      return;
    }
    
    if (activeTab === 'code') {
      analyzeCode();
    } else {
      analyzeSpecs();
    }
  };

  const exampleCode = `def get_user(username):
    query = "SELECT * FROM users WHERE username = '" + username + "'"
    return db.execute(query)`;

  const exampleSpec = `GenAI Customer Support Chatbot:
- Accepts user queries via web interface
- Uses LLM to generate responses
- Accesses customer database for personalized responses
- Stores conversation history
- Allows users to upload documents for context`;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f172a 100%)',
      fontFamily: '"JetBrains Mono", "Courier New", monospace',
      color: '#e2e8f0',
      padding: '0',
      margin: '0'
    }}>
      {/* Animated background grid */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '15px',
            marginBottom: '20px',
            padding: '20px 40px',
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '15px',
            border: '2px solid rgba(59, 130, 246, 0.3)',
            boxShadow: '0 0 30px rgba(59, 130, 246, 0.2)'
          }}>
            <Shield size={48} color="#3b82f6" strokeWidth={2.5} />
            <h1 style={{
              fontSize: '42px',
              fontWeight: '800',
              margin: '0',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-1px'
            }}>
              LLM SECURITY HELPER
            </h1>
          </div>
          <p style={{
            fontSize: '16px',
            color: '#94a3b8',
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Analyze code vulnerabilities and GenAI application security risks with AI-powered insights
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '30px',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => setActiveTab('code')}
            style={{
              padding: '15px 30px',
              background: activeTab === 'code' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(30, 41, 59, 0.5)',
              border: activeTab === 'code' ? '2px solid #3b82f6' : '2px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '10px',
              color: activeTab === 'code' ? '#3b82f6' : '#94a3b8',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.3s ease',
              fontFamily: 'inherit'
            }}
          >
            <Code size={20} />
            CODE ANALYSIS
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            style={{
              padding: '15px 30px',
              background: activeTab === 'specs' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(30, 41, 59, 0.5)',
              border: activeTab === 'specs' ? '2px solid #8b5cf6' : '2px solid rgba(139, 92, 246, 0.2)',
              borderRadius: '10px',
              color: activeTab === 'specs' ? '#8b5cf6' : '#94a3b8',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.3s ease',
              fontFamily: 'inherit'
            }}
          >
            <Brain size={20} />
            SPEC ANALYSIS
          </button>
        </div>

        {/* Main Content */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.7)',
          borderRadius: '20px',
          padding: '40px',
          border: '2px solid rgba(59, 130, 246, 0.2)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
        }}>
          {/* Input Section */}
          <div style={{ marginBottom: '25px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <label style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#cbd5e1',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                {activeTab === 'code' ? '// Input Code' : '// Application Specifications'}
              </label>
              <button
                onClick={() => setInput(activeTab === 'code' ? exampleCode : exampleSpec)}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '6px',
                  color: '#3b82f6',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(59, 130, 246, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(59, 130, 246, 0.1)';
                }}
              >
                Load Example
              </button>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={activeTab === 'code' 
                ? 'Paste your code here...' 
                : 'Describe your GenAI/Agentic application specifications...'}
              style={{
                width: '100%',
                minHeight: '250px',
                padding: '20px',
                background: '#0f172a',
                border: '2px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '12px',
                color: '#e2e8f0',
                fontSize: '14px',
                fontFamily: '"JetBrains Mono", monospace',
                resize: 'vertical',
                lineHeight: '1.6',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={loading}
            style={{
              width: '100%',
              padding: '18px',
              background: loading 
                ? 'rgba(71, 85, 105, 0.5)' 
                : `linear-gradient(135deg, ${activeTab === 'code' ? '#3b82f6' : '#8b5cf6'} 0%, ${activeTab === 'code' ? '#1d4ed8' : '#6d28d9'} 100%)`,
              border: 'none',
              borderRadius: '12px',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: '800',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.3s ease',
              fontFamily: 'inherit',
              boxShadow: loading ? 'none' : `0 5px 20px ${activeTab === 'code' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(139, 92, 246, 0.3)'}`,
              marginBottom: '30px'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.target.style.transform = 'translateY(0)';
            }}
          >
            {loading ? (
              <>
                <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
                ANALYZING...
              </>
            ) : (
              <>
                <Lock size={20} />
                ANALYZE SECURITY
              </>
            )}
          </button>

          {/* Error Display */}
          {error && (
            <div style={{
              padding: '20px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '2px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <AlertTriangle size={24} color="#ef4444" />
              <span style={{ color: '#fca5a5', fontSize: '14px' }}>{error}</span>
            </div>
          )}

          {/* Results Display */}
          {results && (
            <div style={{ animation: 'fadeIn 0.5s ease-in' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '25px',
                padding: '15px',
                background: 'rgba(34, 197, 94, 0.1)',
                border: '2px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '10px'
              }}>
                <CheckCircle size={24} color="#22c55e" />
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#86efac' }}>
                  Analysis Complete
                </span>
              </div>

              {/* Human-Readable Format */}
              {results.analysis && (
                <div style={{ background: '#0f172a', borderRadius: '12px', padding: '30px', border: '2px solid rgba(59, 130, 246, 0.2)' }}>
                  
                  {/* Summary */}
                  <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ color: '#3b82f6', fontSize: '18px', marginBottom: '10px' }}>📋 Summary</h3>
                    <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6' }}>
                      {results.analysis.summary}
                    </p>
                    <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '10px' }}>
                      <strong>Security Score:</strong> {results.analysis.security_score}
                    </p>
                  </div>

                  {/* Vulnerabilities */}
                  <div>
                    <h3 style={{ color: '#ef4444', fontSize: '18px', marginBottom: '20px' }}>
                      🚨 Vulnerabilities Found: {results.analysis.vulnerabilities?.length || 0}
                    </h3>
                    
                    {results.analysis.vulnerabilities?.map((vuln, index) => (
                      <div key={index} style={{
                        background: 'rgba(30, 41, 59, 0.5)',
                        border: `2px solid ${vuln.severity === 'Critical' ? '#ef4444' : vuln.severity === 'High' ? '#f97316' : '#eab308'}`,
                        borderRadius: '10px',
                        padding: '20px',
                        marginBottom: '20px'
                      }}>
                        {/* Header */}
                        <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h4 style={{ color: '#e2e8f0', fontSize: '16px', margin: 0 }}>
                            {index + 1}. {vuln.name}
                          </h4>
                          <span style={{
                            padding: '4px 12px',
                            background: vuln.severity === 'Critical' ? '#ef4444' : vuln.severity === 'High' ? '#f97316' : '#eab308',
                            color: '#fff',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '700'
                          }}>
                            {vuln.severity}
                          </span>
                        </div>

                        {/* Lines */}
                        {vuln.lines && (
                          <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '10px' }}>
                            📍 <strong>Lines:</strong> {vuln.lines}
                          </p>
                        )}

                        {/* Description */}
                        <div style={{ marginBottom: '15px' }}>
                          <p style={{ color: '#64748b', fontSize: '12px', fontWeight: '700', marginBottom: '5px' }}>DESCRIPTION:</p>
                          <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6' }}>{vuln.description}</p>
                        </div>

                        {/* Risk */}
                        {vuln.risk && (
                          <div style={{ marginBottom: '15px' }}>
                            <p style={{ color: '#64748b', fontSize: '12px', fontWeight: '700', marginBottom: '5px' }}>RISK:</p>
                            <p style={{ color: '#fca5a5', fontSize: '14px', lineHeight: '1.6' }}>{vuln.risk}</p>
                          </div>
                        )}

                        {/* OWASP & ATLAS Mappings */}
                        {(vuln.owasp_mapping || vuln.atlas_mapping) && (
                          <div style={{ marginBottom: '15px' }}>
                            {vuln.owasp_mapping && (
                              <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '5px' }}>
                                🏷️ <strong>OWASP:</strong> {vuln.owasp_mapping.join(', ')}
                              </p>
                            )}
                            {vuln.atlas_mapping && (
                              <p style={{ color: '#94a3b8', fontSize: '13px' }}>
                                🎯 <strong>ATLAS:</strong> {vuln.atlas_mapping.join(', ')}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Fix */}
                        {vuln.fix && (
                          <div style={{ marginBottom: '15px' }}>
                            <p style={{ color: '#64748b', fontSize: '12px', fontWeight: '700', marginBottom: '5px' }}>💡 RECOMMENDED FIX:</p>
                            <p style={{ color: '#86efac', fontSize: '14px', lineHeight: '1.6' }}>{vuln.fix}</p>
                          </div>
                        )}

                        {/* Fixed Code */}
                        {vuln.fixed_code && (
                          <div>
                            <p style={{ color: '#64748b', fontSize: '12px', fontWeight: '700', marginBottom: '5px' }}>✅ FIXED CODE:</p>
                            <pre style={{
                              background: '#020617',
                              padding: '15px',
                              borderRadius: '8px',
                              fontSize: '13px',
                              color: '#22c55e',
                              overflowX: 'auto',
                              border: '1px solid rgba(34, 197, 94, 0.3)'
                            }}>
                              {vuln.fixed_code}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Model Info */}
                  <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px' }}>
                    <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>
                      🤖 Analyzed by: <strong>{results.model}</strong>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div style={{
          marginTop: '40px',
          textAlign: 'center',
          fontSize: '13px',
          color: '#64748b'
        }}>
          <p style={{ margin: '5px 0' }}>
            Powered by LLaMA • OWASP Top 10 for LLM Apps • MITRE ATLAS Framework
          </p>
          <p style={{ margin: '5px 0', fontSize: '11px' }}>
            ⚠️ For educational purposes • Always verify results manually
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default App;