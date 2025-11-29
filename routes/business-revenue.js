// routes/business-revenue.js
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

// GET /api/revenue → landlord, client, amount, commission
router.get("/revenue", async (req, res) => {
  try {
    const salesPath = path.join(__dirname, "../data/sales.json");
    const sales = await readJSON(salesPath);

    const simplified = sales.map(s => ({
      landlord: s.landlord || "N/A",
      client: s.client || "N/A",
      amount: s.amount || "N/A",
      commission: s.commission || "N/A"
    }));

    res.json(simplified);
  } catch (err) {
    console.error("Error loading revenue:", err);
    res.status(500).json({ error: "Server error loading revenue" });
  }
});

module.exports = router;
