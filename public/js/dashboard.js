// dashboard.js

document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menu-toggle");
  const sidebar = document.getElementById("sidebar");
  const contentArea = document.getElementById("content-area");

  // Toggle sidebar visibility on small screens
  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("active");

    // Toggle icon between ☰ and ✖
    if (menuToggle.innerHTML === "&#9776;" || menuToggle.textContent === "☰") {
      menuToggle.textContent = "✖";
    } else {
      menuToggle.textContent = "☰";
    }
  });

  // Handle sidebar item clicks
  sidebar.querySelectorAll("li").forEach(item => {
    item.addEventListener("click", () => {
      const section = item.getAttribute("data-content");
      // Render dynamic content into content area
     // contentArea.innerHTML = `
       // <h2>${section}</h2>
        //<p>You are now viewing the <strong>${section}</strong> section.</p>
      //`;

      // Close sidebar automatically on small screens after selection
      if (window.innerWidth <= 768) {
        sidebar.classList.remove("active");
        menuToggle.textContent = "☰";
      }
    });
  });
});
