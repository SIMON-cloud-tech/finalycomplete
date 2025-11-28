
const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const clientsPath = path.join(__dirname, "../data/clients.json");
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Utility: read JSON safely
function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return [];
  }
}

// POST /api/client/login
router.post("/client/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required." });
  }

  try {
    const clients = readJSON(clientsPath);
    const client = clients.find(c => c.email === email);

    if (!client) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // ✅ Compare submitted password against stored hash
    const match = await bcrypt.compare(password, client.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Issue JWT token with client ID
    const token = jwt.sign(
      { id: client.id, email: client.email },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error("Error during client login:", err);
    res.status(500).json({ error: "Server error during login." });
  }
});

module.exports = router;
