// routes/authRoutes.js
const fs = require("fs").promises; // async file system API
const path = require("path");
const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const sgMail = require("@sendgrid/mail");

const dataFile = path.join(__dirname, "../data/landlords.json");

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const FROM_EMAIL = process.env.SENDGRID_FROM;
const REPLY_TO = process.env.SENDGRID_REPLY_TO;
const BUSINESS_EMAIL = process.env.SENDGRID_FROM; // business receives copy

// Utility: load landlords.json
async function loadLandlords() {
  try {
    const data = await fs.readFile(dataFile, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Utility: save landlords.json
async function saveLandlords(landlords) {
  await fs.writeFile(dataFile, JSON.stringify(landlords, null, 2), "utf8");
}

// Utility: generate 6-digit OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Route 1: Request Reset
 */
router.post("/request-reset", async (req, res) => {
  const { email } = req.body;
  const landlords = await loadLandlords();
  const landlord = landlords.find(l => l.email === email);

  if (!landlord) return res.status(404).json({ message: "Email not found" });

  const otp = generateOtp();
  landlord.otp = otp;
  landlord.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 min expiry

  await saveLandlords(landlords);

  const msg = [
    {
      to: email,
      from: FROM_EMAIL,
      replyTo: REPLY_TO,
      subject: "Password Reset OTP",
      text: `Your OTP code is ${otp}. It expires in 10 minutes.`
    },
    {
      to: BUSINESS_EMAIL,
      from: FROM_EMAIL,
      replyTo: REPLY_TO,
      subject: `Password Reset Requested for ${landlord.name}`,
      text: `Landlord ${landlord.name} (${email}) requested a password reset. OTP: ${otp}`
    }
  ];

  try {
    await sgMail.send(msg);
    res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error("❌ Failed to send OTP email:", err);
    res.status(500).json({ message: "Failed to send OTP email" });
  }
});

/**
 * Route 2: Verify OTP
 */
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  const landlords = await loadLandlords();
  const landlord = landlords.find(l => l.email === email);

  if (!landlord || landlord.otp !== otp || Date.now() > landlord.otpExpiry) {
    return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
  }

  res.json({ success: true, message: "OTP verified" });
});

/**
 * Route 3: Reset Password
 */
router.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;
  const landlords = await loadLandlords();
  const landlord = landlords.find(l => l.email === email);

  if (!landlord) return res.status(404).json({ message: "Email not found" });

  landlord.passwordHash = await bcrypt.hash(newPassword, 10);
  landlord.emailSent = true;

  await saveLandlords(landlords);

  const confirmationMsg = [
    {
      to: email,
      from: FROM_EMAIL,
      replyTo: REPLY_TO,
      subject: "Password Updated",
      text: `Hello ${landlord.name}, your password was changed at ${new Date().toLocaleString()} by email ${email}.
If this wasn’t you, click here to revert: https://yourapp.com/forgot-password`
    },
    {
      to: BUSINESS_EMAIL,
      from: FROM_EMAIL,
      replyTo: REPLY_TO,
      subject: `Password Updated for ${landlord.name}`,
      text: `Landlord ${landlord.name} (${email}) updated their password at ${new Date().toLocaleString()}.`
    }
  ];

  try {
    await sgMail.send(confirmationMsg);
    res.json({ message: "Password updated and confirmation email sent" });
  } catch (err) {
    console.error("❌ Failed to send confirmation email:", err);
    res.status(500).json({ message: "Failed to send confirmation email" });
  }
});

module.exports = router;
