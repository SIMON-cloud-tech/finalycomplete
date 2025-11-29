// routes/landlord-bookings.js
const express = require("express");
const fs = require("fs").promises; // async file system API
const path = require("path");
const router = express.Router();
const { authenticateToken } = require("./login"); // ✅ JWT middleware

const bookingsPath = path.join(__dirname, "../data/bookings.json");
const listingsPath = path.join(__dirname, "../data/listings.json");
const clientsPath = path.join(__dirname, "../data/clients.json");

// Utility: read JSON safely
async function readJSON(filePath) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// GET /api/landlord/bookings
router.get("/landlord/bookings", authenticateToken, async (req, res) => {
  try {
    const landlordId = req.landlord.id; // ✅ landlord ID comes from JWT

    // Read all files concurrently
    const [bookings, listings, clients] = await Promise.all([
      readJSON(bookingsPath),
      readJSON(listingsPath),
      readJSON(clientsPath)
    ]);

    const landlordBookings = bookings
      .filter(b => String(b.landlordId) === String(landlordId))
      .map(b => {
        const house = listings.find(h => String(h.id) === String(b.houseId));
        const client = clients.find(c => c.id === b.clientId);

        return {
          clientName: client?.name || "Unknown",
          clientPhone: b.tenantPhone,
          unit: house?.unit || `House ${b.houseId}`,
          location: house?.location || "Unknown",
          price: house?.price || 0,
          status: b.status
        };
      });

    res.json(landlordBookings);
  } catch (err) {
    console.error("Error fetching landlord bookings:", err);
    res.status(500).json({ message: "Server error fetching bookings." });
  }
});

module.exports = router;
