// ../js/landlord-valuation.js
document.addEventListener("DOMContentLoaded", () => {
  const contentArea = document.getElementById("content-area");
  const valuationItem = document.querySelector('li[data-content="Valuation"]');

  // Utility: format numbers with commas
  function formatNumber(num) {
    if (num === null || num === undefined) return "";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  valuationItem.addEventListener("click", async () => {
    try {
      const token = localStorage.getItem("landlordToken");
      if (!token) {
        contentArea.innerHTML = "<p>Please log in to view valuation.</p>";
        return;
      }

      const res = await fetch("/api/landlord-valuation", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (!res.ok) {
        contentArea.innerHTML = `<p>Error: ${data.message}</p>`;
        return;
      }

      if (!data.rows || data.rows.length === 0) {
        contentArea.innerHTML = "<p>No valuation data available.</p>";
        return;
      }

      // Build table
      let tableHTML = `
        <h2>Valuation</h2>
        <table class="valuation-table">
          <thead>
            <tr>
              <th>Unit</th>
              <th>No</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
      `;

      data.rows.forEach(row => {
        tableHTML += `
          <tr>
            <td>${row.unit}</td>
            <td>${formatNumber(row.no)}</td>
            <td>${formatNumber(row.price)}</td>
            <td>${formatNumber(row.total)}</td>
          </tr>
        `;
      });

      tableHTML += `
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3"><strong>Grand Total</strong></td>
              <td><strong>${formatNumber(data.grandTotal)}</strong></td>
            </tr>
          </tfoot>
        </table>
      `;

      contentArea.innerHTML = tableHTML;
    } catch (err) {
      console.error("🚨 Error loading valuation:", err);
      contentArea.innerHTML = `<p>Error loading valuation: ${err.message}</p>`;
    }
  });
});
