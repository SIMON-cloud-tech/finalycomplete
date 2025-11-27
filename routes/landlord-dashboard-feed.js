const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { authenticateToken } = require("./login");

const listingsPath = path.join(__dirname, "../data/listings.json");
const salesPath = path.join(__dirname, "../data/sales.json");
const bookingsPath = path.join(__dirname, "../data/bookings.json");
const clientsPath = path.join(__dirname, "../data/clients.json");
const paymentsPath = path.join(__dirname, "../data/payments.json");

function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return [];
  }
}

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
router.get("/feed", authenticateToken, (req, res) => {
  const landlordId = req.landlord.id;
  const landlordName = req.landlord.name;

  const listings = readJSON(listingsPath);
  const sales = readJSON(salesPath);
  const bookings = readJSON(bookingsPath);
  const clients = readJSON(clientsPath);
  const payments = readJSON(paymentsPath);

  // My Units
  const myUnits = listings
    .filter(l => l.landlordId === landlordId || l.landlord === landlordName)
    .reduce((sum, l) => sum + parseInt(l.units || "0"), 0);

  // Revenue
  const revenue = sales
    .filter(s => s.landlordId === landlordId || s.landlord === landlordName)
    .reduce((sum, s) => sum + parseInt(s.landlordShare.replace(/\D/g, "")), 0);

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
});

module.exports = router;
