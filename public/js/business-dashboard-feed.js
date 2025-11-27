// public/js/business-dashboard-feed.js
document.addEventListener("DOMContentLoaded", () => {
  async function loadDashboard() {
    try {
      const res = await fetch("/api/dashboard-feed");
      const data = await res.json();

      // ✅ Feed cards
      document.getElementById("users").innerText =
        `Users: ${data.users}`;
      document.getElementById("monthlyRevenue").innerText =
        `Revenue: ${data.revenue}`; // already formatted by backend
      document.getElementById("currentGrowthStatus").innerText =
        `Growth: ${data.growth}%`;
      document.getElementById("registeredLandlords").innerText =
        `Landlords: ${data.landlordCount}`;
      document.getElementById("valuation").innerText =
        `Valuation: ${data.valuation}`; // already formatted by backend

      // ✅ Alerts
      document.getElementById("newBooking").innerText = data.alerts.booking
        ? `Booking by client ${data.alerts.booking.clientId} with ${data.alerts.booking.landlord} at ${data.alerts.booking.time}`
        : "No recent booking";

      document.getElementById("newPayment").innerText = data.alerts.payment
        ? `Payment of ${data.alerts.payment.amount} by ${data.alerts.payment.client}`
        : "No recent payment";

      document.getElementById("newLandlord").innerText = data.alerts.landlord
        ? `${data.alerts.landlord.name} joined us`
        : "No recent landlord";
    } catch (err) {
      console.error("Error loading dashboard feed:", err);
    }
  }

  // Auto-load on page ready
  loadDashboard();
});
