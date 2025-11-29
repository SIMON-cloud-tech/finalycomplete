// routes/business-manage-landlords.js
const express = require("express");
const fs = require("fs").promises; // use promises API
const path = require("path");
const sgMail = require("@sendgrid/mail");   // ✅ SendGrid SDK

const router = express.Router();

const landlordsPath = path.join(__dirname, "../data/landlords.json");

// Load SendGrid API key from environment variable
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Utility: read JSON file safely
async function readJSON(filePath) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const trimmed = raw.trim();
    if (!trimmed) return []; // empty file → return empty array
    return JSON.parse(trimmed);
  } catch (err) {
    console.error("🚨 Error parsing JSON file:", filePath, err.message);
    return [];
  }
}

// Utility: write JSON file safely
async function writeJSON(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

// GET /api/manage-landlords → all landlords
router.get("/", async (req, res) => {
  try {
    const landlords = await readJSON(landlordsPath);
    res.json(landlords);
  } catch (err) {
    console.error("🚨 Error loading landlords:", err);
    res.status(500).json({ message: "Failed to load landlords" });
  }
});

// SOFT DELETE /api/manage-landlords/:id → mark landlord as blocked
router.delete("/:id", async (req, res) => {
  try {
    const landlords = await readJSON(landlordsPath);
    const id = req.params.id;

    const landlord = landlords.find(ld => ld.id === id);
    if (!landlord) {
      return res.status(404).json({ message: "Landlord not found" });
    }

    landlord.blocked = true; // 🔧 soft delete
    await writeJSON(landlordsPath, landlords);

    res.json({ message: `Landlord ${id} marked as blocked` });
  } catch (err) {
    console.error("🚨 Error blocking landlord:", err);
    res.status(500).json({ message: "Failed to block landlord" });
  }
});

// POST /api/manage-landlords/:id/warning → send warning email
router.post("/:id/warning", async (req, res) => {
  try {
    const landlords = await readJSON(landlordsPath);
    const id = req.params.id;
    const landlord = landlords.find(ld => ld.id === id);

    if (!landlord) {
      return res.status(404).json({ message: "Landlord not found" });
    }

    const msg = {
      to: landlord.email,
      from: process.env.SENDGRID_FROM, // your verified sender
      subject: "Warning from Real Estate Platform",
      text: `Dear ${landlord.name},\n\nThis is a warning regarding your account activity.\n\nRegards,\nCompany Dashboard`,
      html: `<p>Dear ${landlord.name},</p>
             <p>This is a warning regarding your account activity.</p>
             <p>Regards,<br/>Company Dashboard</p>`
    };

    await sgMail.send(msg);
    res.json({ message: `Warning email sent to ${landlord.email}` });
  } catch (err) {
    console.error("🚨 Error sending email:", err);
    res.status(500).json({ message: "Failed to send warning email" });
  }
});

module.exports = router;
