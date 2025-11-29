// routes/landlord-valuation.js
const express = require("express");
const router = express.Router();
const fs = require("fs").promises; // async file system API
const path = require("path");
const { authenticateToken } = require("./login");

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

// Utility: format numbers with commas
const fmt = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

// GET /api/landlord/valuation
router.get("/", authenticateToken, async (req, res) => {
  try {
    const listings = await readJSON(listingsPath);
    const landlordKey = req.landlord.landlordId || req.landlord.id;
    const landlordListings = listings.filter(v => v.landlordId === landlordKey);

    if (!landlordListings.length) {
      return res.json([]);
    }

    const rows = landlordListings.map(v => ({
      unit: v.unit,
      no: fmt(v.units),
      price: fmt(v.price),
      total: fmt(v.units * v.price)
    }));

    const grandTotal = fmt(
      landlordListings.reduce((s, v) => s + v.units * v.price, 0)
    );

    res.json({ rows, grandTotal });
  } catch (err) {
    console.error("Error fetching landlord valuation:", err);
    res.status(500).json({ message: "Server error fetching valuation." });
  }
});

module.exports = router;
