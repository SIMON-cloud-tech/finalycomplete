// public/js/business-bookings.js
document.addEventListener("DOMContentLoaded", () => {
  const contentArea = document.getElementById("content-area");
  const bookingsItem = document.querySelector('li[data-content="Bookings"]');

  bookingsItem.addEventListener("click", async () => {
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();

      // Build table dynamically
      let tableHTML = `
        <h2>Bookings</h2>
        <table>
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

      data.forEach(item => {
        tableHTML += `
          <tr>
            <td>${item.landlord}</td>
            <td>${item.price}</td>
            <td>${new Date(item.time).toLocaleString()}</td>
            <td>${item.status}</td>
          </tr>
        `;
      });

      tableHTML += `</tbody></table>`;
      contentArea.innerHTML = tableHTML;
    } catch (err) {
      contentArea.innerHTML = `<p>Error loading bookings: ${err.message}</p>`;
    }
  });
});
