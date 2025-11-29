// routes/landlord-analytics.js
const express = require("express");
const router = express.Router();
const fs = require("fs").promises; // async file system API
const path = require("path");
const { authenticateToken } = require("./login");

const salesPath = path.join(__dirname, "../data/sales.json");

// Utility: read JSON safely
async function readJSON(filePath) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("🚨 Error parsing sales.json:", err);
    return [];
  }
}

// GET /api/landlord/analytics
router.get("/analytics", authenticateToken, async (req, res) => {
  try {
    const sales = await readJSON(salesPath);
    const landlordId = req.landlord.id;
    const landlordName = req.landlord.name;

    const landlordSales = sales.filter(
      s => s.landlordId === landlordId || s.landlord === landlordName
    );

    const formatted = landlordSales.map(s => ({
      client: s.client,
      commission: parseInt(String(s.commission || "0").replace(/\D/g, "")), // strip KES
      revenue: parseInt(String(s.landlordShare || "0").replace(/\D/g, "")),
      timestamp: s.timestamp
    }));

    res.json({ sales: formatted });
  } catch (err) {
    console.error("🚨 Error reading analytics:", err);
    res.status(500).json({ message: "Server error fetching analytics." });
  }
});

module.exports = router;
