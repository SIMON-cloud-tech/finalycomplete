document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector(".testimonialsGrid");
  const section = document.getElementById("testimonials");

  // Add feedback button
  const feedbackBtn = document.createElement("button");
  feedbackBtn.textContent = "Leave Your Feedback";
  feedbackBtn.className = "feedback-btn";
  section.appendChild(feedbackBtn);

  let testimonials = [];
  let currentIndex = 0;
  let interval;

  async function loadTestimonials() {
    const res = await fetch("/api/testimonials");
    const data = await res.json();
    testimonials = data.testimonials || [];
    if (testimonials.length) {
      showTestimonial(currentIndex);
      startRotation();
    }
  }

  function showTestimonial(index) {
    const t = testimonials[index];
    grid.innerHTML = `
      <div class="testimonial-card">
        <h3>${t.name}</h3>
        <p>${t.feedback}</p>
        <small>${t.date}</small>
      </div>
    `;
  }

  function startRotation() {
    clearInterval(interval);
    interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % testimonials.length;
      showTestimonial(currentIndex);
    }, 5000); // rotate every 5s
  }

  // Feedback form
  feedbackBtn.addEventListener("click", () => {
    grid.innerHTML = `
      <form id="feedbackForm" class="feedback-form">
        <input type="text" id="name" placeholder="Your Name" required />
        <textarea id="feedback" placeholder="Your Testimonial" required></textarea>
        <button type="submit">Submit</button>
      </form>
    `;

    document.getElementById("feedbackForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = {
        name: document.getElementById("name").value,
        feedback: document.getElementById("feedback").value
      };

      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        showToast("Thank you for your feedback!");
        loadTestimonials();
      } else {
        showToast(data.error || "Failed to submit testimonial.");
      }
    });
  });

  loadTestimonials();
});
