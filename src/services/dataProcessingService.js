const vectorStore = require("../utils/vectorStore");

class DataProcessingService {
  constructor() {
    this.chunkSize = 1000; // Default chunk size in characters
    this.overlapSize = 200; // Default overlap size in characters
  }

  async processDocument(document) {
    try {
      const chunks = this.chunkText(document.content);
      const embeddings = await this.generateEmbeddings(chunks);
      const metadata = chunks.map((chunk, index) => ({
        text: chunk,
        documentId: document.id,
        chunkIndex: index,
        title: document.title || "Untitled",
        timestamp: new Date().toISOString(),
      }));

      const ids = await vectorStore.upsertVectors(embeddings, metadata);
      return { success: true, ids };
    } catch (error) {
      console.error("Error processing document:", error);
      throw new Error("Failed to process document");
    }
  }

  chunkText(text) {
    const chunks = [];
    let startIndex = 0;

    while (startIndex < text.length) {
      const endIndex = Math.min(startIndex + this.chunkSize, text.length);
      const chunk = text.slice(startIndex, endIndex);
      chunks.push(chunk);
      startIndex = endIndex - this.overlapSize;
    }

    return chunks;
  }

  async generateEmbeddings(chunks) {
    try {
      // TODO: Implement embedding generation using LLM service
      // This is a placeholder that returns random vectors for testing
      return chunks.map(() =>
        Array.from({ length: vectorStore.vectorSize }, () => Math.random())
      );
    } catch (error) {
      console.error("Error generating embeddings:", error);
      throw new Error("Failed to generate embeddings");
    }
  }
}

module.exports = new DataProcessingService();
