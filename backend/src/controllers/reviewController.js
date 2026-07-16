// backend/src/controllers/reviewController.js
const db = require("../utils/db");
const { Linter } = require("eslint");
const { generateCodeReview } = require("../utils/ai"); // Day 8 AI Engine Utility
const analyzeComplexity = require("../utils/complexity");
const { generateDocumentation } = require("../utils/documentation");

const linter = new Linter();

const eslintConfig = {
  languageOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  rules: {
    "no-unused-vars": "warn",
    "eqeqeq": "error",
    "no-undef": "error"
  }
};

const analyzeCode = async (req, res) => {
  try {
    console.log("Received request body:", req.body);

    const { codeText, language } = req.body;
    const metrics = analyzeComplexity(codeText);
    const userId = 1; // Default user context for current workspace

    if (!codeText || !codeText.trim()) {
      return res.status(400).json({
        error: "Code snippet cannot be empty."
      });
    }

    // ----------------------------------------------------
    // STAGE 1: STATIC CODE ANALYSIS (In-Memory ESLint)
    // ----------------------------------------------------
    const lintMessages = linter.verify(codeText, eslintConfig);

    // Map ESLint warnings/errors into standard database findings schema
    const staticFindings = lintMessages.map((issue) => ({
      severity: issue.severity === 2 ? "error" : "warning",
      issue: `Rule: ${issue.ruleId || "syntax"}`,
      explanation: issue.message,
      suggested_fix: "Refactor code to conform to standard JavaScript practices.",
      file_name: "snippet.js",
      line_number: issue.line || 1
    }));

    // ----------------------------------------------------
    // STAGE 2: AI REVIEW ENGINE (Gemini 2.5 Flash Pass)
    // ----------------------------------------------------
    let integratedFindings = [...staticFindings];
    let finalizedScore = Math.max(100 - staticFindings.length * 10, 0);
    let reviewSummary =
      staticFindings.length === 0
        ? "Clean Pass! No static anomalies found."
        : `Static Analysis found ${staticFindings.length} issue(s).`;
    let reviewComplexity = {
      cyclomatic: 1,
      line_count: codeText.split("\n").length
    };

    try {
      // Send raw code and static findings into Gemini AI
      const aiReviewResult = await generateCodeReview(codeText, staticFindings);

      if (aiReviewResult) {
        // Merge AI deep insights with static lint results
        const aiFindings = (aiReviewResult.findings || []).map((f) => ({
          severity: f.severity || "info",
          issue: f.issue || "AI Code Recommendation",
          explanation: f.explanation || "Optimization suggestion.",
          suggested_fix: f.suggested_fix || "Follow best practices.",
          file_name: "snippet.js",
          line_number: f.line_number || 1
        }));

        integratedFindings = [...staticFindings, ...aiFindings];
        finalizedScore = aiReviewResult.overall_score ?? finalizedScore;
        reviewSummary = aiReviewResult.summary || reviewSummary;
        reviewComplexity = aiReviewResult.complexity || reviewComplexity;

        // Apply penalty deduction for static issues if needed
        if (staticFindings.length > 0) {
          finalizedScore = Math.max(0, finalizedScore - staticFindings.length * 5);
        }
      }
    } catch(error){
    console.error(error);
    }
    const documentation = await generateDocumentation(codeText);

    // ----------------------------------------------------
    // STAGE 3: DATABASE PERSISTENCE (PostgreSQL)
    // ----------------------------------------------------
    
    // 1. Save Project Record
    const projectResult = await db.query(
      `
      INSERT INTO projects (user_id, project_name)
      VALUES ($1, $2)
      RETURNING id
      `,
      [userId, `Snippet Review (${language || "JavaScript"})`]
    );
    const projectId = projectResult.rows[0].id;

    // 2. Save Review Header Record
    const reviewResult = await db.query(
      `
      INSERT INTO reviews (project_id, review_type, overall_score, summary)
      VALUES ($1, $2, $3, $4)
      RETURNING id
      `,
      [projectId, "snippet", finalizedScore, reviewSummary]
    );
    const reviewId = reviewResult.rows[0].id;

    // 3. Save Detailed Review Findings Records
    if (integratedFindings.length > 0) {
      for (const item of integratedFindings) {
        // Sanitize severity to match database constraint ('error', 'warning', 'info')
        let cleanSeverity = (item.severity || "info")
    .toLowerCase()
    .trim();

if (cleanSeverity === "error") {
    cleanSeverity = "critical";
}

if (!["info", "warning", "critical"].includes(cleanSeverity)) {
    cleanSeverity = "info";
}

        console.log("Severity =", cleanSeverity);

await db.query(
  `
  INSERT INTO review_findings (
      review_id,
      severity,
      issue,
      explanation,
      suggested_fix,
      file_name,
      line_number
  )
  VALUES ($1,$2,$3,$4,$5,$6,$7)
  `,
  [
      reviewId,
      cleanSeverity,
      item.issue,
      item.explanation,
      item.suggested_fix,
      item.file_name,
      item.line_number
  ]
);
      }
    }

    // ----------------------------------------------------
    // STAGE 4: DISPATCH RESPONSE TO FRONTEND DASHBOARD
    // ----------------------------------------------------
    return res.status(201).json({
    success: true,
    reviewId,

    project_metrics: {
        overall_score: finalizedScore,
        summary: reviewSummary,
        complexity: {
            cyclomaticComplexity: metrics.cyclomaticComplexity,
            linesOfCode: metrics.linesOfCode,
            numberOfFunctions: metrics.numberOfFunctions,
            numberOfClasses: metrics.numberOfClasses
        }
    },

    findings: integratedFindings,

    documentation
});
  } catch (err) {
    console.error("Global Analysis Engine Exception:", err);
    return res.status(500).json({
      error: err.message || "Internal Server Error processing code analysis."
    });
  }
};

const getReviewHistory = async (req, res) => {
  try {

    const result = await db.query(`
      SELECT
        reviews.id,
        reviews.overall_score,
        reviews.summary,
        reviews.created_at,
        projects.project_name
      FROM reviews
      JOIN projects
      ON reviews.project_id = projects.id
      ORDER BY reviews.created_at DESC
    `);

    return res.status(200).json(result.rows);

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      error: "Unable to fetch review history."
    });

  }
};

const deleteReview = async (req, res) => {
    try {

        const { id } = req.params;

        // Find project id
        const projectResult = await db.query(
            `
            SELECT project_id
            FROM reviews
            WHERE id=$1
            `,
            [id]
        );

        if (projectResult.rows.length === 0) {
            return res.status(404).json({
                error: "Review not found."
            });
        }

        const projectId = projectResult.rows[0].project_id;

        // Delete findings
        await db.query(
            `
            DELETE FROM review_findings
            WHERE review_id=$1
            `,
            [id]
        );

        // Delete review
        await db.query(
            `
            DELETE FROM reviews
            WHERE id=$1
            `,
            [id]
        );

        // Delete project
        await db.query(
            `
            DELETE FROM projects
            WHERE id=$1
            `,
            [projectId]
        );

        return res.json({
            success: true,
            message: "Review deleted successfully."
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            error: "Unable to delete review."
        });

    }
};

const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Requested Review ID:", id);

    const reviewResult = await db.query(
      `
      SELECT
        reviews.id,
        reviews.overall_score,
        reviews.summary,
        reviews.created_at,
        projects.project_name
      FROM reviews
      JOIN projects
      ON reviews.project_id = projects.id
      WHERE reviews.id = $1
      `,
      [id]
    );

    console.log("Rows Returned:", reviewResult.rows);

    if (reviewResult.rows.length === 0) {
      return res.status(404).json({
        error: "Review not found."
      });
    }

    const findingsResult = await db.query(
      `
      SELECT
        severity,
        issue,
        explanation,
        suggested_fix,
        file_name,
        line_number
      FROM review_findings
      WHERE review_id = $1
      ORDER BY id
      `,
      [id]
    );

    console.log("Findings:", findingsResult.rows.length);

    return res.json({
      review: reviewResult.rows[0],
      findings: findingsResult.rows
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: err.message
    });
  }
};

module.exports = {
    analyzeCode,
    getReviewHistory,
    deleteReview,
    getReviewById
};