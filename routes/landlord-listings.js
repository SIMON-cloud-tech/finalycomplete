// routes/landlord-listings.js
const express = require("express");
const fs = require("fs").promises; // async file system API
const path = require("path");
const multer = require("multer");
const { authenticateToken } = require("./login"); // JWT middleware

const router = express.Router();

// Paths
const listingsPath = path.join(__dirname, "../data/listings.json");
const uploadsDir = path.join(__dirname, "../public/assets/uploads");

// Ensure uploads directory exists
(async () => {
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
  } catch (err) {
    console.error("Error ensuring uploads directory:", err);
  }
})();

// Multer storage config
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadsDir),
  filename: (_, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    cb(null, `${base}_${timestamp}${ext}`);
  }
});

// Only accept common image types
const upload = multer({
  storage,
  fileFilter: (_, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Invalid file type. Only JPEG/PNG/WEBP are allowed."));
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Utility: read JSON safely
async function readJSON(filePath) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error parsing JSON:", err);
    return [];
  }
}

// Utility: write JSON
async function writeJSON(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

// GET /api/landlord/listings
router.get("/listings", authenticateToken, async (req, res) => {
  try {
    const all = await readJSON(listingsPath);
    const landlordId = req.landlord.id;

    let listings = all.filter(l => l.landlordId === landlordId);

    // Optional server-side filtering
    const { q, unit, location, price } = req.query;
    if (q) {
      const ql = q.toLowerCase();
      listings = listings.filter(l =>
        String(l.unit || "").toLowerCase().includes(ql) ||
        String(l.location || "").toLowerCase().includes(ql) ||
        String(l.price || "").includes(q)
      );
    }
    if (unit) listings = listings.filter(l => String(l.unit || "").toLowerCase() === unit.toLowerCase());
    if (location) listings = listings.filter(l => String(l.location || "").toLowerCase() === location.toLowerCase());
    if (price) listings = listings.filter(l => String(l.price || "") === String(price));

    res.json({ listings });
  } catch (err) {
    console.error("Error fetching listings:", err);
    res.status(500).json({ message: "Server error fetching listings." });
  }
});

// POST /api/landlord/listings
router.post(
  "/listings",
  authenticateToken,
  upload.single("image"),
  async (req, res) => {
    try {
      const all = await readJSON(listingsPath);
      const landlordId = req.landlord.id;

      // Validate required fields
      const { unit, units, location, price, description, paymentType, depositAmount } = req.body;
      if (!unit || !units || !location || !price) {
        return res.status(400).json({ message: "Missing required fields." });
      }

      // Parse and sanitize values
      const unitsInt = parseInt(units, 10);
      const priceInt = parseInt(price, 10);
      const depositInt = depositAmount ? parseInt(depositAmount, 10) : 0;

      if (Number.isNaN(unitsInt) || Number.isNaN(priceInt)) {
        return res.status(400).json({ message: "Units and price must be numbers." });
      }
      if (paymentType === "deposit-first" && Number.isNaN(depositInt)) {
        return res.status(400).json({ message: "Deposit amount must be a number when deposit-first is selected." });
      }

      // Image handling
      let imagePath = "";
      if (req.file) {
        imagePath = `/assets/uploads/${req.file.filename}`;
      }

      // Create new listing
      const newListing = {
        id: Date.now(),
        landlordId,
        unit,
        units: unitsInt,
        location,
        price: priceInt,
        description: description || "",
        imagePath,
        createdAt: new Date().toISOString(),

        // 🔽 New deposit-related fields
        paymentType: paymentType || "monthly",
        requiresDeposit: paymentType === "deposit-first",
        depositAmount: depositInt
      };

      all.push(newListing);
      await writeJSON(listingsPath, all);

      res.json({ message: "Listing created successfully.", listing: newListing });
    } catch (err) {
      console.error("Error creating listing:", err);
      res.status(500).json({ message: "Server error creating listing." });
    }
  }
);

module.exports = router;
