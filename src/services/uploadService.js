const dataProcessingService = require("./dataProcessingService");
const vectorStore = require("../utils/vectorStore");

class UploadService {
  constructor() {
    this.supportedFormats = [
      "text/plain",
      "application/json",
      "application/pdf",
    ];
  }

  async uploadDocument(file, metadata = {}) {
    try {
      if (!this.validateFile(file)) {
        throw new Error("Unsupported file format");
      }

      const document = {
        id: Date.now().toString(),
        content: await this.extractContent(file),
        title: metadata.title || file.name,
        ...metadata,
      };

      await vectorStore.initializeCollection();
      const result = await dataProcessingService.processDocument(document);

      return {
        success: true,
        documentId: document.id,
        vectorIds: result.ids,
      };
    } catch (error) {
      console.error("Error uploading document:", error);
      throw new Error("Failed to upload document");
    }
  }

  validateFile(file) {
    return this.supportedFormats.includes(file.type);
  }

  async extractContent(file) {
    try {
      if (file.type === "application/json") {
        const content = await file.text();
        const jsonContent = JSON.parse(content);
        return typeof jsonContent === "string"
          ? jsonContent
          : JSON.stringify(jsonContent);
      }
      return await file.text();
    } catch (error) {
      console.error("Error extracting content:", error);
      throw new Error("Failed to extract content from file");
    }
  }

  async uploadBatch(files, metadata = {}) {
    const results = [];
    for (const file of files) {
      try {
        const result = await this.uploadDocument(file, metadata);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          fileName: file.name,
          error: error.message,
        });
      }
    }
    return results;
  }
}

module.exports = new UploadService();
