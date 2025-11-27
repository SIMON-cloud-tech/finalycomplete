// routes/business-bookings.js
const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Utility to safely read JSON
function readJSON(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

// GET /api/bookings → landlord, price, time, status
router.get("/bookings", (req, res) => {
  const bookingsPath = path.join(__dirname, "../data/bookings.json");
  const bookings = readJSON(bookingsPath);

  const simplified = bookings.map(b => ({
    landlord: b.landlord,
    price: b.price,
    time: b.time,
    status: b.status
  }));

  res.json(simplified);
});

module.exports = router;
