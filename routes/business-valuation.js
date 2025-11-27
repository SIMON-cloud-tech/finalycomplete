// routes/business-valuation.js
const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const listingsPath = path.join(__dirname, "../data/listings.json");
const landlordsPath = path.join(__dirname, "../data/landlords.json");

// Utility: read JSON safely
function readJSON(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("🚨 Error parsing JSON file:", err);
    return [];
  }
}

// GET /api/valuation – business view (all landlords)
// 🔧 FIX: use "/" here because server mounts at "/api/valuation"
router.get("/", (req, res) => {
  try {
    const listings = readJSON(listingsPath);
    const landlords = readJSON(landlordsPath);

    const valuationData = listings.map(l => {
      const units = parseInt(l.units || "0");
      const price = parseInt(l.price || "0");

      // Join landlordId in listings.json to id in landlords.json
      const landlord = landlords.find(ld => ld.id === l.landlordId);
      const landlordName = landlord ? landlord.name : "Unknown";

      return {
        landlord: landlordName,
        unit: l.unit,
        units,
        price,
        location: l.location,
        total: units * price
      };
    });

    const grandTotal = valuationData.reduce((sum, item) => sum + item.total, 0);

    // Always return JSON
    res.json({ valuation: valuationData, grandTotal });
  } catch (err) {
    console.error("🚨 Error reading valuation:", err);
    res.status(500).json({ message: "Server error fetching valuation." });
  }
});

module.exports = router;
