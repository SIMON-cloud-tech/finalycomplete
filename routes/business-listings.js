// routes/business-listings.js
const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

// Paths to JSON files
const listingsPath = path.join(__dirname, "../data/listings.json"); 
const landlordsPath = path.join(__dirname, "../data/landlords.json");

// GET /api/listings
router.get("/", (req, res) => {
  try {
    const listings = JSON.parse(fs.readFileSync(listingsPath, "utf8"));
    const landlords = JSON.parse(fs.readFileSync(landlordsPath, "utf8"));

    const output = listings.map((item) => {
      const landlord = landlords.find((l) => l.id === item.landlordId);

      return {
        id: item.id,
        landlordName: landlord ? landlord.name : "Unknown",
        unitType: item.unit,
        units: item.units,
        price: item.price
      };
    });

    res.json(output);

  } catch (err) {
    console.error("Error loading listings:", err);
    res.status(500).json({ error: "Server error loading listings" });
  }
});

module.exports = router;
