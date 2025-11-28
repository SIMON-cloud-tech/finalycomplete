// routes/shop.js
const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

const listingsPath = path.join(__dirname, "../data/listings.json");
const landlordsPath = path.join(__dirname, "../data/landlords.json");

router.get("/", (req, res) => {
  try {
    const listingsData = JSON.parse(fs.readFileSync(listingsPath, "utf-8"));
    const landlordsData = JSON.parse(fs.readFileSync(landlordsPath, "utf-8"));

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
    console.error("Error reading listings:", err);
    res.status(500).json({ error: "Failed to load listings" });
  }
});

module.exports = router;
