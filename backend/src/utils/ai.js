// backend/src/utils/ai.js
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config(); 

// Connect using your fresh, active key from your environment file
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateCodeReview(codeText) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash", // Updated to the active production model
      contents: `Analyze the following JavaScript code and provide a code review in strict JSON format. 
      The JSON object must contain exactly an "overall_score" (0-100), a "summary" string, and a "findings" array of objects.
      
      Code to analyze:
      ${codeText}`,
      config: {
        responseMimeType: "application/json" // Tells Gemini to output clean, raw JSON
      }
    });

    let rawText = response.text;
    if (!rawText) {
      throw new Error("Empty response received from the Gemini AI engine.");
    }

    // Defensive cleanup in case markdown ticks wrap the output
    if (rawText.includes("```")) {
      rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    }

    return JSON.parse(rawText);

  } catch (error) {
    console.error("AI Context evaluation fault:", error);
    throw error;
  }
}

module.exports = { generateCodeReview };