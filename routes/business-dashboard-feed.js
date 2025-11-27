const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

function readJSON(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

// Format numbers with commas
function formatNumber(num) {
  return Number(num || 0).toLocaleString("en-KE");
}

// Format KES values consistently
function formatKES(value) {
  // Ensure value is treated as string before replace
  const strValue = String(value || "0");
  const numeric = parseInt(strValue.replace(/\D/g, "")) || 0;
  return `KES ${formatNumber(numeric)}`;
}

// Format time like "9:10 PM"
function formatTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-KE", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}

router.get("/dashboard-feed", (req, res) => {
  const listings = readJSON(path.join(__dirname, "../data/listings.json"));
  const sales = readJSON(path.join(__dirname, "../data/sales.json"));
  const landlords = readJSON(path.join(__dirname, "../data/landlords.json"));
  const bookings = readJSON(path.join(__dirname, "../data/bookings.json"));
  const payments = readJSON(path.join(__dirname, "../data/payments.json"));

  // Valuation: sum of units × price
  const valuationRaw = listings.reduce((sum, l) => sum + (l.units * l.price), 0);

  // Revenue: sum of landlordShare from sales.json
  const revenueRaw = sales.reduce((sum, s) => {
    const strShare = String(s.landlordShare || "0");
    const share = parseInt(strShare.replace(/\D/g, "")) || 0;
    return sum + share;
  }, 0);

  // Growth % = (revenue / valuation) × 100
  const growth = valuationRaw > 0 ? ((revenueRaw / valuationRaw) * 100).toFixed(2) : "0";

  // Landlords count
  const landlordCount = Array.isArray(landlords) ? landlords.length : 0;

  // Users = landlords + clients (from sales.json)
  const clientsCount = Array.isArray(sales) ? sales.length : 0;
  const users = landlordCount + clientsCount;

  // Alerts
  const latestBooking = bookings[bookings.length - 1] || null;
  const latestPayment = payments[payments.length - 1] || null;
  const latestLandlord = landlords[landlords.length - 1] || null;

  const alerts = {
    booking: latestBooking
      ? {
          clientId: latestBooking.clientId,
          time: formatTime(latestBooking.time || latestBooking.createdAt),
          landlord: latestBooking.landlord
        }
      : null,
    payment: latestPayment
      ? {
          client: latestPayment.client,
          amount: formatKES(latestPayment.amount),
          time: latestPayment.dateTime
        }
      : null,
    landlord: latestLandlord
      ? {
          name: latestLandlord.name,
          joinedAt: latestLandlord.createdAt
            ? formatTime(latestLandlord.createdAt)
            : "time not recorded"
        }
      : null
  };

  res.json({
    users,
    valuation: formatKES(valuationRaw),
    revenue: formatKES(revenueRaw),
    growth,
    landlordCount,
    alerts
  });
});

module.exports = router;
