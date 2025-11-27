// public/js/business-payments.js
document.addEventListener("DOMContentLoaded", () => {
  const contentArea = document.getElementById("content-area");
  const paymentsItem = document.querySelector('li[data-content="Payments"]');

  paymentsItem.addEventListener("click", async () => {
    try {
      const res = await fetch("/api/payments");
      const data = await res.json();

      // Build table dynamically
      let tableHTML = `
        <h2>Payments</h2>
        <table>
          <thead>
            <tr>
              <th>Landlord</th>
              <th>Client</th>
              <th>Total</th>
              <th>Commission</th>
            </tr>
          </thead>
          <tbody>
      `;

      data.forEach(item => {
        tableHTML += `
          <tr>
            <td>${item.landlord}</td>
            <td>${item.client}</td>
            <td>${item.total}</td>
            <td>${item.commission}</td>
          </tr>
        `;
      });

      tableHTML += `</tbody></table>`;
      contentArea.innerHTML = tableHTML;
    } catch (err) {
      contentArea.innerHTML = `<p>Error loading payments: ${err.message}</p>`;
    }
  });
});
