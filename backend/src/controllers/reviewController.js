const db = require("../utils/db");
const { Linter } = require("eslint");

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

    const userId = 1;

    if (!codeText) {
      return res.status(400).json({
        error: "Code snippet cannot be empty."
      });
    }

    // ------------------------
    // Stage 1 - Static Analysis
    // ------------------------

    const lintMessages = linter.verify(codeText, eslintConfig);

    const issuesFoundCount = lintMessages.length;

    const overallScore = Math.max(
      100 - issuesFoundCount * 10,
      0
    );

    const summary =
      issuesFoundCount === 0
        ? "Clean Pass! No structural anomalies found."
        : `Static Analysis found ${issuesFoundCount} issue(s).`;

    // ------------------------
    // Stage 2 - Save Project
    // ------------------------

    const projectResult = await db.query(
      `
      INSERT INTO projects(user_id,project_name)
      VALUES($1,$2)
      RETURNING id
      `,
      [
        userId,
        `Snippet Review (${language || "JavaScript"})`
      ]
    );

    const projectId = projectResult.rows[0].id;

    // ------------------------
    // Stage 3 - Save Review
    // ------------------------

    const reviewResult = await db.query(
      `
      INSERT INTO reviews
      (
        project_id,
        review_type,
        overall_score,
        summary
      )
      VALUES($1,$2,$3,$4)
      RETURNING id
      `,
      [
        projectId,
        "snippet",
        overallScore,
        summary
      ]
    );

    const reviewId = reviewResult.rows[0].id;

    // ------------------------
    // Stage 4 - Save Findings
    // ------------------------

    if (issuesFoundCount > 0) {

      for (const issue of lintMessages) {

        await db.query(
`
INSERT INTO review_findings
(
review_id,
severity,
issue,
explanation,
suggested_fix,
line_number
)
VALUES($1,$2,$3,$4,$5,$6)
`,
[
reviewId,
issue.severity === 2 ? "critical" : "warning",
issue.ruleId || "syntax",
issue.message,
"Please fix this issue.",
issue.line || 1
]
);

      }

    }

    return res.status(201).json({
      success: true,
      reviewId,
      overallScore,
      summary,
      issues: lintMessages
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      error: err.message
    });

  }
};

module.exports = {
  analyzeCode
};