import { useEffect, useState } from "react";

export default function History() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [selectedReview, setSelectedReview] = useState(null);

  // Fetch Review History
  const fetchReviews = () => {
    setLoading(true);

    fetch("https://ai-code-review-yekr.onrender.com/api/reviews/history")
      .then((res) => res.json())
      .then((data) => {
        setReviews(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Delete Review
  const deleteReview = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/reviews/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        fetchReviews();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Unable to delete review.");
    }
  };
const viewDetails = async (id) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/reviews/${id}`
    );

    const data = await response.json();

    // 👇 ADD THESE TWO LINES
    console.log("Response OK:", response.ok);
    console.log("Review Details:", data);

    if (response.ok) {
      setSelectedReview(data);

      // 👇 Optional: Check if state is being set
      console.log("Review loaded successfully");
    } else {
      alert(data.error);
    }

  } catch (err) {
    console.error(err);
    alert("Unable to load review.");
  }
};
  // Search + Filter
  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.summary.toLowerCase().includes(search.toLowerCase()) ||
      review.project_name.toLowerCase().includes(search.toLowerCase());

    let matchesScore = true;

    if (scoreFilter === "excellent") {
      matchesScore = review.overall_score >= 80;
    }

    if (scoreFilter === "average") {
      matchesScore =
        review.overall_score >= 60 &&
        review.overall_score < 80;
    }

    if (scoreFilter === "poor") {
      matchesScore = review.overall_score < 60;
    }

    return matchesSearch && matchesScore;
  });

  console.log("Selected Review:", selectedReview);
  return (
    <div className="space-y-6">

      {/* Heading */}

      <div>

        <h1 className="text-3xl font-extrabold">
          Review History
        </h1>

        <p className="text-slate-400 mt-2">
          View all your previous AI code reviews.
        </p>

      </div>

      {/* Search */}

      <input
        type="text"
        placeholder="Search reviews..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"
      />

      {/* Filter */}

      <select
        value={scoreFilter}
        onChange={(e) => setScoreFilter(e.target.value)}
        className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-white w-64"
      >
        <option value="all">All Reviews</option>
        <option value="excellent">Excellent (80+)</option>
        <option value="average">Average (60-79)</option>
        <option value="poor">Needs Improvement (&lt;60)</option>
      </select>

      {/* Loading */}

      {loading ? (

        <div className="text-slate-400">
          Loading reviews...
        </div>

      ) : filteredReviews.length === 0 ? (

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
          No reviews found.
        </div>

      ) : (

        <div className="space-y-5">

          {filteredReviews.map((review) => (

  <div
    key={review.id}
    className="bg-slate-950 border border-slate-800 rounded-xl p-6"
  >

    {/* Header */}
    <div className="flex justify-between items-center">

      <h2 className="text-xl font-bold">
        Review #{review.id}
      </h2>

      <span className="text-green-400 font-bold">
        Score: {review.overall_score}
      </span>

    </div>

    {/* Summary */}
    <p className="text-slate-400 mt-4">
      {review.summary}
    </p>

    {/* Project & Date */}
    <div className="mt-5 text-sm text-slate-500">

      <p>
        <strong>Project:</strong>{" "}
        {review.project_name}
      </p>

      <p>
        <strong>Date:</strong>{" "}
        {new Date(review.created_at).toLocaleString()}
      </p>

    </div>

    {/* Buttons */}
    <div className="mt-6 flex justify-end gap-3">

      <button
        onClick={() => viewDetails(review.id)}
        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white font-semibold"
      >
        View Details
      </button>

      <button
        onClick={() => deleteReview(review.id)}
        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white font-semibold"
      >
        Delete
      </button>

    </div>

    {/* Details */}
    {selectedReview &&
      selectedReview.review.id === review.id && (

      <div className="mt-6 border-t border-slate-700 pt-6">

        <h2 className="text-2xl font-bold mb-4">
          Review Details
        </h2>

        <p>
          <strong>Summary:</strong>{" "}
          {selectedReview.review.summary}
        </p>

        <h3 className="text-xl font-bold mt-6 mb-3">
          Findings
        </h3>

        {selectedReview.findings.map((finding, index) => (

          <div
            key={index}
            className="border border-slate-700 rounded-lg p-4 mb-3"
          >

            <p>
              <strong>Severity:</strong> {finding.severity}
            </p>

            <p>
              <strong>Issue:</strong> {finding.issue}
            </p>

            <p>
              <strong>Explanation:</strong> {finding.explanation}
            </p>

            <p className="text-green-400">
              💡 {finding.suggested_fix}
            </p>

          </div>

        ))}

      </div>

    )}

  </div>

))}
          {selectedReview && (

  <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">

    <h2 className="text-2xl font-bold mb-4">
      Review Details
    </h2>

    <p>
      <strong>Score:</strong>{" "}
      {selectedReview.review.overall_score}
    </p>

    <p className="mt-2">
      <strong>Summary:</strong>{" "}
      {selectedReview.review.summary}
    </p>

    <h3 className="text-xl font-bold mt-6 mb-3">
      Findings
    </h3>

    {selectedReview.findings.map((finding, index) => (

      <div
        key={index}
        className="border border-slate-700 rounded-lg p-4 mb-3"
      >

        <p>
          <strong>Severity:</strong> {finding.severity}
        </p>

        <p>
          <strong>Issue:</strong> {finding.issue}
        </p>

        <p>
          <strong>Explanation:</strong> {finding.explanation}
        </p>

        <p className="text-green-400">
          💡 {finding.suggested_fix}
        </p>

      </div>

    ))}

  </div>

)}

        </div>

      )}

    </div>
  );
}