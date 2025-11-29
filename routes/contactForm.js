const express = require("express");
const router = express.Router();
const fs = require("fs").promises;
const path = require("path");
const validator = require("validator");
const sgMail = require("@sendgrid/mail");

const contactsPath = path.join(__dirname, "../data/contacts.json");
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

// POST /api/contact
router.post("/contact", async (req, res) => {
  try {
    let { name, email, comment, enquiry } = req.body;

    // ✅ Sanitize inputs
    name = validator.escape(name.trim());
    email = validator.normalizeEmail(email.trim());
    comment = validator.escape(comment.trim());
    enquiry = validator.escape(enquiry.trim());

    // ✅ Validate required fields
    if (!name || !email || !comment || !enquiry) {
      return res.status(400).json({ error: "All fields are required." });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    // ✅ Save to contacts.json
    const contacts = await readJSON(contactsPath);
    const newContact = {
      id: Date.now().toString(),
      name,
      email,
      comment,
      enquiry,
      timestamp: new Date().toISOString()
    };
    contacts.push(newContact);
    await writeJSON(contactsPath, contacts);

    // ✅ Dual email notifications
    const clientMsg = {
      to: email,
      from: process.env.SENDGRID_FROM,
      replyTo: process.env.SENDGRID_REPLY_TO,
      subject: "We received your enquiry",
      text: `Hello ${name},\n\nThank you for contacting us. We received your enquiry:\n"${enquiry}"\n\nWe will get back to you soon.\n\nBest regards,\nBusiness Team`
    };

    const businessMsg = {
      to: process.env.SENDGRID_FROM,
      from: process.env.SENDGRID_FROM,
      replyTo: process.env.SENDGRID_REPLY_TO,
      subject: "New Contact Form Submission",
      text: `New enquiry received:\n\nName: ${name}\nEmail: ${email}\nComment: ${comment}\nEnquiry: ${enquiry}\n\nTimestamp: ${newContact.timestamp}`
    };

    try {
      await sgMail.send(clientMsg);
      await sgMail.send(businessMsg);
    } catch (err) {
      console.error("❌ Email failed:", err);
    }

    res.json({ message: "Contact submission successful." });
  } catch (err) {
    console.error("🚨 Server error:", err);
    res.status(500).json({ error: "Server error during contact submission." });
  }
});

module.exports = router;
