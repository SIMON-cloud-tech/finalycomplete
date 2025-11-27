document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("activationForm");
  const messageEl = document.getElementById("activationMessage");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const productKey = sanitize(document.getElementById("productKey").value);

    try {
      const res = await fetch("/api/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productKey })
      });

      const data = await res.json();
      messageEl.innerText = data.message || data.error;

      if (res.ok && data.success) {
        // Redirect to login page after activation
        setTimeout(() => {
          window.location.href = "login.html";
        }, 1500);
      }
    } catch (err) {
      messageEl.innerText = "Error activating key.";
      messageEl.style.color = "red";
      console.error(err);
    }
  });

  function sanitize(str) {
    return str.replace(/[<>]/g, "");
  }
});
