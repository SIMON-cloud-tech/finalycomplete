const prefillEmail = localStorage.getItem("prefillEmail");
if (prefillEmail) {
  document.getElementById("loginEmail").value = prefillEmail;
  document.getElementById("loginMessage").innerText = "Welcome! Please enter your password to continue.";
  localStorage.removeItem("prefillEmail"); // clear after use
}
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const messageEl = document.getElementById("loginMessage");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = sanitize(document.getElementById("loginEmail").value);
    const password = sanitize(document.getElementById("loginPassword").value);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      messageEl.innerText = data.message || data.error;

      if (res.ok && data.redirect) {
        setTimeout(() => {
          window.location.href = data.redirect; // e.g. "business.html"
        }, 1500);
      }
    } catch (err) {
      messageEl.innerText = "Login failed.";
      messageEl.style.color = "red";
      console.error(err);
    }
  });

  function sanitize(str) {
    return str.replace(/[<>]/g, "");
  }
});
