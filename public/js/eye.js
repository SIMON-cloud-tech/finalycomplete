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