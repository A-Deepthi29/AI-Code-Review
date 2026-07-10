// backend/src/controllers/reviewController.js
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const axios = require('axios'); // ADDED: Required to communicate with the GitHub API
const { generateCodeReview } = require('../utils/ai');

/**
 * Helper function to promisify shell executions.
 * This unifies asynchronous execution contexts into clean async/await syntax.
 */
const runCommand = (cmd) => {
  return new Promise((resolve) => {
    exec(cmd, (error, stdout, stderr) => {
      // We resolve even if there's an error because linters return exit code 1 when code errors are found
      resolve({ stdout, stderr });
    });
  });
};

const analyzeCode = async (req, res) => {
  let filePath = '';
  let codeContent = '';

  try {
    // 1. DETERMINE INPUT TYPE & EXTRACT RAW CONTENT
    if (req.file) {
      // Branch A: Direct file upload
      filePath = req.file.path;
      codeContent = fs.readFileSync(filePath, 'utf8');

    } else if (req.body.codeText) {
      // Branch B: Raw pasted code text
      codeContent = req.body.codeText;
      const uniqueName = `paste-${Date.now()}.js`;
      filePath = path.join(__dirname, '../tmp', uniqueName);
      fs.writeFileSync(filePath, codeContent, 'utf8');

    } else if (req.body.owner && req.body.repo && req.body.path) {
      // Branch C: ADDED - Day 5 GitHub Repository payload parser
      const { owner, repo, path: githubFilePath } = req.body;
      
      // Fetch the file contents from GitHub
      const githubUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${githubFilePath}`;
      const response = await axios.get(githubUrl);
      
      // Decode the Base64 response text into raw string text
      codeContent = Buffer.from(response.data.content, 'base64').toString('utf-8');
      
      // Write to local temp directory so Oxlint can analyze it locally
      const uniqueName = `github-${Date.now()}-${path.basename(githubFilePath)}`;
      filePath = path.join(__dirname, '../tmp', uniqueName);
      fs.writeFileSync(filePath, codeContent, 'utf8');

    } else {
      return res.status(400).json({ error: 'No code content, file uploaded, or GitHub repository parameters provided.' });
    }

    // 2. STAGE 1: RUN OXLINT STATIC COMPLIANCE CHECK
    const oxlintCommand = `npx oxlint --format json "${filePath}"`;
    const { stdout } = await runCommand(oxlintCommand);

    let rawLinterResults = [];
    try {
      // ONLY attempt to parse if stdout exists AND looks like a JSON array or object
      if (stdout && (stdout.trim().startsWith('[') || stdout.trim().startsWith('{'))) {
        const parsedOutput = JSON.parse(stdout);
        if (Array.isArray(parsedOutput)) {
          rawLinterResults = parsedOutput;
        } else if (parsedOutput && Array.isArray(parsedOutput.errors)) {
          rawLinterResults = parsedOutput.errors;
        } else if (parsedOutput && typeof parsedOutput === 'object') {
          rawLinterResults = parsedOutput.diagnostics || [];
        }
      } else {
        console.log("Oxlint skipped analysis or returned text warning. Proceeding directly to AI engine.");
      }
    } catch (parseErr) {
      console.error("Oxlint JSON parsing exception ignored:", parseErr.message);
    }

    // Map linter issues safely into the unified database schema layout
    const staticFindings = Array.isArray(rawLinterResults) 
      ? rawLinterResults.map(issue => ({
          severity: issue.severity ? issue.severity.toLowerCase() : 'warning',
          issue: issue.message || 'Linter Rule Violation',
          explanation: issue.help || 'Refactor code to follow standard practices.',
          line_number: issue.span && issue.span.start ? issue.span.start : 0,
          file_name: path.basename(filePath)
        }))
      : [];

    // 3. STAGE 2: PIPELINE PASS TO INTELLIGENT COMPLIANCE ANALYSIS
    let integratedFindings = [...staticFindings];
    let finalizedScore = staticFindings.length > 0 ? 90 : 100;
    let reviewSummary = "Static analysis completed successfully.";
    let reviewComplexity = { cyclomatic: 0, line_count: codeContent.split('\n').length };

    try {
      const aiReviewResult = await generateCodeReview(codeContent, staticFindings);
      
      // Merge static linter structures with deep AI insights
      integratedFindings = [...staticFindings, ...aiReviewResult.findings];
      finalizedScore = aiReviewResult.overall_score;
      reviewSummary = aiReviewResult.summary;
      reviewComplexity = aiReviewResult.complexity || reviewComplexity;

      if (staticFindings.length > 0) {
        finalizedScore = Math.max(10, finalizedScore - (staticFindings.length * 2));
      }
    } catch (aiErr) {
      console.error("Pipeline warning: Stage 2 (AI Engine) failed:", aiErr.message);
      reviewSummary += " Intelligent deep review analysis was restricted due to processing errors.";
    }

    // 4. DISPATCH SUCCESS RESPONSE
    return res.status(200).json({
      success: true,
      project_metrics: {
        overall_score: finalizedScore,
        summary: reviewSummary,
        complexity: reviewComplexity
      },
      findings: integratedFindings
    });

  } catch (serverErr) {
    console.error("Global pipeline process failure:", serverErr);
    return res.status(500).json({ error: "Internal Analysis Engine Exception processing request." });
  } finally {
    // 5. GUARANTEED CLEANUP (Wipes temp file regardless of GitHub source or manual input strings)
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupErr) {
        console.error("Failed to delete temp file:", cleanupErr);
      }
    }
  }
};

module.exports = { analyzeCode };