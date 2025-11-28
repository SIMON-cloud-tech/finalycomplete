// public/js/business-listings.js
document.addEventListener("DOMContentLoaded", () => {
  const listingsBtn = document.querySelector('li[data-content="Listings"]');
  const contentArea = document.getElementById("content-area");

  if (listingsBtn) {
    listingsBtn.addEventListener("click", loadListings);
  }

  async function loadListings() {
    contentArea.innerHTML = "<p>Loading listings...</p>";

    try {
      const res = await fetch("/api/listings");
      const listings = await res.json();

      if (!Array.isArray(listings)) {
        contentArea.innerHTML = "<p>Error loading listings.</p>";
        return;
      }

      let html = `
        <h2>Listings</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Landlord</th>
              <th>Unit Type</th>
              <th>No. of Units</th>
              <th>Price (KSh)</th>
            </tr>
          </thead>
          <tbody>
      `;

      listings.forEach((l) => {
        html += `
          <tr>
            <td>${l.landlordName}</td>
            <td>${l.unitType}</td>
            <td>${l.units}</td>
            <td>${l.price}</td>
          </tr>
        `;
      });

      html += `
          </tbody>
        </table>
      `;

      contentArea.innerHTML = html;

    } catch (error) {
      console.error(error);
      contentArea.innerHTML = "<p>Failed to load listings.</p>";
    }
  }
});
