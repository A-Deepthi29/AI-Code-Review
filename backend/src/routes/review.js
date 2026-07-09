const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Route handling the paste ingestion submission
router.post('/submit-snippet', reviewController.submitSnippet);

module.exports = router;