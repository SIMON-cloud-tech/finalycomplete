const express = require("express");
const fs = require("fs");
const path = require("path");
const sgMail = require("@sendgrid/mail");   // ✅ SendGrid SDK

const router = express.Router();

const landlordsPath = path.join(__dirname, "../data/landlords.json");

// Load SendGrid API key from environment variable
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function readJSON(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8").trim();
    if (!raw) return []; // empty file → return empty array
    return JSON.parse(raw);
  } catch (err) {
    console.error("🚨 Error parsing JSON file:", filePath, err.message);
    return [];
  }
}


function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

// GET /api/manage-landlords → all landlords
router.get("/", (req, res) => {
  const landlords = readJSON(landlordsPath);
  res.json(landlords);
});

// SOFT DELETE /api/manage-landlords/:id → mark landlord as blocked
router.delete("/:id", (req, res) => {
  const landlords = readJSON(landlordsPath);
  const id = req.params.id;

  const landlord = landlords.find(ld => ld.id === id);
  if (!landlord) {
    return res.status(404).json({ message: "Landlord not found" });
  }

  landlord.blocked = true; // 🔧 soft delete
  writeJSON(landlordsPath, landlords);

  res.json({ message: `Landlord ${id} marked as blocked` });
});

// POST /api/manage-landlords/:id/warning → send warning email
router.post("/:id/warning", async (req, res) => {
  const landlords = readJSON(landlordsPath);
  const id = req.params.id;
  const landlord = landlords.find(ld => ld.id === id);

  if (!landlord) {
    return res.status(404).json({ message: "Landlord not found" });
  }

  try {
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
