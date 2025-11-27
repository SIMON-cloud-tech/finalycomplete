document.addEventListener("DOMContentLoaded", () => {
  const contentArea = document.getElementById("content-area");
  const listingsItem = document.querySelector('li[data-content="Listings"]');
  const token = localStorage.getItem("landlordToken");

  let allListings = []; // cache for search and "see more"

  listingsItem.addEventListener("click", async () => {
    if (!token) {
      contentArea.innerHTML = "<p>Please log in to manage listings.</p>";
      return;
    }
    renderListingsUI(); // Build the form, search, table, and grid containers
    await loadListings(); // Fetch and render data
  });

  function renderListingsUI() {
    contentArea.innerHTML = `
      <h2>Manage Listings</h2>

      <!-- Create form -->
      <form id="listingForm" class="listing-form" enctype="multipart/form-data">
        <div class="form-row">
          <label>Unit</label>
          <input type="text" id="unit" placeholder="e.g., 2 Bedroom" required />
        </div>
        <div class="form-row">
          <label>Units (Qty)</label>
          <input type="number" id="units" min="1" placeholder="e.g., 10" required />
        </div>
        <div class="form-row">
          <label>Location</label>
          <input type="text" id="location" placeholder="e.g., Kakamega" required />
        </div>
        <div class="form-row">
          <label>Price (KES)</label>
          <input type="number" id="price" min="0" placeholder="e.g., 15000" required />
        </div>
        <div class="form-row">
           <label>Payment Type</label>
           <select id="paymentType" required>
           <option value="monthly">Monthly Rent Only</option>
           <option value="deposit-first">Deposit + Rent</option>
         </select>
      </div>

     <div class="form-row" id="depositRow">
      <label>Deposit Amount (KES)</label>
      <input type="number" id="depositAmount" min="0" placeholder="e.g., 5000" />
      </div>

        <div class="form-row">
          <label>Description</label>
          <textarea id="description" rows="3" placeholder="House details..."></textarea>
        </div>
        <div class="form-row">
          <label>Image</label>
          <input type="file" id="image" accept="image/jpeg,image/png,image/webp" />
        </div>
        <div class="form-row">
          <label>Preview</label>
          <img id="imagePreview" src="" alt="Preview" style="max-width:200px; display:none; border:1px solid #ddd;" />
        </div>
        <button type="submit">Create Listing</button>
      </form>

      <!-- Search bar -->
      <div class="search-bar">
        <input type="text" id="searchInput" placeholder="Search by unit, location, or price..." />
        <button id="searchBtn">Search</button>
        <button id="clearSearchBtn">Clear</button>
      </div>

      <!-- Table -->
      <h3>Listings Table</h3>
      <table class="listings-table">
        <thead>
          <tr>
            <th>Unit</th>
            <th>No.</th>
            <th>Location</th>
            <th>Price (KES)</th>
            <th>Payment Type</th>
            <th>Deposit (KES)</th>
          </tr>
        </thead>
        <tbody id="listingsTableBody"></tbody>
      </table>

      <!-- Grid -->
      <h3>Latest Houses</h3>
      <div id="cardsGrid" class="house-grid"></div>
      <p id="seeMore" style="cursor:pointer;color:#007bff;text-decoration:underline;">See more</p>
    `;

      // Toggle deposit field enable/disable (greyed out when not needed)
     const paymentTypeSelect = document.getElementById("paymentType");
     const depositInput = document.getElementById("depositAmount");

     // Start disabled and greyed
     depositInput.disabled = true;
     depositInput.style.backgroundColor = "#f0f0f0";
     depositInput.style.color = "#888";

      paymentTypeSelect.addEventListener("change", () => {
      if (paymentTypeSelect.value === "deposit-first") {
      depositInput.disabled = false;
      depositInput.style.backgroundColor = "#fff";
      depositInput.style.color = "#000";
    } else {
    depositInput.disabled = true;
    depositInput.value = "";
    depositInput.style.backgroundColor = "#f0f0f0";
    depositInput.style.color = "#888";
    }
   })
   
    // Image preview handler
    const imageInput = document.getElementById("image");
    const preview = document.getElementById("imagePreview");
    imageInput.addEventListener("change", () => {
      const file = imageInput.files[0];
      if (!file) {
        preview.style.display = "none";
        preview.src = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = e => {
        preview.src = e.target.result;
        preview.style.display = "block";
      };
      reader.readAsDataURL(file);
    });

    // Submit handler
    document.getElementById("listingForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData();
      formData.append("unit", document.getElementById("unit").value.trim());
      formData.append("units", document.getElementById("units").value.trim());
      formData.append("location", document.getElementById("location").value.trim());
      formData.append("price", document.getElementById("price").value.trim());
      formData.append("paymentType", document.getElementById("paymentType").value);
      formData.append("depositAmount", document.getElementById("depositAmount").value.trim());
      formData.append("description", document.getElementById("description").value.trim());
      const imageFile = document.getElementById("image").files[0];
      if (imageFile) formData.append("image", imageFile);

      try {
        const res = await fetch("/api/landlord/listings", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
        const data = await res.json();

        if (!res.ok) {
          showToast(`Error: ${data.message || "Failed to create listing"}`, "error");
          return;
        }

       showToast("Listing created successfully.", "success");
        // Reset form and preview
        e.target.reset();
        const previewEl = document.getElementById("imagePreview");
        previewEl.src = "";
        previewEl.style.display = "none";

        // Reload listings
        await loadListings();
      } catch (err) {
        alert(`Error: ${err.message}`);
      }
    });

    // Search handlers
    document.getElementById("searchBtn").addEventListener("click", () => {
      const q = document.getElementById("searchInput").value.trim().toLowerCase();
      const filtered = allListings.filter(l =>
        String(l.unit || "").toLowerCase().includes(q) ||
        String(l.location || "").toLowerCase().includes(q) ||
        String(l.price || "").includes(q)
      );
      renderTable(filtered);
      renderGrid(filtered, false); // show all for search results
    });

    document.getElementById("clearSearchBtn").addEventListener("click", () => {
      document.getElementById("searchInput").value = "";
      renderTable(allListings);
      renderGrid(allListings, true); // back to last 5
    });

    // See more toggle
    document.getElementById("seeMore").addEventListener("click", () => {
      const seeMoreEl = document.getElementById("seeMore");
      const showingAll = seeMoreEl.dataset.showAll === "true";
      if (showingAll) {
        renderGrid(allListings, true);
        seeMoreEl.innerText = "See more";
        seeMoreEl.dataset.showAll = "false";
      } else {
        renderGrid(allListings, false);
        seeMoreEl.innerText = "See less";
        seeMoreEl.dataset.showAll = "true";
      }
    });
  }

  async function loadListings() {
    try {
      const res = await fetch("/api/landlord/listings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        contentArea.innerHTML = `<p>Error: ${data.message}</p>`;
        return;
      }
      allListings = data.listings || [];
      renderTable(allListings);
      renderGrid(allListings, true); // last 5
    } catch (err) {
      contentArea.innerHTML = `<p>Error loading listings: ${err.message}</p>`;
    }
  }

  function renderTable(listings) {
    const tbody = document.getElementById("listingsTableBody");
    tbody.innerHTML = listings.map(l => `
      <tr>
        <td>${escapeHTML(l.unit)}</td>
        <td>${escapeHTML(l.units)}</td>
        <td>${escapeHTML(l.location)}</td>
        <td>${escapeHTML(l.price)}</td
        <td>${ escapeHTML(l.paymentType || "monthly")}</td>
        <td>${escapeHTML(l.depositAmount || 0)}</td>
      </tr>
    `).join("");
  }

  function renderGrid(listings, lastFiveOnly) {
    const grid = document.getElementById("cardsGrid");
    const list = lastFiveOnly ? listings.slice(-5).reverse() : listings.slice().reverse();

    grid.innerHTML = list.map(l => `
      <div class="house-card">
        <img src="${escapeAttr(l.imagePath || '')}" alt="${escapeAttr(l.unit || 'House')}" />
        <div class="house-info">
          <p><strong>Unit:</strong> ${escapeHTML(l.unit || "")}</p>
          <p><strong>Location:</strong> ${escapeHTML(l.location || "")}</p>
          <p><strong>Price:</strong> KES ${escapeHTML(l.price || "")}</p>
          <p><strong>Payment Type:</strong> ${escapeHTML(l.paymentType || "monthly")}</p>
          ${l.requiresDeposit ? `<p><strong>Deposit:</strong> KES ${escapeHTML(l.depositAmount || 0)}</p>` : ""}
      </div>
      </div>
    `).join("");
  }

  // Simple escape to avoid XSS in text context
  function escapeHTML(str) {
    return String(str).replace(/[&<>"]/g, s => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;"
    })[s]);
  }
  // Escape for attribute contexts
  function escapeAttr(str) {
    return String(str).replace(/"/g, "&quot;");
  }
});
