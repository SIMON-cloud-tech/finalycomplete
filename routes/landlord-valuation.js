const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { authenticateToken } = require("./login");

const listingsPath = path.join(__dirname, "../data/listings.json");

function readJSON(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, "utf8")); }
  catch { return []; }
}
const fmt = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

router.get("/", authenticateToken, (req, res) => {
  const listings = readJSON(listingsPath);
  const landlordKey = req.landlord.landlordId || req.landlord.id;
  const landlordListings = listings.filter(v => v.landlordId === landlordKey);

  if (!landlordListings.length) return res.json([]);

  const rows = landlordListings.map(v => ({
    unit: v.unit,
    no: fmt(v.units),
    price: fmt(v.price),
    total: fmt(v.units * v.price)
  }));
  const grandTotal = fmt(landlordListings.reduce((s, v) => s + v.units * v.price, 0));

  res.json({ rows, grandTotal });
});

module.exports = router;
