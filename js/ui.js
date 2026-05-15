/**
 * Classroom.AI — UI Utilities
 * ============================
 * Toast notifications, modal management, loading states.
 */

// ---- Toast System ----
let toastContainer = null;

function ensureToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className = "toast-container";
    toastContainer.setAttribute("aria-live", "polite");
    toastContainer.setAttribute("aria-label", "Notifications");
    document.body.appendChild(toastContainer);
  }
}

/**
 * Show a toast notification.
 * @param {string} message
 * @param {"success"|"error"|"info"|"warning"} type
 * @param {number} duration - ms before auto-dismiss
 */
export function showToast(message, type = "info", duration = 4000) {
  ensureToastContainer();
  const icons = { success: "✓", error: "✕", info: "ℹ", warning: "⚠" };
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.setAttribute("role", "alert");
  toast.innerHTML = `<span>${icons[type] || ""}</span><span>${message}</span>`;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("toast-exit");
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ---- Modal Management ----
/**
 * Open a modal by ID.
 * @param {string} modalId
 */
export function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.add("active");
  modal.style.display = "flex";
  // Trap focus
  const focusable = modal.querySelectorAll('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (focusable.length) focusable[0].focus();
  // Close on Escape
  const handler = (e) => {
    if (e.key === "Escape") { closeModal(modalId); document.removeEventListener("keydown", handler); }
  };
  document.addEventListener("keydown", handler);
  // Close on backdrop click
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(modalId); }, { once: true });
}

/**
 * Close a modal by ID.
 * @param {string} modalId
 */
export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.remove("active");
  modal.style.display = "none";
}

// ---- Loading State ----
/**
 * Set loading state on a button.
 */
export function setButtonLoading(btn, loading, originalText = "") {
  if (loading) {
    btn.dataset.originalText = btn.textContent;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Processing...';
  } else {
    btn.disabled = false;
    btn.textContent = originalText || btn.dataset.originalText || "Submit";
  }
}

// ---- Smooth Navigation ----
export function smoothNavigate(url) {
  document.body.classList.add("fade-out");
  setTimeout(() => { window.location.href = url; }, 400);
}

// Make available globally for inline onclick handlers
window.showToast = showToast;
window.openModal = openModal;
window.closeModal = closeModal;
window.smoothNavigate = smoothNavigate;
