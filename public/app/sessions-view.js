// sessions-view.js — Sessions tab cards
import { state } from "./state.js";
import { switchTab } from "./navigation.js";

// escapeHtml is defined globally in the existing codebase (check window.escapeHtml
// or import from wherever it lives — likely utils or inline in sheets-view.js).
// If not importable, copy the implementation:
function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function deriveStatus(session) {
  if (session.lastError) return "error";
  if (session.isStreaming) return "streaming";
  if (session.hasPendingUiRequest) return "waiting";
  return "idle";
}

const STATUS_LABELS = {
  streaming: "streaming",
  waiting: "waiting for you",
  idle: "idle",
  error: "error",
};

function relativeTime(ms) {
  if (!ms) return "";
  const diff = Date.now() - ms;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

function projectName(session) {
  const cwd = session.cwd || session.secondaryLabel || "";
  if (!cwd) return "unknown";
  return cwd.split("/").filter(Boolean).pop() || cwd;
}

function createSessionCard(session) {
  const status = deriveStatus(session);
  const isCurrent = session.id === state.activeSessionId;

  const card = document.createElement("button");
  card.className = "session-card" + (isCurrent ? " session-card--active" : "");
  card.dataset.sessionId = session.id;
  card.setAttribute("aria-label", "Open session");

  // Build structure with textContent for safety
  const header = document.createElement("div");
  header.className = "session-card__header";

  const project = document.createElement("span");
  project.className = "session-card__project";
  project.textContent = projectName(session);

  const badge = document.createElement("span");
  badge.className = `session-badge badge--${status}`;
  badge.textContent = STATUS_LABELS[status] || status;

  header.appendChild(project);
  header.appendChild(badge);

  const goal = document.createElement("div");
  goal.className = "session-card__goal";
  goal.textContent = session.firstUserPreview || "No messages yet";

  const footer = document.createElement("div");
  footer.className = "session-card__footer";
  const time = relativeTime(session.lastActivityAt);
  if (time) {
    const timeEl = document.createElement("span");
    timeEl.className = "session-card__time";
    timeEl.textContent = time;
    footer.appendChild(timeEl);
  }

  card.appendChild(header);
  card.appendChild(goal);
  card.appendChild(footer);

  card.addEventListener("click", () => {
    if (session.id !== state.activeSessionId) {
      import("./transport.js").then(({ sendRpc }) => {
        sendRpc({ command: "switch_session", data: { sessionId: session.id } });
      });
    }
    switchTab("chat");
  });

  return card;
}

export function renderSessionsView() {
  const container = document.getElementById("sessions-list");
  if (!container) return;

  const sessions = [...state.activeSessions].sort((a, b) => {
    const aCurr = a.id === state.activeSessionId ? 1 : 0;
    const bCurr = b.id === state.activeSessionId ? 1 : 0;
    if (aCurr !== bCurr) return bCurr - aCurr;
    return (b.lastActivityAt || 0) - (a.lastActivityAt || 0);
  });

  // Clear safely
  while (container.firstChild) container.removeChild(container.firstChild);

  if (sessions.length === 0) {
    const empty = document.createElement("div");
    empty.className = "sessions-empty";

    const msg = document.createElement("p");
    msg.textContent = "No active sessions";

    const hint = document.createElement("p");
    hint.className = "sessions-empty__hint";
    hint.textContent = "Start Pi with /phone-start 8787 <token>";

    empty.appendChild(msg);
    empty.appendChild(hint);
    container.appendChild(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const session of sessions) {
    fragment.appendChild(createSessionCard(session));
  }
  container.appendChild(fragment);
}
