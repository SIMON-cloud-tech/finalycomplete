const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const clientsPath = path.join(__dirname, "../data/clients.json");
const bookingsPath = path.join(__dirname, "../data/bookings.json");
const listingsPath = path.join(__dirname, "../data/listings.json");
const landlordsPath = path.join(__dirname, "../data/landlords.json");

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

// Helper: calculate overdraft
function calculateOverdraft(price, amountPaid) {
  const oneMonthRent = price;
  const diff = (amountPaid || 0) - oneMonthRent;

  if (diff < 0) {
    // Format with commas for readability
    return Math.abs(diff).toLocaleString();
  } else {
    return "Clear";
  }
}

// GET /api/client/dashboard
router.get("/client/dashboard", authenticateClient, (req, res) => {
  const clients = readJSON(clientsPath);
  const bookings = readJSON(bookingsPath);
  const listings = readJSON(listingsPath);
  const landlords = readJSON(landlordsPath);

  const client = clients.find(c => c.id === req.client.id);
  if (!client) {
    return res.status(404).json({ error: "Client not found." });
  }

  // Find all bookings for this client
  const clientBookings = bookings
    .filter(b => b.clientId === client.id)
    .map(b => {
      const houseObj = listings.find(h => String(h.id) === String(b.houseId));
      const landlordObj = landlords.find(ld => String(ld.id) === String(b.landlordId));

      return {
        house: houseObj?.unit || `House ${b.houseId}`,   // ✅ real unit name
        location: houseObj?.location || "Unknown",
        landlord: landlordObj?.name || "Unknown",
        status: b.status,
        overdraft: calculateOverdraft(b.price, b.amountPaid)
      };
    });

  res.json({
    client: {
      id: client.id,
      name: client.name,
      email: client.email
    },
    bookings: clientBookings
  });
});

module.exports = router;
