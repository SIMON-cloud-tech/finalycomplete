// routes/landlord-feed.js
const express = require("express");
const router = express.Router();
const fs = require("fs").promises; // async file system API
const path = require("path");
const { authenticateToken } = require("./login");

const listingsPath = path.join(__dirname, "../data/listings.json");
const salesPath = path.join(__dirname, "../data/sales.json");
const bookingsPath = path.join(__dirname, "../data/bookings.json");
const clientsPath = path.join(__dirname, "../data/clients.json");
const paymentsPath = path.join(__dirname, "../data/payments.json");

// Utility: read JSON safely
async function readJSON(filePath) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Utility: format timestamp
function formatTimestamp(isoString) {
  const date = new Date(isoString);
  const options = { hour: "numeric", minute: "numeric", hour12: true };
  const time = date.toLocaleTimeString("en-KE", options);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${time} ${day}/${month}/${year}`;
}

// GET /api/landlord/feed
router.get("/feed", authenticateToken, async (req, res) => {
  try {
    const landlordId = req.landlord.id;
    const landlordName = req.landlord.name;

    // Read all files concurrently
    const [listings, sales, bookings, clients, payments] = await Promise.all([
      readJSON(listingsPath),
      readJSON(salesPath),
      readJSON(bookingsPath),
      readJSON(clientsPath),
      readJSON(paymentsPath)
    ]);

    // My Units
    const myUnits = listings
      .filter(l => l.landlordId === landlordId || l.landlord === landlordName)
      .reduce((sum, l) => sum + parseInt(l.units || "0"), 0);

    // Revenue
    const revenue = sales
      .filter(s => s.landlordId === landlordId || s.landlord === landlordName)
      .reduce((sum, s) => sum + parseInt(String(s.landlordShare || "0").replace(/\D/g, "")), 0);

    // Bookings
    const bookingsCount = bookings.filter(
      b => b.landlordId === landlordId || b.landlord === landlordName
    ).length;

    // Clients
    const clientsCount = clients.filter(
      c => c.landlordId === landlordId || c.landlord === landlordName
    ).length;

    // Alerts
    const bookingAlerts = bookings
      .filter(b => b.landlordId === landlordId || b.landlord === landlordName)
      .map(b => `${formatTimestamp(b.createdAt)}: A booking was made by client ${b.clientId}`);

    const paymentAlerts = payments
      .filter(p => p.landlordId === landlordId || p.landlord === landlordName)
      .map(p => `${p.landlord} has just been paid ${p.amount}`);

    res.json({
      landlordName,   // ✅ include the name
      cards: {
        myUnits,
        revenue,
        bookings: bookingsCount,
        clients: clientsCount
      },
      alerts: {
        bookings: bookingAlerts,
        payments: paymentAlerts
      }
    });
  } catch (err) {
    console.error("Error loading landlord feed:", err);
    res.status(500).json({ message: "Server error loading landlord feed." });
  }
});

module.exports = router;
