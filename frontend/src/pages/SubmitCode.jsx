import { useState } from 'react';

export default function SubmitCode() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [reviewResults, setReviewResults] = useState(null);

  const handleSubmit = async () => {
    if (!code.trim()) {
      alert("Please paste some code before submitting!");
      return;
    }

    setLoading(true);
    setStatusMessage(null);
    setReviewResults(null);

    try {
     const response = await fetch(
    "http://localhost:5000/api/reviews/analyze",
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            codeText: code,
            language: "JavaScript"
        })
    }
);

      const data = await response.json();

      if (response.ok) {
        setStatusMessage({ type: 'success', text: `✅ Code analyzed successfully!` });
        setReviewResults({
          overallScore: data.overallScore,
          summary: data.summary,
          issues: data.issues || []
        });
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Submission failed' });
      }
    } catch (error) {
      setStatusMessage({ type: 'error', text: 'Could not connect to the backend server.' });
    } finally {
      setLoading(false);
    }
  };

  // Helper styling configuration to evaluate dynamic color maps for scores
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400 border-green-800 bg-green-950/20';
    if (score >= 50) return 'text-amber-400 border-amber-800 bg-amber-950/20';
    return 'text-red-400 border-red-800 bg-red-950/20';
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Analyze Code Snippet</h1>
        <p className="text-slate-400 mt-2">Paste your code block below to execute automatic structural and AI code compliance reviews.</p>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-lg text-sm font-semibold ${
          statusMessage.type === 'success' ? 'bg-green-950/50 border border-green-800 text-green-400' : 'bg-red-950/50 border border-red-800 text-red-400'
        }`}>
          {statusMessage.text}
        </div>
      )}

      {/* Input code editor workspace panel */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 p-6 shadow-xl">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={loading}
          className="w-full h-64 bg-slate-900 border border-slate-800 rounded-lg p-4 font-mono text-sm text-slate-300 focus:outline-none focus:border-blue-500 transition-colors placeholder-slate-600 resize-none disabled:opacity-50"
          placeholder="// Paste your code repository snippets here...&#10;function calculateSum(a, b) {&#10;    return a + b;&#10;}"
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-semibold transition-all shadow-lg shadow-blue-600/10 disabled:opacity-50"
          >
            {loading ? 'Running Analysis...' : 'Submit for Review'}
          </button>
        </div>
      </div>

      {/* DYNAMIC ANALYSIS DASHBOARD RENDER MODULE */}
      {reviewResults && (
        <div className="space-y-6 animate-fadeIn">
          <div className="border border-slate-800 bg-slate-950/50 rounded-xl p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            
            {/* Circular Metric Score badge representation component */}
            <div className="flex flex-col items-center justify-center p-4 border rounded-xl bg-slate-900 border-slate-800">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Quality Score</span>
              <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center font-extrabold text-2xl ${getScoreColor(reviewResults.overallScore)}`}>
                {reviewResults.overallScore}
              </div>
            </div>

            {/* Core Review summary header indicator */}
            <div className="md:col-span-3 space-y-2">
              <h3 className="text-xl font-bold text-slate-200">Analysis Summary</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{reviewResults.summary}</p>
            </div>
          </div>

          {/* Finding issue checklist breakdowns mapping panel */}
          <div>
            <h3 className="text-lg font-bold text-slate-300 mb-4">Discovered Code Findings ({reviewResults.issues.length})</h3>
            
            {reviewResults.issues.length === 0 ? (
              <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-800 text-center text-slate-400 text-sm">
                ✨ Excellent code structure! No static linting violations detected in the compilation phase.
              </div>
            ) : (
              <div className="space-y-3">
                {reviewResults.issues.map((issue, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${
                          issue.severity === 2 ? 'bg-red-950/60 text-red-400 border border-red-900' : 'bg-amber-950/60 text-amber-400 border border-amber-900'
                        }`}>
                          {issue.severity === 2 ? 'Error' : 'Warning'}
                        </span>
                        <span className="text-xs font-mono text-slate-500">Rule: {issue.ruleId || 'syntax'}</span>
                      </div>
                      <p className="text-slate-300 text-sm font-medium pt-1">{issue.message}</p>
                    </div>
                    
                    {/* Position context placement tags tracking exact code coordinates */}
                    <div className="flex items-center gap-3 self-start md:self-center">
                      <span className="bg-slate-900 border border-slate-800 text-slate-400 px-3 py-1 rounded-md text-xs font-mono whitespace-nowrap">
                        Line {issue.line || 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}