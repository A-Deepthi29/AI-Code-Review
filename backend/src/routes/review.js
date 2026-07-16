const express = require("express");
const router = express.Router();

const reviewController = require("../controllers/reviewController");

router.post("/analyze", reviewController.analyzeCode);

router.get("/history", reviewController.getReviewHistory);

router.get("/:id", reviewController.getReviewById);

router.delete("/:id", reviewController.deleteReview);

module.exports = router;