// frontend.js

// Handle email submission
document.getElementById('emailForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = e.target.querySelector('input[type="email"]').value;

  const res = await fetch('/api/auth/request-reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });

  const data = await res.json();
  if (res.ok) {
    document.getElementById('otpSection').classList.remove('hidden');
    showToast(data.message);
  } else {
    showToast(data.message);
  }
});

// Auto-verify OTP once all boxes are filled
const otpInputs = document.querySelectorAll('.otp-input');
otpInputs.forEach((input, index) => {
  input.addEventListener('input', async () => {
    if (input.value.length === 1 && index < otpInputs.length - 1) {
      otpInputs[index + 1].focus();
    }

    const otp = Array.from(otpInputs).map(i => i.value).join('');
    if (otp.length === otpInputs.length) {
      const email = document.querySelector('#emailForm input[type="email"]').value;
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      const data = await res.json();
      if (data.success) {
        document.getElementById('newPasswordSection').classList.remove('hidden');
      } else {
        showToast(data.message);
        otpInputs.forEach(i => i.value = '');
        otpInputs[0].focus();
      }
    }
  });
});

// Handle new password submission
document.getElementById('passwordForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.querySelector('#emailForm input[type="email"]').value;
  const newPassword = e.target.querySelector('input[type="password"]').value;

  const res = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, newPassword })
  });

  const data = await res.json();
  showToast(data.message);

  if (res.ok) {
    // Auto-redirect to landlord login page
    window.location.href = "landlordlogin.html";
  }
});
