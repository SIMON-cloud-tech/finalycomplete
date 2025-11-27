document.addEventListener("DOMContentLoaded", () => {
  const contentArea = document.getElementById("content-area");
  const valuationItem = document.querySelector('li[data-content="Valuation"]');

  valuationItem.addEventListener("click", async () => {
    try {
      const res = await fetch("/api/valuation");
      const raw = await res.text(); // Read as text first

      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        // Show raw response to diagnose routing/content-type issues
        contentArea.innerHTML = `<p>Error loading valuation: Server did not return JSON.</p><pre>${raw}</pre>`;
        return;
      }

      if (!res.ok || !data.valuation) {
        contentArea.innerHTML = `<p>Error loading valuation: ${data.message || "No valuation data"}</p>`;
        return;
      }

      const { valuation, grandTotal } = data;

      let tableHTML = `
        <h2>Valuation</h2>
        <table>
          <thead>
            <tr>
              <th>Landlord</th>
              <th>Unit Type</th>
              <th>Units</th>
              <th>Price (KES)</th>
              <th>Location</th>
              <th>Total (KES)</th>
            </tr>
          </thead>
          <tbody>
      `;

      valuation.forEach(item => {
        tableHTML += `
          <tr>
            <td>${item.landlord || "Unknown"}</td>
            <td>${item.unit || ""}</td>
            <td>${item.units ?? ""}</td>
            <td>${(item.price ?? 0).toLocaleString()}</td>
            <td>${item.location || ""}</td>
            <td>${(item.total ?? 0).toLocaleString()}</td>
          </tr>
        `;
      });

      tableHTML += `
        <tr style="font-weight:bold; background:#eee;">
          <td colspan="5">Grand Total</td>
          <td>${(grandTotal ?? 0).toLocaleString()}</td>
        </tr>
      `;

      tableHTML += `</tbody></table>`;
      contentArea.innerHTML = tableHTML;
    } catch (err) {
      contentArea.innerHTML = `<p>Error loading valuation: ${err.message}</p>`;
    }
  });
});
