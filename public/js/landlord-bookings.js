document.addEventListener("DOMContentLoaded", () => {
  const contentArea = document.getElementById("content-area");
  const bookingsItem = document.querySelector('li[data-content="Bookings"]');
  const token = localStorage.getItem("landlordToken");

  bookingsItem.addEventListener("click", async () => {
    if (!token) {
      contentArea.innerHTML = "<p>Please log in to view bookings.</p>";
      return;
    }
    renderBookingsUI();
    await loadBookings();
  });

  function renderBookingsUI() {
    contentArea.innerHTML = `
      <h2>Tenant Bookings</h2>
      <table class="bookings-table">
        <thead>
          <tr>
            <th>Client</th>
            <th>Phone</th>
            <th>Unit</th>
            <th>Location</th>
            <th>Price (KES)</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody id="bookingsTableBody"></tbody>
      </table>
    `;
  }

  async function loadBookings() {
    try {
      const res = await fetch("/api/landlord/bookings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok) {
        contentArea.innerHTML = `<p>Error: ${data.message || "Failed to load bookings"}</p>`;
        return;
      }

      renderTable(data.bookings || data); // route returns array or {bookings}
    } catch (err) {
      contentArea.innerHTML = `<p>Error loading bookings: ${err.message}</p>`;
    }
  }

  function renderTable(bookings) {
    const tbody = document.getElementById("bookingsTableBody");
    if (!bookings || bookings.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6">No bookings found.</td></tr>`;
      return;
    }

    tbody.innerHTML = bookings.map(b => `
      <tr>
        <td>${escapeHTML(b.clientName)}</td>
        <td>${escapeHTML(b.clientPhone)}</td>
        <td>${escapeHTML(b.unit)}</td>
        <td>${escapeHTML(b.location)}</td>
        <td>${escapeHTML(b.price)}</td>
        <td>${escapeHTML(b.status)}</td>
      </tr>
    `).join("");
  }

  // Simple escape to avoid XSS in text context
  function escapeHTML(str) {
    return String(str || "").replace(/[&<>"]/g, s => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;"
    })[s]);
  }
});
