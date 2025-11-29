// routes/client-signout.js
const express = require("express");
const fs = require("fs").promises; // async file system API
const path = require("path");
const router = express.Router();
const { authenticateToken } = require("./login");

const bookingsPath = path.join(__dirname, "../data/bookings.json");
const listingsPath = path.join(__dirname, "../data/listings.json");
const clientsPath = path.join(__dirname, "../data/clients.json");
const archivesPath = path.join(__dirname, "../data/archives.json");

// Utility: read JSON safely
async function readJSON(filePath) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Utility: write JSON safely
async function writeJSON(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

// POST /api/client/signout
router.post("/client/signout", authenticateToken, async (req, res) => {
  const clientId = req.client?.id;
  if (!clientId) {
    return res.status(403).json({ message: "Unauthorized client." });
  }

  try {
    let [bookings, listings, clients, archives] = await Promise.all([
      readJSON(bookingsPath),
      readJSON(listingsPath),
      readJSON(clientsPath),
      readJSON(archivesPath)
    ]);

    // Cancel and archive pending bookings
    bookings.forEach(b => {
      if (String(b.clientId) === String(clientId) && b.status === "pending") {
        b.status = "cancelled";
        archives.push({
          type: "booking",
          ...b,
          archivedAt: new Date().toISOString()
        });

        const house = listings.find(h => String(h.id) === String(b.houseId));
        if (house) house.units = (house.units || 0) + 1;
      }
    });

    // Archive client record itself
    const clientIndex = clients.findIndex(c => String(c.id) === String(clientId));
    if (clientIndex !== -1) {
      const clientRecord = clients[clientIndex];
      archives.push({
        type: "client",
        ...clientRecord,
        archivedAt: new Date().toISOString()
      });
      clients.splice(clientIndex, 1);
    }

    // Persist updates
    await Promise.all([
      writeJSON(bookingsPath, bookings),
      writeJSON(listingsPath, listings),
      writeJSON(clientsPath, clients),
      writeJSON(archivesPath, archives)
    ]);

    res.json({
      message: "Signed out successfully. Client record and pending bookings archived."
    });
  } catch (err) {
    console.error("Error during client signout:", err);
    res.status(500).json({ message: "Server error during signout." });
  }
});

module.exports = router;
