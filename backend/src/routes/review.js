const express = require("express");
const router = express.Router();

const { analyzeCode } = require("../controllers/reviewController");

router.post("/analyze", analyzeCode);

module.exports = router;