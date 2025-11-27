document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("joinForm");
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

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const landlordData = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      password: passwordInput.value.trim(),
      phone: document.getElementById("phone").value.trim(),
      role: document.getElementById("role").value
    };

    try {
      const res = await fetch("/api/landlords/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(landlordData)
      });

      const data = await res.json();

if (res.ok) {
  showToast("Registration successful! ID: " + data.landlord.id);

  // ✅ Save prefill info in localStorage
  if (data.prefill && data.prefill.email) {
    localStorage.setItem("prefillEmail", data.prefill.email);
  }

  // ✅ Redirect to login page if backend provided it
  if (data.redirect) {
    setTimeout(() => {
      window.location.href = data.redirect;
    }, 1500);
  }

  form.reset();
} else {
  showToast("Registration failed: " + (data.message || "Unknown error"));
}

    } catch (err) {
      console.error("Error registering landlord:", err);
      showToast("Error registering landlord.");
    }
  });
});
