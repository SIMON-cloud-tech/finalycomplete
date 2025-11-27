document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  const modal = document.getElementById("successModal");
  const closeBtn = modal.querySelector(".close-btn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const sanitize = (str) => str.replace(/[<>]/g, "").trim();

    const contactData = {
      name: sanitize(document.getElementById("name").value),
      email: sanitize(document.getElementById("email").value),
      comment: sanitize(document.getElementById("comment").value),
      enquiry: sanitize(document.getElementById("enquiry").value),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactData),
      });

      const result = await res.json();

      if (res.ok) {
        modal.style.display = "block"; // show modal
        form.reset();
      } else {
        showToast(result.message || "Failed to send message.");
      }
    } catch (err) {
      console.error("Error submitting contact form:", err);
      showToast("Failed to send message. Please try again.");
    }
  });

  // Close modal
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Close when clicking outside modal
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
});
