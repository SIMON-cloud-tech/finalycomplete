// routes/payment.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const { sendB2C, sendB2B } = require("../utils/mpesa"); // import Daraja utils

const router = express.Router();

// Utility functions for reading/writing JSON safely
function readJSON(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const data = fs.readFileSync(filePath, "utf8");
  try { return JSON.parse(data); } catch { return []; }
}
function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

// POST /api/payment → process a client checkout
router.post("/payment", async (req, res) => {
  const { bookingId } = req.body;
  if (!bookingId) return res.status(400).json({ error: "Booking ID required" });

  // Paths to data files
  const bookingsPath = path.join(__dirname, "../data/bookings.json");
  const listingsPath = path.join(__dirname, "../data/listings.json");
  const paymentsPath = path.join(__dirname, "../data/payments.json");
  const salesPath = path.join(__dirname, "../data/sales.json");
  const commissionsPath = path.join(__dirname, "../data/commissions.json");
  const landlordsPath = path.join(__dirname, "../data/landlords.json");

  // Load data
  let bookings = readJSON(bookingsPath);
  let listings = readJSON(listingsPath);
  let payments = readJSON(paymentsPath);
  let sales = readJSON(salesPath);
  let commissionConfig = readJSON(commissionsPath);
  let landlords = readJSON(landlordsPath);

  // Find booking
  const booking = bookings.find(b => b.id == bookingId);
  if (!booking) return res.status(404).json({ error: "Booking not found" });

  // Find house from listings
  const house = listings.find(h => h.id == booking.houseId);
  if (!house) return res.status(404).json({ error: "House not found" });

  // Find landlord by name from house.landlord
  const landlord = landlords.find(
    l => l.name.toLowerCase() === house.landlord.toLowerCase()
  );
  if (!landlord) return res.status(404).json({ error: "Landlord not found" });

  // Commission rate (default 10% if not set)
  const commissionRate = commissionConfig.commissionRate || 0.1;
  const commissionAmount = booking.price * commissionRate;
  const landlordPayout = booking.price - commissionAmount;

  // Mark booking as paid
  booking.status = "paid";
  writeJSON(bookingsPath, bookings);

  // ✅ Rotating payout logic: Paybill → Till → Phone
  try {
    if (landlord.paybillNumber) {
      await sendB2B({ paybillNumber: landlord.paybillNumber, amount: landlordPayout });
    } else if (landlord.tillNumber) {
      await sendB2B({ tillNumber: landlord.tillNumber, amount: landlordPayout });
    } else if (landlord.phone) {
      await sendB2C({ phone: landlord.phone, amount: landlordPayout });
    } else {
      throw new Error("No payout method defined for landlord");
    }
  } catch (err) {
    console.error("Daraja payout error:", err.message);
    return res.status(500).json({ error: "Failed to remit payout via M-Pesa" });
  }

  // Record payment
  const paymentId = payments.length + 1;
  const payment = {
    id: paymentId,
    bookingId,
    amount: booking.price,
    commission: commissionAmount,
    landlordPayout,
    landlordId: landlord.id,
    landlordName: landlord.name,
    landlordPhone: landlord.phone,
    tillNumber: landlord.tillNumber,
    paybillNumber: landlord.paybillNumber,
    paidAt: new Date().toISOString()
  };
  payments.push(payment);
  writeJSON(paymentsPath, payments);

  // Record sale
  const saleId = sales.length + 1;
  const sale = {
    id: saleId,
    bookingId,
    amount: booking.price,
    commission: commissionAmount,
    landlordPayout,
    landlordId: landlord.id,
    completedAt: new Date().toISOString()
  };
  sales.push(sale);
  writeJSON(salesPath, sales);

  // Update landlord balance
  landlord.balance = (landlord.balance || 0) + landlordPayout;
  writeJSON(landlordsPath, landlords);

  // Respond instantly to client with breakdown
  res.json({
    paymentId,
    commission: commissionAmount,
    landlordPayout,
    landlordName: landlord.name,
    landlordPhone: landlord.phone,
    tillNumber: landlord.tillNumber,
    paybillNumber: landlord.paybillNumber,
    message: `Payment successful! Commission: KSh ${commissionAmount}, Landlord payout: KSh ${landlordPayout} sent to ${landlord.name} via ${landlord.paybillNumber || landlord.tillNumber || landlord.phone}`
  });
});

module.exports = router;
