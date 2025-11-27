document.addEventListener("DOMContentLoaded", () => {
  const contentArea = document.getElementById("content-area");
  const listingsItem = document.querySelector('li[data-content="Listings"]');

  listingsItem.addEventListener("click", async () => {
    try {
      const res = await fetch("/api/listings");
      const data = await res.json();

      let tableHTML = `
        <h2>Listings</h2>
        <table>
          <thead>
            <tr>
              <th>Landlord</th>
              <th>Unit Type</th>
              <th>Units</th>
              <th>Price (KSh)</th>
            </tr>
          </thead>
          <tbody>
      `;

      data.forEach(item => {
        tableHTML += `
          <tr>
            <td>${item.landlord}</td>
            <td>${item.unit}</td>
            <td>${item.units}</td>
            <td>${item.price}</td>
          </tr>
        `;
      });

      tableHTML += `</tbody></table>`;
      contentArea.innerHTML = tableHTML;
    } catch (err) {
      contentArea.innerHTML = `<p>Error loading listings: ${err.message}</p>`;
    }
  });
});
