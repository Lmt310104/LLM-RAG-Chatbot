const express = require("express");
const router = express.Router();
const ragController = require("../controllers/ragController");

// Make sure all these controller functions exist and are exported
router.post("/process-pdf", ragController.processPDF);
router.post("/process-markdown", ragController.processMarkdown);
router.get("/query", ragController.conductQuery);
router.post("/chat", ragController.chatQuery);
router.post("/parse-pdf", ragController.parsePDF);
router.post("/evaluate", ragController.evaluateResult);

module.exports = router;
