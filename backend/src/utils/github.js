// Ensure axios and your AI utility are imported at the top of the file
const axios = require('axios');
const { generateCodeReview } = require('../utils/ai');

async function fetchAndReviewGithubFile(owner, repo, path) {
  try {
    // 1. Fetch from GitHub API
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`);
    
    // 2. Decode the Base64 file content from GitHub into a raw string
    const rawCode = Buffer.from(response.data.content, 'base64').toString('utf-8');

    // 3. Pass the raw string straight into our fixed Gemini engine pipeline (Called once!)
    const reviewResult = await generateCodeReview(rawCode);
    
    // 4. Return the clean JSON object back to the controller/route
    return reviewResult; 
    
  } catch (error) {
    console.error("Repository fetching failed:", error);
    throw error; // Throwing the error helps your API routes catch it and send a 500 status to the user
  }
}

// Don't forget to export it if you're using it in another file!
module.exports = { fetchAndReviewGithubFile };