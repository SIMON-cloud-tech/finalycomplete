// routes/callbacks.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const { sendB2C, sendB2B } = require("../utils/mpesa");

const router = express.Router();

// Utility functions
function readJSON(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const data = fs.readFileSync(filePath, "utf8");
  try { return JSON.parse(data); } catch { return []; }
}
function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

// ✅ STK Push callback handler
router.post("/callback", async (req, res) => {
  console.log("STK Push callback:", JSON.stringify(req.body, null, 2));

  const { Body } = req.body;
  const stkCallback = Body?.stkCallback;
  if (!stkCallback) return res.sendStatus(400);

  const resultCode = stkCallback.ResultCode;
  const resultDesc = stkCallback.ResultDesc;
  const metadata = stkCallback.CallbackMetadata?.Item || [];

  if (resultCode !== 0) {
    console.error("Tenant payment failed:", resultDesc);
    return res.sendStatus(200); // acknowledge Safaricom
  }

  // ✅ Extract bookingId from AccountReference
  const bookingId = metadata.find(i => i.Name === "AccountReference")?.Value
  const receipt = metadata.find(i => i.Name === "MpesaReceiptNumber")?.Value;

  // Paths
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

  const booking = bookings.find(b => String(b.id) === String(bookingId));
  if (!booking) {
    console.error("Booking not found for callback");
    return res.sendStatus(200);
  }

  if (booking.status === "paid") {
  console.log("Booking already processed, skipping duplicate callback");
  return res.sendStatus(200); 
  }
 
  const house = listings.find(h => h.id == booking.houseId);
  if (!house) {
  console.error("House not found for booking", bookingId);
  return res.sendStatus(200);
  } 

  const landlord = landlords.find(l => String(l.id) === String(house.landlordId));if (!landlord) {
  console.error("Landlord not found for house", house.id);
  return res.sendStatus(200);
  }

  // Commission + payout
const depositAmount = Number(booking.depositAmount) || 0;
const price = Number(booking.price) || 0;
const totalAmount = depositAmount ? price + depositAmount : price;

const amountPaid = Number(metadata.find(i => i.Name === "Amount")?.Value || 0);
if (amountPaid !== totalAmount) {
  console.warn(`Callback amount ${amountPaid} does not match expected total ${totalAmount}`);
}

const commissionRate = commissionConfig.commissionRate || 0.1;
const commissionAmount = totalAmount * commissionRate;
const landlordPayout = totalAmount - commissionAmount;

  booking.status = "paid";
  writeJSON(bookingsPath, bookings);

  // 🔽 Reduce units count for the house once payment is confirmed
    if (house.units && house.units > 0) {
       house.units -= 1;
       // Optionally mark as unavailable if units reach 0
       if (house.units === 0) {
        house.status = "unavailable";
       }

  writeJSON(listingsPath, listings);
  }

  try {
    let darajaResponse;
    if (landlord.paybillNumber) {
      darajaResponse = await sendB2B({ paybillNumber: landlord.paybillNumber, amount: landlordPayout });
    } else if (landlord.tillNumber) {
      darajaResponse = await sendB2B({ tillNumber: landlord.tillNumber, amount: landlordPayout });
    } else if (landlord.phone) {
      darajaResponse = await sendB2C({ phone: landlord.phone, amount: landlordPayout });
    }
    console.log("Daraja payout response:", JSON.stringify(darajaResponse, null, 2));
  } catch (err) {
    console.error("Daraja payout error:", err.message);
  }

  // Record payment + sale
  const paymentId = payments.length + 1;
  payments.push({
    id: paymentId,
    bookingId,
    amount: totalAmount,
    commission: commissionAmount,
    landlordPayout,
    landlordId: landlord.id,
    landlordName: landlord.name,
    landlordPhone: landlord.phone,
    receipt,
    paidAt: new Date().toISOString()
  });
  writeJSON(paymentsPath, payments);

  const saleId = sales.length + 1;
  sales.push({
    id: saleId,
    bookingId,
    amount: totalAmount,
    commission: commissionAmount,
    landlordPayout,
    landlordId: landlord.id,
    completedAt: new Date().toISOString()
  });
  writeJSON(salesPath, sales);

  landlord.balance = (landlord.balance || 0) + landlordPayout;
  writeJSON(landlordsPath, landlords);

  res.sendStatus(200); // always acknowledge Safaricom
});

module.exports = router;
