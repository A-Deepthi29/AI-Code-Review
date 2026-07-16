const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});


/**
 * Analyzes a code snippet and returns a structured breakdown of issues and improvements.
 * @param {string} codeSnippet - The raw text of the code to analyze.
 * @returns {Promise<Object>} Structured response containing overall score, summary, and findings.
 */
async function generateCodeReview(codeSnippet) {
    try {
        const prompt = `
            You are an expert senior code reviewer. Analyze the following code snippet for code smells, bugs, performance improvements, and security issues.
            
            Code to analyze:
            \`\`\`javascript
            ${codeSnippet}
            \`\`\`
            
            You MUST respond with a valid JSON object matching this schema. Do not include markdown wraps like \`\`\`json.
            {
                "overallScore": 85, // Integer from 0-100 based on code quality
                "summary": "Brief high-level summary paragraph explaining the strengths and absolute weaknesses.",
                "findings": [
                    {
                        "severity": "high", // must be "high", "medium", or "info"
                        "issue": "Brief name of the problem (e.g., SQL Injection, Poor Performance)",
                        "explanation": "Detailed clear reason why this code structure is bad.",
                        "suggestedFix": "Example code or text showing exactly how to fix it.",
                        "lineNumber": 3 // Approximated line number of the issue if visible, otherwise 1
                    }
                ]
            }
        `;

        // Using the recommended fast and smart text model
        const response = await client.chat.completions.create({
  model: "llama-3.3-70b-versatile",
  messages: [
    {
      role: "user",
      content: prompt,
    },
  ],
  temperature: 0.2,
});

        // Clean text response in case markdown blocks were added back accidentally
        let jsonText = response.choices[0].message.content.trim();
        if (jsonText.startsWith('```json')) jsonText = jsonText.substring(7);
        if (jsonText.endsWith('```')) jsonText = jsonText.substring(0, jsonText.length - 3);

        return JSON.parse(jsonText.trim());
    } catch (error) {
    console.error("========== GEMINI ERROR ==========");
    console.error(error);

    if (error.message) {
        console.error("Message:", error.message);
    }

    if (error.status) {
        console.error("Status:", error.status);
    }

    if (error.response) {
        console.error("Response:", error.response);
    }

    return {
        overallScore: 50,
        summary: "AI Review failed to initialize properly. Storing fallback status.",
        findings: [
            {
                severity: "info",
                issue: "AI Execution Timeout",
                explanation: "Could not successfully complete remote LLM execution loop.",
                suggestedFix: "Check your Gemini API configuration.",
                lineNumber: 1
            }
        ]
    };
}
}

module.exports = { generateCodeReview };