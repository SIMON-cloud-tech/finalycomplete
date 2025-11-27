const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { authenticateToken } = require("./login"); // JWT middleware

const salesPath = path.join(__dirname, "../data/sales.json");

// Utility: read JSON safely
function readJSON(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("🚨 Error parsing sales.json:", err);
    return [];
  }
}

// Format timestamp → "9:00am 20/11/2025"
function formatTimestamp(isoString) {
  const date = new Date(isoString);
  const options = { hour: "numeric", minute: "numeric", hour12: true };
  const time = date.toLocaleTimeString("en-KE", options);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${time} ${day}/${month}/${year}`;
}

// GET /api/landlord/payments
router.get("/payments", authenticateToken, (req, res) => {
  try {
    const sales = readJSON(salesPath);

    const landlordId = req.landlord.id;
    const landlordName = req.landlord.name;

    // Filter sales by landlordId (preferred) or landlord name (fallback)
    const landlordSales = sales.filter(
      s => s.landlordId === landlordId || s.landlord === landlordName
    );

    // Format data
    const formattedSales = landlordSales.map(s => ({
      client: s.client,
      amount: s.amount,
      landlordShare: s.landlordShare,
      time: formatTimestamp(s.timestamp)
    }));

    res.json({ sales: formattedSales });
  } catch (err) {
    console.error("🚨 Error reading sales:", err);
    res.status(500).json({ message: "Server error fetching payments." });
  }
});

module.exports = router;
