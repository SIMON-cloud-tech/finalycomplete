// routes/admin-setup.js
const express = require("express");
const router = express.Router();
const fs = require("fs").promises; // async file system API
const path = require("path");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");
const sgMail = require("@sendgrid/mail");

require("dotenv").config(); // Load .env

const adminPath = path.join(__dirname, "../data/admin.json");

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Rate limiter: max 5 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: "Too many setup attempts, please try again later." }
});

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

// Generate 16-digit product key
function generateProductKey() {
  let key = "";
  for (let i = 0; i < 16; i++) {
    key += Math.floor(Math.random() * 10);
  }
  // Format as XXXX-XXXX-XXXX-XXXX
  return key.match(/.{1,4}/g).join("-");
}

// POST /api/setup
router.post(
  "/setup",
  limiter,
  [
    body("companyName").trim().escape().isLength({ min: 2 }),
    body("location").trim().escape().isLength({ min: 2 }),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: "Invalid input", details: errors.array() });
    }

    const { companyName, location, email, password } = req.body;

    try {
      const admins = await readJSON(adminPath);

      // Generate product key
      const productKey = generateProductKey();

      // Hash password and product key
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      const productKeyHash = await bcrypt.hash(productKey, salt);

      const newAdmin = {
        id: Date.now().toString(),
        companyName,
        location,
        email,
        passwordHash,
        productKeyHash,
        activated: false
      };

      admins.push(newAdmin);
      await writeJSON(adminPath, admins);

      // ✅ Send product key via SendGrid
      const msg = {
        to: email,
        from: process.env.SENDGRID_FROM,
        replyTo: process.env.SENDGRID_REPLY_TO,
        subject: "Your Product Key",
        text: `Hello ${companyName},\n\nYour product key is: ${productKey}\n\nUse this to activate your dashboard.\n`
      };

      try {
        await sgMail.send(msg);
      } catch (err) {
        console.error("❌ Failed to send product key email:", err);
      }

      res.json({ message: "Setup successful. Product key sent to email.", redirect: true });
    } catch (err) {
      console.error("Error during setup:", err);
      res.status(500).json({ error: "Server error during setup." });
    }
  }
);

module.exports = router;
