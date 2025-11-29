document.addEventListener("DOMContentLoaded", () => {
  const signoutBtn = document.getElementById("clientSignoutBtn");
  const contentArea = document.querySelector(".client-dashboard"); // ✅ target the section
  const token = localStorage.getItem("clientToken");

  if (signoutBtn) {
    signoutBtn.addEventListener("click", async () => {
      if (!token) {
        contentArea.innerHTML = "<p>You are not logged in.</p>";
        return;
      }

      try {
        const res = await fetch("/api/client/signout", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        // ✅ Clear token
        localStorage.removeItem("clientToken");

        // ✅ Grey out dashboard
        contentArea.innerHTML = `
          <h2>Client Dashboard</h2>
          <p style="color:#888;">${data.message}</p>
          <p style="color:#888;">Your records have been archived.</p>
        `;
      } catch (err) {
        contentArea.innerHTML = `<p>Error signing out: ${err.message}</p>`;
      }
    });
  }
});
