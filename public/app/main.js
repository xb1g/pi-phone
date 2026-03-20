import { initializeBindings } from "./bindings.js";
import { handleAuthFailure, handleEnvelope } from "./handlers.js";
import { boot } from "./transport.js";
import { initTheme, toggleTheme, triggerHapticFeedback, setupControlCenter, openControlCenter, closeControlCenter, initKeyboardHandling } from "./ui.js";
import { el } from "./state.js";

// Initialize theme on load
initTheme();

// Setup theme toggle button
function setupThemeToggle() {
  if (!el.themeToggleButton) return;
  
  el.themeToggleButton.addEventListener("click", () => {
    toggleTheme();
    triggerHapticFeedback([10]);
  });
  
  // Keyboard shortcut: Alt+T to toggle theme
  document.addEventListener("keydown", (e) => {
    if (e.altKey && e.key === "t") {
      e.preventDefault();
      toggleTheme();
    }
  });
}

// Setup Control Center
function setupControlCenterUI() {
  setupControlCenter();
  
  // Control center button
  el.controlCenterButton?.addEventListener("click", () => {
    openControlCenter();
  });
  
  // Keyboard shortcut: Alt+C to open control center
  document.addEventListener("keydown", (e) => {
    if (e.altKey && e.key === "c") {
      e.preventDefault();
      openControlCenter();
    }
  });
  
  // Listen for control center actions
  document.addEventListener("control-center-action", (e) => {
    handleControlCenterAction(e.detail.action);
  });
}

function handleControlCenterAction(action) {
  // Map control center actions to existing functionality
  const actionMap = {
    new: () => el.insertCommandButton?.click(),
    compact: () => showToast("Type /compact in the message box", "info"),
    reload: () => showToast("Type /reload in the message box", "info"),
    refresh: () => el.refreshButton?.click(),
    model: () => showToast("Type /model in the message box", "info"),
    thinking: () => showToast("Type /thinking in the message box", "info"),
    sessions: () => el.sessionBrowserButton?.click(),
    tree: () => el.treeBrowserButton?.click(),
    stats: () => showToast("Type /stats in the message box", "info"),
    cost: () => showToast("Type /cost in the message box", "info"),
    abort: () => el.abortButton?.click(),
  };
  
  const handler = actionMap[action];
  if (handler) {
    handler();
  }
}

// Initialize all UI enhancements
function initializeUI() {
  setupThemeToggle();
  setupControlCenterUI();
  setupMobileOptimizations();
  setupAccessibility();
  initKeyboardHandling();
  setupQuickCommands();
}

// Setup quick command chips
function setupQuickCommands() {
  document.getElementById("quick-commands")?.addEventListener("click", (e) => {
    const chip = e.target.closest("[data-command]");
    if (!chip) return;
    const input = document.getElementById("prompt-input");
    if (!input) return;
    input.value = chip.dataset.command;
    input.focus();
    input.selectionStart = input.selectionEnd = input.value.length;
  });
}

// Mobile-specific optimizations
function setupMobileOptimizations() {
  // Prevent double-tap zoom on iOS
  let lastTouchEnd = 0;
  document.addEventListener("touchend", (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
  
  // Improve scroll performance
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

// Accessibility enhancements
function setupAccessibility() {
  // Focus management for modals
  const modals = document.querySelectorAll(".modal-backdrop");
  modals.forEach((modal) => {
    modal.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        modal.classList.add("hidden");
      }
    });
  });
  
  // Trap focus in modals when open
  document.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      const openModal = document.querySelector(".modal-backdrop:not(.hidden)");
      if (openModal) {
        trapFocusInModal(openModal, e);
      }
    }
  });
}

function trapFocusInModal(modal, event) {
  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];
  
  if (event.shiftKey) {
    if (document.activeElement === firstFocusable) {
      lastFocusable.focus();
      event.preventDefault();
    }
  } else {
    if (document.activeElement === lastFocusable) {
      firstFocusable.focus();
      event.preventDefault();
    }
  }
}

// Service Worker Registration for PWA
function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js?v=20260320-1")
        .then((registration) => {
          console.log("SW registered:", registration.scope);
        })
        .catch((error) => {
          console.log("SW registration failed:", error);
        });
    });
  }
}

// Check for updates
function checkForUpdates() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.update();
    });
  }
}

// Initialize everything when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initializeUI();
    registerServiceWorker();
    initializeBindings({ handleEnvelope, handleAuthFailure });
    boot({ handleEnvelope, handleAuthFailure });
    
    // Check for updates after initial load
    setTimeout(checkForUpdates, 5000);
  });
} else {
  initializeUI();
  registerServiceWorker();
  initializeBindings({ handleEnvelope, handleAuthFailure });
  boot({ handleEnvelope, handleAuthFailure });
  
  // Check for updates after initial load
  setTimeout(checkForUpdates, 5000);
}

// Handle online/offline status
window.addEventListener("online", () => {
  console.log("Network status: online");
});

window.addEventListener("offline", () => {
  console.log("Network status: offline");
});

// Prevent accidental back navigation during active sessions
window.addEventListener("beforeunload", (e) => {
  // Only warn if there's an active streaming session
  if (document.getElementById("stop-button")?.classList.contains("hidden") === false) {
    e.preventDefault();
    e.returnValue = "";
  }
});
