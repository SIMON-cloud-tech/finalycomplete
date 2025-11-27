// utils/mpesa.js
const axios = require("axios");

/**
 * Get OAuth access token from Daraja
 */
async function getAccessToken() {
  const consumerKey = process.env.DARAJA_CONSUMER_KEY;
  const consumerSecret = process.env.DARAJA_CONSUMER_SECRET;
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
 * - If paybillNumber is provided, it will be used
 * - If tillNumber is provided, it will be used
 */
async function sendB2B({ tillNumber, paybillNumber, amount }) {
  const token = await getAccessToken();

  // Choose PartyB based on priority: paybill → till
  const partyB = paybillNumber || tillNumber;
  if (!partyB) throw new Error("No till or paybill number provided for B2B payout");

  const payload = {
    Initiator: process.env.DARAJA_INITIATOR,
    SecurityCredential: process.env.DARAJA_SECURITY_CRED,
    CommandID: "BusinessPayBill", // can be BusinessPayBill or BusinessBuyGoods depending on use case
    SenderIdentifierType: "4", // shortcode
    RecieverIdentifierType: "4", // till/paybill
    Amount: amount,
    PartyA: process.env.DARAJA_SHORTCODE,
    PartyB: partyB,
    AccountReference: "HouseBooking",
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

module.exports = { sendB2C, sendB2B };
