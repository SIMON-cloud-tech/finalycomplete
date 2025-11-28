// routes/business-bookings.js
const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

// Paths to JSON files
const bookingsPath = path.join(__dirname, "../data/bookings.json");
const landlordsPath = path.join(__dirname, "../data/landlords.json");

// GET /api/bookings
router.get("/", (req, res) => {
  try {
    const bookings = JSON.parse(fs.readFileSync(bookingsPath, "utf8"));
    const landlords = JSON.parse(fs.readFileSync(landlordsPath, "utf8"));

    const result = bookings.map((b) => {
      const landlord = landlords.find((l) => l.id === b.landlordId);

      return {
        id: b.id,
        landlordName: landlord ? landlord.name : "Unknown",
        price: b.price,
        time: b.time,
        status: b.status,
      };
    });

    res.json(result);
  } catch (err) {
    console.error("Error loading bookings:", err);
    res.status(500).json({ error: "Server error loading bookings" });
  }
});

module.exports = router;
