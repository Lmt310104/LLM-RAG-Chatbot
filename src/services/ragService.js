const pdfParse = require("pdf-parse");
const fs = require("fs");
const marked = require("marked");
const { RunnableSequence } = require("@langchain/core/runnables");
const { PromptTemplate } = require("@langchain/core/prompts");
const axios = require("axios");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const embeddings = require("../utils/embedding");
const { client } = require("../utils/vectorStore");
const constant = require("../utils/constant");
const crypto = require("crypto");
const llmService = require("../utils/llmService");

async function loadPDF(filePathOrUrl) {
  try {
    let dataBuffer;
    if (
      filePathOrUrl.startsWith("http://") ||
      filePathOrUrl.startsWith("https://")
    ) {
      const response = await axios.get(filePathOrUrl, {
        responseType: "arraybuffer",
      });
      dataBuffer = response.data;
    } else {
      // Check if file exists
      if (!fs.existsSync(filePathOrUrl)) {
        throw new Error(`File not found: ${filePathOrUrl}`);
      }
      dataBuffer = fs.readFileSync(filePathOrUrl);
    }

    // Add options to handle potential issues
    const options = {
      max: 0, // 0 = unlimited pages
      version: "v2.0.550",
    };

    try {
      const data = await pdfParse(dataBuffer, options);
      return data.text;
    } catch (pdfError) {
      console.error("PDF parsing error:", pdfError.message);
      if (pdfError.message.includes("Invalid PDF")) {
        throw new Error(
          `The file at ${filePathOrUrl} is not a valid PDF or might be password-protected.`
        );
      }
      throw pdfError;
    }
  } catch (error) {
    console.error("Error loading PDF:", error.message);
    throw error;
  }
}

async function loadMarkdown(filePath) {
  const data = fs.readFileSync(filePath, "utf8");
  return marked(data);
}

async function splitDocs(text, chunkSize = 2048, chunkOverlap = 20) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize - chunkOverlap) {
    chunks.push(text.substring(i, i + chunkSize));
  }
  return chunks;
}
async function conductQuery(query, collectionTable) {
  try {
    const queryEmbedding = await embeddings.embedQuery(query);
    const response = await client.search(collectionTable, {
      vector: { name: "default", vector: queryEmbedding },
      score_threshold: 0.0,
      limit: 3,
    });
    console.log(query);
    const context = response.map((res) => res.payload.content).join("\n");
    const answer = await llmService.generateResponse(
      query,
      `${constant.RAG_SYSTEM_PROMPT}. Documentation: ${context}`
    );

    return answer;
  } catch (error) {
    console.error("Error conducting query:", error);
    throw error;
  }
}

async function persistEmbeddings(collectionTable, documents, customMeta) {
  try {
    // Validate input parameters
    if (!collectionTable) {
      throw new Error("Collection name is required");
    }
    if (!documents) {
      throw new Error("Documents are required");
    }
    if (!customMeta) {
      throw new Error("Custom metadata is required");
    }

    // Validate collection name format
    if (!/^[a-zA-Z0-9_-]+$/.test(collectionTable)) {
      throw new Error(
        "Collection name must only contain alphanumeric characters, underscores, and hyphens"
      );
    }

    // Check if collection exists first
    let collections;
    try {
      collections = await client.getCollections();
    } catch (error) {
      throw new Error(`Failed to fetch collections: ${error.message}`);
    }

    const collectionExists = collections.collections.some(
      (c) => c.name === collectionTable
    );

    if (!collectionExists) {
      try {
        await client.createCollection(collectionTable, {
          vectors: {
            default: {
              size: 3072,
              distance: "Cosine",
            },
          },
        });
        console.log(`Collection ${collectionTable} created successfully`);
      } catch (error) {
        if (
          error.message.includes("Conflict") ||
          error.message.includes("already exists")
        ) {
          console.log(
            `Collection ${collectionTable} already exists (created concurrently)`
          );
        } else {
          throw error;
        }
      }
    }

    // Split documents and generate embeddings
    const splitDocuments = await splitDocs(documents);
    const em = await embeddings.embedDocuments(splitDocuments);

    // Create points
    const points = splitDocuments.map((doc, idx) => ({
      id: crypto.randomUUID(),
      vector: { default: em[idx] }, // Name the vector as 'default' to match collection configuration
      payload: {
        ...customMeta,
        content: doc,
        chunk_index: idx,
        timestamp: new Date().toISOString(),
      },
    }));
    points.map((point) => {
      console.log(point);
    });

    // Process points one by one (batchSize=1 as required by Vertex AI)
    await client.upsert(collectionTable, {
      wait: true,
      points: points,
    });

    console.log(
      `Successfully upserted ${points.length} points to ${collectionTable}`
    );
  } catch (err) {
    console.log(err);
    throw new Error("Error creating collection and upserting points");
  }
}
module.exports = {
  loadPDF,
  loadMarkdown,
  persistEmbeddings,
  conductQuery,
};
