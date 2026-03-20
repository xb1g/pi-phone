import { THEME_CSS_VARIABLES, TOKEN_STORAGE_KEY, THEME_STORAGE_KEY, TOAST_DURATION } from "./constants.js";
import { formatCwdDisplay, formatTokenCount } from "./formatters.js";
import { el, state } from "./state.js";

let composerLayoutFrame = 0;
let toastTimeouts = new Map();

// ==========================================================================
// Theme Management
// ==========================================================================

export function initTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = savedTheme || (prefersDark ? "dark" : "light");
  applyTheme(theme);
  
  // Listen for system theme changes
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!localStorage.getItem(THEME_STORAGE_KEY)) {
      applyTheme(e.matches ? "dark" : "light");
    }
  });
}

export function applyTheme(theme) {
  if (theme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
    document.querySelector('meta[name="theme-color"]').setAttribute("content", "#f8fafc");
  } else {
    document.documentElement.removeAttribute("data-theme");
    document.querySelector('meta[name="theme-color"]').setAttribute("content", "#0b0f14");
  }
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  updateThemeToggleButton();
}

export function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  const newTheme = currentTheme === "light" ? "dark" : "light";
  applyTheme(newTheme);
  
  // Haptic feedback if available
  if (navigator.vibrate) {
    navigator.vibrate(10);
  }
}

function updateThemeToggleButton() {
  if (!el.themeToggleButton) return;
  const isLight = document.documentElement.getAttribute("data-theme") === "light";
  el.themeToggleButton.setAttribute("aria-label", `Switch to ${isLight ? "dark" : "light"} theme`);
  el.themeToggleButton.setAttribute("title", `Switch to ${isLight ? "dark" : "light"} theme`);
}

export function storeToken(token) {
  if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
  else localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function resetToken({ clearInput = false } = {}) {
  state.token = "";
  storeToken("");
  if (clearInput) el.tokenInput.value = "";
}

export function applyThemePalette(themePayload) {
  const root = document.documentElement;
  const colors = themePayload?.colors || {};

  for (const [colorKey, cssVariable] of Object.entries(THEME_CSS_VARIABLES)) {
    const value = typeof colors[colorKey] === "string" ? colors[colorKey].trim() : "";
    if (value) root.style.setProperty(cssVariable, value);
    else root.style.removeProperty(cssVariable);
  }

  if (themePayload?.name) root.dataset.piTheme = themePayload.name;
  else delete root.dataset.piTheme;
}

// ==========================================================================
// Quota Display
// ==========================================================================

function currentQuotaModel() {
  const model = state.snapshotState?.model;
  if (!model || typeof model !== "object") return null;
  return {
    provider: typeof model.provider === "string" ? model.provider : "",
    modelId: typeof model.id === "string" ? model.id : "",
  };
}

function shouldShowQuotaForModel(model = currentQuotaModel()) {
  if (!model) return false;
  return model.provider === "openai-codex" && /^gpt-/i.test(model.modelId || "");
}

function quotaPillClassName(leftPercent) {
  if (!Number.isFinite(leftPercent)) return "";
  if (leftPercent <= 10) return "danger";
  if (leftPercent <= 25) return "warn";
  return "good";
}

function contextPillClassName(percent) {
  if (!Number.isFinite(percent)) return "";
  if (percent > 90) return "danger";
  if (percent > 70) return "warn";
  return "";
}

function currentContextUsage() {
  const snapshot = state.snapshotState;
  if (!snapshot || typeof snapshot !== "object") return null;

  const contextWindow = Number(snapshot.contextUsage?.contextWindow ?? snapshot.model?.contextWindow);
  if (!Number.isFinite(contextWindow) || contextWindow <= 0) return null;

  const percent = typeof snapshot.contextUsage?.percent === "number"
    ? snapshot.contextUsage.percent
    : null;
  const percentDisplay = percent === null ? "?" : `${percent.toFixed(1)}%`;

  return {
    percent,
    text: `${percentDisplay}/${formatTokenCount(contextWindow)}`,
  };
}

export function syncComposerReserve() {
  if (!el.composerWrap) return;
  const reserve = Math.max(144, Math.ceil(el.composerWrap.getBoundingClientRect().height + 16));
  document.documentElement.style.setProperty("--composer-reserve", `${reserve}px`);
}

export function scheduleComposerLayoutSync() {
  if (composerLayoutFrame) return;
  composerLayoutFrame = requestAnimationFrame(() => {
    composerLayoutFrame = 0;
    syncComposerReserve();
  });
}

function isAnyModalOpen() {
  return !el.sheetModal.classList.contains("hidden") || 
         !el.uiModal.classList.contains("hidden") || 
         !el.loginModal.classList.contains("hidden");
}

export function scrollMessagesToBottom() {
  if (isAnyModalOpen()) return;
  requestAnimationFrame(() => {
    syncComposerReserve();
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
  });
}

// ==========================================================================
// Banner and Toast Notifications
// ==========================================================================

export function showBanner(text, kind = "info") {
  if (!text) {
    el.banner.classList.add("hidden");
    el.banner.textContent = "";
    el.banner.className = "banner hidden";
    return;
  }
  el.banner.textContent = text;
  el.banner.className = `banner ${kind}`;
  el.banner.classList.remove("hidden");
  
  // Auto-hide after 5 seconds for non-error messages
  if (kind !== "error") {
    setTimeout(() => {
      if (el.banner.textContent === text) {
        showBanner("");
      }
    }, 5000);
  }
}

export function showToast(text, kind = "info") {
  // Clear existing toast of same type
  if (toastTimeouts.has(kind)) {
    clearTimeout(toastTimeouts.get(kind));
  }
  
  const toast = document.createElement("div");
  toast.className = `toast ${kind === "error" ? "error" : kind === "success" ? "success" : kind === "warning" ? "warning" : ""}`;
  toast.textContent = text;
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  
  el.toastHost.appendChild(toast);
  
  // Haptic feedback for important toasts
  if (navigator.vibrate && (kind === "error" || kind === "success")) {
    navigator.vibrate(kind === "error" ? [50, 50, 50] : [30]);
  }
  
  const timeoutId = setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-10px)";
    toast.style.transition = "all 200ms ease";
    setTimeout(() => toast.remove(), 200);
    toastTimeouts.delete(kind);
  }, TOAST_DURATION);
  
  toastTimeouts.set(kind, timeoutId);
}

export function renderQuota() {
  const cwd = state.status?.cwd || state.health?.cwd || "";
  const contextUsage = currentContextUsage();

  if (cwd) {
    el.quotaCwd.textContent = formatCwdDisplay(cwd);
    el.quotaCwd.title = cwd;
    el.quotaCwd.setAttribute("aria-label", `Working directory ${cwd}`);
    el.quotaCwd.className = "quota-pill cwd-pill mono";
  } else {
    el.quotaCwd.textContent = "";
    el.quotaCwd.title = "";
    el.quotaCwd.removeAttribute("aria-label");
    el.quotaCwd.className = "quota-pill cwd-pill mono hidden";
  }

  if (contextUsage) {
    el.quotaContext.textContent = contextUsage.text;
    el.quotaContext.title = "Current context usage";
    el.quotaContext.setAttribute("aria-label", `Current context usage ${contextUsage.text}`);
    el.quotaContext.className = `quota-pill quota-context-pill mono ${contextPillClassName(contextUsage.percent)}`.trim();
  } else {
    el.quotaContext.textContent = "";
    el.quotaContext.title = "";
    el.quotaContext.removeAttribute("aria-label");
    el.quotaContext.className = "quota-pill quota-context-pill mono hidden";
  }

  const quotaSupported = shouldShowQuotaForModel();
  if (!quotaSupported) {
    state.quota = null;
  }

  const primary = quotaSupported ? state.quota?.primaryWindow : null;
  const secondary = quotaSupported ? state.quota?.secondaryWindow : null;
  const hasQuotaPills = Boolean(contextUsage || (state.quota?.visible && (primary || secondary)));

  if (primary) {
    el.quotaPrimary.textContent = primary.text;
    el.quotaPrimary.title = `${primary.label} quota remaining`;
    el.quotaPrimary.setAttribute("aria-label", `${primary.label} quota remaining ${primary.text}`);
    el.quotaPrimary.className = `quota-pill ${quotaPillClassName(primary.leftPercent)}`.trim();
  } else {
    el.quotaPrimary.textContent = "";
    el.quotaPrimary.title = "";
    el.quotaPrimary.removeAttribute("aria-label");
    el.quotaPrimary.className = "quota-pill hidden";
  }

  if (secondary) {
    el.quotaSecondary.textContent = secondary.text;
    el.quotaSecondary.title = `${secondary.label} quota remaining`;
    el.quotaSecondary.setAttribute("aria-label", `${secondary.label} quota remaining ${secondary.text}`);
    el.quotaSecondary.className = `quota-pill ${quotaPillClassName(secondary.leftPercent)}`.trim();
  } else {
    el.quotaSecondary.textContent = "";
    el.quotaSecondary.title = "";
    el.quotaSecondary.removeAttribute("aria-label");
    el.quotaSecondary.className = "quota-pill hidden";
  }

  const hasMetaRow = Boolean(cwd);
  el.quotaMetaRow.classList.toggle("hidden", !hasMetaRow);
  el.quotaPillsRow.classList.toggle("hidden", !hasQuotaPills);
  el.quotaRow.classList.toggle("hidden", !(hasMetaRow || hasQuotaPills));
  scheduleComposerLayoutSync();
}

// ==========================================================================
// Header and Status Rendering
// ==========================================================================

function updateComposerState() {
  const streaming = Boolean(state.status?.isStreaming || state.snapshotState?.isStreaming);
  const sendLabel = streaming ? "Queue message" : "Send message";

  el.abortButton.disabled = !streaming;
  if (el.stopButton) {
    el.stopButton.disabled = !streaming;
    el.stopButton.classList.toggle("hidden", !streaming);
  }
  el.sendButton.setAttribute("aria-label", sendLabel);
  el.sendButton.setAttribute("title", sendLabel);
  el.steerButton.classList.toggle("hidden", !streaming);
  scheduleComposerLayoutSync();
}

export function renderHeader() {
  const connected = state.socket?.readyState === WebSocket.OPEN;
  
  // Update connection pill
  el.connectionPill.textContent = connected ? "Connected" : "Offline";
  el.connectionPill.className = `status-pill ${connected ? "connected" : "offline"}`;
  
  // Update streaming indicator
  const streaming = Boolean(state.status?.isStreaming || state.snapshotState?.isStreaming);
  if (el.streamingPill) {
    el.streamingPill.classList.toggle("hidden", !streaming);
  }
  
  // Apply theme from server
  const status = state.status || state.health || {};
  applyThemePalette(status.theme || state.health?.theme || null);
  
  // Update status values
  const snapshotMatchesActive = !state.snapshotWorkerId || !state.activeSessionId || state.snapshotWorkerId === state.activeSessionId;
  const snapshot = snapshotMatchesActive ? (state.snapshotState || {}) : {};
  const activeSession = state.activeSessions.find((session) => session.id === state.activeSessionId) || null;
  
  el.cwdValue.textContent = status.cwd || "—";
  el.sessionValue.textContent = snapshot.sessionName || snapshot.sessionId || activeSession?.label || "Current session";
  el.modelValue.textContent = snapshot.model?.name || snapshot.model?.id || activeSession?.model?.name || "Default";
  el.thinkingValue.textContent = snapshot.thinkingLevel || "—";
  el.streamingValue.textContent = streaming ? "Streaming" : "Idle";
  el.serverValue.textContent = status.port ? `${status.host || "127.0.0.1"}:${status.port}` : "—";
  
  updateComposerState();
  renderQuota();
}

export function autoResizeTextarea() {
  el.promptInput.style.height = "auto";
  el.promptInput.style.height = `${Math.min(el.promptInput.scrollHeight, 220)}px`;
  scheduleComposerLayoutSync();
}

// ==========================================================================
// Modal Management
// ==========================================================================

export function openTokenModal() {
  if (el.loginModal.classList.contains("hidden")) {
    el.tokenInput.value = state.token;
  }
  el.loginModal.classList.remove("hidden");
  
  // Focus with slight delay for animation
  setTimeout(() => {
    el.tokenInput.focus();
    el.tokenInput.select();
  }, 100);
}

export function closeTokenModal() {
  el.loginModal.classList.add("hidden");
}

export function clearUiModal() {
  state.pendingUiRequest = null;
  el.uiModal.classList.add("hidden");
  el.uiModalOptions.innerHTML = "";
  el.uiModalButtons.innerHTML = "";
  el.uiModalInput.value = "";
  el.uiModalInput.classList.add("hidden");
}

export function openUiModalForRequest(request, onResponse) {
  state.pendingUiRequest = request;
  el.uiModalTitle.textContent = request.title || "Action required";
  el.uiModalMessage.textContent = request.message || "";
  el.uiModalOptions.innerHTML = "";
  el.uiModalButtons.innerHTML = "";
  el.uiModalInput.value = request.prefill || "";
  el.uiModalInput.classList.add("hidden");

  const addCancel = () => {
    const cancelButton = document.createElement("button");
    cancelButton.className = "secondary";
    cancelButton.textContent = "Cancel";
    cancelButton.addEventListener("click", () => {
      onResponse({ id: request.id, cancelled: true });
      clearUiModal();
    });
    el.uiModalButtons.appendChild(cancelButton);
  };

  if (request.method === "select") {
    for (const option of request.options || []) {
      const button = document.createElement("button");
      button.textContent = option;
      button.className = "secondary";
      button.addEventListener("click", () => {
        onResponse({ id: request.id, value: option });
        clearUiModal();
      });
      el.uiModalOptions.appendChild(button);
    }
    addCancel();
  } else if (request.method === "confirm") {
    const denyButton = document.createElement("button");
    denyButton.className = "secondary";
    denyButton.textContent = "No";
    denyButton.addEventListener("click", () => {
      onResponse({ id: request.id, confirmed: false });
      clearUiModal();
    });

    const confirmButton = document.createElement("button");
    confirmButton.textContent = "Yes";
    confirmButton.addEventListener("click", () => {
      onResponse({ id: request.id, confirmed: true });
      clearUiModal();
    });

    el.uiModalButtons.appendChild(denyButton);
    el.uiModalButtons.appendChild(confirmButton);
  } else if (request.method === "input" || request.method === "editor") {
    el.uiModalInput.classList.remove("hidden");
    el.uiModalInput.placeholder = request.placeholder || "";

    const submitButton = document.createElement("button");
    submitButton.textContent = "Submit";
    submitButton.addEventListener("click", () => {
      onResponse({ id: request.id, value: el.uiModalInput.value });
      clearUiModal();
    });

    addCancel();
    el.uiModalButtons.appendChild(submitButton);
  }

  el.uiModal.classList.remove("hidden");
  
  // Focus management
  setTimeout(() => {
    if (request.method === "input" || request.method === "editor") {
      el.uiModalInput.focus();
      el.uiModalInput.select();
    }
  }, 100);
}

// ==========================================================================
// Loading Overlay
// ==========================================================================

export function showLoadingOverlay(text = "Loading…") {
  if (el.loadingOverlay) {
    el.loadingOverlay.querySelector(".loading-text").textContent = text;
    el.loadingOverlay.classList.remove("hidden");
    el.loadingOverlay.setAttribute("aria-hidden", "false");
  }
}

export function hideLoadingOverlay() {
  if (el.loadingOverlay) {
    el.loadingOverlay.classList.add("hidden");
    el.loadingOverlay.setAttribute("aria-hidden", "true");
  }
}

// ==========================================================================
// Enhanced Accessibility
// ==========================================================================

export function announceToScreenReader(message, priority = "polite") {
  let announcer = document.getElementById("sr-announcer");
  if (!announcer) {
    announcer = document.createElement("div");
    announcer.id = "sr-announcer";
    announcer.setAttribute("role", "status");
    announcer.setAttribute("aria-live", priority);
    announcer.setAttribute("aria-atomic", "true");
    announcer.className = "sr-only";
    document.body.appendChild(announcer);
  }
  
  // Clear and set message (triggers announcement)
  announcer.textContent = "";
  setTimeout(() => {
    announcer.textContent = message;
  }, 100);
}

// ==========================================================================
// Mobile UX Enhancements
// ==========================================================================

export function triggerHapticFeedback(pattern = [10]) {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

export function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function isTouchDevice() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}
