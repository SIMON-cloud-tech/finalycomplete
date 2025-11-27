// public/js/business-landlords.js
document.addEventListener("DOMContentLoaded", () => {
  const contentArea = document.getElementById("content-area");
  const landlordsItem = document.querySelector('li[data-content="Landlords"]');

  landlordsItem.addEventListener("click", async () => {
    try {
      const res = await fetch("/api/landlords");
      const data = await res.json();

      // Build table dynamically
      let tableHTML = `
        <h2>Landlords</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Units</th>
              <th>Location(s)</th>
            </tr>
          </thead>
          <tbody>
      `;

      data.forEach(item => {
        tableHTML += `
          <tr>
            <td>${item.name}</td>
            <td>${item.phone}</td>
            <td>${item.units}</td>
            <td>${item.location}</td>
          </tr>
        `;
      });

      tableHTML += `</tbody></table>`;
      contentArea.innerHTML = tableHTML;
    } catch (err) {
      contentArea.innerHTML = `<p>Error loading landlords: ${err.message}</p>`;
    }
  });
});
