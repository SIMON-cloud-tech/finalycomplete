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

// INFINITE AUTO-SLIDING CAROUSEL – NO BLANK FLASH, ULTRA SMOOTH
const track = document.getElementById('track');
const cards = document.querySelectorAll('.property-card');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let currentIndex = 0;
const totalCards = cards.length;

// Clone first 3 and last 3 cards for seamless loop
const clonesBefore = 3;
const clonesAfter = 3;

for (let i = 0; i < clonesAfter; i++) {
  track.appendChild(cards[i % totalCards].cloneNode(true));
}
for (let i = totalCards - clonesBefore; i < totalCards; i++) {
  track.insertBefore(cards[i].cloneNode(true), track.firstChild);
}

// Adjust initial position to hide clones
const cardWidth = cards[0].offsetWidth + 30; // 30px gap
track.style.transform = `translateX(-${clonesBefore * cardWidth}px)`;
currentIndex = clonesBefore;

function updatePosition() {
  track.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
  track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
}

// Seamless reset when reaching end
track.addEventListener('transitionend', () => {
  if (currentIndex >= totalCards + clonesAfter) {
    track.style.transition = 'none';
    currentIndex = clonesBefore;
    track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
  }
  if (currentIndex < clonesBefore) {
    track.style.transition = 'none';
    currentIndex = totalCards + clonesBefore - 1;
    track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
  }
});

// Auto-slide
let autoSlide = setInterval(() => {
  currentIndex++;
  updatePosition();
}, 4000);

// Arrows
nextBtn.onclick = () => {
  currentIndex++;
  updatePosition();
  clearInterval(autoSlide);
  autoSlide = setInterval(() => { currentIndex++; updatePosition(); }, 4000);
};

prevBtn.onclick = () => {
  currentIndex--;
  updatePosition();
  clearInterval(autoSlide);
  autoSlide = setInterval(() => { currentIndex++; updatePosition(); }, 4000);
};

// Touch/Swipe
let touchStartX = 0;
track.parentElement.addEventListener('touchstart', e => touchStartX = e.touches[0].clientX, { passive: true });
track.parentElement.addEventListener('touchend', e => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) {
    diff > 0 ? (currentIndex++) : (currentIndex--);
    updatePosition();
    clearInterval(autoSlide);
    autoSlide = setInterval(() => { currentIndex++; updatePosition(); }, 4000);
  }
}, { passive: true });

// Start auto-slide
updatePosition();
