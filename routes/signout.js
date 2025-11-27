const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { authenticateToken } = require("./login");

const landlordsPath = path.join(__dirname, "../data/landlords.json");

function readJSON(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, "utf8")); }
  catch { return []; }
}
function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// POST /api/signout
router.post("/", authenticateToken, (req, res) => {
  try {
    const landlords = readJSON(landlordsPath);
    const landlordKey = req.landlord.id;

    const landlord = landlords.find(l => l.id === landlordKey);
    if (landlord) {
      landlord.status = "signed_out";
      landlord.signedOutAt = new Date().toISOString();
      writeJSON(landlordsPath, landlords);
    }

    res.json({ message: "Signed out successfully" });
  } catch (err) {
    console.error("🚨 Sign out error:", err);
    res.status(500).json({ message: "Server error signing out" });
  }
});

module.exports = router;
