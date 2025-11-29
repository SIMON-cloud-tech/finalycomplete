// routes/admin-activate.js
const express = require("express");
const router = express.Router();
const fs = require("fs").promises; // async file system API
const path = require("path");
const bcrypt = require("bcryptjs");

const adminPath = path.join(__dirname, "../data/admin.json");

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

// POST /api/activate
router.post("/activate", async (req, res) => {
  const { productKey } = req.body;
  if (!productKey) {
    return res.status(400).json({ error: "Product key required." });
  }

  try {
    const admins = await readJSON(adminPath);

    // Find the last created admin (or match by email if needed)
    const admin = admins[admins.length - 1];
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
    await writeJSON(adminPath, admins);

    res.json({ success: true, message: "Product key activated successfully." });
  } catch (err) {
    console.error("Error during activation:", err);
    res.status(500).json({ error: "Server error during activation." });
  }
});

module.exports = router;
