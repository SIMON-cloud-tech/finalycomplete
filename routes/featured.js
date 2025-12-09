const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

router.get('/api/featured', (req, res) => {
  const filePath = path.join(__dirname, '../data/listings.json'); // or featured.json
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading featured.json:', err);
      return res.status(500).json({ error: 'Failed to load featured listings' });
    }
    try {
      const listings = JSON.parse(data);

      // Sort by createdAt descending (latest first)
      listings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Take first 6 for the day
      const featured = listings.slice(0, 6);

      res.json(featured);
    } catch (parseErr) {
      console.error('Error parsing featured.json:', parseErr);
      res.status(500).json({ error: 'Invalid JSON format' });
    }
  });
});

module.exports = router;
