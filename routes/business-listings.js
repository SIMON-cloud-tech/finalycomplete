const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const listingsPath = path.join(__dirname, "../data/listings.json");
const landlordsPath = path.join(__dirname, "../data/landlords.json");

// Utility to safely read JSON
function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return [];
  }
}

// Normalize ID
function normId(val) {
  return String(val || "").trim();
}

// GET /api/listings → landlord, unit type, units, price
// 🔧 Use "/" here because server mounts at "/api/listings"
router.get("/", (req, res) => {
  try {
    const listings = readJSON(listingsPath);
    const landlords = readJSON(landlordsPath);

    // Build lookup map
    const landlordMap = {};
    landlords.forEach(ld => {
      landlordMap[normId(ld.id)] = ld.name;
    });

    const simplified = listings.map(l => ({
      landlord: landlordMap[normId(l.landlordId)] || "Unknown",
      unit: l.unit || "",
      units: l.units || 0,
      price: l.price || 0
    }));

    res.json(simplified);
  } catch (err) {
    console.error("🚨 Error reading listings:", err);
    res.status(500).json({ message: "Server error fetching listings." });
  }
});

module.exports = router;
