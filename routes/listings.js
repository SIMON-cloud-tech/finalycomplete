const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const listingsPath = path.join(__dirname, "../data/listings.json");

// Utility: read JSON safely
function readJSON(filePath) {
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return [];
  }
}

// GET /api/listings → return all houses
router.get("/listings", (req, res) => {
  const listings = readJSON(listingsPath);
  res.json(listings);
});

module.exports = router;
