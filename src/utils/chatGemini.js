const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");

const langchainGemini = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-2.0-flash", // Chọn mô hình phù hợp
  maxOutputTokens: 4096, // Thay maxTokens thành maxOutputTokens
});

module.exports = { langchainGemini };
