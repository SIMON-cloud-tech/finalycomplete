const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const adminPath = path.join(__dirname, "../data/admin.json");

function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return [];
  }
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

// POST /api/activate
router.post("/activate", async (req, res) => {
  const { productKey } = req.body;
  if (!productKey) {
    return res.status(400).json({ error: "Product key required." });
  }

  try {
    const admins = readJSON(adminPath);

    // Find the first admin (or match by email if needed)
    const admin = admins[admins.length - 1]; // last created admin
    if (!admin) {
      return res.status(404).json({ error: "No admin setup found." });
    }

    // Compare entered key with stored hash
    const match = await bcrypt.compare(productKey, admin.productKeyHash);
    if (!match) {
      return res.status(401).json({ error: "Invalid product key." });
    }

    // Mark activated forever
    admin.activated = true;
    writeJSON(adminPath, admins);

    res.json({ success: true, message: "Product key activated successfully." });
  } catch (err) {
    console.error("Error during activation:", err);
    res.status(500).json({ error: "Server error during activation." });
  }
});

module.exports = router;
