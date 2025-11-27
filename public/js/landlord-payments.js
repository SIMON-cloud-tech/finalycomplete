document.addEventListener("DOMContentLoaded", () => {
  const contentArea = document.getElementById("content-area");
  const paymentsItem = document.querySelector('li[data-content="Payments"]');

  paymentsItem.addEventListener("click", async () => {
    try {
      const token = localStorage.getItem("landlordToken");
      if (!token) {
        contentArea.innerHTML = "<p>Please log in to view payments.</p>";
        return;
      }

      const res = await fetch("/api/landlord/payments", {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Ensure response is JSON
      const data = await res.json();

      if (!res.ok) {
        contentArea.innerHTML = `<p>Error: ${data.message}</p>`;
        return;
      }

      // Build table
      let tableHTML = `
        <h2>Payments</h2>
        <table class="payments-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Amount</th>
              <th>Revenue</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
      `;

      data.sales.forEach(s => {
        tableHTML += `
          <tr>
            <td>${s.client}</td>
            <td>${s.amount}</td>
            <td>${s.landlordShare}</td>
            <td>${s.time}</td>
          </tr>
        `;
      });

      tableHTML += `</tbody></table>`;
      contentArea.innerHTML = tableHTML;
    } catch (err) {
      console.error("🚨 Error loading payments:", err);
      contentArea.innerHTML = `<p>Error loading payments: ${err.message}</p>`;
    }
  });
});
