// routes/landlord-settings.js
const express = require("express");
const router = express.Router();
const fs = require("fs").promises; // async file system API
const path = require("path");
const bcrypt = require("bcryptjs");
const { authenticateToken } = require("./login"); // JWT middleware

const landlordsPath = path.join(__dirname, "../data/landlords.json");

// Utility: read JSON safely
async function readJSON(filePath) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("🚨 Error parsing landlords.json:", err);
    return [];
  }
}

// Utility: write JSON safely
async function writeJSON(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

// GET /api/landlord/settings
router.get("/settings", authenticateToken, async (req, res) => {
  try {
    const landlords = await readJSON(landlordsPath);
    const landlord = landlords.find(l => l.id === req.landlord.id);

    if (!landlord) {
      return res.status(404).json({ message: "Landlord not found." });
    }

    // Return profile without exposing passwordHash
    const { passwordHash, ...safeProfile } = landlord;
    res.json({ landlord: safeProfile });
  } catch (err) {
    console.error("🚨 Error fetching settings:", err);
    res.status(500).json({ message: "Server error fetching settings." });
  }
});

// PUT /api/landlord/settings
router.put("/settings", authenticateToken, async (req, res) => {
  try {
    const landlords = await readJSON(landlordsPath);
    const landlordIndex = landlords.findIndex(l => l.id === req.landlord.id);

    if (landlordIndex === -1) {
      return res.status(404).json({ message: "Landlord not found." });
    }

    const landlord = landlords[landlordIndex];

    // Update fields if provided
    if (req.body.name) landlord.name = req.body.name;
    if (req.body.phone) landlord.phone = req.body.phone;
    if (req.body.tillNumber) landlord.tillNumber = req.body.tillNumber;

    if (req.body.password && req.body.password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      landlord.passwordHash = await bcrypt.hash(req.body.password, salt);
    }

    landlords[landlordIndex] = landlord;
    await writeJSON(landlordsPath, landlords);

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("🚨 Error updating settings:", err);
    res.status(500).json({ message: "Server error updating settings." });
  }
});

module.exports = router;
