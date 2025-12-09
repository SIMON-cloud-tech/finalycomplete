document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('gallery-grid');

  fetch('/api/gallery')
    .then(res => res.json())
    .then(listings => {
      listings.forEach(listing => {
        const card = document.createElement('div');
        card.className = 'gallery-card';

        card.innerHTML = `
          <img src="${listing.imagePath}" alt="${listing.unit}">
          <div class="overlay">
            <h3>${listing.unit}</h3>
            <p class="location"><i class="fas fa-map-marker-alt"></i> ${listing.location}</p>
            <p class="price">KSh ${listing.price.toLocaleString()}/${listing.paymentType}</p>
            <p class="desc">${listing.description}</p>
          </div>
        `;

        grid.appendChild(card);
      });
    })
    .catch(err => console.error('Error loading gallery listings:', err));
});
