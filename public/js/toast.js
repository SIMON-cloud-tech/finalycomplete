// Toast container
function createToastContainer() {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.style.position = "fixed";
    container.style.top = "20px";
    container.style.right = "20px";
    container.style.zIndex = "9999";
    document.body.appendChild(container);
  }
  return container;
}

// Show toast
function showToast(message, type = "success") {
  const container = createToastContainer();
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.background = type === "success" ? "#28a745" : "#dc3545";
  toast.style.color = "#fff";
  toast.style.padding = "10px 16px";
  toast.style.marginTop = "10px";
  toast.style.borderRadius = "6px";
  toast.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
  toast.style.fontFamily = "Segoe UI, sans-serif";
  toast.style.fontSize = "14px";
  toast.style.opacity = "0";
  toast.style.transition = "opacity 0.3s";

  container.appendChild(toast);

  // Fade in
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
  });

  // Auto remove after 3s
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
