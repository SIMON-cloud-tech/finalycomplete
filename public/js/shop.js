// ../js/shop.js

const houseGrid = document.getElementById("houseGrid");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

let listings = [];

// Fetch listings from backend
async function fetchListings() {
  try {
    const res = await fetch("/api/listings");
    listings = await res.json();
    renderGrid(listings);
  } catch (err) {
    console.error("Error fetching listings:", err);
    houseGrid.innerHTML = "<p>Failed to load listings.</p>";
  }
}

// Render grid of cards
function renderGrid(data) {
  houseGrid.innerHTML = "";

    // If no results, show "Search not found"
  if (!data || data.length === 0) {
    houseGrid.innerHTML = "<p class='no-results'>Search not found</p>";
    return;
  }

  data.forEach(listing => {
    const card = document.createElement("div");
    card.className = "house-card";

    card.innerHTML = `
      <img src="${listing.imagePath}" alt="${listing.unit}" />
      <div class="card-info">
        <h3>${listing.unit}</h3>
        <p class="location">${listing.location}</p>
        <p class="price">KSh ${listing.price}</p>
        <p>${listing.description.substring(0, 60)}...</p>
      </div>
      <button class="book-btn">Book Now</button>
    `;

    // Card click → show details
    card.addEventListener("click", e => {
      if (e.target.classList.contains("book-btn")) return;
      showDetails(listing);
    });

    // Book Now button
    card.querySelector(".book-btn").addEventListener("click", e => {
      e.stopPropagation();
      bookHouse(listing.id);
    });

    houseGrid.appendChild(card);
  });
}

// Show full details dynamically
function showDetails(listing) {
  houseGrid.innerHTML = `
    <div class="house-card expanded">
      <img src="${listing.imagePath}" alt="${listing.unit}" />
      <div class="card-info">
        <h3>${listing.unit}</h3>
        <p class="location">${listing.location}</p>
        <p class="price">KSh ${listing.price}</p>
        <p><strong>Landlord:</strong> ${listing.landlord}</p>
        <p><strong>Units Available:</strong> ${listing.units}</p>
        <p>${listing.description}</p>
      </div>
      <button class="book-btn">Book Now</button>
    </div>
  `;

  document.querySelector(".book-btn").addEventListener("click", () => {
    bookHouse(listing.id);
  });
}

// Save selected house ID & redirect
function bookHouse(houseId) {
  localStorage.setItem("selectedHouseId", houseId);
  window.location.href = "book.html";
}

// Search functionality
function searchListings() {
  const query = searchInput.value.toLowerCase();
  const filtered = listings.filter(l =>
    l.unit.toLowerCase().includes(query) ||
    l.location.toLowerCase().includes(query) ||
    String(l.price).includes(query)
  );
  renderGrid(filtered);
}

searchBtn.addEventListener("click", searchListings);
searchInput.addEventListener("keypress", e => {
  if (e.key === "Enter") searchListings();
});

fetchListings();
