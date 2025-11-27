document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("landlordToken");
  if (!token) return;

  try {
    const res = await fetch("/api/landlord/feed", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();

    if (!res.ok) {
      console.error("Error fetching feed:", data.message);
      return;
    }
    // Populate landlord name in welcome section
      document.getElementById("landlordName").innerText = ` ${data.landlordName}`;

    // Populate cards
    document.getElementById("myUnits").innerText = `My Units: ${data.cards.myUnits}`;
    document.getElementById("revenue").innerText = `Revenue: KES ${data.cards.revenue}`;
    document.getElementById("valuation").innerText = `Bookings: ${data.cards.bookings}`;
    document.getElementById("currentGrowthStatus").innerText = `Clients: ${data.cards.clients}`;

    // Populate alerts
    const bookingAlertEl = document.getElementById("newBooking");
    bookingAlertEl.innerHTML = data.alerts.bookings
      .map(msg => `<li>${msg}</li>`)
      .join("");

    const paymentAlertEl = document.getElementById("newPayment");
    paymentAlertEl.innerHTML = data.alerts.payments
      .map(msg => `<li>${msg}</li>`)
      .join("");
  } catch (err) {
    console.error("🚨 Error loading dashboard feed:", err);
  }
});
