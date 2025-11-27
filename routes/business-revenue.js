// routes/business-revenue.js
const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Utility to safely read JSON
function readJSON(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

// GET /api/revenue → landlord, client, amount, commission
router.get("/revenue", (req, res) => {
  const salesPath = path.join(__dirname, "../data/sales.json");
  const sales = readJSON(salesPath);

  const simplified = sales.map(s => ({
    landlord: s.landlord || "N/A",
    client: s.client || "N/A",
    amount: s.amount || "N/A",
    commission: s.commission || "N/A"
  }));

  res.json(simplified);
});

module.exports = router;
