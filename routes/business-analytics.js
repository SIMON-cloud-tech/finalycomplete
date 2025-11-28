const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const landlordsPath = path.join(__dirname, '../data/landlords.json');
const salesPath = path.join(__dirname, '../data/sales.json');

router.get('/analytics-summary', (req, res) => {
  try {
    const landlords = JSON.parse(fs.readFileSync(landlordsPath, 'utf8'));
    const sales = JSON.parse(fs.readFileSync(salesPath, 'utf8'));

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
