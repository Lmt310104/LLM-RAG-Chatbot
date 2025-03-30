const express = require("express");
const fileController = require("../controllers/fileController");

const router = express.Router();

// Combined route for uploading PDF and querying
router.post(
  "/query-with-pdf",
  fileController.upload.single("pdfFile"),
  fileController.processPDFMiddleware,
  fileController.queryWithPDF
);

module.exports = router;
