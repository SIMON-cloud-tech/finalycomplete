// routes/business-settings.js – simplified, no email/OTP
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const ADMIN_FILE = path.join(__dirname, '../data/admin.json');
const COMMISSION_FILE = path.join(__dirname, '../data/commissions.json');

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8') || '{}');
const write = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

// Update settings directly (no OTP)
router.post('/api/settings/update', (req, res) => {
  const { updates } = req.body;

  let admin = read(ADMIN_FILE);
  let commission = read(COMMISSION_FILE);

  if (updates.companyName) admin.companyName = updates.companyName;
  if (updates.phone) admin.phone = updates.phone;
  if (updates.password) {
    const bcrypt = require('bcryptjs');
    admin.password = bcrypt.hashSync(updates.password, 10);
  }
  if (updates.commissionRate !== undefined) {
    commission.rate = parseFloat(updates.commissionRate);
  }

  write(ADMIN_FILE, admin);
  write(COMMISSION_FILE, commission);

  res.json({ success: true, message: 'Settings updated!' });
});

module.exports = router;
