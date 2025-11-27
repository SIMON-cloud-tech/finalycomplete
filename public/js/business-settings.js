// public/js/business-settings.js – simplified, no email/OTP
document.addEventListener('DOMContentLoaded', () => {
  const settingsItem = document.querySelector('li[data-content="Settings"]');
  const contentArea = document.getElementById('content-area');

  if (!settingsItem || !contentArea) {
    console.error('Settings menu or content area not found');
    return;
  }

  settingsItem.addEventListener('click', () => {
    contentArea.innerHTML = `
      <h2>Business Settings</h2>
      <p>Update your business details below.</p>

      <div id="updateForm" style="margin-top:20px;">
        <h3>Enter new values (leave blank to keep current)</h3>
        <input type="text" id="companyName" placeholder="New Company Name"><br><br>
        <input type="tel" id="phone" placeholder="New Phone"><br><br>
        <input type="password" id="password" placeholder="New Password"><br><br>
        <input type="number" step="0.01" id="commissionRate" placeholder="Commission Rate (e.g. 0.10)"><br><br>
        <button id="updateBtn">Update Settings</button>
      </div>
    `;

    // Submit update
    document.getElementById('updateBtn').onclick = async () => {
      const updates = {
        companyName: document.getElementById('companyName').value || undefined,
        phone: document.getElementById('phone').value || undefined,
        password: document.getElementById('password').value || undefined,
        commissionRate: document.getElementById('commissionRate').value || undefined
      };

      const payload = { updates };

      const res = await fetch('/api/settings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      showToast(data.message || data.error);

      if(data.success){
        showToast(`Company name updated to: ${updates.companyName || 'unchanged'}`);
      }
    };
  });
});
