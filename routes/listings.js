// routes/listings.js
const express = require("express");
const fs = require("fs").promises; // async file system API
const path = require("path");

const router = express.Router();
const listingsPath = path.join(__dirname, "../data/listings.json");

// Utility: read JSON safely
async function readJSON(filePath) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// GET /api/listings → return all houses
router.get("/listings", async (req, res) => {
  try {
    const listings = await readJSON(listingsPath);
    res.json(listings);
  } catch (err) {
    console.error("Error fetching listings:", err);
    res.status(500).json({ error: "Failed to load listings" });
  }
});

module.exports = router;
