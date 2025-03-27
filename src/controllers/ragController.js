const llmService = require("../utils/llmService");

async function processQuery(req, res) {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }
    const response = await llmService.generateResponse(query);
    res.json({ response });
  } catch (error) {
    console.error("Error processing query:", error);
    res.status(500).json({ error: "Failed to process query" });
  }
}

async function getDocuments(req, res) {
  try {
    res.json({ documents: [] });
  } catch (error) {
    console.error("Error getting documents:", error);
    res.status(500).json({ error: "Failed to get documents" });
  }
}

async function addDocument(req, res) {
  try {
    const { document } = req.body;
    if (!document) {
      return res.status(400).json({ error: "Document is required" });
    }
    res.status(201).json({ message: "Document added successfully" });
  } catch (error) {
    console.error("Error adding document:", error);
    res.status(500).json({ error: "Failed to add document" });
  }
}

async function deleteDocument(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Document ID is required" });
    }
    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ error: "Failed to delete document" });
  }
}

async function evaluateResult(req, res) {
  try {
    const { result } = req.body;
    if (!result) {
      return res.status(400).json({ error: "Result is required" });
    }
    res.json({
      result: await llmService.evaluate(result),
    });
  } catch (error) {
    console.error("Error evaluating result:", error);
    res.status(500).json({ error: "Failed to evaluate result" });
  }
}

module.exports = {
  processQuery,
  getDocuments,
  addDocument,
  deleteDocument,
  evaluateResult,
};
