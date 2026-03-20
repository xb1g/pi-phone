// navigation.js — Tab switching logic
import { state } from "./state.js";

const PANELS = {
  chat: () => document.getElementById("messages"),
  sessions: () => document.getElementById("sessions-view"),
};

export function switchTab(name) {
  if (name === "menu") {
    // "Menu" tab opens the control center sheet; don't change the active tab
    document.getElementById("control-center-button")?.click();
    return;
  }

  state.previousTab = state.activeTab;
  state.activeTab = name;

  // Show/hide panels
  for (const [key, getEl] of Object.entries(PANELS)) {
    const el = getEl();
    if (!el) continue;
    if (key === name) {
      el.removeAttribute("hidden");
    } else {
      el.setAttribute("hidden", "");
    }
  }

  // Show/hide composer (only in chat)
  const composer = document.querySelector(".composer-wrap");
  if (composer) composer.style.display = name === "chat" ? "" : "none";

  // Update tab button states
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    const isActive = btn.dataset.tab === name;
    btn.classList.toggle("tab-btn--active", isActive);
    btn.setAttribute("aria-current", isActive ? "page" : "false");
  });
}

export function initNavigation() {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });
  // Ensure initial state matches HTML (chat active, others hidden)
  const sessionsView = document.getElementById("sessions-view");
  if (sessionsView) sessionsView.setAttribute("hidden", "");
}
