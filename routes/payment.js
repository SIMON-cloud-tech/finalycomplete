// routes/payment
const express = require("express");
const fs = require("fs");
const path = require("path");
const { sendSTKPush } = require("../utils/mpesa"); // ✅ only STK here

const router = express.Router();

// Utility functions for reading/writing JSON safely
function readJSON(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const data = fs.readFileSync(filePath, "utf8");
  try { return JSON.parse(data); } catch { return []; }
}

// POST /api/payment → initiate tenant checkout
router.post("/payment", async (req, res) => {
  const { bookingId } = req.body;
  if (!bookingId) return res.status(400).json({ error: "Booking ID required" });

  // Load bookings
  const bookingsPath = path.join(__dirname, "../data/bookings.json");
  let bookings = readJSON(bookingsPath);

  // Find booking
  const booking = bookings.find(b => b.id == bookingId);
  if (!booking) return res.status(404).json({ error: "Booking not found" });

  // ✅ Initiate STK Push to collect payment from tenant
  try {
    const stkResponse = await sendSTKPush({
      phone: booking.tenantPhone,   // tenant phone must be stored in booking
      amount: Number(booking.price),
      bookingId: booking.id 
    });

    console.log("STK Push response:", JSON.stringify(stkResponse, null, 2));

   return res.json({
  message: `STK Push initiated for booking ${booking.id}. Await tenant confirmation.`,
  merchantRequestId: stkResponse.MerchantRequestID,
  checkoutRequestId: stkResponse.CheckoutRequestID,
  tenantPhone: booking.tenantPhone,
  amount: Number(booking.price)
});

  
  } catch (err) {
    console.error("STK Push error:", err.message);
    return res.status(500).json({ error: "Failed to initiate tenant payment" });
  }
});

module.exports = router;
