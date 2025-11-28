const houseGrid = document.getElementById("houseGrid");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

let listings = [];

// Fetch listings from backend
async function fetchListings() {
  try {
    const res = await fetch("/api/shop/listings"); // ✅ new path
    listings = await res.json();
    console.log("Fetched listings:", listings); // debug
    renderGrid(listings);
  } catch (err) {
    console.error("Error fetching listings:", err);
    houseGrid.innerHTML = "<p>Failed to load listings.</p>";
  }
}

// Render grid of house cards
function renderGrid(data) {
  houseGrid.innerHTML = "";

  if (!data || data.length === 0) {
    houseGrid.innerHTML = "<p class='no-results'>No listings found</p>";
    return;
  }

  data.forEach(listing => {
    const card = document.createElement("div");
    card.className = "house-card";

    const imgSrc = listing.imagePath || "/assets/default-house.jpg";

    card.innerHTML = `
      <img src="${imgSrc}" alt="${listing.unit}" />
      <div class="card-info">
        <h3>${listing.unit}</h3>
        <p class="location">${listing.location}</p>
        <p class="price">KSh ${listing.price}</p>
        <p class="landlord">Landlord: ${listing.landlord}</p>
      </div>
      <button class="book-btn">Book Now</button>
    `;

    // Double-click → show full details
    card.addEventListener("dblclick", () => {
      showDetails(listing);
    });

    card.querySelector(".book-btn").addEventListener("click", e => {
      e.stopPropagation();
      bookHouse(listing.id);
    });

    houseGrid.appendChild(card);
  });
}

// Show full listing details
function showDetails(listing) {
  const imgSrc = listing.imagePath || "/assets/default-house.jpg";
  const statusColor = (listing.status || "occupied").toLowerCase() === "vacant" ? "green" : "red";
  const statusText = (listing.status || "occupied").charAt(0).toUpperCase() + (listing.status || "occupied").slice(1);

  houseGrid.innerHTML = `
    <div class="house-card expanded">
      <img src="${imgSrc}" alt="${listing.unit}" />
      <div class="card-info">
        <h3>${listing.unit}</h3>
        <p class="location">${listing.location}</p>
        <p class="price">KSh ${listing.price}</p>
        <p><strong>Landlord:</strong> ${listing.landlord}</p>
        <p><strong>Status:</strong> <span style="color:${statusColor}">${statusText}</span></p>
        <p><strong>Description:</strong> ${listing.description}</p>
      </div>
      <button class="book-btn">Book Now</button>
    </div>
  `;

  document.querySelector(".book-btn").addEventListener("click", () => {
    bookHouse(listing.id);
  });
}

// Save selected house & redirect
function bookHouse(houseId) {
  localStorage.setItem("selectedHouseId", houseId);
  window.location.href = "book.html";
}

// Search functionality
function searchListings() {
  const query = searchInput.value.toLowerCase();
  const filtered = listings.filter(l =>
    (l.unit && l.unit.toLowerCase().includes(query)) ||
    (l.location && l.location.toLowerCase().includes(query)) ||
    (l.price && String(l.price).includes(query))
  );
  renderGrid(filtered);
}

searchBtn.addEventListener("click", searchListings);
searchInput.addEventListener("keypress", e => {
  if (e.key === "Enter") searchListings();
});

// Initial fetch
fetchListings();
