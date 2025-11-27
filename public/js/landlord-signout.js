document.addEventListener("DOMContentLoaded", () => {
  const contentArea = document.getElementById("content-area");
  const signoutItem = document.querySelector('li[data-content="SignOut"]');

  if (!signoutItem) return;

  signoutItem.addEventListener("click", async () => {
    try {
      const token = localStorage.getItem("landlordToken");
      if (!token) {
        contentArea.innerHTML = "<p>You are not logged in.</p>";
        return;
      }

      const res = await fetch("/api/signout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });

      // Always read as text first to avoid parse errors
      const raw = await res.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        contentArea.innerHTML = `<p>Unexpected response: ${raw}</p>`;
        return;
      }

      if (!res.ok) {
        contentArea.innerHTML = `<p>Error: ${data.message}</p>`;
        return;
      }

      // Clear token and redirect
      localStorage.removeItem("landlordToken");
      contentArea.innerHTML = `<p>${data.message}</p>`;
      window.location.href = "../index.html"; // from dashboard.html back to index.html
    } catch (err) {
      console.error("🚨 Error signing out:", err);
      contentArea.innerHTML = `<p>Error signing out: ${err.message}</p>`;
    }
  });
});
