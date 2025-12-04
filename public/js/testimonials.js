
// TOAST FUNCTION — YOUR ORIGINAL (kept exactly)
function showToast(msg) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 100);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

// MAIN TESTIMONIALS SYSTEM
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector(".testimonialsGrid");
  const section = document.getElementById("testimonials");

  // Create or get feedback button
  let feedbackBtn = document.getElementById("openFeedback");
  if (!feedbackBtn) {
    feedbackBtn = document.createElement("button");
    feedbackBtn.id = "openFeedback";
    feedbackBtn.className = "feedback-btn-sm";
    feedbackBtn.innerHTML = '<i class="fas fa-comment-dots"></i> Share Your Experience';
    section.appendChild(feedbackBtn);
  }

  let testimonials = [];
  let currentIndex = 0;
  let interval;

  // Load testimonials from your backend
  async function loadTestimonials() {
    try {
      const res = await fetch("/api/testimonials");
      const data = await res.json();
      testimonials = data.testimonials || [];
      if (testimonials.length > 0) {
        showTestimonial(currentIndex);
        startRotation();
      } else {
        grid.innerHTML = "<p style='color:#94a3b8; text-align:center;'>No testimonials yet. Be the first!</p>";
      }
    } catch (err) {
      grid.innerHTML = "<p style='color:#ef4444; text-align:center;'>Failed to load testimonials</p>";
      console.error(err);
    }
  }

  // Show one testimonial
  function showTestimonial(index) {
    const t = testimonials[index];
    grid.innerHTML = `
      <div class="testimonial-card">
        <h3>${t.name}</h3>
        <p>"${t.feedback}"</p>
        <small>— ${t.location || 'Kenya'} • ${new Date(t.date).toLocaleDateString('en-KE')}</small>
      </div>
    `;
  }

  // Auto-rotate every 6 seconds
  function startRotation() {
    clearInterval(interval);
    interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % testimonials.length;
      showTestimonial(currentIndex);
    }, 6000);
  }

  // === FEEDBACK BUTTON CLICK ===
  feedbackBtn.addEventListener("click", () => {
    clearInterval(interval); // pause rotation
    grid.innerHTML = `
      <form id="feedbackForm" class="feedback-form">
        <input type="text" id="testimonialName" placeholder="Your Name" required />
        <input type="text" id="testimonialLocation" placeholder="Your Location (e.g. Westlands)" required />
        <textarea id="testimonialFeedback" rows="5" placeholder="Share your experience..." required></textarea>
        <div class="form-buttons">
          <button type="submit">Submit Review</button>
          <button type="button" id="cancelFeedback">Cancel</button>
        </div>
      </form>
    `;

    // Submit
    document.getElementById("feedbackForm").onsubmit = async (e) => {
      e.preventDefault();
      const payload = {
        name: document.getElementById("testimonialName").value.trim(),
        location: document.getElementById("testimonialLocation").value.trim(),
        feedback: document.getElementById("testimonialFeedback").value.trim()
      };

      try {
        const res = await fetch("/api/testimonials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.success) {
          showToast("Thank you! Your review has been submitted.");
          await loadTestimonials(); // reload + resume
        } else {
          showToast(data.error || "Failed to submit review");
        }
      } catch (err) {
        showToast("Network error");
      }
    };

    // Cancel
    document.getElementById("cancelFeedback").onclick = () => {
      showTestimonial(currentIndex);
      startRotation();
    };
  });

  // Start everything
  loadTestimonials();
});
