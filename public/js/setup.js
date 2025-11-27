document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("setupForm");
  const messageEl = document.getElementById("setupMessage");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Collect and sanitize inputs
    const companyName = sanitize(document.getElementById("companyName").value);
    const location = sanitize(document.getElementById("location").value);
    const email = sanitize(document.getElementById("email").value);
    const password = sanitize(document.getElementById("password").value);

    try {
      // Send data to backend
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, location, email, password })
      });

      const data = await res.json();

      // Show feedback
      messageEl.innerText = data.message || data.error;
      messageEl.style.color = data.error ? "red" : "green";

      // Redirect if backend instructs
      if (data.redirect) {
        window.location.href = "product-key.html";
      }
    } catch (err) {
      messageEl.innerText = "Error during setup.";
      messageEl.style.color = "red";
      console.error("Setup error:", err);
    }
  });

  // Simple sanitization to prevent HTML injection
  function sanitize(str) {
    return str.replace(/[<>]/g, "");
  }
});
