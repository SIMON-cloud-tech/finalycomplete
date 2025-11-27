const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
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

// Middleware: verify JWT
function authenticateClient(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No token provided." });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Invalid token format." });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.client = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token." });
  }
}

// GET /api/client/dashboard
router.get("/client/dashboard", authenticateClient, (req, res) => {
  const clients = readJSON(clientsPath);
  const client = clients.find(c => c.id === req.client.id);

  if (!client) {
    return res.status(404).json({ error: "Client not found." });
  }

  // Return only this client’s data
  res.json({
    client: {
      id: client.id,
      name: client.name,
      email: client.email,
      house: client.house,
      landlord: client.landlord,
      startDate: client.startDate,
      status: client.status,
      location: client.location,
      stayDays: client.stayDays
    }
  });
});

module.exports = router;
