const express = require('express');
const fs = require('fs').promises; // use promises API
const path = require('path');
const router = express.Router();

const landlordsPath = path.join(__dirname, '../data/landlords.json');
const salesPath = path.join(__dirname, '../data/sales.json');

router.get('/analytics-summary', async (req, res) => {
  try {
    // Read files asynchronously
    const landlordsData = await fs.readFile(landlordsPath, 'utf8');
    const salesData = await fs.readFile(salesPath, 'utf8');

    const landlords = JSON.parse(landlordsData);
    const sales = JSON.parse(salesData);

    // landlordId -> landlordName map
    const landlordMap = {};
    landlords.forEach(l => {
      landlordMap[l.id] = l.name;
    });

    const summary = sales.map(sale => {
      const amount = parseInt(sale.amount.replace("KES ", ""));
      const commission = parseInt(sale.commission.replace("KES ", ""));
      return {
        landlord: landlordMap[sale.landlordId] || "Unknown",
        amount,
        commission
      };
    });

    res.json(summary);
  } catch (err) {
    console.error("Error building analytics summary:", err);
    res.status(500).json({ error: "Failed to load analytics summary" });
  }
});

module.exports = router;
