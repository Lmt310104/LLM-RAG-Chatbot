const { VertexAIEmbeddings } = require("@langchain/google-vertexai");
const fs = require("fs");
require("dotenv").config();

// Check if credentials file exists
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!credentialsPath || !fs.existsSync(credentialsPath)) {
  console.error(
    `Error: Google credentials file not found at ${credentialsPath}`
  );
  console.error(
    "Please ensure the file path in GOOGLE_APPLICATION_CREDENTIALS is correct"
  );
}

// Create embeddings with explicit project configuration
const embeddings = new VertexAIEmbeddings({
  model: "text-embedding-large-exp-03-07",
  googleProjectId: process.env.GOOGLE_PROJECT_ID,
  googleLocation: process.env.GOOGLE_LOCATION || "us-central1",
  batchSize: 1,
});

module.exports = embeddings;
