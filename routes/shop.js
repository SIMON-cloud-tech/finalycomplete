// routes/shop.js
const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// GET /api/listings → return all house listings
router.get("/listings", (req, res) => {
  const filePath = path.join(__dirname, "../data/listings.json");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading listings.json:", err);
      return res.status(500).json({ error: "Failed to load listings" });
    }

    try {
      const listings = JSON.parse(data);
      res.json(listings);
    } catch (parseErr) {
      console.error("Error parsing listings.json:", parseErr);
      res.status(500).json({ error: "Invalid listings data" });
    }
  });
});

module.exports = router;
