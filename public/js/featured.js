document.addEventListener('DOMContentLoaded', () => {
  const track = document.getElementById('track');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  let currentIndex = 0;
  let cardWidth = 0;
  let listingsData = [];

  fetch('/api/featured')
    .then(res => res.json())
    .then(listings => {
      listingsData = listings;
      listings.forEach(listing => {
        const card = document.createElement('div');
        card.className = 'property-card';
        card.innerHTML = `
          <img src="${listing.imagePath}" alt="${listing.unit}">
          <div class="card-content">
            <h3>${listing.unit} in ${listing.location}</h3>
            <p>${listing.description}</p>
            <div class="icons">
              <div class="icon-item">
                <i class="fas fa-bed"></i>
                <span>${listing.units} Beds</span>
              </div>
              <div class="icon-item">
                <i class="fas fa-map-marker-alt"></i>
                <span>${listing.location}</span>
              </div>
              <div class="icon-item">
                <i class="fas fa-tag"></i>
                <span>KSh ${listing.price.toLocaleString()}/${listing.paymentType}</span>
              </div>
            </div>
          </div>
        `;
        track.appendChild(card);
      });

      // Set card width based on first card
      const firstCard = track.querySelector('.property-card');
      if (firstCard) {
        cardWidth = firstCard.offsetWidth + 30; // width + margin
      }

      autoSlide();
    })
    .catch(err => console.error('Error loading featured listings:', err));

  function updateSlide() {
    track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
    track.style.opacity = 0;
    setTimeout(() => {
      track.style.opacity = 1;
    }, 200);
  }

  function nextCard() {
    if (currentIndex < listingsData.length - 1) {
      currentIndex++;
    } else {
      currentIndex = 0;
    }
    updateSlide();
  }

  function prevCard() {
    if (currentIndex > 0) {
      currentIndex--;
    } else {
      currentIndex = listingsData.length - 1;
    }
    updateSlide();
  }

  function autoSlide() {
    setInterval(nextCard, 4000); // every 4s
  }

  nextBtn.addEventListener('click', nextCard);
  prevBtn.addEventListener('click', prevCard);
});
