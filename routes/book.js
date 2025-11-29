const express = require("express");
const fs = require("fs").promises; // use promises API
const path = require("path");
const bcrypt = require("bcryptjs");

const router = express.Router();

// Helper: read JSON file safely
async function readJSON(filePath) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Helper: write JSON file safely
async function writeJSON(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

// POST /api/book → create booking
router.post("/book", async (req, res) => {
  const { houseId, name, email, password, price, tenantPhone } = req.body;

  if (!houseId || !name || !email || !password || !tenantPhone) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const clientsPath = path.join(__dirname, "../data/clients.json");
  const bookingsPath = path.join(__dirname, "../data/bookings.json");
  const listingsPath = path.join(__dirname, "../data/listings.json");
  const landlordsPath = path.join(__dirname, "../data/landlords.json");

  // Load clients, bookings, and listings asynchronously
  let clients = await readJSON(clientsPath);
  let bookings = await readJSON(bookingsPath);
  let listings = await readJSON(listingsPath);
  const landlords = await readJSON(landlordsPath);

  // Check if client exists
  let client = clients.find(c => c.email === email);
  if (!client) {
    const hashedPassword = await bcrypt.hash(password, 10); // async hash
    client = {
      id: clients.length + 1,
      name,
      email,
      password: hashedPassword
    };
    clients.push(client);
    await writeJSON(clientsPath, clients);
  }

  // Find landlord info and deposit info from listings
  const house = listings.find(l => String(l.id) === String(houseId));
  const landlordId = house ? house.landlordId : null;
  const landlordName = landlordId
    ? (landlords.find(ld => String(ld.id) === String(landlordId))?.name || "Unknown")
    : "Unknown";

  // Create booking (enriched with deposit fields)
  const bookingId = bookings.length + 1;
  const now = new Date().toISOString();
  const booking = {
    id: bookingId,
    houseId,
    tenantPhone,
    clientId: client.id,
    price,
    status: "pending",
    createdAt: now,
    landlordId,
    landlord: landlordName,
    time: now,
    depositAmount: house && house.paymentType === "deposit-first" ? house.depositAmount : 0,
    depositPaid: house && house.paymentType === "deposit-first" ? true : false,
    depositRefunded: false,
    refundDate: null
  };

  bookings.push(booking);
  await writeJSON(bookingsPath, bookings);

  res.json({ bookingId, booking });
});

// GET /api/bookings → list all bookings
router.get("/bookings", async (req, res) => {
  const bookingsPath = path.join(__dirname, "../data/bookings.json");
  const bookings = await readJSON(bookingsPath);
  res.json(bookings);
});

// GET /api/bookings/:id → fetch single booking by ID
router.get("/bookings/:id", async (req, res) => {
  const bookingsPath = path.join(__dirname, "../data/bookings.json");
  const bookings = await readJSON(bookingsPath);

  const bookingId = parseInt(req.params.id, 10);
  const booking = bookings.find(b => Number(b.id) === bookingId);

  if (!booking) {
    console.log("DEBUG: Requested ID", bookingId, "Available IDs:", bookings.map(b => b.id));
    return res.status(404).json({ error: "Booking not found" });
  }

  res.json(booking);
});

// PATCH /api/bookings/:id/refund → mark deposit refunded
router.patch("/bookings/:id/refund", async (req, res) => {
  const bookingsPath = path.join(__dirname, "../data/bookings.json");
  let bookings = await readJSON(bookingsPath);

  const bookingId = parseInt(req.params.id, 10);
  const booking = bookings.find(b => Number(b.id) === bookingId);

  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }

  // Only update if deposit was paid
  if (booking.depositPaid) {
    booking.depositRefunded = true;
    booking.refundDate = new Date().toISOString();
    await writeJSON(bookingsPath, bookings);
    return res.json({ message: "Deposit refunded", booking });
  } else {
    return res.status(400).json({ error: "No deposit to refund for this booking" });
  }
});

module.exports = router;
