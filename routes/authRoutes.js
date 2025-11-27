// routes/authRoutes.js
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const sgMail = require('@sendgrid/mail');

// Resolve landlords.json inside /data folder
const dataFile = path.join(__dirname, '../data/landlords.json');
let landlords = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const FROM_EMAIL = process.env.SENDGRID_FROM;
const REPLY_TO = process.env.SENDGRID_REPLY_TO;
const BUSINESS_EMAIL = process.env.SENDGRID_FROM; // business receives copy

// Utility: generate 6-digit OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Route 1: Request Reset
 * - Finds landlord by email
 * - Generates OTP and expiry
 * - Sends OTP email to landlord + business
 */
router.post('/request-reset', (req, res) => {
  const { email } = req.body;
  const landlord = landlords.find(l => l.email === email);

  if (!landlord) return res.status(404).json({ message: "Email not found" });

  const otp = generateOtp();
  landlord.otp = otp;
  landlord.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 min expiry

  // Dual send: landlord + business
  const msg = [
    {
      to: email,
      from: FROM_EMAIL,
      replyTo: REPLY_TO,
      subject: 'Password Reset OTP',
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

  sgMail.send(msg).then(() => {
    res.json({ message: "OTP sent to email" });
  }).catch(err => {
    console.error(err);
    res.status(500).json({ message: "Failed to send OTP email" });
  });
});

/**
 * Route 2: Verify OTP
 * - Checks if OTP matches and is not expired
 */
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const landlord = landlords.find(l => l.email === email);

  if (!landlord || landlord.otp !== otp || Date.now() > landlord.otpExpiry) {
    return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
  }

  res.json({ success: true, message: "OTP verified" });
});

/**
 * Route 3: Reset Password
 * - Hashes new password
 * - Updates landlord.passwordHash in landlords.json
 * - Sends confirmation email to landlord + business
 */
router.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  const landlord = landlords.find(l => l.email === email);

  if (!landlord) return res.status(404).json({ message: "Email not found" });

  // Update passwordHash
  landlord.passwordHash = await bcrypt.hash(newPassword, 10);
  landlord.emailSent = true;

  // Persist changes back into /data/landlords.json
  fs.writeFileSync(dataFile, JSON.stringify(landlords, null, 2));

  // Dual send: landlord + business
  const confirmationMsg = [
    {
      to: email,
      from: FROM_EMAIL,
      replyTo: REPLY_TO,
      subject: 'Password Updated',
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

  sgMail.send(confirmationMsg).then(() => {
    res.json({ message: "Password updated and confirmation email sent" });
  }).catch(err => {
    console.error(err);
    res.status(500).json({ message: "Failed to send confirmation email" });
  });
});

module.exports = router;
