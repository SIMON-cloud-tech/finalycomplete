// Replace your showToast function
function showToast(msg) {
  let toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = msg;
  document.body.appendChild(toast);

  // Show it
  setTimeout(() => toast.classList.add("show"), 100);

  // Hide after 3s
  setTimeout(() => {
    toast.classList.remove("show");
    document.body.removeChild(toast);
  }, 3000);
}

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

  function stopRotation() {
    clearInterval(interval);
  }

  // Feedback form
  feedbackBtn.addEventListener("click", () => {
    stopRotation(); // pause rotation while form is open

    grid.innerHTML = `
      <form id="feedbackForm" class="feedback-form">
        <input type="text" id="testimonialName" placeholder="Your Name" required />
        <textarea id="testimonialFeedback" placeholder="Your Testimonial" required></textarea>
        <button type="submit">Submit</button>
        <button type="button" id="cancelFeedback">Cancel</button>
      </form>
    `;

  
    // Submit handler
    document.getElementById("feedbackForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      
        const payload = {
                  name: document.getElementById("testimonialName").value.trim(),
                  feedback: document.getElementById("testimonialFeedback").value.trim()
               };

            console.log("Payload before submit:", payload);

      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        showToast("Thank you for your feedback!");
        await loadTestimonials();
        startRotation(); // resume rotation after reload
      } else {
        showToast(data.error || "Failed to submit testimonial.");
      }
    });

    // Cancel handler
    document.getElementById("cancelFeedback").addEventListener("click", () => {
      showTestimonial(currentIndex); // restore current testimonial
      startRotation(); // resume rotation
    });
  });

  loadTestimonials();
});
