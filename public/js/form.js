// public/js/form.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const passwordInput = document.getElementById("password");
  const toggleIcon = document.getElementById("togglePassword");

  // Toggle password visibility
  if (toggleIcon) {
    toggleIcon.addEventListener("click", () => {
      const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);
      toggleIcon.classList.toggle("fa-eye");
      toggleIcon.classList.toggle("fa-eye-slash");
    });
  }


  // Simple sanitization helper
  function sanitize(input) {
    return input.replace(/[<>]/g, "").trim();
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = sanitize(document.getElementById("email").value);
    const password = sanitize(document.getElementById("password").value);

    try {
      const res = await fetch("/api/landlords/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok && data.token) {
        // Save JWT in localStorage
        localStorage.setItem("landlordToken", data.token);
        showToast("Login successful!");
        window.location.href = "landlord.html"; // redirect to dashboard
      } else {
        showToast("Login failed: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("🚨 Error logging in:", err);
      showToast("Error logging in.");
    }
  });
});
