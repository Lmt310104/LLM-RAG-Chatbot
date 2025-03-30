const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ragService = require("../services/ragService");
const { catchAsync } = require("../utils/catchAsync");
require("dotenv").config();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
});

// Middleware to process PDF and add content to request
const processPDFMiddleware = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    const filePath = req.file.path;
    const pdfText = await ragService.loadPDF(filePath);

    // Add PDF content to request object
    req.pdfContent = pdfText;

    // Clean up uploaded file after processing
    fs.unlinkSync(filePath);

    next();
  } catch (error) {
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
};

// Combined query endpoint with PDF processing
const queryWithPDF = catchAsync(async (req, res) => {
  const pdfText = req.pdfContent;

  if (!pdfText) {
    return res.status(400).json({ error: "Please submit your result" });
  }

  try {
    // Perform the query
    const answer = await ragService.conductQuery(
      pdfText,
      process.env.COLLECTION_NAME
    );

    res.status(200).json({ answer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = {
  upload,
  processPDFMiddleware,
  queryWithPDF,
};
