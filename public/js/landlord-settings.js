document.addEventListener("DOMContentLoaded", () => {
  const contentArea = document.getElementById("content-area");
  const settingsItem = document.querySelector('li[data-content="Settings"]');

  settingsItem.addEventListener("click", async () => {
    const token = localStorage.getItem("landlordToken");
    if (!token) {
      contentArea.innerHTML = "<p>Please log in to view settings.</p>";
      return;
    }

    // Fetch current landlord details
    const res = await fetch("/api/landlord/settings", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    if (!res.ok) {
      contentArea.innerHTML = `<p>Error: ${data.message}</p>`;
      return;
    }

    const landlord = data.landlord;

    // Build form
    let formHTML = `
      <h2>Update Profile</h2>
      <form id="settingsForm">
        <label>Name</label>
        <input type="text" id="name" value="${landlord.name}" />

        <label>Email</label>
        <input type="text" id="email" value="${landlord.email}" disabled />

        <label>Phone</label>
        <input type="text" id="phone" value="${landlord.phone}" />

        <label>Till Number</label>
        <input type="text" id="tillNumber" value="${landlord.tillNumber || ""}" />

       <label>Password</label>
       <div class="password-wrapper" style="display:flex;align-items:center;">
       <input type="password" id="password" placeholder="Enter new password" />
       <!-- 👁️ eye icon (default closed) -->
       <span id="togglePassword" style="cursor:pointer;margin-left:8px;">&#128065;</span>
       </div>


        <button type="submit">Update Profile</button>
      </form>
    `;

    contentArea.innerHTML = formHTML;

    const togglePassword = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("password");

     togglePassword.addEventListener("click", () => { 
     const isHidden = passwordInput.getAttribute("type") === "password";
     passwordInput.setAttribute("type", isHidden ? "text" : "password");

     if (isHidden) {
     // When showing password → red right eye
     togglePassword.innerHTML = "&#128065;"; // 👁️
     togglePassword.style.color = "red";
   } else {
      // When hiding password → normal eye
      togglePassword.innerHTML = "&#128065;"; // 👁️
     togglePassword.style.color = "black";
    }
  });

    const form = document.getElementById("settingsForm");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const payload = {
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value,
        tillNumber: document.getElementById("tillNumber").value,
        password: document.getElementById("password").value
      };

      const updateRes = await fetch("/api/landlord/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const updateData = await updateRes.json();
      if (updateRes.ok) {
        showToast("Profile updated successfully!");
      } else {
        showToast("Error updating profile: " + updateData.message);
      }
    });
  });
});
