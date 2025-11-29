// routes/business-landlords.js
const express = require("express");
const fs = require("fs").promises; // use promises API
const path = require("path");

const router = express.Router();

// Utility to safely read JSON asynchronously
async function readJSON(filePath) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// GET /api/landlords → name, phone, units, location
router.get("/landlords", async (req, res) => {
  try {
    const landlordsPath = path.join(__dirname, "../data/landlords.json");
    const listingsPath = path.join(__dirname, "../data/listings.json");

    // Read both files concurrently
    const [landlords, listings] = await Promise.all([
      readJSON(landlordsPath),
      readJSON(listingsPath)
    ]);

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
  } catch (err) {
    console.error("Error loading landlords:", err);
    res.status(500).json({ error: "Server error loading landlords" });
  }
});

module.exports = router;
