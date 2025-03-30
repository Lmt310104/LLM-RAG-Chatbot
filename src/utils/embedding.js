const { VertexAIEmbeddings } = require("@langchain/google-vertexai");
const fs = require("fs");
require("dotenv").config();

// Check if credentials file exists
if (process.env.GOOGLE_CREDENTIALS_BASE64) {
  const credentialsJson = Buffer.from(
    process.env.GOOGLE_CREDENTIALS_BASE64,
    "base64"
  ).toString("utf-8");

  // Tạo file tạm thời trên server
  const tempFilePath = "/tmp/google-credentials.json";
  fs.writeFileSync(tempFilePath, credentialsJson);

  // Cấu hình Google Cloud để sử dụng file này
  process.env.GOOGLE_APPLICATION_CREDENTIALS = tempFilePath;
} else {
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credentialsPath || !fs.existsSync(credentialsPath)) {
    console.error(
      `Error: Google credentials file not found at ${credentialsPath}`
    );
    console.error(
      "Please ensure the file path in GOOGLE_APPLICATION_CREDENTIALS is correct"
    );
  }
}

// Create embeddings with explicit project configuration
const embeddings = new VertexAIEmbeddings({
  model: "text-embedding-large-exp-03-07",
  googleProjectId: process.env.GOOGLE_PROJECT_ID,
  googleLocation: process.env.GOOGLE_LOCATION || "us-central1",
  batchSize: 1,
});

module.exports = embeddings;
