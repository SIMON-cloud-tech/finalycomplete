// routes/business-landlords.js
const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Utility to safely read JSON
function readJSON(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

// GET /api/landlords → name, phone, units, location
router.get("/landlords", (req, res) => {
  const landlordsPath = path.join(__dirname, "../data/landlords.json");
  const listingsPath = path.join(__dirname, "../data/listings.json");

  const landlords = readJSON(landlordsPath);
  const listings = readJSON(listingsPath);

  // Merge landlords with their listings by landlordId
  const merged = landlords.map(l => {
    const landlordListings = listings.filter(
      house => house.landlordId && house.landlordId === l.id
    );

    const totalUnits = landlordListings.reduce(
      (sum, house) => sum + (house.units || 0), 0
    );
    const locations = landlordListings
      .map(house => house.location || "Unknown")
      .join(", ") || "N/A";

    return {
      name: l.name,
      phone: l.phone,
      units: totalUnits,
      location: locations
    };
  });

  res.json(merged);
});

module.exports = router;
