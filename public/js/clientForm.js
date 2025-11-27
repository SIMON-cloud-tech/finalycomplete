document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("clientForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = sanitize(document.getElementById("email").value);
    const password = sanitize(document.getElementById("password").value);

    try {
      const res = await fetch("/api/client/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok && data.token) {
        // ✅ Store JWT token in localStorage
        localStorage.setItem("clientToken", data.token);

        // Redirect to client dashboard
        window.location.href = "client-dashboard.html";
      } else {
        showToast(data.error || "Login failed.");
      }
    } catch (err) {
      showToast("Error logging in: " + err.message);
    }
  });

  function sanitize(str) {
    return str.replace(/[<>]/g, "");
  }
});
