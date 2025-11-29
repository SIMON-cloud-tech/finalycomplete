// routes/business-payments.js
const express = require("express");
const fs = require("fs").promises; // use promises API
const path = require("path");

const router = express.Router();

// Utility to safely read JSON asynchronously
async function readJSON(filePath) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// GET /api/payments → landlord, client, total, commission
router.get("/payments", async (req, res) => {
  try {
    const salesPath = path.join(__dirname, "../data/sales.json");
    const sales = await readJSON(salesPath);

    // Normalize schema: pick landlord, client, total, commission
    const simplified = sales.map(s => ({
      landlord: s.landlord || "N/A",
      client: s.client || "N/A",
      total: s.amount || s.landlordShare || "N/A",
      commission: s.commission || "N/A"
    }));

    res.json(simplified);
  } catch (err) {
    console.error("Error loading payments:", err);
    res.status(500).json({ error: "Server error loading payments" });
  }
});

module.exports = router;
