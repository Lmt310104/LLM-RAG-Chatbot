const express = require("express");
const router = express.Router();
const ragController = require("../controllers/ragController");

// RAG endpoints
// router.post("/query", ragController.processQuery);
// router.get("/documents", ragController.getDocuments);
// router.post("/documents", ragController.addDocument);
// router.delete("/documents/:id", ragController.deleteDocument);

router.post("/evaluate-result", ragController.evaluateResult);

module.exports = router;
