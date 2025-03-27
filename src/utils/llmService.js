const { GoogleGenerativeAI } = require("@google/generative-ai");
const constant = require("./constant");
require("dotenv").config();

class LLMService {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  }

  async evaluate(testResponse) {
    try {
      console.log(testResponse);
      const prompt = `${constant.SYSTEM_PROMPT} ${testResponse}`;
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Error generating response:", error);
      throw new Error("Failed to generate response from Gemini");
    }
  }
}

module.exports = new LLMService();
