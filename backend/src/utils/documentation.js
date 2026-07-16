const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

async function generateDocumentation(codeText) {
  try {
    const prompt = `
You are an expert software documentation generator.

Generate documentation for the following code.

Return ONLY valid JSON.

{
  "functions":[
    {
      "name":"",
      "description":"",
      "parameters":[],
      "returns":""
    }
  ],
  "classes":[
    {
      "name":"",
      "description":""
    }
  ],
  "apis":[
    {
      "method":"",
      "endpoint":"",
      "description":"",
      "request":"",
      "response":""
    }
  ]
}

Code:

${codeText}
`;

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

    let text = response.choices[0].message.content.trim();

    text = text.replace(/```json/g, "");
    text = text.replace(/```/g, "");

    return JSON.parse(text);

  } catch (err) {

    console.error("Documentation Generation Error:", err.message);

    return {
      functions: [],
      classes: [],
      apis: []
    };
  }
}

module.exports = {
  generateDocumentation,
};