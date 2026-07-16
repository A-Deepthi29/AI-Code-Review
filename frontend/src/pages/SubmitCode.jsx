import { useState } from "react";

export default function SubmitCode() {
  const [code, setCode] = useState("");
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
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            codeText: code,
            language: "JavaScript",
          }),
        }
      );

      const data = await response.json();

      console.log("Backend Response:", data);

      if (response.ok) {
        setStatusMessage({
          type: "success",
          text: "✅ Code analyzed successfully!",
        });

        setReviewResults({
          overallScore: data.project_metrics?.overall_score ?? 0,
          summary: data.project_metrics?.summary ?? "",
          complexity: data.project_metrics?.complexity ?? {},
          issues: data.findings ?? [],
        });
      } else {
        setStatusMessage({
          type: "error",
          text: data.error || "Submission failed",
        });
      }
    } catch (err) {
      console.error(err);

      setStatusMessage({
        type: "error",
        text: "Could not connect to backend server.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80)
      return "text-green-400 border-green-600 bg-green-900/20";

    if (score >= 50)
      return "text-yellow-400 border-yellow-600 bg-yellow-900/20";

    return "text-red-400 border-red-600 bg-red-900/20";
  };

  return (
    <div className="space-y-6 pb-12">

      {/* Heading */}

      <div>
        <h1 className="text-3xl font-bold">
          Analyze Code Snippet
        </h1>

        <p className="text-slate-400 mt-2">
          Paste your code below to perform AI-powered code review.
        </p>
      </div>

      {/* Status */}

      {statusMessage && (
        <div
          className={`p-4 rounded-lg font-semibold ${
            statusMessage.type === "success"
              ? "bg-green-900/40 border border-green-700 text-green-400"
              : "bg-red-900/40 border border-red-700 text-red-400"
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {/* Code Editor */}

      <div className="bg-slate-950 border border-slate-800 rounded-xl p-6">

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={loading}
          className="w-full h-64 bg-slate-900 rounded-lg border border-slate-800 p-4 text-sm font-mono text-slate-300 resize-none"
          placeholder="// Paste your code here..."
        />

        <div className="mt-5 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-lg font-semibold text-white"
          >
            {loading ? "Running Analysis..." : "Submit for Review"}
          </button>
        </div>
      </div>

      {/* Results */}

      {reviewResults && (
        <div className="space-y-6">

          {/* Score + Summary */}

          <div className="grid md:grid-cols-4 gap-6 border border-slate-800 rounded-xl bg-slate-950 p-6">

            <div className="flex flex-col items-center">

              <span className="text-xs uppercase text-slate-500 mb-3">
                Quality Score
              </span>

              <div
                className={`w-24 h-24 rounded-full border-4 flex items-center justify-center text-3xl font-bold ${getScoreColor(
                  reviewResults.overallScore
                )}`}
              >
                {reviewResults.overallScore}
              </div>
            </div>

            <div className="md:col-span-3">

              <h2 className="text-2xl font-bold mb-3">
                Analysis Summary
              </h2>

              <p className="text-slate-300">
                {reviewResults.summary}
              </p>

            </div>

          </div>

          {/* Complexity Analysis */}

<div className="grid grid-cols-2 md:grid-cols-4 gap-4">

  <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 text-center">

    <h3 className="text-slate-400 text-sm mb-2">
      Cyclomatic Complexity
    </h3>

    <p className="text-3xl font-bold text-blue-400">
      {reviewResults.complexity?.cyclomaticComplexity ?? "-"}
    </p>

  </div>

  <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 text-center">

    <h3 className="text-slate-400 text-sm mb-2">
      Lines of Code
    </h3>

    <p className="text-3xl font-bold text-green-400">
      {reviewResults.complexity?.linesOfCode ?? "-"}
    </p>

  </div>

  <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 text-center">

    <h3 className="text-slate-400 text-sm mb-2">
      Functions
    </h3>

    <p className="text-3xl font-bold text-yellow-400">
      {reviewResults.complexity?.numberOfFunctions ?? "-"}
    </p>

  </div>

  <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 text-center">

    <h3 className="text-slate-400 text-sm mb-2">
      Classes
    </h3>

    <p className="text-3xl font-bold text-purple-400">
      {reviewResults.complexity?.numberOfClasses ?? "-"}
    </p>

  </div>

</div>

          {/* Findings */}

          <div>

            <h2 className="text-xl font-bold mb-4">
              Discovered Code Findings ({reviewResults.issues.length})
            </h2>

            {reviewResults.issues.length === 0 ? (
              <div className="border border-slate-800 rounded-xl p-6 text-center text-slate-400">
                🎉 No issues detected.
              </div>
            ) : (
              <div className="space-y-4">

                {reviewResults.issues.map((issue, index) => (

                  <div
                    key={index}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-5"
                  >

                    <div className="flex items-center gap-3 mb-3">

                      <span
                        className={`px-3 py-1 rounded text-xs font-bold uppercase ${
                          issue.severity === "critical"
                            ? "bg-red-900 text-red-300"
                            : issue.severity === "warning"
                            ? "bg-yellow-900 text-yellow-300"
                            : "bg-blue-900 text-blue-300"
                        }`}
                      >
                        {issue.severity}
                      </span>

                      <span className="font-semibold text-slate-300">
                        {issue.issue}
                      </span>

                    </div>

                    <p className="text-slate-400">
                      {issue.explanation}
                    </p>

                    <div className="mt-4 text-green-400">
                      💡 {issue.suggested_fix}
                    </div>

                    <div className="mt-3 text-xs text-slate-500">
                      Line {issue.line_number}
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