# Pi-Phone Improvements Design

**Date**: 2026-03-20
**Repo**: https://github.com/xb1g/pi-phone
**Approach**: Component-level redesign (Option B) — 4 screens redesigned independently, vanilla JS frontend, same WebSocket backend, no framework migration.

---

## Goals

1. Sessions list that shows goal, project, and status at a glance
2. Chat view with readable tool calls on mobile
3. Control center / menu with clear hierarchy and bottom navigation
4. Composer that works well on mobile (keyboard handling, send/stop, quick commands)

---

## Section 1: Sessions List

### What it does
Home screen showing all active Pi sessions. Users can glance at what each session is working on, which project it belongs to, and whether it needs attention.

### Data model
Extend the backend health API and WebSocket push to include a `sessions[]` array. Each entry:

```ts
interface SessionSummary {
  id: string;
  goal: string;          // first user message (truncated to 80 chars) or "No messages yet"
  cwd: string;           // full path
  project: string;       // basename(cwd)
  status: "streaming" | "waiting" | "idle" | "error";
  lastActivityAt: number; // unix ms
}
```

Backend change: `PhoneServerRuntime` already tracks sessions. Add a method that maps each session to `SessionSummary` and include it in the `/api/health` response and in periodic WebSocket pushes.

### Frontend
- Card list, one card per session
- Card layout: project name (bold, top-left) + status badge (top-right) + goal text (body, 2 lines max, truncated) + relative timestamp (bottom-right)
- Status badges: `● streaming` (pulsing accent dot), `⏳ waiting` (highlighted, draws attention), `— idle` (muted), `✕ error` (red)
- Tap card → opens that session's Chat view
- Pull-to-refresh to re-fetch sessions

### Mobile constraints
- Cards: min 72px height, 16px padding, 44px tap targets
- Status badge: pill shape, color-coded
- Empty state: "No active sessions — start Pi with /phone-start"

---

## Section 2: Chat / Conversation View

### What it does
The main dev UX. Shows the conversation with Pi, renders tool calls readably, and indicates when Pi is streaming or waiting for input.

### Message rendering
- **User messages**: right-aligned bubble, accent background
- **Pi messages**: left-aligned, neutral background, markdown rendered
- **Code blocks**: `font-family: monospace`, horizontal scroll (no wrapping), syntax-light background
- **Streaming cursor**: blinking `|` at end of partial message while Pi is generating

### Tool call rendering
Collapsed by default. Each tool call renders as a single-line chip:

| Tool | Icon | Summary |
|------|------|---------|
| edit / write | ✏️ | `Edited src/index.ts` |
| bash | 💻 | `npm install` (first 40 chars of command) |
| read | 📖 | `Read 3 files` |
| glob / grep | 🔍 | `Searched *.ts` |
| other | 🔧 | tool name |

Tap chip → expands inline to show full tool call input and output. Tap again to collapse. This removes the dominant source of mobile visual clutter.

### State indicators
- **Streaming**: small pulsing dot at bottom of conversation (not full-screen overlay)
- **Waiting for you**: composer area gets a subtle highlight + label "Pi is waiting" above the input — draws attention without being intrusive
- **Error**: red banner at top with error message, tap to dismiss
- **No session selected** (e.g. first load, or all sessions closed): Chat tab shows a centered empty state — "No session open" + "Go to Sessions" button that switches to the Sessions tab
- **WebSocket reconnect mid-stream**: partial streaming message is discarded; a reconnect notice is appended inline ("↩ Reconnected"); conversation history is re-fetched from the server on reconnect

---

## Section 3: Control Center / Menu

### Navigation
Replace ad-hoc navigation with a persistent bottom tab bar (3 tabs):

```
[ Chat ]  [ Sessions ]  [ Menu ]
```

- Always visible, sits above home indicator (respects `env(safe-area-inset-bottom)`)
- Active tab: accent color, slightly larger icon
- Minimum tap target: 44px height per tab

### Control center (Menu tab → bottom sheet)
Sheet slides up from bottom, drag handle at top, backdrop tap or swipe-down to close.

**Sections (top to bottom):**

1. **Session info** — goal (truncated), project name, status badge of the **most recently active session** (last session switched to or started). Read-only context. In a single-session setup this is always the only session.
2. **Session actions** — "New session", "Switch session" (opens Sessions list), "Stop session". Card-based layout, icon + label. (Branch session is deferred — not in this pass.)
3. **Model** — compact chip showing current model (e.g. `kimi-k2.5`). Tap to open a scrollable model picker list. The model list comes from the `/api/health` response (`availableModels` field — to be added alongside `sessions[]`). Selecting a model sends `{ type: "set_model", model: "<id>" }` over WebSocket.
4. **Danger zone** — "Kill server", "Disconnect". Red-tinted background, separated by a divider. Requires a confirm tap before executing.

### Mobile constraints
- All cards: 44px min height, 16px horizontal padding
- Sheet: `border-radius: 20px` top corners, max 85vh height, scrollable if content overflows
- No hover-only states — all affordances work on touch

---

## Section 4: Composer

### Layout
Fixed to bottom of screen, above the bottom tab bar. Three rows:

1. **Quick commands** (optional, toggleable): horizontally scrollable chip row with a static list of common commands: `/cd`, `/phone-stop`, `/clear`, `/model`. No dynamic discovery in this pass. Hidden by default when keyboard is up. Small "^" toggle to reveal.
2. **Input row**: attachment button (📎) | auto-resizing text area (1–4 lines) | send/stop button
3. *(nothing below — tab bar handles safe area)*

### Behaviors
- **Text area**: `min-height: 44px`, grows up to 4 lines then scrolls. `font-size: 16px` to prevent iOS auto-zoom.
- **Send button**: prominent, accent color. Disabled when text is empty.
- **Stop button**: replaces send during streaming. Square icon, red or accent color. Sends stop signal to Pi via WebSocket.
- **Attachments**: taps native `<input type="file" accept="image/*">`. Uploaded image shown as thumbnail above text area, with remove (×) button. Image is transmitted as base64 inline in the message JSON (matching the existing `attachments` flow in `state.js` — this extends rather than replaces current behavior). Max file size: 5 MB. If the selected file exceeds 5 MB or is not an image, show a toast error ("File too large — max 5 MB" / "Only images are supported") and do not add it to the attachments list.
- **Keyboard handling**: composer anchors above keyboard using `visualViewport` resize event. Fallback: `padding-bottom` matching `env(keyboard-inset-height)`. Prevents composer from hiding behind keyboard on iOS and Android.

---

## Backend Changes

Only one backend change required:

**Extend session metadata in health API + WebSocket push**

In `src/extension/phone-server-runtime.ts`:
- Add `getSessionSummaries(): SessionSummary[]` method
- Include `sessions: SessionSummary[]` in the `/api/health` JSON response
- Include `availableModels: string[]` and `currentModel: string` in the `/api/health` response (read from Pi's model config)
- Handle incoming WebSocket message `{ type: "set_model", model: string }` to switch the active model
- Push `{ type: "sessions_update", sessions: SessionSummary[] }` over WebSocket on session state changes (streaming start/stop, new session, session switch)

The `goal` field: read the first `user` role message from in-memory session history (preferred, already available in `PhoneServerRuntime`). If the session has no messages yet, fall back to `"No messages yet"`. Do not read from JSONL files — use only what is already in memory to avoid I/O. Truncate to 80 chars.

Push `sessions_update` on: streaming start, streaming stop, new session created, session switched, session stopped, session destroyed/removed from memory, **and on error state transitions** (so the sessions list always reflects current status in real time).

---

## Out of Scope (This Pass)

- File diff rendering
- Voice input
- Push notifications
- Multi-user / team sessions
- Offline-first sync

---

## Success Criteria

- Sessions list shows goal, project, and status without opening a session
- Tool calls in chat are collapsed by default and readable when expanded
- Bottom tab bar works reliably on iOS Safari and Android Chrome
- Composer never hides behind the keyboard
- All tap targets ≥ 44px
- Control center sections are clearly separated and the danger zone requires confirmation
- Tool call chips are collapsed by default; tapping one expands it to show full input/output; tapping again collapses it
