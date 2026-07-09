export default function SubmitCode() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Analyze Code Snippet</h1>
        <p className="text-slate-400 mt-2">Paste your code block below to execute automatic structural and AI code compliance reviews.</p>
      </div>

      <div className="bg-slate-950 rounded-xl border border-slate-800 p-6 shadow-xl">
        <textarea
          className="w-full h-80 bg-slate-900 border border-slate-800 rounded-lg p-4 font-mono text-sm text-slate-300 focus:outline-none focus:border-blue-500 transition-colors placeholder-slate-600 resize-none"
          placeholder="// Paste your code repository snippets here...&#10;function calculateSum(a, b) {&#10;    return a + b;&#10;}"
        />
        <div className="mt-4 flex justify-end">
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-semibold transition-all shadow-lg shadow-blue-600/10">
            Submit for Review
          </button>
        </div>
      </div>
    </div>
  );
}
