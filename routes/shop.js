// routes/shop.js
const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs").promises; // async file system API

const listingsPath = path.join(__dirname, "../data/listings.json");
const landlordsPath = path.join(__dirname, "../data/landlords.json");

// Utility: read JSON safely
async function readJSON(filePath) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return [];
  }
}

// GET /api/shop
router.get("/", async (req, res) => {
  try {
    // Read both files concurrently
    const [listingsData, landlordsData] = await Promise.all([
      readJSON(listingsPath),
      readJSON(landlordsPath)
    ]);

    // Build landlordId → landlordName map
    const landlordsMap = {};
    landlordsData.forEach(l => {
      landlordsMap[String(l.id).trim()] = l.name;
    });

    // Keep all original fields, just add landlord
    const processedListings = listingsData.map(listing => ({
      ...listing,
      landlord: landlordsMap[String(listing.landlordId).trim()] || "Unknown"
    }));

    res.json(processedListings);
  } catch (err) {
    console.error("Error loading shop listings:", err);
    res.status(500).json({ error: "Failed to load listings" });
  }
});

module.exports = router;
