# Pi-Phone Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign pi-phone into a polished mobile app with a sessions list (goal + status), collapsed tool calls, bottom tab navigation, an organized control center, and a composer that never hides behind the keyboard.

**Architecture:** Vanilla JS PWA — no framework, no build step. All changes are in `public/` (frontend) and `src/session-pool/` (one small backend addition). The backend already pushes `SessionSummary[]` (including `firstUserPreview`, `isStreaming`, `hasPendingUiRequest`, `lastError`) via `channel: "sessions"` → `state.activeSessions`. We build on what's there.

**Security note:** All user/server data rendered into HTML uses `textContent`. `escapeHtml()` exists in the codebase but is not exported — `sessions-view.js` defines a local `esc()` copy for any cases where HTML strings are needed. Static structure built with `document.createElement` is always safe.

**Tech Stack:** Vanilla JS (ES modules), CSS custom properties, WebSocket (`ws`), Node.js/TypeScript backend. No build step — edited files are served directly from `public/`.

---

## Codebase Map

### Files Modified

| File | What changes |
|------|-------------|
| `public/index.html` | Add bottom tab bar `<nav>`, sessions tab panel `<div id="sessions-view">`, restructure control center HTML |
| `public/styles.css` | Tab bar styles, session card styles, tool-call chip styles, control center section styles, composer keyboard CSS |
| `public/app/state.js` | Add `activeTab`, `previousTab` fields |
| `public/app/main.js` | Init navigation, keyboard handler, attachment size guard |
| `public/app/handlers.js` | Call `renderSessionsView()` + `renderChatEmptyState()` on catalog update |
| `public/app/ui.js` | `visualViewport` keyboard handler, danger-zone confirm, CC session info, chat empty state |
| `public/app/tool-rendering.js` | Collapsed-by-default chip rendering |
| `public/app/transport.js` | Append reconnect notice on reconnect |
| `public/app/messages.js` | Ensure markdown applied to all assistant messages |

### Files Created

| File | What it does |
|------|-------------|
| `public/app/navigation.js` | Tab switching: `switchTab(name)`, keeps `state.activeTab`, shows/hides panels |
| `public/app/sessions-view.js` | Renders sessions tab: card list from `state.activeSessions`, status derivation, empty state |

### Backend (minimal)

| File | What changes |
|------|-------------|
| `src/session-pool/types.ts` | Add `cwd` field to `SessionSummary` |
| `src/session-pool/session-worker.ts` | Include `cwd` in `getSummary()` return value |

---

## Task 1: Add `cwd` to SessionSummary

The sessions tab needs to show the project name (basename of cwd). `SessionSummary` in `src/session-pool/types.ts` doesn't include `cwd` yet.

**Files:**
- Modify: `src/session-pool/types.ts`
- Modify: `src/session-pool/session-worker.ts`

- [ ] **Step 1: Add `cwd` to the type**

In `src/session-pool/types.ts`, find the `SessionSummary` type and add one field after `secondaryLabel`:

```typescript
  cwd: string;
```

- [ ] **Step 2: Populate `cwd` in `getSummary()`**

In `src/session-pool/session-worker.ts`, find the `getSummary()` method (around line 202) and add `cwd: this.options.cwd` to its return object.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/bunyasit/dev/pi-phone
npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors

- [ ] **Step 4: Commit**

```bash
git add src/session-pool/types.ts src/session-pool/session-worker.ts
git commit -m "feat: add cwd to SessionSummary for sessions tab"
```

---

## Task 2: Bottom Tab Bar — HTML + CSS

Add the `<nav class="bottom-tab-bar">` and `<div id="sessions-view">` panel. No JS yet — just markup and CSS.

**Files:**
- Modify: `public/index.html`
- Modify: `public/styles.css`

- [ ] **Step 1: Add sessions view panel to index.html**

Inside `.app-shell`, after `<main id="messages">`, insert:

```html
<div id="sessions-view" class="tab-panel" hidden>
  <div id="sessions-list" class="sessions-list">
    <!-- Rendered by sessions-view.js -->
  </div>
</div>
```

- [ ] **Step 2: Add bottom tab bar to index.html**

Before the closing `</div>` of `.app-shell`, insert:

```html
<nav class="bottom-tab-bar" aria-label="Main navigation">
  <button class="tab-btn tab-btn--active" data-tab="chat" aria-label="Chat" aria-current="page">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
    <span>Chat</span>
  </button>
  <button class="tab-btn" data-tab="sessions" aria-label="Sessions" aria-current="false">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
    <span>Sessions</span>
  </button>
  <button class="tab-btn" data-tab="menu" aria-label="Menu" aria-current="false">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
    <span>Menu</span>
  </button>
</nav>
```

- [ ] **Step 3: Add tab bar + sessions panel CSS to styles.css**

Append to `public/styles.css`:

```css
/* ─── Bottom Tab Bar ───────────────────────────────────── */
.bottom-tab-bar {
  display: flex;
  align-items: stretch;
  background: var(--bg-surface, #1a1a1a);
  border-top: 1px solid var(--border-color, #333);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  flex-shrink: 0;
  z-index: 100;
}

.tab-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  min-height: 56px;
  padding: 8px 4px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted, #888);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.02em;
  transition: color 0.15s ease;
  -webkit-tap-highlight-color: transparent;
}

.tab-btn:active { opacity: 0.7; }

.tab-btn--active,
.tab-btn--active svg {
  color: var(--accent, #8abeb7);
  stroke: var(--accent, #8abeb7);
}

/* ─── Tab Panels ───────────────────────────────────────── */
.tab-panel {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

#sessions-view {
  padding: 16px;
  background: var(--bg-base, #111);
}

/* Ensure .app-shell lays out correctly */
.app-shell {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  overflow: hidden;
}

#messages {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
}
```

- [ ] **Step 4: Visual check**

Open `https://pi.passionseed.org` in a browser.
Expected: bottom tab bar visible with 3 tabs, chat content still shows normally. Tabs are not interactive yet.

- [ ] **Step 5: Commit**

```bash
git add public/index.html public/styles.css
git commit -m "feat: bottom tab bar HTML and CSS"
```

---

## Task 3: Tab Navigation JS

Wire up the tab bar so clicking a tab switches panels. "Menu" tab opens the existing control center sheet.

**Files:**
- Create: `public/app/navigation.js`
- Modify: `public/app/state.js`
- Modify: `public/app/main.js`

- [ ] **Step 1: Add `activeTab` + `previousTab` to state.js**

In `public/app/state.js`, add alongside `activeSessions`:

```javascript
activeTab: "chat",
previousTab: "chat",
```

- [ ] **Step 2: Create `public/app/navigation.js`**

```javascript
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
```

- [ ] **Step 3: Import and init in main.js**

In `public/app/main.js`, add at the top with other imports:

```javascript
import { initNavigation } from "./navigation.js";
```

In the init block (inside `DOMContentLoaded` or at module level), call:

```javascript
initNavigation();
```

- [ ] **Step 4: Manual test**

```
1. Open app
2. Tap "Sessions" tab → sessions panel shows (empty), composer hides
3. Tap "Chat" tab → messages show, composer shows
4. Tap "Menu" tab → control center sheet opens; Chat tab stays highlighted
5. Close sheet → still on Chat view
```

- [ ] **Step 5: Commit**

```bash
git add public/app/navigation.js public/app/state.js public/app/main.js
git commit -m "feat: tab navigation wiring"
```

---

## Task 4: Sessions Tab View

Render session cards using `state.activeSessions` (already populated via WebSocket catalog broadcasts).

**Files:**
- Create: `public/app/sessions-view.js`
- Modify: `public/app/handlers.js`
- Modify: `public/styles.css`

**Security:** All server-supplied strings rendered into HTML use `escapeHtml()`. Static structure is set once via innerHTML, then dynamic text is applied with `textContent`.

- [ ] **Step 1: Create `public/app/sessions-view.js`**

```javascript
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
```

- [ ] **Step 2: Call renderSessionsView in handlers.js**

In `public/app/handlers.js`, find the `channel: "sessions"` handler (around line 329). Add an import at the top of the file:

```javascript
import { renderSessionsView } from "./sessions-view.js";
```

Then in the catalog handler, after updating `state.activeSessions`, add:

```javascript
renderSessionsView();
```

- [ ] **Step 3: Add session card CSS to styles.css**

```css
/* ─── Sessions View ────────────────────────────────────── */
.sessions-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.session-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  padding: 14px 16px;
  background: var(--bg-surface, #1a1a1a);
  border: 1px solid var(--border-color, #333);
  border-radius: 14px;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease;
  -webkit-tap-highlight-color: transparent;
  min-height: 72px;
}

.session-card:active { background: var(--bg-surface-hover, #242424); }

.session-card--active { border-color: var(--accent, #8abeb7); }

.session-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.session-card__project {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-primary, #eee);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-card__goal {
  font-size: 13px;
  color: var(--text-secondary, #aaa);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.session-card__footer { display: flex; justify-content: flex-end; }

.session-card__time { font-size: 11px; color: var(--text-muted, #666); }

/* Status badges (shared with control center) */
.session-badge {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 20px;
  white-space: nowrap;
  flex-shrink: 0;
}
.badge--streaming {
  background: color-mix(in srgb, var(--accent, #8abeb7) 20%, transparent);
  color: var(--accent, #8abeb7);
  animation: badge-pulse 2s ease-in-out infinite;
}
.badge--waiting  { background: color-mix(in srgb, #f5a623 20%, transparent); color: #f5a623; }
.badge--idle     { background: var(--bg-base, #111); color: var(--text-muted, #666); }
.badge--error    { background: color-mix(in srgb, #e74c3c 20%, transparent); color: #e74c3c; }

@keyframes badge-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

/* Empty state */
.sessions-empty { text-align: center; padding: 48px 24px; color: var(--text-muted, #666); }
.sessions-empty__hint { font-size: 13px; margin-top: 8px; }
```

- [ ] **Step 4: Manual test**

```
1. Open app with an active Pi session
2. Tap "Sessions" tab
3. Verify: session card shows project name (basename of cwd), goal, status badge, timestamp
4. Active session has accent border
5. Tap card → Chat tab opens showing that session
6. While Pi is streaming: "streaming" badge pulses on the card
7. When Pi is waiting: "waiting for you" badge shown in orange
8. No sessions → empty state message shown
```

- [ ] **Step 5: Commit**

```bash
git add public/app/sessions-view.js public/app/handlers.js public/styles.css
git commit -m "feat: sessions tab with status cards"
```

---

## Task 5: Tool Call Collapsed Chips

Tool calls expand/collapse using `state.toolPanelOpen`. Change the default from open to closed.

**Files:**
- Modify: `public/app/tool-rendering.js`
- Modify: `public/styles.css`

- [ ] **Step 1: Read the current tool panel rendering**

In `public/app/tool-rendering.js`, search for `toolPanelOpen` to find:
1. Where it initializes a panel's default state
2. The collapsed vs expanded rendering branches

- [ ] **Step 2: Change default to collapsed**

Find the initialization check (looks like one of these patterns):

```javascript
// Pattern A:
if (!state.toolPanelOpen.has(item.id)) {
  state.toolPanelOpen.set(item.id, true);  // change true → false
}

// Pattern B: default in ternary
const isOpen = state.toolPanelOpen.get(item.id) ?? true;  // change true → false
```

Change `true` to `false` so new tool items start collapsed.

- [ ] **Step 3: Verify collapsed view shows icon + summary**

Find the rendering path for when `isOpen === false`. It should show at minimum a one-line chip. If the collapsed view is empty or missing, add:

```javascript
// In the collapsed branch of tool rendering:
const TOOL_ICONS = { edit: "✏️", write: "📝", read: "📖", bash: "💻", grep: "🔍", find: "🔍", ls: "📁" };

function toolSummaryLine(item) {
  const icon = TOOL_ICONS[item.toolName] || "🔧";
  let detail = "";
  if (item.args?.path) detail = item.args.path.split("/").pop();
  else if (item.args?.command) detail = item.args.command.slice(0, 40);
  else detail = item.toolName;
  return `${icon} ${detail}`;
}
```

The collapsed chip element should:
- Use `textContent` (not innerHTML) for the summary text
- Have a `›` or chevron that rotates when open (CSS handles this via `.tool-chip--open`)

- [ ] **Step 4: Add chip CSS to styles.css**

```css
/* ─── Tool Call Chips ──────────────────────────────────── */
.tool-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px 4px 8px;
  background: var(--bg-surface, #1a1a1a);
  border: 1px solid var(--border-color, #333);
  border-radius: 20px;
  font-size: 12px;
  color: var(--text-secondary, #aaa);
  cursor: pointer;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.12s ease;
  user-select: none;
}

.tool-chip:active { background: var(--bg-surface-hover, #242424); }

.tool-chip__chevron {
  flex-shrink: 0;
  color: var(--text-muted, #666);
  transition: transform 0.15s ease;
}

.tool-chip--open .tool-chip__chevron { transform: rotate(90deg); }
```

- [ ] **Step 5: Manual test**

```
1. Run a Pi task that edits files and runs bash commands
2. Verify: tool calls render as chips (✏️ styles.css, 💻 npm install)
3. Tap a chip → expands showing full details
4. Tap again → collapses
5. Existing/historical messages also collapsed by default
6. "running" tools still visible during streaming
```

- [ ] **Step 6: Commit**

```bash
git add public/app/tool-rendering.js public/styles.css
git commit -m "feat: tool calls collapsed by default"
```

---

## Task 6: Control Center Redesign

Reorganize into: session info → session actions → model → danger zone.

**Files:**
- Modify: `public/index.html`
- Modify: `public/styles.css`
- Modify: `public/app/ui.js`

- [ ] **Step 1: Read the current control center HTML**

In `public/index.html`, find `id="control-center"` and read its full contents. Note the existing IDs and class names used in `ui.js` so they can be preserved or updated.

- [ ] **Step 2: Replace control center inner HTML**

Inside `#control-center` (after the drag handle `<div class="sheet-handle">`), replace the content with:

```html
<div class="cc-scroll">
  <!-- Session info -->
  <section class="cc-section cc-section--info" id="cc-session-info">
    <div class="cc-session-goal" id="cc-goal"></div>
    <div class="cc-session-meta">
      <span id="cc-project"></span>
      <span id="cc-status-badge" class="session-badge badge--idle">idle</span>
    </div>
  </section>

  <!-- Session actions -->
  <section class="cc-section">
    <h3 class="cc-section-title">Session</h3>
    <div class="cc-card-list">
      <button class="cc-card" id="cc-new-session">
        <span class="cc-card__icon" aria-hidden="true">＋</span>
        <span class="cc-card__label">New session</span>
      </button>
      <button class="cc-card" id="cc-switch-session">
        <span class="cc-card__icon" aria-hidden="true">⇄</span>
        <span class="cc-card__label">Switch session</span>
      </button>
      <button class="cc-card" id="cc-stop-session">
        <span class="cc-card__icon" aria-hidden="true">◼</span>
        <span class="cc-card__label">Stop session</span>
      </button>
    </div>
  </section>

  <!-- Model -->
  <section class="cc-section">
    <h3 class="cc-section-title">Model</h3>
    <button class="cc-model-chip" id="cc-model-chip">
      <span id="cc-model-name">—</span>
      <span class="cc-model-chevron" aria-hidden="true">›</span>
    </button>
  </section>

  <!-- Danger zone -->
  <section class="cc-section cc-section--danger">
    <h3 class="cc-section-title cc-section-title--danger">Danger</h3>
    <div class="cc-card-list">
      <button class="cc-card cc-card--danger" id="cc-kill-server">
        <span class="cc-card__icon" aria-hidden="true">✕</span>
        <span class="cc-card__label">Kill server</span>
      </button>
    </div>
  </section>
</div>
```

- [ ] **Step 3: Add control center CSS to styles.css**

```css
/* ─── Control Center ───────────────────────────────────── */
.cc-scroll {
  overflow-y: auto;
  max-height: calc(85vh - 60px);
  padding: 0 16px 32px;
  -webkit-overflow-scrolling: touch;
}

.cc-section { margin-bottom: 20px; }

.cc-section-title {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted, #666);
  margin: 0 0 10px;
}
.cc-section-title--danger { color: #e74c3c; }

.cc-section--info {
  padding: 14px 16px;
  background: var(--bg-surface, #1a1a1a);
  border-radius: 14px;
  margin-bottom: 20px;
}

.cc-session-goal {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #eee);
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 20px;
}

.cc-session-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-secondary, #aaa);
}

.cc-card-list { display: flex; flex-direction: column; gap: 8px; }

.cc-card {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 52px;
  padding: 12px 16px;
  background: var(--bg-surface, #1a1a1a);
  border: 1px solid var(--border-color, #333);
  border-radius: 12px;
  text-align: left;
  cursor: pointer;
  transition: background 0.12s ease;
  -webkit-tap-highlight-color: transparent;
}
.cc-card:active { background: var(--bg-surface-hover, #242424); }

.cc-card--danger { border-color: color-mix(in srgb, #e74c3c 40%, transparent); }
.cc-card--danger:active { background: color-mix(in srgb, #e74c3c 10%, transparent); }

.cc-section--danger {
  padding: 12px;
  border: 1px solid color-mix(in srgb, #e74c3c 30%, transparent);
  border-radius: 14px;
}

.cc-card__icon { font-size: 18px; width: 24px; text-align: center; flex-shrink: 0; }
.cc-card__label { font-size: 14px; font-weight: 500; color: var(--text-primary, #eee); }

.cc-model-chip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 52px;
  padding: 12px 16px;
  background: var(--bg-surface, #1a1a1a);
  border: 1px solid var(--border-color, #333);
  border-radius: 12px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
#cc-model-name { font-size: 14px; font-weight: 500; color: var(--text-primary, #eee); }
.cc-model-chevron { color: var(--text-muted, #666); font-size: 18px; }
```

- [ ] **Step 4: Update element refs in state.js**

In `public/app/state.js`, find where `el.cc*` refs are cached (around line 118). Add refs for the new elements (the new HTML in Step 2 keeps `cc-new-session` but adds new IDs):

```javascript
// Add alongside existing el.ccNewSession:
el.ccSwitchSession = document.querySelector("#cc-switch-session");
el.ccStopSession   = document.querySelector("#cc-stop-session");
el.ccKillServer    = document.querySelector("#cc-kill-server");
el.ccModelChip     = document.querySelector("#cc-model-chip");
el.ccGoal          = document.querySelector("#cc-goal");
el.ccProject       = document.querySelector("#cc-project");
el.ccStatusBadge   = document.querySelector("#cc-status-badge");
el.ccModelName     = document.querySelector("#cc-model-name");
```

- [ ] **Step 5: Wire new actions in ui.js**

In `public/app/ui.js`, find `setupControlCenter()` (line ~559). The existing `el.ccNewSession` binding already handles "New session" — leave it. Add bindings for the **new** elements only:

```javascript
// Call this when the control center opens to populate info
export function updateCcSessionInfo() {
  const current = state.activeSessions.find(s => s.id === state.activeSessionId)
    || state.activeSessions[0];

  const goalEl = document.getElementById("cc-goal");
  const projectEl = document.getElementById("cc-project");
  const statusEl = document.getElementById("cc-status-badge");
  const modelEl = document.getElementById("cc-model-name");

  if (el.ccGoal) el.ccGoal.textContent = current?.firstUserPreview || "No messages yet";

  if (el.ccProject) {
    const cwd = current?.cwd || current?.secondaryLabel || "";
    el.ccProject.textContent = cwd.split("/").filter(Boolean).pop() || "—";
  }

  if (el.ccStatusBadge && current) {
    const status = current.lastError ? "error"
      : current.isStreaming ? "streaming"
      : current.hasPendingUiRequest ? "waiting"
      : "idle";
    const labels = { streaming: "streaming", waiting: "waiting", idle: "idle", error: "error" };
    el.ccStatusBadge.textContent = labels[status];
    el.ccStatusBadge.className = `session-badge badge--${status}`;
  }

  if (el.ccModelName) el.ccModelName.textContent = state.snapshotState?.model || "—";
}

// Add inside setupControlCenter(), after the existing el.ccNewSession binding:
// (el.ccNewSession already handles "New session" — do NOT add a second listener for it)

el.ccSwitchSession?.addEventListener("click", () => {
  closeControlCenter();
  import("./navigation.js").then(({ switchTab }) => switchTab("sessions"));
});

el.ccStopSession?.addEventListener("click", () => {
  handleControlCenterAction("stop_session");
  closeControlCenter();
});

el.ccKillServer?.addEventListener("click", () => {
  if (!window.confirm("Kill the Pi Phone server? This will disconnect all clients.")) return;
  handleControlCenterAction("stop");
});

el.ccModelChip?.addEventListener("click", () => {
  handleControlCenterAction("model");
  closeControlCenter();
});
```

Also call `updateCcSessionInfo()` in the control center open handler (find where `#control-center` gets `active` class or `classList.add` is called).

- [ ] **Step 5: Manual test**

```
1. Tap "Menu" tab → control center slides up
2. Session info section shows goal text (first message), project name, status badge
3. All 3 session action buttons visible with 52px+ height
4. Model chip shows current model name
5. Danger zone has red-tinted border; Kill server button inside
6. Tap "Kill server" → browser confirm dialog appears; Cancel → nothing
7. Tap "Switch session" → sheet closes, Sessions tab opens
8. All sections clearly separated on mobile
```

- [ ] **Step 6: Commit**

```bash
git add public/index.html public/styles.css public/app/ui.js
git commit -m "feat: control center with organized sections and danger zone confirm"
```

---

## Task 7: Composer — Keyboard Anchoring + Attachment Guard

Fix keyboard hiding, ensure font size 16px (no iOS zoom), and add attachment validation.

**Files:**
- Modify: `public/styles.css`
- Modify: `public/app/ui.js`
- Modify: `public/app/main.js`

- [ ] **Step 1: Fix composer CSS**

In `public/styles.css`, find `.composer-wrap`. Ensure it has `position: sticky; bottom: 0` (not `position: fixed`) and safe area support:

```css
.composer-wrap {
  /* keep existing rules, ensure/add: */
  position: sticky;
  bottom: 0;
  background: var(--bg-surface, #1a1a1a);
  padding-bottom: max(env(safe-area-inset-bottom, 0px), 8px);
  border-top: 1px solid var(--border-color, #333);
  z-index: 50;
  flex-shrink: 0;
}
```

Also ensure `.app-shell` uses dynamic viewport height:

```css
.app-shell { height: 100dvh; }
html, body { height: 100%; margin: 0; }
```

- [ ] **Step 2: Fix textarea font size (prevents iOS zoom)**

In `styles.css`, find `#prompt-input` or `textarea` in the composer and set:

```css
#prompt-input {
  font-size: 16px; /* ≥16px prevents iOS Safari auto-zoom */
}
```

- [ ] **Step 3: Add visualViewport keyboard handler in ui.js**

In `public/app/ui.js`, export an init function (call from main.js):

```javascript
export function initKeyboardHandling() {
  if (!window.visualViewport) return;

  function onViewportResize() {
    const composer = document.querySelector(".composer-wrap");
    if (!composer) return;
    // When keyboard opens, visualViewport.height shrinks.
    // Add the gap as padding so composer floats above keyboard.
    const gap = window.innerHeight - window.visualViewport.offsetTop - window.visualViewport.height;
    composer.style.paddingBottom = `max(${Math.max(0, gap)}px, env(safe-area-inset-bottom, 0px))`;
  }

  window.visualViewport.addEventListener("resize", onViewportResize);
  window.visualViewport.addEventListener("scroll", onViewportResize);
}
```

In `public/app/main.js`, import and call it:

```javascript
import { initKeyboardHandling } from "./ui.js";
// ...
initKeyboardHandling();
```

- [ ] **Step 4: Add attachment guard in main.js**

In `public/app/main.js`, find the existing `change` handler on `#image-input` (the file picker). Add validation at the top of that handler:

```javascript
// At the top of the existing change handler (don't add a second listener):
const file = e.target.files?.[0];
if (!file) return;

if (!file.type.startsWith("image/")) {
  showToast("Only images are supported");  // use existing showToast function
  e.target.value = "";
  return;
}

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
if (file.size > MAX_BYTES) {
  showToast("File too large — max 5 MB");
  e.target.value = "";
  return;
}
// existing upload logic continues...
```

- [ ] **Step 5: Static quick command chips**

**Important:** `#command-strip` is owned by `bindings.js` for autocomplete (`data-autocomplete-index` items). Do NOT add chips there — it gets cleared on every autocomplete cycle.

Instead, add a **separate** `#quick-commands` div. In `public/index.html`, inside `.composer-wrap`, add this **above** `#command-strip`:

```html
<div id="quick-commands" class="quick-commands">
  <button class="command-chip" data-command="/cd ">📁 /cd</button>
  <button class="command-chip" data-command="/phone-stop">⏹ /phone-stop</button>
  <button class="command-chip" data-command="/clear">🗑 /clear</button>
  <button class="command-chip" data-command="/model ">🤖 /model</button>
</div>
```

Add CSS:

```css
.quick-commands {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 6px 12px 0;
  scrollbar-width: none;
}
.quick-commands::-webkit-scrollbar { display: none; }
```

In `public/app/main.js`, add a click handler for the new container (this is independent of the autocomplete system):

```javascript
document.getElementById("quick-commands")?.addEventListener("click", (e) => {
  const chip = e.target.closest("[data-command]");
  if (!chip) return;
  const input = document.getElementById("prompt-input");
  if (!input) return;
  input.value = chip.dataset.command;
  input.focus();
  input.selectionStart = input.selectionEnd = input.value.length;
});
```

- [ ] **Step 6: Manual test on mobile**

```
1. Open https://pi.passionseed.org on iPhone/Android
2. Tap the text area → keyboard slides up
3. Verify: composer is visible above the keyboard, not hidden behind it
4. Type, dismiss keyboard → composer returns to bottom
5. Tap 📎, select a file > 5MB → toast "File too large — max 5 MB"
6. Tap 📎, select a PDF → toast "Only images are supported"
7. Tap a quick command chip → text inserted into input, cursor at end
8. While Pi is streaming: "Stop" button visible, "Send" hidden
9. After response: "Send" button visible
```

- [ ] **Step 7: Commit**

```bash
git add public/styles.css public/app/ui.js public/app/main.js public/index.html
git commit -m "feat: composer keyboard anchoring, attachment guard, quick commands"
```

---

## Task 8: Chat Empty State + Streaming Cursor + Reconnect Notice

Covers three spec requirements missing from other tasks.

**Files:**
- Modify: `public/app/ui.js`
- Modify: `public/app/handlers.js`
- Modify: `public/styles.css`

- [ ] **Step 1: Chat "No session open" empty state**

In `public/app/ui.js`, find the function that renders/updates the `#messages` container (likely `renderMessages()` or similar). When `state.messages.length === 0` AND `state.activeSessions.length === 0`, show an empty state overlay:

```javascript
export function renderChatEmptyState() {
  const messages = document.getElementById("messages");
  if (!messages) return;

  const hasSession = state.activeSessions.length > 0;
  const hasMessages = state.messages.length > 0 || state.liveAssistant;

  let emptyEl = document.getElementById("chat-empty-state");

  if (!hasSession && !hasMessages) {
    if (!emptyEl) {
      emptyEl = document.createElement("div");
      emptyEl.id = "chat-empty-state";
      emptyEl.className = "chat-empty-state";

      const msg = document.createElement("p");
      msg.textContent = "No session open";

      const btn = document.createElement("button");
      btn.className = "btn-primary";
      btn.textContent = "Go to Sessions";
      btn.addEventListener("click", () => {
        import("./navigation.js").then(({ switchTab }) => switchTab("sessions"));
      });

      emptyEl.appendChild(msg);
      emptyEl.appendChild(btn);
      messages.appendChild(emptyEl);
    }
  } else if (emptyEl) {
    emptyEl.remove();
  }
}
```

Add CSS:

```css
.chat-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  height: 100%;
  color: var(--text-muted, #666);
  text-align: center;
  padding: 32px;
}
```

Call `renderChatEmptyState()` from `handlers.js` whenever `state.activeSessions` updates (alongside `renderSessionsView()`).

- [ ] **Step 2: Verify streaming cursor**

Search `public/app/messages.js` for `streaming` or `live` class on assistant messages. The streaming cursor (blinking `|`) should already render via CSS on the live assistant message. Search for `.streaming-cursor` or `::after` pseudo-element.

If it doesn't exist, add to `styles.css`:

```css
.message--streaming .message-text::after {
  content: "│";
  animation: blink 1s step-start infinite;
  color: var(--accent, #8abeb7);
  margin-left: 1px;
}
@keyframes blink { 50% { opacity: 0; } }
```

And ensure the live assistant message element has `class="message--streaming"` while streaming. Find where the assistant message element is created in `messages.js` and add that class when `item.live === true`.

- [ ] **Step 3: Reconnect notice**

In `public/app/transport.js`, find where the WebSocket reconnects (the reconnection callback, after a successful reconnect). Add an inline reconnect notice to the messages list:

```javascript
// After a successful reconnect (find the onopen/reconnect handler):
function appendReconnectNotice() {
  const messages = document.getElementById("messages");
  if (!messages) return;
  const notice = document.createElement("div");
  notice.className = "reconnect-notice";
  notice.textContent = "↩ Reconnected";
  messages.appendChild(notice);
  messages.scrollTop = messages.scrollHeight;
}
```

Add CSS:

```css
.reconnect-notice {
  text-align: center;
  font-size: 12px;
  color: var(--text-muted, #666);
  padding: 4px 0;
  margin: 4px 0;
}
```

Also ensure that on reconnect, any in-progress streaming is cleared. Find `clearTransientState()` in handlers.js and confirm it's called after reconnect.

- [ ] **Step 4: Commit**

```bash
git add public/app/ui.js public/app/handlers.js public/styles.css public/app/transport.js
git commit -m "feat: chat empty state, streaming cursor, reconnect notice"
```

---

## Task 9: Markdown Rendering in Chat

Pi messages already render markdown via `messages.js`. This task verifies it works well on mobile and fixes any gaps (code blocks, links, tables).

**Files:**
- Modify: `public/app/messages.js` (if markdown not applied to all message types)
- Modify: `public/styles.css`

- [ ] **Step 1: Audit current markdown rendering**

In `public/app/messages.js`, find `transformMessage()` and check which message kinds get markdown rendered. Look for calls to a markdown parser (likely `marked`, `micromark`, or a custom `renderMarkdown()` function).

Run a test: send Pi a message with `**bold**`, `# heading`, `` `code` ``, and a fenced code block. Verify they render correctly in the chat.

- [ ] **Step 2: Ensure all Pi (assistant) messages get markdown**

If some assistant message types skip markdown, apply it consistently. The pattern should be:

```javascript
// For any assistant/pi message text:
messageEl.innerHTML = renderMarkdown(item.text);
// Where renderMarkdown() is the existing markdown function in the codebase
```

**Security:** `renderMarkdown()` must only be called with content from the Pi server (trusted). User messages use `textContent` only. Do not markdown-render user input.

- [ ] **Step 3: Mobile-friendly markdown CSS**

Add or update markdown styles for mobile readability:

```css
/* ─── Markdown in Messages ─────────────────────────────── */
.message-text h1, .message-text h2, .message-text h3 {
  font-size: 15px;
  font-weight: 600;
  margin: 12px 0 6px;
  line-height: 1.3;
}

.message-text p { margin: 6px 0; line-height: 1.55; }

.message-text ul, .message-text ol {
  padding-left: 20px;
  margin: 6px 0;
}

.message-text li { margin: 3px 0; line-height: 1.5; }

.message-text code {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 13px;
  background: var(--bg-surface, #1a1a1a);
  padding: 1px 5px;
  border-radius: 4px;
}

.message-text pre {
  background: var(--bg-surface, #1a1a1a);
  border: 1px solid var(--border-color, #333);
  border-radius: 8px;
  padding: 12px;
  overflow-x: auto;
  margin: 8px 0;
  -webkit-overflow-scrolling: touch;
}

.message-text pre code {
  background: none;
  padding: 0;
  font-size: 12px;
  white-space: pre;
}

.message-text a {
  color: var(--accent, #8abeb7);
  text-decoration: underline;
  text-decoration-color: color-mix(in srgb, var(--accent, #8abeb7) 50%, transparent);
}

.message-text blockquote {
  border-left: 3px solid var(--accent, #8abeb7);
  margin: 8px 0;
  padding: 4px 12px;
  color: var(--text-secondary, #aaa);
}

.message-text table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  overflow-x: auto;
  display: block;
}

.message-text th, .message-text td {
  padding: 6px 10px;
  border: 1px solid var(--border-color, #333);
  text-align: left;
}

.message-text th { background: var(--bg-surface, #1a1a1a); font-weight: 600; }
```

- [ ] **Step 4: Manual test**

```
1. Send Pi: "Reply with examples of **bold**, `inline code`, a code block, a table, and a > blockquote"
2. Verify all render correctly in the chat on mobile
3. Code blocks have horizontal scroll (no wrapping)
4. Links are tappable
5. Tables scroll horizontally if wider than screen
6. User messages: plain text only (no markdown rendering)
```

- [ ] **Step 5: Commit**

```bash
git add public/app/messages.js public/styles.css
git commit -m "feat: markdown rendering improvements for mobile chat"
```

---

## Task 10: Push to Fork + Sync Server

**Files:** All modified files

- [ ] **Step 1: Push all commits to xb1g/pi-phone**

```bash
cd /Users/bunyasit/dev/pi-phone
git log --oneline origin/main..HEAD  # verify all local commits listed
git push origin master:main
```

- [ ] **Step 2: Pull on server**

```bash
ssh bunyasit@100.107.213.73 "cd ~/dev/pi-phone && git remote -v | head -2"
# Confirm fork remote is set (it's called 'fork')
ssh bunyasit@100.107.213.73 "TOKEN=$(cat ~/.gh-token 2>/dev/null) && cd ~/dev/pi-phone && git fetch fork && git merge fork/main && echo 'Updated'"
```

If that fails (no cached token), pull via the stored token:

```bash
TOKEN=$(gh auth token)
ssh bunyasit@100.107.213.73 "cd ~/dev/pi-phone && git pull https://xb1g:${TOKEN}@github.com/xb1g/pi-phone.git main && echo 'Updated'"
```

- [ ] **Step 3: Restart pi-phone if TypeScript changed**

If Task 1 (backend `cwd` field) was implemented, the Pi session needs to be restarted to pick up the TypeScript change:

```bash
# In the pi tmux session on the server:
ssh bunyasit@100.107.213.73 "tmux send-keys -t pi-phone '/phone-stop' Enter && sleep 3 && tmux send-keys -t pi-phone '/phone-start 8787 punch' Enter"
sleep 5
ssh bunyasit@100.107.213.73 "curl -s http://localhost:8787/api/health | python3 -c 'import json,sys; d=json.load(sys.stdin); print(\"OK\" if d[\"serverRunning\"] else \"FAIL\")'"
```

Expected: `OK`

- [ ] **Step 4: Full mobile test**

Open `https://pi.passionseed.org` on a mobile device:

```
✓ Bottom tab bar visible: Chat | Sessions | Menu
✓ Sessions tab shows session cards with goal + project + status badge
✓ Tapping a card switches to Chat tab for that session
✓ Tool calls in chat are collapsed chips by default
✓ Tapping a chip expands/collapses it
✓ Menu tab opens control center with clear sections
✓ Danger zone (Kill server) requires confirm
✓ Composer stays above keyboard when typing
✓ Send/Stop toggle works during streaming
✓ Attachment validation rejects large files and non-images
```

---

## Reference

- **Spec:** `docs/superpowers/specs/2026-03-20-pi-phone-improvements-design.md`
- **Fork:** https://github.com/xb1g/pi-phone
- **Live URL:** https://pi.passionseed.org
- **Server:** `bunyasit@100.107.213.73` (via Tailscale)
- **Pi tmux session:** `tmux attach -t pi-phone` on server
- **Backend catalog push:** `channel: "sessions"`, `event: "catalog"` → `state.activeSessions` in frontend
- **Model switch RPC:** `{ command: "set_model", data: { model } }` already wired in handlers.js:192
- **Existing `escapeHtml`:** check `sheets-view.js` for the canonical definition in this codebase
