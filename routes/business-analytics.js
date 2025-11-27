// routes/business-analytics.js
const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Utility to safely read JSON
function readJSON(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

// GET /api/analytics → landlord, amount, commission
router.get("/analytics", (req, res) => {
  const listingsPath = path.join(__dirname, "../data/listings.json");
  const salesPath = path.join(__dirname, "../data/sales.json");

  const listings = readJSON(listingsPath);
  const sales = readJSON(salesPath);

  // Compute amount from listings (units × price)
  const listingTotals = listings.map(l => ({
    landlord: l.landlord,
    amount: l.units * l.price
  }));

  // Compute commission from sales.json
  const commissionTotals = sales.map(s => ({
    landlord: s.landlord,
    commission: parseInt(s.commission.replace(/\D/g, "")) || 0
  }));

  // Merge by landlord
  const merged = listingTotals.map(l => {
    const comm = commissionTotals
      .filter(c => c.landlord === l.landlord)
      .reduce((sum, c) => sum + c.commission, 0);

    return {
      landlord: l.landlord,
      amount: l.amount,
      commission: comm
    };
  });

  // Sort descending by commission
  merged.sort((a, b) => b.commission - a.commission);

  res.json(merged);
});

module.exports = router;
