// public/js/business-bookings.js

document.addEventListener("DOMContentLoaded", () => {
  const bookingsBtn = document.querySelector('li[data-content="Bookings"]');
  const contentArea = document.getElementById("content-area");

  if (bookingsBtn) {
    bookingsBtn.addEventListener("click", loadBookings);
  }

  async function loadBookings() {
    contentArea.innerHTML = "<p>Loading bookings...</p>";

    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();

      if (!Array.isArray(data)) {
        contentArea.innerHTML = "<p>Error loading bookings.</p>";
        return;
      }

      // Build table HTML
      let table = `
        <h2>Bookings</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Landlord</th>
              <th>Price (KSh)</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
      `;

      data.forEach((b) => {
        table += `
          <tr>
            <td>${b.landlordName}</td>
            <td>${b.price}</td>
            <td>${new Date(b.time).toLocaleString()}</td>
            <td>${b.status}</td>
          </tr>
        `;
      });

      table += `
          </tbody>
        </table>
      `;

      contentArea.innerHTML = table;
    } catch (error) {
      console.error(error);
      contentArea.innerHTML = "<p>Failed to load bookings.</p>";
    }
  }
});
