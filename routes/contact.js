const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const sgMail = require("@sendgrid/mail");

// Load SendGrid API key from .env
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const contactsFile = path.join(__dirname, "../data/contacts.json");

// Helper: sanitize input server-side
function sanitize(str) {
  return String(str).replace(/[<>]/g, "").trim();
}

router.post("/contact", async (req, res) => {
  try {
    const { name, email, comment, enquiry } = req.body;

    if (!name || !email || !comment || !enquiry) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const contactEntry = {
      id: Date.now(),
      name: sanitize(name),
      email: sanitize(email),
      comment: sanitize(comment),
      enquiry: sanitize(enquiry),
      timestamp: new Date().toISOString(),
    };

    // Save to contacts.json
    let contacts = [];
    if (fs.existsSync(contactsFile)) {
      contacts = JSON.parse(fs.readFileSync(contactsFile, "utf8"));
    }
    contacts.push(contactEntry);
    fs.writeFileSync(contactsFile, JSON.stringify(contacts, null, 2));

    // Send dual emails (to business + client)
    const businessMsg = {
      to:  process.env.SENDGRID_REPLY_TO,  
      from:process.env.SENDGRID_FROM,
      subject: "New Contact Form Submission",
      text: `Name: ${contactEntry.name}\nEmail: ${contactEntry.email}\nComment: ${contactEntry.comment}\nEnquiry: ${contactEntry.enquiry}`,
    };

    
    const clientMsg = {
      to: contactEntry.email,
      from: process.env.SENDGRID_FROM,
      subject: "Thank you for contacting us",
      text: `Dear ${contactEntry.name},\n\nWe have received your enquiry:\n"${contactEntry.enquiry}"\n\nOur team will get back to you shortly.\n\nBest regards,\nBusiness Team`,
    };

    await sgMail.send(businessMsg);
    await sgMail.send(clientMsg);

    res.json({ message: "Contact form submitted successfully." });
  } catch (err) {
    console.error("Error handling contact form:", err);
    res.status(500).json({ message: "Failed to process contact form." });
  }
});

module.exports = router;
