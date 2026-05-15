/**
 * Classroom.AI — API Client
 * ==========================
 * Centralized fetch wrapper with error handling, loading states, and toast notifications.
 */
import { showToast } from "./ui.js";

const API_BASE = "";

/**
 * Make an API request to the backend.
 * @param {string} endpoint - The API endpoint (e.g., "/summarize")
 * @param {object} body - The JSON body to send
 * @param {object} options - Optional configuration
 * @returns {Promise<object>} The parsed JSON response
 */
export async function apiRequest(endpoint, body, options = {}) {
  const { showError = true, timeout = 60000 } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (response.status === 429) {
      if (showError) showToast("Too many requests. Please wait a moment.", "warning");
      throw new Error("Rate limited");
    }

    const data = await response.json();

    if (!response.ok) {
      const msg = data.error || `Server error (${response.status})`;
      if (showError) showToast(msg, "error");
      throw new Error(msg);
    }

    return data;
  } catch (err) {
    clearTimeout(timer);
    if (err.name === "AbortError") {
      if (showError) showToast("Request timed out. Please try again.", "error");
      throw new Error("Request timed out");
    }
    if (err.message !== "Rate limited" && !err.message.startsWith("Server error")) {
      if (showError) showToast("Failed to connect to AI server.", "error");
    }
    throw err;
  }
}

/** Typewriter effect for output elements */
export function typeWriter(element, text, speed = 15) {
  return new Promise((resolve) => {
    element.textContent = "";
    let i = 0;
    function type() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        element.scrollTop = element.scrollHeight;
        i++;
        setTimeout(type, speed);
      } else {
        resolve();
      }
    }
    type();
  });
}
