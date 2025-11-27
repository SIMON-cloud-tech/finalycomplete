// ../js/checkout.js

const totalPaid = document.getElementById("totalPaid");
const landlordName = document.getElementById("landlordName");
const checkoutBtn = document.getElementById("checkoutBtn");

const bookingId = localStorage.getItem("bookingId"); // saved after /api/book

async function loadCheckoutDetails() {
  if (!bookingId) {
    totalPaid.textContent = "No booking found. Please book a house first.";
    return;
  }

  try {
    // Fetch single booking and listings
    const [listingsRes, bookingRes] = await Promise.all([
      fetch("/api/listings"),
      fetch(`/api/bookings/${bookingId}`)
    ]);

    const listings = await listingsRes.json();
    const booking = await bookingRes.json();
    console.log("Booking response:", booking);

    console.log("Checkout bookingId:", bookingId);
    console.log("Booking object:", booking);

    if (!booking || booking.error) {
      totalPaid.textContent = "Booking not found.";
      return;
    }

    // ✅ Normalize IDs (convert both to numbers)
    const house = listings.find(
      l => Number(l.id) === Number(booking.houseId)
    );

    // ✅ Always show price (prefer booking, fallback to listing)
    totalPaid.textContent = `Total: KSh ${booking.price || house?.price || "0"}`;

    // ✅ Landlord fallback: prefer listing, then booking, else Unknown
    landlordName.textContent = `Landlord: ${house?.landlord || booking.landlord || "Unknown"}`;
  } catch (err) {
    console.error("Error loading checkout details:", err);
    totalPaid.textContent = "Failed to load checkout details.";
  }
}

checkoutBtn.addEventListener("click", async () => {
  if (!bookingId) return;

  try {
    const res = await fetch("/api/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId })
    });

    const result = await res.json();

    if (res.ok) {
      showToast(
        `✅ Payment successful!\n\n` +
        `Commission: KSh ${result.commission}\n` +
        `Landlord payout: KSh ${result.landlordPayout}\n` +
        `Sent to: ${result.landlordName} via ${result.landlordPhone || result.tillNumber || result.paybillNumber}`
      );

      localStorage.removeItem("bookingId");
      window.location.href = "shop.html";
    } else {
     showToast(`❌ Payment failed: ${result.error || "Unknown error"}`);
    }
  } catch (err) {
    console.error("Error during payment:", err);
    showToast("❌ Payment failed due to a network error.");
  }
});

// Init
loadCheckoutDetails();
