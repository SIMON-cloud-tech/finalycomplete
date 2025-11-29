// routes/business-bookings.js
const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs").promises; // use promises API

// Paths to JSON files
const bookingsPath = path.join(__dirname, "../data/bookings.json");
const landlordsPath = path.join(__dirname, "../data/landlords.json");

// GET /api/bookings
router.get("/", async (req, res) => {
  try {
    // Read files asynchronously
    const bookingsData = await fs.readFile(bookingsPath, "utf8");
    const landlordsData = await fs.readFile(landlordsPath, "utf8");

    const bookings = JSON.parse(bookingsData);
    const landlords = JSON.parse(landlordsData);

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
