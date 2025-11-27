// public/js/business-revenue.js
document.addEventListener("DOMContentLoaded", () => {
  const contentArea = document.getElementById("content-area");
  const revenueItem = document.querySelector('li[data-content="Revenue"]');

  revenueItem.addEventListener("click", async () => {
    try {
      const res = await fetch("/api/revenue");
      const data = await res.json();

      // Build table dynamically
      let tableHTML = `
        <h2>Revenue</h2>
        <table>
          <thead>
            <tr>
              <th>Landlord</th>
              <th>Client</th>
              <th>Amount</th>
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
            <td>${item.amount}</td>
            <td>${item.commission}</td>
          </tr>
        `;
      });

      tableHTML += `</tbody></table>`;
      contentArea.innerHTML = tableHTML;
    } catch (err) {
      contentArea.innerHTML = `<p>Error loading revenue: ${err.message}</p>`;
    }
  });
});
