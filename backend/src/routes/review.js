// backend/src/routes/review.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { analyzeCode } = require('../controllers/reviewController');

// Configure multer to store uploaded files temporarily with their original extension
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../tmp'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Route can handle either an uploaded file (field name: 'codeFile') or raw text in req.body.codeText
router.post('/analyze', upload.single('codeFile'), analyzeCode);

module.exports = router;