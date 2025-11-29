// routes/testimonials.js
const express = require("express");
const router = express.Router();
const fs = require("fs").promises; // async file system API
const path = require("path");
const validator = require("validator");

const testimonialsPath = path.join(__dirname, "../data/testimonials.json");

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

// GET all testimonials
router.get("/api/testimonials", async (req, res) => {
  try {
    const testimonials = await readJSON(testimonialsPath);
    res.json({ testimonials });
  } catch (err) {
    console.error("Error fetching testimonials:", err);
    res.status(500).json({ error: "Server error fetching testimonials." });
  }
});

// POST new testimonial (or update if same name exists)
router.post("/api/testimonials", async (req, res) => {
  try {
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

    const testimonials = await readJSON(testimonialsPath);

    // Check if testimonial with same name exists
    const existingIndex = testimonials.findIndex(t => t.name.toLowerCase() === name.toLowerCase());

    const now = new Date();
    const formattedDate = now.toLocaleString();

    if (existingIndex !== -1) {
      // Update existing testimonial
      testimonials[existingIndex].feedback = feedback;
      testimonials[existingIndex].date = formattedDate;

      await writeJSON(testimonialsPath, testimonials);
      return res.json({ success: true, testimonial: testimonials[existingIndex], updated: true });
    } else {
      // Create new testimonial
      const newId = Date.now(); // unique ID
      const newTestimonial = { id: newId, name, feedback, date: formattedDate };
      testimonials.push(newTestimonial);

      await writeJSON(testimonialsPath, testimonials);
      return res.json({ success: true, testimonial: newTestimonial, created: true });
    }
  } catch (err) {
    console.error("Error creating/updating testimonial:", err);
    res.status(500).json({ error: "Server error creating/updating testimonial." });
  }
});

module.exports = router;
