document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("clientToken");
  const nameEl = document.getElementById("clientName");

  if (!token) {
    alert("You must log in first.");
    window.location.href = "client-login.html";
    return;
  }

  try {
    const res = await fetch("/api/client/dashboard", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.error || "Failed to load dashboard.");
      window.location.href = "client-login.html";
      return;
    }

    // ✅ Welcome message
    nameEl.innerText = data.client.name;

    // ✅ Populate table
    document.getElementById("house").innerText = data.client.house;
    document.getElementById("landlord").innerText = data.client.landlord;
    document.getElementById("startdate").innerText = data.client.startDate;
    document.getElementById("status").innerText = data.client.status;
    document.getElementById("location").innerText = data.client.location;
    document.getElementById("staydays").innerText = data.client.stayDays;
  } catch (err) {
    console.error("Error loading dashboard:", err);
    showToast("Error loading dashboard.");
    window.location.href = "client-login.html";
  }
});
