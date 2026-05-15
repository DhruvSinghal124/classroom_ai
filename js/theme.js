/**
 * Classroom.AI — Theme Manager
 * ==============================
 * Dark/Light mode toggle with system preference detection and localStorage persistence.
 */

const THEME_KEY = "classroom-ai-theme";

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const theme = saved || getSystemTheme();
  applyTheme(theme);

  // Listen for system changes
  window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", (e) => {
    if (!localStorage.getItem(THEME_KEY)) {
      applyTheme(e.matches ? "light" : "dark");
    }
  });
}

export function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  // Update toggle button if exists
  const btn = document.getElementById("themeToggle");
  if (btn) btn.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} mode`);
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
  localStorage.setItem(THEME_KEY, next);
}

window.toggleTheme = toggleTheme;
