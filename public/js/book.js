// ../js/book.js
const housePreview = document.getElementById("housePreview");
const bookForm = document.getElementById("bookForm");
const priceInput = document.getElementById("price");
const msg = document.getElementById('errorMessage');

// Load selected house from localStorage
const selectedHouseId = localStorage.getItem("selectedHouseId");

// Fetch listings and show preview
async function loadHousePreview() {
  if (!selectedHouseId) {
    housePreview.innerHTML = "<p>No house selected. Please go back to the shop.</p>";
    return;
  }

  try {
    const res = await fetch("/api/shop/listings");
    const listings = await res.json();
    const house = listings.find(l => l.id == selectedHouseId);

    if (!house) {
      housePreview.innerHTML = "<p>Selected house not found.</p>";
      return;
    }

    // Render preview
    housePreview.innerHTML = `
      <img src="${house.imagePath}" alt="${house.unit}" />
      <h3>${house.unit}</h3>
      <p class="location">${house.location}</p>
      <p class="price">KSh ${house.price}</p>
    `;

    // Pre-fill price
    priceInput.value = house.price;
  } catch (err) {
    console.error("Error loading house preview:", err);
    housePreview.innerHTML = "<p>Failed to load house details.</p>";
  }
}

// Handle booking form submit
bookForm.addEventListener("submit", async e => {
  e.preventDefault();

  const bookingData = {
    houseId: selectedHouseId,
    name: document.getElementById("clientName").value,
    email: document.getElementById("clientEmail").value,
    password: document.getElementById("clientPassword").value,
    tenantPhone: document.getElementById("tenantPhone").value,
    price: priceInput.value
  };

  try {
    const res = await fetch("/api/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingData)
    });

    const result = await res.json();

    console.log("Booking result from backend:", result);
    
    if (res.ok) {
      // ✅ Save bookingId for checkout
      localStorage.setItem("bookingId", result.bookingId);

      // Optionally clear selectedHouseId
      localStorage.removeItem("selectedHouseId");

      // ✅ Redirect to checkout.html
      window.location.href = "checkout.html";

      setTimeout(()=>{
        msg.style.display = 'block';
      }, 2000);

    } else {
      msg.textContent = `Booking failed ${result.error}`;
      msg.style.color = 'red';
    }
  } catch (err) {
    console.error("Error submitting booking:", err);
    msg.innerHTML = "Failed to submit booking form due to a network error";
    msg.style.color = 'red';
    setTimeout(() => {
      msg.style.opacity = 1;
    }, 2000);
  }
});

// Init
loadHousePreview();
