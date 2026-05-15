/**
 * Classroom.AI — Sidebar Component
 * ==================================
 * Dynamically injected sidebar with collapsible menus, mobile support,
 * ARIA attributes, and keyboard navigation.
 */
import { auth, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "./firebase-config.js";
import { showToast, openModal, closeModal, smoothNavigate } from "./ui.js";

const SIDEBAR_HTML = `
<a href="#main-content" class="skip-link">Skip to main content</a>

<!-- Mobile overlay -->
<div id="sidebarOverlay" class="sidebar-overlay" aria-hidden="true"></div>

<!-- Sidebar -->
<aside id="sidebar" class="sidebar" role="navigation" aria-label="Main navigation">
  <div class="sidebar-inner">
    <!-- Logo -->
    <div class="sidebar-logo">
      <img src="logo.png" alt="" class="sidebar-logo-img" width="32" height="32" />
      <span class="sidebar-logo-text">Classroom.AI</span>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav" aria-label="Tools navigation">
      <!-- Home -->
      <div class="nav-group">
        <button class="nav-toggle" aria-expanded="false" aria-controls="homeMenu" onclick="toggleNav('homeMenu', this)">
          <span class="nav-toggle-label"><span class="nav-icon">🏠</span> Home</span>
          <svg class="nav-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
        </button>
        <div id="homeMenu" class="nav-submenu" role="group" hidden>
          <a href="dashboard.html" class="nav-link">📊 Dashboard</a>
        </div>
      </div>

      <!-- Text Tools -->
      <div class="nav-group">
        <button class="nav-toggle" aria-expanded="false" aria-controls="textMenu" onclick="toggleNav('textMenu', this)">
          <span class="nav-toggle-label"><span class="nav-icon">✍️</span> Text Tools</span>
          <svg class="nav-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
        </button>
        <div id="textMenu" class="nav-submenu" role="group" hidden>
          <a href="questioning.html" class="nav-link">Question Answering</a>
          <a href="summarizer.html" class="nav-link">Summarizer</a>
          <a href="notes.html" class="nav-link">Notes Generator</a>
          <a href="paraphraser.html" class="nav-link">Paraphraser</a>
          <a href="grammar-checker.html" class="nav-link">Grammar Checker</a>
          <a href="essay_writer.html" class="nav-link">Essay Writer</a>
        </div>
      </div>

      <!-- Visual Tools -->
      <div class="nav-group">
        <button class="nav-toggle" aria-expanded="false" aria-controls="visualMenu" onclick="toggleNav('visualMenu', this)">
          <span class="nav-toggle-label"><span class="nav-icon">🖼️</span> Visual Tools</span>
          <svg class="nav-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
        </button>
        <div id="visualMenu" class="nav-submenu" role="group" hidden>
          <a href="image_preview.html" class="nav-link">Image Preview</a>
        </div>
      </div>

      <!-- Voice Tools -->
      <div class="nav-group">
        <button class="nav-toggle" aria-expanded="false" aria-controls="voiceMenu" onclick="toggleNav('voiceMenu', this)">
          <span class="nav-toggle-label"><span class="nav-icon">🎤</span> Voice Tools</span>
          <svg class="nav-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
        </button>
        <div id="voiceMenu" class="nav-submenu" role="group" hidden>
          <a href="speech_to_text.html" class="nav-link">Speech to Text</a>
        </div>
      </div>

      <!-- Coding Tools -->
      <div class="nav-group">
        <button class="nav-toggle" aria-expanded="false" aria-controls="codeMenu" onclick="toggleNav('codeMenu', this)">
          <span class="nav-toggle-label"><span class="nav-icon">👨‍💻</span> Coding Tools</span>
          <svg class="nav-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
        </button>
        <div id="codeMenu" class="nav-submenu" role="group" hidden>
          <a href="code_generator.html" class="nav-link">Code Generator</a>
          <a href="code_explainer.html" class="nav-link">Code Explainer</a>
          <a href="code_debugger.html" class="nav-link">Code Debugger</a>
        </div>
      </div>

      <!-- Settings -->
      <a href="settings.html" class="nav-toggle nav-link-direct">
        <span class="nav-toggle-label"><span class="nav-icon">⚙️</span> Settings</span>
      </a>
    </nav>

    <!-- Footer -->
    <div class="sidebar-footer">
      <p>Built with 💡 for learning.</p>
      <p>© 2025 Classroom.AI</p>
    </div>
  </div>
</aside>

<!-- Header Bar -->
<header class="app-header" role="banner">
  <button id="sidebarToggle" class="btn-ghost sidebar-toggle" aria-label="Toggle sidebar" onclick="toggleSidebar()">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
  </button>
  <div class="header-right">
    <button id="themeToggle" class="btn-ghost" aria-label="Toggle dark/light mode" onclick="toggleTheme()">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
    </button>
    <span id="authText" class="auth-link" onclick="openModal('authModal')">Sign In</span>
    <div class="avatar-wrapper">
      <img id="profileAvatar" src="user.png" alt="Profile" class="header-avatar" onclick="toggleDropdown()" width="36" height="36" />
      <div id="dropdownMenu" class="dropdown-menu" hidden>
        <div class="dropdown-user">
          <img id="dropdownAvatar" src="user.png" alt="" width="40" height="40" class="dropdown-avatar" />
          <div><p id="dropdownName" class="dropdown-name">User</p><p class="dropdown-role">Student</p></div>
        </div>
        <a href="dashboard.html" class="dropdown-item">Edit Profile</a>
        <button class="dropdown-item dropdown-logout" onclick="logoutUser()">Logout</button>
      </div>
    </div>
  </div>
</header>
`;

// Auth Modals HTML
const AUTH_MODALS_HTML = `
<!-- Sign Up Modal -->
<div id="authModal" class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="authModalTitle">
  <div class="modal-content">
    <div class="modal-header">
      <h2 id="authModalTitle">Create Account</h2>
      <button class="modal-close" aria-label="Close dialog" onclick="closeModal('authModal')">&times;</button>
    </div>
    <form id="signupForm" class="auth-form" novalidate>
      <div class="input-group">
        <label for="signupName">Full Name</label>
        <input id="signupName" type="text" class="input" placeholder="John Doe" required autocomplete="name" />
      </div>
      <div class="input-group">
        <label for="signupEmail">Email</label>
        <input id="signupEmail" type="email" class="input" placeholder="you@example.com" required autocomplete="email" />
      </div>
      <div class="input-group">
        <label for="signupPassword">Password</label>
        <input id="signupPassword" type="password" class="input" placeholder="Min 6 characters" required autocomplete="new-password" minlength="6" />
      </div>
      <button type="submit" class="btn btn-primary btn-lg" style="width:100%">Sign Up</button>
      <p style="text-align:center;color:var(--color-text-muted);margin-top:0.75rem;font-size:0.875rem">
        Already have an account? <a href="#" onclick="closeModal('authModal');openModal('loginModal');return false;">Login</a>
      </p>
    </form>
    <div class="auth-divider"><span>or</span></div>
    <button class="btn btn-secondary" style="width:100%" onclick="googleSignIn()">
      <img src="google-logo-png.png" alt="" width="20" height="20" /> Continue with Google
    </button>
  </div>
</div>

<!-- Login Modal -->
<div id="loginModal" class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="loginModalTitle">
  <div class="modal-content">
    <div class="modal-header">
      <h2 id="loginModalTitle">Login</h2>
      <button class="modal-close" aria-label="Close dialog" onclick="closeModal('loginModal')">&times;</button>
    </div>
    <form id="loginForm" class="auth-form" novalidate>
      <div class="input-group">
        <label for="loginEmail">Email</label>
        <input id="loginEmail" type="email" class="input" placeholder="you@example.com" required autocomplete="email" />
      </div>
      <div class="input-group">
        <label for="loginPassword">Password</label>
        <input id="loginPassword" type="password" class="input" placeholder="Your password" required autocomplete="current-password" />
      </div>
      <button type="submit" class="btn btn-primary btn-lg" style="width:100%">Login</button>
    </form>
    <div class="auth-divider"><span>or</span></div>
    <button class="btn btn-secondary" style="width:100%" onclick="googleSignIn()">
      <img src="google-logo-png.png" alt="" width="20" height="20" /> Continue with Google
    </button>
  </div>
</div>
`;

// ---- Sidebar CSS (injected) ----
const SIDEBAR_CSS = `
<style>
.sidebar-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:calc(var(--z-sidebar) - 1);opacity:0;pointer-events:none;transition:opacity var(--transition-base);}
.sidebar-overlay.active{opacity:1;pointer-events:auto;}
.sidebar{position:fixed;top:0;left:0;bottom:0;width:var(--sidebar-width);background:var(--color-bg-secondary);border-right:1px solid var(--color-border);z-index:var(--z-sidebar);display:flex;flex-direction:column;transition:transform var(--transition-base);overflow-y:auto;}
.sidebar-inner{display:flex;flex-direction:column;height:100%;padding:1.25rem;}
.sidebar-logo{display:flex;align-items:center;gap:0.625rem;margin-bottom:1.5rem;padding:0.25rem 0;}
.sidebar-logo-img{width:32px;height:32px;object-fit:contain;}
.sidebar-logo-text{font-size:1.25rem;font-weight:700;color:var(--color-accent);}
.sidebar-nav{flex:1;display:flex;flex-direction:column;gap:0.25rem;}
.nav-group{display:flex;flex-direction:column;}
.nav-toggle{display:flex;align-items:center;justify-content:space-between;width:100%;padding:0.625rem 0.75rem;border:none;background:none;color:var(--color-text-primary);font-size:0.875rem;font-weight:500;border-radius:var(--radius-sm);cursor:pointer;transition:background var(--transition-fast);text-decoration:none;}
.nav-toggle:hover{background:var(--color-bg-hover);}
.nav-toggle-label{display:flex;align-items:center;gap:0.625rem;}
.nav-icon{font-size:1.125rem;}
.nav-chevron{transition:transform var(--transition-fast);flex-shrink:0;}
.nav-toggle[aria-expanded="true"] .nav-chevron{transform:rotate(180deg);}
.nav-submenu{padding-left:2.25rem;display:flex;flex-direction:column;gap:0.125rem;margin-top:0.125rem;}
.nav-submenu[hidden]{display:none;}
.nav-link{display:block;padding:0.5rem 0.75rem;color:var(--color-text-secondary);font-size:0.8125rem;border-radius:var(--radius-sm);transition:all var(--transition-fast);text-decoration:none;}
.nav-link:hover{background:var(--color-bg-hover);color:var(--color-text-primary);}
.nav-link.active{background:var(--color-accent-light);color:var(--color-accent);}
.nav-link-direct{text-decoration:none;}
.sidebar-footer{padding-top:1rem;border-top:1px solid var(--color-border);font-size:0.6875rem;color:var(--color-text-muted);line-height:1.6;}
.sidebar-toggle{display:none;}
@media(max-width:768px){.sidebar{transform:translateX(-100%);}.sidebar.open{transform:translateX(0);}.sidebar-toggle{display:flex;}}

/* Header */
.header-right{display:flex;align-items:center;gap:1rem;}
.auth-link{font-size:0.875rem;color:var(--color-text-secondary);cursor:pointer;transition:color var(--transition-fast);}
.auth-link:hover{color:var(--color-text-primary);}
.avatar-wrapper{position:relative;}
.header-avatar{width:36px;height:36px;border-radius:50%;object-fit:cover;cursor:pointer;border:2px solid var(--color-border);transition:border-color var(--transition-fast);}
.header-avatar:hover{border-color:var(--color-accent);}
.dropdown-menu{position:absolute;top:calc(100% + 0.5rem);right:0;width:240px;background:var(--color-bg-secondary);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:1rem;box-shadow:var(--shadow-lg);z-index:var(--z-modal);}
.dropdown-menu[hidden]{display:none;}
.dropdown-user{display:flex;align-items:center;gap:0.75rem;margin-bottom:0.75rem;padding-bottom:0.75rem;border-bottom:1px solid var(--color-border);}
.dropdown-avatar{width:40px;height:40px;border-radius:50%;object-fit:cover;}
.dropdown-name{font-weight:600;font-size:0.875rem;}
.dropdown-role{font-size:0.75rem;color:var(--color-text-muted);}
.dropdown-item{display:block;width:100%;padding:0.5rem 0.75rem;text-align:left;border:none;background:none;color:var(--color-text-secondary);font-size:0.875rem;border-radius:var(--radius-sm);cursor:pointer;transition:all var(--transition-fast);text-decoration:none;}
.dropdown-item:hover{background:var(--color-bg-hover);color:var(--color-text-primary);}
.dropdown-logout{color:var(--color-error);margin-top:0.5rem;border-top:1px solid var(--color-border);padding-top:0.75rem;}
.dropdown-logout:hover{background:rgba(239,68,68,0.1);}

/* Auth modals */
.auth-form{display:flex;flex-direction:column;gap:1rem;}
.auth-divider{display:flex;align-items:center;gap:1rem;margin:1rem 0;color:var(--color-text-muted);font-size:0.8125rem;}
.auth-divider::before,.auth-divider::after{content:'';flex:1;height:1px;background:var(--color-border);}
</style>
`;

/**
 * Initialize the sidebar on the page.
 */
export function initSidebar() {
  // Inject CSS
  document.head.insertAdjacentHTML("beforeend", SIDEBAR_CSS);
  // Inject HTML at start of body
  document.body.insertAdjacentHTML("afterbegin", SIDEBAR_HTML + AUTH_MODALS_HTML);
  // Highlight current page in nav
  highlightCurrentPage();
  // Setup auth state listener
  setupAuthListener();
  // Setup event listeners
  setupFormListeners();
  setupDropdownClose();
}

function highlightCurrentPage() {
  const current = window.location.pathname.split("/").pop() || "home.html";
  document.querySelectorAll(".nav-link").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === current) {
      link.classList.add("active");
      // Expand parent menu
      const submenu = link.closest(".nav-submenu");
      if (submenu) {
        submenu.hidden = false;
        const toggle = submenu.previousElementSibling;
        if (toggle) toggle.setAttribute("aria-expanded", "true");
      }
    }
  });
}

function setupAuthListener() {
  onAuthStateChanged(auth, (user) => {
    const authText = document.getElementById("authText");
    const avatar = document.getElementById("profileAvatar");
    const dropdownAvatar = document.getElementById("dropdownAvatar");
    const dropdownName = document.getElementById("dropdownName");
    if (user) {
      if (authText) authText.style.display = "none";
      if (avatar) avatar.src = user.photoURL || "user.png";
      if (dropdownAvatar) dropdownAvatar.src = user.photoURL || "user.png";
      if (dropdownName) dropdownName.textContent = user.displayName || user.email || "User";
    } else {
      if (authText) authText.style.display = "inline-block";
    }
  });
}

function setupFormListeners() {
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("signupName").value.trim();
      const email = document.getElementById("signupEmail").value.trim();
      const password = document.getElementById("signupPassword").value;
      if (!name || !email || !password) return showToast("Please fill all fields.", "warning");
      if (password.length < 6) return showToast("Password must be at least 6 characters.", "warning");
      createUserWithEmailAndPassword(auth, email, password)
        .then(() => { showToast("Account created!", "success"); closeModal("authModal"); })
        .catch((err) => showToast(err.message, "error"));
    });
  }
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value;
      if (!email || !password) return showToast("Please fill all fields.", "warning");
      signInWithEmailAndPassword(auth, email, password)
        .then(() => { showToast("Welcome back!", "success"); closeModal("loginModal"); })
        .catch((err) => showToast(err.message, "error"));
    });
  }
}

function setupDropdownClose() {
  document.addEventListener("click", (e) => {
    const dropdown = document.getElementById("dropdownMenu");
    const avatar = document.getElementById("profileAvatar");
    if (dropdown && !dropdown.contains(e.target) && e.target !== avatar) {
      dropdown.hidden = true;
    }
  });
}

// ---- Global functions ----
window.toggleNav = function (menuId, btn) {
  const menu = document.getElementById(menuId);
  if (!menu) return;
  const expanded = btn.getAttribute("aria-expanded") === "true";
  btn.setAttribute("aria-expanded", String(!expanded));
  menu.hidden = expanded;
};

window.toggleSidebar = function () {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  sidebar.classList.toggle("open");
  overlay.classList.toggle("active");
};

window.toggleDropdown = function () {
  const menu = document.getElementById("dropdownMenu");
  if (menu) menu.hidden = !menu.hidden;
};

window.googleSignIn = function () {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then(() => { showToast("Signed in with Google!", "success"); closeModal("authModal"); closeModal("loginModal"); })
    .catch((err) => showToast(err.message, "error"));
};

window.logoutUser = function () {
  signOut(auth)
    .then(() => { showToast("Logged out.", "info"); window.location.href = "home.html"; })
    .catch((err) => showToast(err.message, "error"));
};
