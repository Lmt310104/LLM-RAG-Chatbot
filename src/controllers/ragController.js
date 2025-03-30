const ragService = require("../services/ragService.js");
const { catchAsync } = require("../utils/catchAsync.js");
require("dotenv").config();

const processPDF = catchAsync(async (req, res) => {
  const { filePath } = req.body;
  const customMeta = {
    file_id: "unique-file-id",
    display_file_name: "display_file_name",
    display_folder_name: "display_folder_name",
  };

  const pdfText = await ragService.loadPDF(filePath);
  await ragService.persistEmbeddings(
    process.env.COLLECTION_NAME,
    pdfText,
    customMeta
  );
  res.status(200).send();
});

const processMarkdown = catchAsync(async (req, res) => {
  const { filePath } = req.body;
  const customMeta = {
    file_id: "unique-file-id",
    display_file_name: "display_file_name",
    display_folder_name: "display_folder_name",
  };

  const markdownContent = await ragService.loadMarkdown(filePath);
  await ragService.persistEmbeddings(
    process.env.COLLECTION_NAME,
    markdownContent,
    customMeta
  );
  const answer = await ragService.conductQuery(
    "What is this about?",
    process.env.COLLECTION_NAME
  );
  res.status(200).json({ answer });
});

const conductQuery = catchAsync(async (req, res) => {
  const { query } = req.query;

  const answer = await ragService.conductQuery(
    query,
    process.env.COLLECTION_NAME
  );
  res.status(200).json({ answer });
});

const chatQuery = catchAsync(async (req, res) => {
  const { messages } = req.body;

  const answer = await ragService.chat(messages);
  res.status(200).json(answer);
});

const parsePDF = catchAsync(async (req, res) => {
  const { fileUrl } = req.body;
  const pdfText = await ragService.loadPDF(fileUrl);
  res.status(200).json(pdfText);
});

const evaluateResult = catchAsync(async (req, res) => {
  // Implementation for evaluating RAG results
  const { query, expectedAnswer, actualAnswer } = req.body;

  if (!query || !expectedAnswer || !actualAnswer) {
    return res.status(400).json({
      error: "Missing required fields: query, expectedAnswer, or actualAnswer",
    });
  }

  // Simple evaluation logic - can be expanded with more sophisticated metrics
  const evaluation = {
    query,
    expectedAnswer,
    actualAnswer,
    relevanceScore: 0, // To be implemented
    completenessScore: 0, // To be implemented
    accuracyScore: 0, // To be implemented
    timestamp: new Date().toISOString(),
  };

  res.status(200).json(evaluation);
});

// Make sure all functions are properly exported
module.exports = {
  processPDF,
  processMarkdown,
  conductQuery,
  chatQuery,
  parsePDF,
  evaluateResult,
};
