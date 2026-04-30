import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router';
import axiosClient from "../utils/axiosClient"

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Sora:wght@400;500;600;700&display=swap');

  .problem-page * { box-sizing: border-box; }

  .problem-page {
    font-family: 'Sora', sans-serif;
    background: #080c14;
    color: #c9d1d9;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Top Bar ── */
  .top-bar {
    height: 44px;
    background: #0d1117;
    border-bottom: 1px solid #1e2738;
    display: flex;
    align-items: center;
    padding: 0 16px;
    gap: 8px;
    flex-shrink: 0;
  }
  .top-dot { width: 10px; height: 10px; border-radius: 50%; }
  .dot-red   { background: #ff5f57; }
  .dot-yellow{ background: #febc2e; }
  .dot-green { background: #28c840; }
  .top-title {
    flex: 1;
    text-align: center;
    font-size: 12px;
    color: #4a5568;
    font-weight: 500;
    letter-spacing: 0.05em;
  }

  /* ── Split Layout ── */
  .split-layout {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  /* ── Panel ── */
  .panel {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .panel-left  { width: 50%; border-right: 1px solid #1e2738; }
  .panel-right { width: 50%; }

  /* ── Tabs ── */
  .tab-bar {
    display: flex;
    background: #0d1117;
    border-bottom: 1px solid #1e2738;
    padding: 0 4px;
    flex-shrink: 0;
  }
  .tab-btn {
    padding: 11px 16px;
    font-size: 12.5px;
    font-weight: 500;
    color: #4a5568;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s;
    letter-spacing: 0.02em;
  }
  .tab-btn:hover { color: #8b98a8; }
  .tab-btn.active {
    color: #e6edf3;
    border-bottom-color: #3b82f6;
  }

  /* ── Scrollable content area ── */
  .panel-content {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
    scrollbar-width: thin;
    scrollbar-color: #1e2738 transparent;
  }
  .panel-content::-webkit-scrollbar { width: 4px; }
  .panel-content::-webkit-scrollbar-track { background: transparent; }
  .panel-content::-webkit-scrollbar-thumb { background: #1e2738; border-radius: 4px; }

  /* ── Problem Header ── */
  .problem-title {
    font-size: 22px;
    font-weight: 700;
    color: #e6edf3;
    margin: 0 0 12px 0;
    line-height: 1.3;
  }
  .badge-row { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
  .badge {
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.03em;
  }
  .badge-easy   { background: rgba(34,197,94,0.12);  color: #22c55e; border: 1px solid rgba(34,197,94,0.3);  }
  .badge-medium { background: rgba(234,179,8,0.12);  color: #eab308; border: 1px solid rgba(234,179,8,0.3);  }
  .badge-hard   { background: rgba(239,68,68,0.12);  color: #ef4444; border: 1px solid rgba(239,68,68,0.3);  }
  .badge-tag    { background: rgba(59,130,246,0.12); color: #60a5fa; border: 1px solid rgba(59,130,246,0.25); }

  /* ── Description text ── */
  .desc-text {
    font-size: 13.5px;
    line-height: 1.75;
    color: #8b98a8;
    white-space: pre-wrap;
    margin-bottom: 24px;
  }

  /* ── Examples ── */
  .examples-heading {
    font-size: 13px;
    font-weight: 600;
    color: #c9d1d9;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin: 0 0 12px 0;
  }
  .example-card {
    background: #0d1117;
    border: 1px solid #1e2738;
    border-radius: 10px;
    padding: 14px 16px;
    margin-bottom: 10px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12.5px;
  }
  .example-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 6px;
    color: #3b82f6;
  }
  .example-row { display: flex; gap: 8px; margin-bottom: 4px; color: #8b98a8; }
  .example-row:last-child { margin-bottom: 0; }
  .example-key { color: #c9d1d9; font-weight: 500; min-width: 90px; }
  .example-val { color: #8b98a8; }

  /* ── Language Selector ── */
  .lang-bar {
    display: flex;
    align-items: center;
    padding: 10px 14px;
    gap: 6px;
    border-bottom: 1px solid #1e2738;
    background: #0d1117;
    flex-shrink: 0;
  }
  .lang-btn {
    padding: 5px 13px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    font-family: 'Sora', sans-serif;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.15s;
    letter-spacing: 0.02em;
  }
  .lang-btn.inactive {
    background: transparent;
    color: #4a5568;
    border-color: #1e2738;
  }
  .lang-btn.inactive:hover { color: #8b98a8; border-color: #2d3748; }
  .lang-btn.active-lang {
    background: #1e2738;
    color: #e6edf3;
    border-color: #3b82f6;
  }

  /* ── Editor wrapper ── */
  .editor-wrap { flex: 1; overflow: hidden; }

  /* ── Action Bar ── */
  .action-bar {
    padding: 10px 14px;
    border-top: 1px solid #1e2738;
    background: #0d1117;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
  }
  .console-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: transparent;
    border: 1px solid #1e2738;
    border-radius: 6px;
    color: #4a5568;
    font-size: 12px;
    font-family: 'Sora', sans-serif;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }
  .console-btn:hover { color: #8b98a8; border-color: #2d3748; }
  .action-btns { display: flex; gap: 8px; }
  .run-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 16px;
    background: transparent;
    border: 1px solid #2d3748;
    border-radius: 7px;
    color: #c9d1d9;
    font-size: 12.5px;
    font-family: 'Sora', sans-serif;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
  }
  .run-btn:hover { background: #1e2738; border-color: #3b82f6; color: #e6edf3; }
  .run-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .submit-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 18px;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    border: 1px solid rgba(59,130,246,0.4);
    border-radius: 7px;
    color: #fff;
    font-size: 12.5px;
    font-family: 'Sora', sans-serif;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    box-shadow: 0 0 12px rgba(37,99,235,0.25);
  }
  .submit-btn:hover { background: linear-gradient(135deg, #3b82f6, #2563eb); box-shadow: 0 0 18px rgba(59,130,246,0.4); }
  .submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* ── Testcase / Result panel ── */
  .result-panel { flex: 1; padding: 20px; overflow-y: auto; }
  .result-empty { color: #2d3748; font-size: 13px; margin-top: 8px; }
  .result-card {
    border-radius: 10px;
    padding: 16px;
    border: 1px solid;
    margin-bottom: 16px;
  }
  .result-success { background: rgba(34,197,94,0.06);  border-color: rgba(34,197,94,0.2);  }
  .result-error   { background: rgba(239,68,68,0.06);  border-color: rgba(239,68,68,0.2);  }
  .result-heading { font-size: 15px; font-weight: 700; margin-bottom: 10px; }
  .result-success .result-heading { color: #22c55e; }
  .result-error   .result-heading { color: #ef4444; }
  .result-meta { font-size: 12px; color: #4a5568; margin-top: 4px; }
  .tc-card {
    background: #0d1117;
    border: 1px solid #1e2738;
    border-radius: 8px;
    padding: 12px;
    margin-top: 8px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11.5px;
  }
  .tc-row { display: flex; gap: 6px; margin-bottom: 4px; color: #8b98a8; }
  .tc-key { color: #c9d1d9; min-width: 80px; }
  .tc-pass { color: #22c55e; font-weight: 600; }
  .tc-fail { color: #ef4444; font-weight: 600; }

  /* ── Loading ── */
  .loading-screen {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: #080c14;
  }
  .spinner {
    width: 36px; height: 36px;
    border: 3px solid #1e2738;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Editorial / Solutions ── */
  .section-title { font-size: 16px; font-weight: 700; color: #e6edf3; margin-bottom: 16px; }
  .solution-card { border: 1px solid #1e2738; border-radius: 10px; margin-bottom: 16px; overflow: hidden; }
  .solution-header { background: #0d1117; padding: 10px 16px; font-size: 12.5px; font-weight: 600; color: #8b98a8; border-bottom: 1px solid #1e2738; }
  .solution-body pre { background: #080c14; margin: 0; padding: 16px; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #8b98a8; overflow-x: auto; }
`;

const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const editorRef = useRef(null);
  let { problemId } = useParams();
  const { handleSubmit } = useForm();

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);
        const initialCode = response.data.startCode.find((sc) => {
          if (sc.language == "cpp" && selectedLanguage == 'cpp') return true;
          else if (sc.language == "java" && selectedLanguage == 'java') return true;
          else if (sc.language == "javascript" && selectedLanguage == 'javascript') return true;
          return false;
        })?.initialCode || '';
        setProblem(response.data);
        setCode(initialCode);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching problem:', error);
        setLoading(false);
      }
    };
    fetchProblem();
  }, [problemId]);

  useEffect(() => {
    if (problem) {
      const initialCode = problem.startCode.find(sc => sc.language === selectedLanguage)?.initialCode || '';
      setCode(initialCode);
    }
  }, [selectedLanguage, problem]);

  const handleEditorChange = (value) => setCode(value || '');
  const handleEditorDidMount = (editor) => { editorRef.current = editor; };
  const handleLanguageChange = (language) => setSelectedLanguage(language);

  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);
    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, { code, language: selectedLanguage });
      setRunResult(response.data);
      setActiveRightTab('testcase');
    } catch (error) {
      setRunResult({ success: false, error: 'Internal server error' });
      setActiveRightTab('testcase');
    }
    setLoading(false);
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);
    try {
      const response = await axiosClient.post(`/submission/submit/${problemId}`, { code, language: selectedLanguage });

      console.log(response);
      setSubmitResult(response.data);
      setActiveRightTab('result');
    } catch (error) {
      setSubmitResult(null);
      setActiveRightTab('result');
    }
    setLoading(false);
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'javascript': return 'javascript';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      default: return 'javascript';
    }
  };

  const getDifficultyBadge = (d) => {
    if (d === 'easy') return 'badge-easy';
    if (d === 'medium') return 'badge-medium';
    if (d === 'hard') return 'badge-hard';
    return 'badge-tag';
  };

  const LANGS = [
    { key: 'javascript', label: 'JavaScript' },
    { key: 'java',       label: 'Java'       },
    { key: 'cpp',        label: 'C++'        },
  ];

  const LEFT_TABS  = ['description','editorial','solutions','submissions'];
  const RIGHT_TABS = ['code','testcase','result'];

  if (loading && !problem) {
    return (
      <div className="loading-screen">
        <style>{styles}</style>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="problem-page">
      <style>{styles}</style>

      {/* ── Top Chrome Bar ── */}
      <div className="top-bar">
        <div className="top-dot dot-red"   />
        <div className="top-dot dot-yellow"/>
        <div className="top-dot dot-green" />
        <div className="top-title">LeetLab · Problem Solver</div>
      </div>

      {/* ── Main Split ── */}
      <div className="split-layout">

        {/* ══ LEFT PANEL ══ */}
        <div className="panel panel-left">
          <div className="tab-bar">
            {LEFT_TABS.map(t => (
              <button
                key={t}
                className={`tab-btn ${activeLeftTab === t ? 'active' : ''}`}
                onClick={() => setActiveLeftTab(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="panel-content">
            {problem && (
              <>
                {activeLeftTab === 'description' && (
                  <div>
                    <h1 className="problem-title">{problem.title}</h1>
                    <div className="badge-row">
                      <span className={`badge ${getDifficultyBadge(problem.difficulty)}`}>
                        {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                      </span>
                      <span className="badge badge-tag">{problem.tags}</span>
                    </div>
                    <p className="desc-text">{problem.description}</p>

                    <p className="examples-heading">Examples</p>
                    {problem.visibleTestCases.map((ex, i) => (
                      <div key={i} className="example-card">
                        <div className="example-label">Example {i + 1}</div>
                        <div className="example-row">
                          <span className="example-key">Input:</span>
                          <span className="example-val">{ex.input}</span>
                        </div>
                        <div className="example-row">
                          <span className="example-key">Output:</span>
                          <span className="example-val">{ex.output}</span>
                        </div>
                        {ex.explanation && (
                          <div className="example-row">
                            <span className="example-key">Explanation:</span>
                            <span className="example-val">{ex.explanation}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {activeLeftTab === 'editorial' && (
                  <div>
                    <p className="section-title">Editorial</p>
                    <p className="desc-text">Editorial will appear here.</p>
                  </div>
                )}

                {activeLeftTab === 'solutions' && (
                  <div>
                    <p className="section-title">Solutions</p>
                    {problem.referenceSolution?.map((sol, i) => (
                      <div key={i} className="solution-card">
                        <div className="solution-header">{problem.title} — {sol.language}</div>
                        <div className="solution-body">
                          <pre><code>{sol.completeCode}</code></pre>
                        </div>
                      </div>
                    )) || <p className="desc-text">Solutions visible after solving the problem.</p>}
                  </div>
                )}

                {activeLeftTab === 'submissions' && (
                  <div>
                    <p className="section-title">My Submissions</p>
                    <p className="desc-text">Your submission history will appear here.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ══ RIGHT PANEL ══ */}
        <div className="panel panel-right">
          <div className="tab-bar">
            {RIGHT_TABS.map(t => (
              <button
                key={t}
                className={`tab-btn ${activeRightTab === t ? 'active' : ''}`}
                onClick={() => setActiveRightTab(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* ─ Code Tab ─ */}
          {activeRightTab === 'code' && (
            <div style={{ display:'flex', flexDirection:'column', flex:1, overflow:'hidden' }}>
              <div className="lang-bar">
                {LANGS.map(l => (
                  <button
                    key={l.key}
                    className={`lang-btn ${selectedLanguage === l.key ? 'active-lang' : 'inactive'}`}
                    onClick={() => handleLanguageChange(l.key)}
                  >
                    {l.label}
                  </button>
                ))}
              </div>

              <div className="editor-wrap">
                <Editor
                  height="100%"
                  language={getLanguageForMonaco(selectedLanguage)}
                  value={code}
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  theme="vs-dark"
                  options={{
                    fontSize: 13,
                    fontFamily: "'JetBrains Mono', monospace",
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    glyphMargin: false,
                    folding: true,
                    lineDecorationsWidth: 10,
                    lineNumbersMinChars: 3,
                    renderLineHighlight: 'line',
                    roundedSelection: false,
                    cursorStyle: 'line',
                    mouseWheelZoom: true,
                    padding: { top: 12 },
                  }}
                />
              </div>

              <div className="action-bar">
                <button className="console-btn" onClick={() => setActiveRightTab('testcase')}>
                  {/* Terminal icon */}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>
                  </svg>
                  Console
                </button>
                <div className="action-btns">
                  <button className="run-btn" onClick={handleRun} disabled={loading}>
                    {/* Play icon */}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                    Run
                  </button>
                  <button className="submit-btn" onClick={handleSubmitCode} disabled={loading}>
                    {/* Send icon */}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─ Testcase Tab ─ */}
          {activeRightTab === 'testcase' && (
            <div className="result-panel">
              <p className="section-title" style={{fontSize:'14px'}}>Test Results</p>
              {runResult ? (
                <div className={`result-card ${runResult.success ? 'result-success' : 'result-error'}`}>
                  <p className="result-heading">
                    {runResult.success ? '✓ All test cases passed' : '✗ Some test cases failed'}
                  </p>
                  {runResult.success && (
                    <>
                      <p className="result-meta">Runtime: {runResult.runtime} sec</p>
                      <p className="result-meta">Memory: {runResult.memory} KB</p>
                    </>
                  )}
                  <div style={{marginTop:'12px'}}>
                    {runResult.testCases?.map((tc, i) => (
                      <div key={i} className="tc-card">
                        <div className="tc-row"><span className="tc-key">Input:</span>     <span>{tc.stdin}</span></div>
                        <div className="tc-row"><span className="tc-key">Expected:</span>  <span>{tc.expected_output}</span></div>
                        <div className="tc-row"><span className="tc-key">Output:</span>    <span>{tc.stdout}</span></div>
                        <div className={tc.status_id === 3 ? 'tc-pass' : 'tc-fail'}>
                          {tc.status_id === 3 ? '✓ Passed' : '✗ Failed'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="result-empty">Click "Run" to test your code with the example test cases.</p>
              )}
            </div>
          )}

          {/* ─ Result Tab ─ */}
          {activeRightTab === 'result' && (
            <div className="result-panel">
              <p className="section-title" style={{fontSize:'14px'}}>Submission Result</p>
              {submitResult ? (
                <div className={`result-card ${submitResult.accepted ? 'result-success' : 'result-error'}`}>
                  <p className="result-heading">
                    {submitResult.accepted ? '🎉 Accepted' : `✗ ${submitResult.error}`}
                  </p>
                  <p className="result-meta">Test Cases: {submitResult.passedTestCases}/{submitResult.totalTestCases}</p>
                  {submitResult.accepted && (
                    <>
                      <p className="result-meta">Runtime: {submitResult.runtime} sec</p>
                      <p className="result-meta">Memory: {submitResult.memory} KB</p>
                    </>
                  )}
                </div>
              ) : (
                <p className="result-empty">Click "Submit" to submit your solution for evaluation.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;