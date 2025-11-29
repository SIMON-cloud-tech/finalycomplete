// routes/business-settings.js – simplified, no email/OTP
const express = require('express');
const router = express.Router();
const fs = require('fs').promises; // use promises API
const path = require('path');
const bcrypt = require('bcryptjs');

const ADMIN_FILE = path.join(__dirname, '../data/admin.json');
const COMMISSION_FILE = path.join(__dirname, '../data/commissions.json');

// Utility: read JSON asynchronously
async function read(file) {
  try {
    const data = await fs.readFile(file, 'utf8');
    return JSON.parse(data || '{}');
  } catch {
    return {};
  }
}

// Utility: write JSON asynchronously
async function write(file, data) {
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf8');
}

// Update settings directly (no OTP)
router.post('/api/settings/update', async (req, res) => {
  try {
    const { updates } = req.body;

    let admin = await read(ADMIN_FILE);
    let commission = await read(COMMISSION_FILE);

    if (updates.companyName) admin.companyName = updates.companyName;
    if (updates.phone) admin.phone = updates.phone;
    if (updates.password) {
      admin.password = await bcrypt.hash(updates.password, 10); // async hash
    }
    if (updates.commissionRate !== undefined) {
      commission.rate = parseFloat(updates.commissionRate);
    }

    await write(ADMIN_FILE, admin);
    await write(COMMISSION_FILE, commission);

    res.json({ success: true, message: 'Settings updated!' });
  } catch (err) {
    console.error("Error updating settings:", err);
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
});

module.exports = router;
