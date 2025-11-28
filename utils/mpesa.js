// utils/mpesa.js
const axios = require("axios");
/**
 * Get OAuth access token from Daraja
 */
async function getAccessToken() {
  const consumerKey = process.env.DARAJA_CONSUMER_KEY;
  const consumerSecret = process.env.DARAJA_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    throw new Error("Missing Daraja consumer key/secret in .env");
  }

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  const res = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    { headers: { Authorization: `Basic ${auth}` } }
  );

  return res.data.access_token;
}

/**
 * Send B2C payout to landlord's phone number
 */
async function sendB2C({ phone, amount }) {
  if (!phone) throw new Error("Phone number required for B2C payout");

  const token = await getAccessToken();

  const payload = {
    InitiatorName: process.env.DARAJA_INITIATOR,
    SecurityCredential: process.env.DARAJA_SECURITY_CRED,
    CommandID: "BusinessPayment",
    Amount: amount,
    PartyA: process.env.DARAJA_SHORTCODE, // your business shortcode
    PartyB: phone, // landlord phone number
    Remarks: "Landlord payout",
    QueueTimeOutURL: process.env.DARAJA_TIMEOUT_URL,
    ResultURL: process.env.DARAJA_RESULT_URL,
    Occasion: "HouseBooking"
  };

  const res = await axios.post(
    "https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest",
    payload,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return res.data;
}

/**
 * Send B2B payout to landlord's till or paybill number
 */
async function sendB2B({ tillNumber, paybillNumber, amount, bookingId }) {
  const token = await getAccessToken();

  const partyB = paybillNumber || tillNumber;
  if (!partyB) throw new Error("No till or paybill number provided for B2B payout");

  const payload = {
    Initiator: process.env.DARAJA_INITIATOR,
    SecurityCredential: process.env.DARAJA_SECURITY_CRED,
    CommandID: paybillNumber ? "BusinessPayBill" : "BusinessBuyGoods",
    SenderIdentifierType: "4", // shortcode
    RecieverIdentifierType: paybillNumber ? "4" : "2",
    Amount: amount,
    PartyA: process.env.DARAJA_SHORTCODE,
    PartyB: partyB,
    AccountReference: bookingId,
    Remarks: "Landlord payout",
    QueueTimeOutURL: process.env.DARAJA_TIMEOUT_URL,
    ResultURL: process.env.DARAJA_RESULT_URL
  };

  const res = await axios.post(
    "https://sandbox.safaricom.co.ke/mpesa/b2b/v1/paymentrequest",
    payload,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return res.data;
}

/**
 * Initiate STK Push for tenant checkout
 */
async function sendSTKPush({ phone, amount, bookingId }) {
  if (!phone) throw new Error("Tenant phone number required for STK Push");
  if (!amount) throw new Error("Amount required for STK Push");

  const token = await getAccessToken();

  // Generate timestamp in YYYYMMDDHHMMSS format
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);

  // Generate password: shortcode + passkey + timestamp → Base64
  const password = Buffer.from(
    `${process.env.DARAJA_SHORTCODE}${process.env.DARAJA_PASSKEY}${timestamp}`
  ).toString("base64");

  const payload = {
    BusinessShortCode: process.env.DARAJA_SHORTCODE, // your business shortcode (600000 in sandbox)
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: phone, // tenant phone number
    PartyB: process.env.DARAJA_SHORTCODE, // business shortcode receiving payment
    PhoneNumber: phone, // tenant phone again
    CallBackURL: process.env.CALLBACK_URL, // must be HTTPS and reachable
    AccountReference: bookingId,
    TransactionDesc: "Rent payment"
  };

  const res = await axios.post(
    "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
    payload,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return res.data;
}


module.exports = { sendB2C, sendB2B, sendSTKPush };

