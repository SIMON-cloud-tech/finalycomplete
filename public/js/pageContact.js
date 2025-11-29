
document.getElementById("contactForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Collect and sanitize inputs
  const name = DOMPurify.sanitize(document.getElementById("name").value.trim());
  const email = DOMPurify.sanitize(document.getElementById("email").value.trim());
  const comment = DOMPurify.sanitize(document.getElementById("comment").value.trim());
  const enquiry = DOMPurify.sanitize(document.getElementById("enquiry").value.trim());

  // Basic validation
  if (!name || !email || !comment || !enquiry) {
    alert("All fields are required.");
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("Please enter a valid email address.");
    return;
  }

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, comment, enquiry })
    });

    const data = await response.json();
    if (response.ok) {
      alert("Your enquiry has been submitted successfully!");
      document.getElementById("contactForm").reset();
    } else {
      alert(data.error || "Submission failed.");
    }
  } catch (err) {
    console.error("Error submitting form:", err);
    alert("Server error. Please try again later.");
  }
});
