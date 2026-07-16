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
          documentation: data.documentation ?? {
            functions: [],
            classes: [],
            apis: [],
          },
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
          Paste your code below to perform AI-powered review,
          complexity analysis and documentation generation.
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
          placeholder="// Paste your JavaScript code here..."
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
                AI Review Summary
              </h2>

              <p className="text-slate-300 leading-7">
                {reviewResults.summary}
              </p>

            </div>

          </div>
                    {/* ==========================
              COMPLEXITY ANALYSIS
          ========================== */}

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

          {/* ==========================
              CODE FINDINGS
          ========================== */}

          <div>

            <h2 className="text-2xl font-bold mb-5">
              Code Findings ({reviewResults.issues.length})
            </h2>

            {reviewResults.issues.length === 0 ? (

              <div className="bg-green-900/20 border border-green-700 rounded-xl p-6 text-center">

                <h3 className="text-green-400 text-xl font-bold">
                  🎉 Excellent!
                </h3>

                <p className="text-slate-300 mt-3">
                  No issues were detected by Static Analysis or AI Review.
                </p>

              </div>

            ) : (

              <div className="space-y-5">

                {reviewResults.issues.map((issue, index) => (

                  <div
                    key={index}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-5"
                  >

                    <div className="flex justify-between items-start flex-wrap gap-3">

                      <div>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase

                          ${
                            issue.severity === "critical"
                              ? "bg-red-900 text-red-300"

                              : issue.severity === "warning"
                              ? "bg-yellow-900 text-yellow-300"

                              : "bg-blue-900 text-blue-300"
                          }`}
                        >
                          {issue.severity}
                        </span>

                      </div>

                      <div className="text-xs text-slate-500">
                        Line {issue.line_number}
                      </div>

                    </div>

                    <h3 className="text-lg font-bold text-slate-200 mt-4">
                      {issue.issue}
                    </h3>

                    <p className="text-slate-400 mt-3">
                      {issue.explanation}
                    </p>

                    <div className="mt-5 bg-green-900/20 border border-green-700 rounded-lg p-4">

                      <p className="text-green-400 font-semibold">
                        💡 Suggested Fix
                      </p>

                      <p className="text-slate-300 mt-2">
                        {issue.suggested_fix}
                      </p>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>
                    {/* ======================================
              FUNCTION DOCUMENTATION
          ======================================= */}

          {reviewResults.documentation?.functions?.length > 0 && (

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6">

              <h2 className="text-2xl font-bold mb-6">
                📘 Generated Function Documentation
              </h2>

              {reviewResults.documentation.functions.map((func, index) => (

                <div
                  key={index}
                  className="border-b border-slate-700 pb-6 mb-6 last:border-none last:mb-0"
                >

                  <h3 className="text-xl font-bold text-blue-400">
                    Function: {func.name}
                  </h3>

                  <p className="mt-3 text-slate-300">
                    {func.description}
                  </p>

                  <h4 className="mt-5 font-semibold text-slate-200">
                    Parameters
                  </h4>

                  <ul className="list-disc ml-6 mt-2 text-slate-300">

                    {func.parameters?.map((p, i) => (

  <li key={i}>

    <span className="font-semibold">
      {p.name}
    </span>

    {" "}({p.type}){" "}

    - {p.description}

  </li>

))}

                  </ul>

                  <h4 className="mt-5 font-semibold text-slate-200">
                    Returns
                  </h4>

                  <p className="mt-2 text-green-400">
                    {func.returns || "No return value"}
                  </p>

                </div>

              ))}

            </div>

          )}

          {/* ======================================
              CLASS DOCUMENTATION
          ======================================= */}

          {reviewResults.documentation?.classes?.length > 0 && (

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6">

              <h2 className="text-2xl font-bold mb-6">
                🏛 Generated Class Documentation
              </h2>

              {reviewResults.documentation.classes.map((cls, index) => (

                <div
                  key={index}
                  className="border-b border-slate-700 pb-6 mb-6 last:border-none last:mb-0"
                >

                  <h3 className="text-xl font-bold text-purple-400">
                    Class: {cls.name}
                  </h3>

                  <p className="mt-3 text-slate-300">
                    {cls.description}
                  </p>

                </div>

              ))}

            </div>

          )}

          {/* ======================================
              API DOCUMENTATION
          ======================================= */}

          {reviewResults.documentation?.apis?.length > 0 && (

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6">

              <h2 className="text-2xl font-bold mb-6">
                🌐 Generated API Documentation
              </h2>

              {reviewResults.documentation.apis.map((api, index) => (

                <div
                  key={index}
                  className="border-b border-slate-700 pb-6 mb-6 last:border-none last:mb-0"
                >

                  <h3 className="text-xl font-bold text-green-400">
                    {api.method} {api.endpoint}
                  </h3>

                  <p className="mt-3 text-slate-300">
                    {api.description}
                  </p>

                  <div className="mt-5">

                    <h4 className="font-semibold text-slate-200">
                      Request
                    </h4>

                    <pre className="bg-slate-900 rounded-lg p-4 mt-2 text-sm overflow-x-auto whitespace-pre-wrap text-slate-300">
{api.request}
                    </pre>

                  </div>

                  <div className="mt-5">

                    <h4 className="font-semibold text-slate-200">
                      Response
                    </h4>

                    <pre className="bg-slate-900 rounded-lg p-4 mt-2 text-sm overflow-x-auto whitespace-pre-wrap text-slate-300">
{api.response}
                    </pre>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      )}

    </div>

  );

}