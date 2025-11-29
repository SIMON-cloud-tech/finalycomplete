// routes/landlord-login.js
const express = require("express");
const router = express.Router();
const fs = require("fs").promises; // async file system API
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const validator = require("validator");

const landlordsPath = path.join(__dirname, "../data/landlords.json");
const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

// Utility: read landlords.json safely
async function readJSON(filePath) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Rate limiter: max 5 login attempts per minute per IP
const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { message: "Too many login attempts. Please try again later." }
});

// POST /api/landlords/login
router.post("/login", loginLimiter, async (req, res) => {
  try {
    let { email, password } = req.body;

    // ✅ Sanitize inputs
    email = validator.normalizeEmail(email.trim());
    password = password.trim();

    if (!email || !password) {
      return res.status(400).json({ message: "Missing email or password." });
    }

    const landlords = await readJSON(landlordsPath);
    const landlord = landlords.find(l => l.email === email);

    if (!landlord) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const validPassword = await bcrypt.compare(password, landlord.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: landlord.id, email: landlord.email, role: landlord.role, name: landlord.name },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error("🚨 Login error:", err);
    res.status(500).json({ message: "Server error during login." });
  }
});

// Middleware: protect routes
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token required." });

  jwt.verify(token, SECRET_KEY, (err, landlord) => {
    if (err) return res.status(403).json({ message: "Invalid token." });
    req.landlord = landlord; // attach landlord info
    next();
  });
}

module.exports = { router, authenticateToken };
