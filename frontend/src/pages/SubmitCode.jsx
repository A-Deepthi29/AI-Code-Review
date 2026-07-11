import { useState } from 'react';

export default function SubmitCode() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleSubmit = async () => {
  if (!code.trim()) {
    alert("Please paste some code before submitting!");
    return;
  }

  setLoading(true);
  setStatusMessage(null);

  try {
    const response = await fetch(
      "http://localhost:5000/api/reviews/analyze",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
    codeText: code,
    language: "JavaScript"
}),
      }
    );

    const data = await response.json();

    console.log(data);

    if (response.ok) {
      setStatusMessage({
        type: "success",
        text: `✅ Saved successfully! Review ID: ${data.reviewId}`,
      });

      setCode("");
    } else {
      setStatusMessage({
        type: "error",
        text: data.error || "Submission failed",
      });
    }
  } catch (error) {
    console.error(error);

    setStatusMessage({
      type: "error",
      text: "Could not connect to the backend server.",
    });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="space-y-6">
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

      <div className="bg-slate-950 rounded-xl border border-slate-800 p-6 shadow-xl">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={loading}
          className="w-full h-80 bg-slate-900 border border-slate-800 rounded-lg p-4 font-mono text-sm text-slate-300 focus:outline-none focus:border-blue-500 transition-colors placeholder-slate-600 resize-none disabled:opacity-50"
          placeholder="// Paste your code repository snippets here...&#10;function calculateSum(a, b) {&#10;    return a + b;&#10;}"
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-semibold transition-all shadow-lg shadow-blue-600/10 disabled:opacity-50"
          >
            {loading ? 'Processing Submission...' : 'Submit for Review'}
          </button>
        </div>
      </div>
    </div>
  );
}