// backend/src/controllers/reviewController.js

const db = require("../utils/db");
const { Linter } = require("eslint");
const { generateCodeReview } = require("../utils/ai");
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


        const { codeText, language } = req.body;

        // --------------------------------------------
        // STEP 1 : Validate Input
        // --------------------------------------------
        if (!codeText || !codeText.trim()) {
            return res.status(400).json({
                error: "Code snippet cannot be empty."
            });
        }

        const metrics = analyzeComplexity(codeText);
        const userId = 1;

        // --------------------------------------------
        // STEP 2 : Static Code Analysis
        // --------------------------------------------
        const lintMessages = linter.verify(codeText, eslintConfig);

        const staticFindings = lintMessages.map((issue) => ({
            severity: issue.severity === 2 ? "error" : "warning",
            issue: `Rule: ${issue.ruleId || "syntax"}`,
            explanation: issue.message,
            suggested_fix:
                "Refactor code to conform to standard JavaScript practices.",
            file_name: "snippet.js",
            line_number: issue.line || 1
        }));

        // --------------------------------------------
        // STEP 3 : AI Code Review
        // --------------------------------------------
        let integratedFindings = [...staticFindings];

        let finalizedScore = Math.max(
            100 - staticFindings.length * 10,
            0
        );

        let reviewSummary =
            staticFindings.length === 0
                ? "Clean Pass! No static anomalies found."
                : `Static Analysis found ${staticFindings.length} issue(s).`;

        const aiReview = await generateCodeReview(codeText);

        if (aiReview) {

            const aiFindings = (aiReview.findings || []).map((item) => ({

                severity: item.severity || "info",

                issue:
                    item.issue ||
                    "AI Code Recommendation",

                explanation:
                    item.explanation ||
                    "Optimization suggestion.",

                suggested_fix:
                    item.suggestedFix ||
                    "Follow best practices.",

                file_name: "snippet.js",

                line_number:
                    item.lineNumber || 1

            }));

            integratedFindings = [
                ...staticFindings,
                ...aiFindings
            ];

            finalizedScore =
                aiReview.overallScore ??
                finalizedScore;

            reviewSummary =
                aiReview.summary ||
                reviewSummary;

            if (staticFindings.length > 0) {

                finalizedScore = Math.max(
                    0,
                    finalizedScore -
                        staticFindings.length * 5
                );

            }
        }

        // --------------------------------------------
        // STEP 4 : Documentation Generation
        // --------------------------------------------
        const documentation =
            await generateDocumentation(codeText);

        // --------------------------------------------
        // STEP 5 : Save Project
        // --------------------------------------------
                let projectResult;

        try {

            projectResult = await db.query(
                `
                INSERT INTO projects (
                    user_id,
                    project_name
                )
                VALUES ($1, $2)
                RETURNING id
                `,
                [
                    userId,
                    `Snippet Review (${language || "JavaScript"})`
                ]
            );

        } catch (error) {

            console.error("Project Insert Error:", error);
            throw error;

        }

        const projectId = projectResult.rows[0].id;

        // --------------------------------------------
        // STEP 6 : Save Review
        // --------------------------------------------

        let reviewResult;

        try {

            reviewResult = await db.query(
                `
                INSERT INTO reviews (
                    project_id,
                    review_type,
                    overall_score,
                    summary
                )
                VALUES ($1, $2, $3, $4)
                RETURNING id
                `,
                [
                    projectId,
                    "snippet",
                    finalizedScore,
                    reviewSummary
                ]
            );

        } catch (error) {

            console.error("Review Insert Error:", error);
            throw error;

        }

        const reviewId = reviewResult.rows[0].id;

        // --------------------------------------------
        // STEP 7 : Save Findings
        // --------------------------------------------

        if (integratedFindings.length > 0) {

            for (const item of integratedFindings) {

                let cleanSeverity =
                    (item.severity || "info")
                        .toLowerCase()
                        .trim();

                if (
                    cleanSeverity === "error" ||
                    cleanSeverity === "high"
                ) {
                    cleanSeverity = "critical";
                }

                if (cleanSeverity === "medium") {
                    cleanSeverity = "warning";
                }

                if (
                    ![
                        "info",
                        "warning",
                        "critical"
                    ].includes(cleanSeverity)
                ) {
                    cleanSeverity = "info";
                }

                try {

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

                } catch (error) {

                    console.error(
                        "Finding Insert Error:",
                        error
                    );

                    throw error;

                }

            }

        }

        // --------------------------------------------
        // STEP 8 : Send Response
        // --------------------------------------------
                return res.status(201).json({
            success: true,
            reviewId,

            project_metrics: {
                overall_score: finalizedScore,
                summary: reviewSummary,
                complexity: {
                    cyclomaticComplexity:
                        metrics.cyclomaticComplexity,
                    linesOfCode:
                        metrics.linesOfCode,
                    numberOfFunctions:
                        metrics.numberOfFunctions,
                    numberOfClasses:
                        metrics.numberOfClasses
                }
            },

            findings: integratedFindings,

            documentation
        });

    } catch (error) {

        console.error("Analysis Error:", error);

        return res.status(500).json({
            error: "Internal Server Error. Please try again later."
        });

    }
};

// ======================================================
// GET REVIEW HISTORY
// ======================================================

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

    } catch (error) {

        console.error("History Fetch Error:", error);

        return res.status(500).json({
            error: "Unable to fetch review history."
        });

    }

};

// ======================================================
// DELETE REVIEW
// ======================================================

const deleteReview = async (req, res) => {

    try {

        const { id } = req.params;

        const projectResult = await db.query(
            `
            SELECT project_id
            FROM reviews
            WHERE id = $1
            `,
            [id]
        );

        if (projectResult.rows.length === 0) {

            return res.status(404).json({
                error: "Review not found."
            });

        }

        const projectId = projectResult.rows[0].project_id;

        await db.query(
            `
            DELETE FROM review_findings
            WHERE review_id = $1
            `,
            [id]
        );

        await db.query(
            `
            DELETE FROM reviews
            WHERE id = $1
            `,
            [id]
        );

        await db.query(
            `
            DELETE FROM projects
            WHERE id = $1
            `,
            [projectId]
        );

        return res.json({
            success: true,
            message: "Review deleted successfully."
        });

    } catch (error) {

        console.error("Delete Review Error:", error);

        return res.status(500).json({
            error: "Unable to delete review."
        });

    }

};// ======================================================
// GET REVIEW BY ID
// ======================================================

const getReviewById = async (req, res) => {

    try {

        const { id } = req.params;

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

        return res.status(200).json({
            review: reviewResult.rows[0],
            findings: findingsResult.rows
        });

    } catch (error) {

        console.error("Get Review Error:", error);

        return res.status(500).json({
            error: "Unable to fetch review."
        });

    }

};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
    analyzeCode,
    getReviewHistory,
    deleteReview,
    getReviewById
};