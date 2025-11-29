// routes/admin-login.js
const express = require("express");
const router = express.Router();
const fs = require("fs").promises; // async file system API
const path = require("path");
const bcrypt = require("bcryptjs");
const sgMail = require("@sendgrid/mail");

require("dotenv").config();

const adminPath = path.join(__dirname, "../data/admin.json");

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Utility: read JSON safely
async function readJSON(filePath) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Utility: write JSON safely (if needed later)
async function writeJSON(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

// POST /api/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required." });
  }

  try {
    const admins = await readJSON(adminPath);
    const admin = admins.find(a => a.email === email);

    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // ✅ Compare submitted password against stored hash
    const match = await bcrypt.compare(password, admin.passwordHash);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Check activation
    if (!admin.activated) {
      return res.status(403).json({ error: "Product not activated. Please activate first." });
    }

    // ✅ Send activation success email using .env values
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM,
      replyTo: process.env.SENDGRID_REPLY_TO,
      subject: "Product Activation Successful",
      text: `Hello ${admin.companyName},\n\nYour product has been successfully activated.\nFrom now on, simply log in with your credentials to access your dashboard.\n\nBest regards,\nBusiness Team`
    };

    try {
      await sgMail.send(msg);
    } catch (err) {
      console.error("❌ Failed to send activation success email:", err);
    }

    res.json({
      message: "Login successful. Redirecting to dashboard...",
      redirect: "business.html"
    });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ error: "Server error during login." });
  }
});

module.exports = router;
