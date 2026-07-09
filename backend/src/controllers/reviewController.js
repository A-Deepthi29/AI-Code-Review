const db = require('../utils/db');

exports.submitSnippet = async (req, res) => {
    const { codeSnippet, language } = req.body;
    
    // Hardcoded user ID fallback for testing until frontend attaches full JWT headers
    const userId = req.user?.id || 1; 

    if (!codeSnippet) {
        return res.status(400).json({ error: "Code snippet content cannot be empty." });
    }

    try {
        // 1. Create a placeholder project reference for this submission
        const projectRes = await db.query(
            'INSERT INTO projects (user_id, project_name) VALUES ($1, $2) RETURNING id',
            [userId, `Snippet Review (${language || 'JavaScript'})`]
        );
        const projectId = projectRes.rows[0].id;

        // 2. Insert a new record into the Reviews table
        // For Day 4, overall_score and summary act as pending storage placeholders
        const reviewRes = await db.query(
            'INSERT INTO reviews (project_id, review_type, overall_score, summary) VALUES ($1, $2, $3, $4) RETURNING id, created_at',
            [projectId, 'snippet', 0, 'Pending analysis...']
        );
        const reviewId = reviewRes.rows[0].id;

        // 3. Temporarily save the raw code into a placeholder findings row until static analysis is connected
        await db.query(
            'INSERT INTO review_findings (review_id, severity, issue, explanation, suggested_fix) VALUES ($1, $2, $3, $4, $5)',
            [reviewId, 'info', 'Code Saved', 'Code snippet successfully queued for evaluation.', codeSnippet]
        );

        res.status(201).json({
            message: "🚀 Code snippet successfully stored in database!",
            reviewId,
            projectId,
            timestamp: reviewRes.rows[0].created_at
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};