const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const validator = require("validator");

const testimonialsPath = path.join(__dirname, "../data/testimonials.json");

function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return [];
  }
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

// GET all testimonials
router.get("/api/testimonials", (req, res) => {
  const testimonials = readJSON(testimonialsPath);
  res.json({ testimonials });
});

// POST new testimonial
router.post("/api/testimonials", (req, res) => {
  let { name, feedback } = req.body;

  if (!name || !feedback) {
    return res.status(400).json({ error: "Name and feedback are required." });
  }

  // ✅ Sanitize inputs
  name = validator.escape(name.trim());
  feedback = validator.escape(feedback.trim());

  // ❌ Reject negative reviews (simple check)
  const negativeWords = ["bad", "poor", "terrible", "awful"];
  if (negativeWords.some(word => feedback.toLowerCase().includes(word))) {
    return res.status(400).json({ error: "Negative reviews are not allowed." });
  }

  const testimonials = readJSON(testimonialsPath);
  const newId = testimonials.length ? testimonials[testimonials.length - 1].id + 1 : 1;

  const now = new Date();
  const formattedDate = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} - ${now.getHours()}:${now.getMinutes()}am`;

  const newTestimonial = { id: newId, name, feedback, date: formattedDate };
  testimonials.push(newTestimonial);
  writeJSON(testimonialsPath, testimonials);

  res.json({ success: true, testimonial: newTestimonial });
});

module.exports = router;
