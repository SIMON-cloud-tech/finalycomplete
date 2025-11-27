document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("productGrid");

  try {
    const res = await fetch("/api/listings");
    const listings = await res.json();

    listings.forEach(house => {
      const card = document.createElement("div");
      card.className = "house-card";

      card.innerHTML = `
        <img src="${house.imagePath}" alt="${house.unit}" />
        <p class="price">KSh ${house.price.toLocaleString()}</p>
        <p class="location">${house.location}</p>
      `;

      // ✅ Double-click opens card in a new window injected via JS
      card.addEventListener("dblclick", () => {
        const newWin = window.open("", "_blank", "width=1200,height=800");
        newWin.document.write(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <title>${house.unit}</title>
            <style>
              body { margin:0; font-family:sans-serif; background:#000; color:#fff;
                     display:flex; justify-content:center; align-items:center; height:100vh; }
              .content { max-width:90%; text-align:center; }
              img { max-width:100%; height:auto; border-radius:8px; }
              h2 { margin:20px 0 10px; }
              p { margin:5px 0; }
            </style>
          </head>
          <body>
            <div class="content">
              <img src="${house.imagePath}" alt="${house.unit}" />
              <h2>${house.unit}</h2>
              <p class="price">KSh ${house.price.toLocaleString()}</p>
              <p class="location">${house.location}</p>
              <p class="description">${house.description}</p>
            </div>
          </body>
          </html>
        `);
        newWin.document.close();
      });

      grid.appendChild(card);
    });

    /* --- Auto-slide logic (responsive card-by-card snapping) --- */
    let autoScroll;
    
function startAutoScroll() {
  const card = grid.querySelector(".house-card");
  if (!card) return;
  const cardStyle = window.getComputedStyle(card);
  const gap = parseInt(cardStyle.marginRight) || 20; // fallback gap
  const cardWidth = card.offsetWidth + gap;

  autoScroll = setInterval(() => {
    const nextScroll = grid.scrollLeft + cardWidth;
    if (nextScroll + grid.clientWidth > grid.scrollWidth) {
      grid.scrollLeft = 0; // loop back to start
    } else {
      grid.scrollTo({ left: nextScroll, behavior: "smooth" });
    }
  }, 3000); // every 3 seconds
}


    function stopAutoScroll() {
      clearInterval(autoScroll);
    }

    // Start auto scroll
    startAutoScroll();

    // Pause on hover/touch
    grid.addEventListener("mouseenter", stopAutoScroll);
    grid.addEventListener("mouseleave", startAutoScroll);
    grid.addEventListener("touchstart", stopAutoScroll);
    grid.addEventListener("touchend", startAutoScroll);

    // Allow manual swipe/drag
    let isDown = false;
    let startX;
    let scrollLeft;

    grid.addEventListener("mousedown", e => {
      isDown = true;
      startX = e.pageX - grid.offsetLeft;
      scrollLeft = grid.scrollLeft;
      stopAutoScroll();
    });
    grid.addEventListener("mouseleave", () => { isDown = false; });
    grid.addEventListener("mouseup", () => { isDown = false; startAutoScroll(); });
    grid.addEventListener("mousemove", e => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - grid.offsetLeft;
      const walk = (x - startX) * 2; // scroll speed
      grid.scrollLeft = scrollLeft - walk;
    });

  } catch (err) {
    grid.innerHTML = "<p>Failed to load houses.</p>";
    console.error("Error fetching listings:", err);
  }
});
