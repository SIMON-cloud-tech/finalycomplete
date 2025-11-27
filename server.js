require("dotenv").config(); // load .env for SendGrid keys etc.
const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

/* ---------------- Middleware ---------------- */
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

/* ---------------- Core Routes ---------------- */
const paymentRoutes = require("./routes/payment");
const shopRoute = require("./routes/shop");
const contactRoutes = require("./routes/contact");
const bookRoutes = require("./routes/book");
const testimonialRoutes = require("./routes/testimonials");
const setupRoute = require("./routes/setup");
const activationRoutes = require("./routes/activation");
const businessActivationLoginRoutes = require("./routes/business-activation-login");
const clientLoginRoutes = require("./routes/client-login");
const clientDashboardRoutes = require("./routes/client-dashboard");
const listingsRoutes = require("./routes/listings");
const authRoutes = require('./routes/authRoutes');


/* ---------------- Business Dashboard Routes ---------------- */
const businessListingsRoute = require("./routes/business-listings");
const businessLandlordsRoute = require("./routes/business-landlords");
const businessPaymentsRoute = require("./routes/business-payments");
const businessBookingsRoute = require("./routes/business-bookings");
const businessValuationRoutes = require("./routes/business-valuation");
const businessRevenueRoute = require("./routes/business-revenue");
const businessAnalyticsRoute = require("./routes/business-analytics");
const businessSettingsRoute = require("./routes/business-settings");
const businessDashboardFeedRoute = require("./routes/business-dashboard-feed");
const manageLandlordsRoute = require("./routes/business-manage-landlords");


/* ---------------- Landlord Dashboard Routes ---------------- */
const landlordRegisterRoutes = require("./routes/register");
const landlordLoginRoutes = require("./routes/login");
const landlordPaymentsRoutes = require("./routes/landlord-payments");
const landlordValuationRoutes = require("./routes/landlord-valuation");
const landlordAnalyticsRoutes = require("./routes/landlord-analytics");
const landlordFeedRoutes = require("./routes/landlord-dashboard-feed");
const landlordListingsRoutes = require("./routes/landlord-listings");
const landlordSettingsRoutes = require("./routes/landlord-settings");
const signoutRoutes = require("./routes/signout");

/* ---------------- Mount Routes ---------------- */
// Core
app.use("/api", paymentRoutes);
app.use("/api", contactRoutes);
app.use("/api", shopRoute);
app.use("/api", bookRoutes);
app.use("/", testimonialRoutes);
app.use("/api", setupRoute);
app.use("/api", activationRoutes);
app.use("/api", businessActivationLoginRoutes);
app.use("/api", clientLoginRoutes);
app.use("/api", clientDashboardRoutes);
app.use("/api", listingsRoutes);
app.use('/api/auth', authRoutes);

// Business Dashboard
app.use("/api", businessLandlordsRoute);
app.use("/api/listings", businessListingsRoute);
app.use("/api", businessPaymentsRoute);
app.use("/api", businessBookingsRoute);
app.use("/api/valuation", businessValuationRoutes);
app.use("/api", businessRevenueRoute);
app.use("/api", businessAnalyticsRoute);
app.use("/api", businessDashboardFeedRoute);
app.use("/", businessSettingsRoute);
app.use("/api/manage-landlords", manageLandlordsRoute);

// Landlord Dashboard
app.use("/api/landlord", landlordPaymentsRoutes);
app.use("/api/landlord-valuation", landlordValuationRoutes);
app.use("/api/landlord", landlordAnalyticsRoutes);
app.use("/api/landlord", landlordFeedRoutes);
app.use("/api/landlord", landlordListingsRoutes);
app.use("/api/landlord", landlordSettingsRoutes);
app.use("/api/landlords", landlordRegisterRoutes);
app.use("/api/landlords", landlordLoginRoutes.router);
app.use("/api/signout", signoutRoutes);

/* ---------------- Root Route ---------------- */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ---------------- Start Server ---------------- */
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
