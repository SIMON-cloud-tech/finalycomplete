document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("clientToken");
  const nameEl = document.getElementById("clientName");
  const tbody = document.querySelector("tbody");

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

    // ✅ Populate table with booking history
    tbody.innerHTML = "";
    data.bookings.forEach(b => {
      const tr = document.createElement("tr");

      const houseTd = document.createElement("td");
      houseTd.innerText = b.house || "Unknown";

      const landlordTd = document.createElement("td");
      landlordTd.innerText = b.landlord || "Unknown";

      const statusTd = document.createElement("td");
      statusTd.innerText = b.status;

      const overdraftTd = document.createElement("td");
      overdraftTd.innerText = b.overdraft;

      tr.appendChild(houseTd);
      tr.appendChild(landlordTd);
      tr.appendChild(statusTd);
      tr.appendChild(overdraftTd);

      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Error loading dashboard:", err);
    showToast("Error loading dashboard.");
    window.location.href = "client-login.html";
  }
});
