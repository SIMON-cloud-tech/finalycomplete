// routes/landlord-signout.js
const express = require("express");
const router = express.Router();
const fs = require("fs").promises; // async file system API
const path = require("path");
const { authenticateToken } = require("./login");

const landlordsPath = path.join(__dirname, "../data/landlords.json");

// Utility: read JSON safely
async function readJSON(filePath) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Utility: write JSON safely
async function writeJSON(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

// POST /api/signout
router.post("/", authenticateToken, async (req, res) => {
  try {
    const landlords = await readJSON(landlordsPath);
    const landlordKey = req.landlord.id;

    const landlord = landlords.find(l => l.id === landlordKey);
    if (landlord) {
      landlord.status = "signed_out";
      landlord.signedOutAt = new Date().toISOString();
      await writeJSON(landlordsPath, landlords);
    }

    res.json({ message: "Signed out successfully" });
  } catch (err) {
    console.error("🚨 Sign out error:", err);
    res.status(500).json({ message: "Server error signing out" });
  }
});

module.exports = router;
