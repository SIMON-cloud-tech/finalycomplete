const menuToggle = document.getElementById('menu-toggle');
const menu = document.getElementById('menu');

menuToggle.addEventListener('click', () => {
  menu.classList.toggle('active');
  menuToggle.textContent = menu.classList.contains('active') ? '✖' : '☰';
});

// Handle submenus
const submenuLinks = document.querySelectorAll('.has-submenu > a');

submenuLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    // Mobile dropdown toggle
    if (window.innerWidth <= 992) {
      e.preventDefault();
      const next = link.nextElementSibling;
      if (next && next.classList.contains('submenu')) {
        next.classList.toggle('show');
      }
    }
  });

  // Edge detection on hover (desktop)
  link.addEventListener('mouseenter', () => {
    if (window.innerWidth > 992) {
      const submenu = link.nextElementSibling;
      if (submenu && submenu.classList.contains('submenu')) {
        submenu.classList.remove('align-left');
        const rect = submenu.getBoundingClientRect();
        const winWidth = window.innerWidth;
        if (rect.right > winWidth) submenu.classList.add('align-left');
      }
    }
  });
});