const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { authenticateToken } = require("./login");

const salesPath = path.join(__dirname, "../data/sales.json");

function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (err) {
    console.error("🚨 Error parsing sales.json:", err);
    return [];
  }
}

// GET /api/landlord/analytics
router.get("/analytics", authenticateToken, (req, res) => {
  try {
    const sales = readJSON(salesPath);
    const landlordId = req.landlord.id;
    const landlordName = req.landlord.name;

    const landlordSales = sales.filter(
      s => s.landlordId === landlordId || s.landlord === landlordName
    );

    const formatted = landlordSales.map(s => ({
      client: s.client,
      commission: parseInt(s.commission.replace(/\D/g, "")), // strip KES
      revenue: parseInt(s.landlordShare.replace(/\D/g, "")),
      timestamp: s.timestamp
    }));

    res.json({ sales: formatted });
  } catch (err) {
    console.error("🚨 Error reading analytics:", err);
    res.status(500).json({ message: "Server error fetching analytics." });
  }
});

module.exports = router;
