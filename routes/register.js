// routes/landlord-register.js
const express = require("express");
const router = express.Router();
const fs = require("fs").promises; // async file system API
const path = require("path");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const sgMail = require("@sendgrid/mail");

const landlordsPath = path.join(__dirname, "../data/landlords.json");
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

// Utility: write JSON safely
async function writeJSON(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

// POST /api/landlords/register
router.post("/register", async (req, res) => {
  try {
    let { name, email, password, phone, role } = req.body;

    // ✅ Sanitize inputs
    name = validator.escape(name.trim());
    email = validator.normalizeEmail(email.trim());
    phone = validator.escape(phone.trim());
    role = validator.escape(role.trim());

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "Missing required fields." });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    const landlords = await readJSON(landlordsPath);

    // ✅ Prevent duplicate email
    if (landlords.find(l => l.email === email)) {
      return res.status(409).json({ message: "Landlord already registered." });
    }

    // ✅ Generate unique landlord ID
    const newId = "L" + (landlords.length + 1).toString().padStart(3, "0");

    // ✅ Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const newLandlord = {
      id: newId,
      name,
      email,
      phone,
      role: role || "landlord",
      passwordHash,
      emailSent: false // flag for email delivery
    };

    landlords.push(newLandlord);
    await writeJSON(landlordsPath, landlords);

    // ✅ Dual email notifications
    const landlordMsg = {
      to: newLandlord.email,
      from: process.env.SENDGRID_FROM,
      replyTo: process.env.SENDGRID_REPLY_TO,
      subject: "Welcome to the Platform",
      text: `Hello ${newLandlord.name},\n\nYour registration was successful. Your ID is ${newLandlord.id}.`,
    };

    const businessMsg = {
      to: process.env.SENDGRID_FROM,
      from: process.env.SENDGRID_FROM,
      replyTo: process.env.SENDGRID_REPLY_TO,
      subject: "New Landlord Registered",
      text: `A new landlord has registered:\n\nID: ${newLandlord.id}\nName: ${newLandlord.name}\nEmail: ${newLandlord.email}\nPhone: ${newLandlord.phone}`,
    };

    try {
      await sgMail.send(landlordMsg);
      await sgMail.send(businessMsg);
      newLandlord.emailSent = true;
      await writeJSON(landlordsPath, landlords); // update flag
    } catch (err) {
      console.error("❌ Email failed:", err);
    }

    // ✅ Updated response: include redirect + prefill email
    res.status(201).json({
      message: "Registration successful",
      landlord: newLandlord,
      redirect: "landlordlogin.html",
      prefill: { email: newLandlord.email }
    });
  } catch (err) {
    console.error("🚨 Server error:", err);
    res.status(500).json({ message: "Server error during landlord registration." });
  }
});

module.exports = router;
