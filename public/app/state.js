import { TOKEN_STORAGE_KEY } from "./constants.js";

export const state = {
  health: null,
  status: null,
  snapshotState: null,
  snapshotWorkerId: null,
  messages: [],
  commands: [],
  models: [],
  sessions: [],
  activeSessions: [],
  activeSessionId: null,
  tree: null,
  stats: null,
  widgets: new Map(),
  footerStatus: "",
  quota: null,
  quotaRequestId: 0,
  liveAssistant: null,
  liveTools: new Map(),
  pendingUiRequest: null,
  socket: null,
  reconnectTimer: null,
  manuallyClosed: false,
  token: localStorage.getItem(TOKEN_STORAGE_KEY) || "",
  sheetMode: "actions",
  commandSheetCategory: "local",
  autocompleteContext: null,
  autocompleteItems: [],
  autocompleteRemoteRequestId: 0,
  autocompleteRemoteTimer: null,
  attachments: [],
  nextAttachmentTokenId: 1,
  lastSheetPointerAction: "",
  lastSheetPointerActionAt: 0,
  toolPanelOpen: new Map(),
};

export const el = {
  // Theme toggle
  themeToggleButton: document.querySelector("#theme-toggle-button"),
  
  // Sidebar
  sessionSidebarButton: document.querySelector("#session-sidebar-button"),
  
  // Status and header
  connectionPill: document.querySelector("#connection-pill"),
  connectionDot: document.querySelector("#connection-dot"),
  streamingPill: document.querySelector("#streaming-pill"),
  cwdValue: document.querySelector("#cwd-value"),
  sessionValue: document.querySelector("#session-value"),
  modelValue: document.querySelector("#model-value"),
  thinkingValue: document.querySelector("#thinking-value"),
  streamingValue: document.querySelector("#streaming-value"),
  serverValue: document.querySelector("#server-value"),
  
  // Status card actions
  actionsButton: document.querySelector("#actions-button"),
  refreshButton: document.querySelector("#refresh-button"),
  refreshStatusButton: document.querySelector("#refresh-status-button"),
  treeBrowserButton: document.querySelector("#tree-browser-button"),
  abortButton: document.querySelector("#abort-button"),
  
  // Banner and widgets
  banner: document.querySelector("#banner"),
  widgetStack: document.querySelector("#widget-stack"),
  
  // Messages
  messages: document.querySelector("#messages"),
  
  // Composer
  composerWrap: document.querySelector(".composer-wrap"),
  promptInput: document.querySelector("#prompt-input"),
  sendButton: document.querySelector("#send-button"),
  stopButton: document.querySelector("#stop-button"),
  attachImageButton: document.querySelector("#attach-image-button"),
  insertCommandButton: document.querySelector("#insert-command-button"),
  cdCommandButton: document.querySelector("#cd-command-button"),
  sessionBrowserButton: document.querySelector("#session-browser-button"),
  controlCenterButton: document.querySelector("#control-center-button"),
  steerButton: document.querySelector("#steer-button"),
  imageInput: document.querySelector("#image-input"),
  attachmentStrip: document.querySelector("#attachment-strip"),
  commandStrip: document.querySelector("#command-strip"),
  
  // Quota display
  quotaRow: document.querySelector("#quota-row"),
  quotaMetaRow: document.querySelector("#quota-meta-row"),
  quotaPillsRow: document.querySelector("#quota-pills-row"),
  quotaCwd: document.querySelector("#quota-cwd"),
  quotaContext: document.querySelector("#quota-context"),
  quotaPrimary: document.querySelector("#quota-primary"),
  quotaSecondary: document.querySelector("#quota-secondary"),
  
  // Modals
  loginModal: document.querySelector("#login-modal"),
  tokenInput: document.querySelector("#token-input"),
  tokenSaveButton: document.querySelector("#token-save-button"),
  uiModal: document.querySelector("#ui-modal"),
  uiModalTitle: document.querySelector("#ui-modal-title"),
  uiModalMessage: document.querySelector("#ui-modal-message"),
  uiModalOptions: document.querySelector("#ui-modal-options"),
  uiModalInput: document.querySelector("#ui-modal-input"),
  uiModalButtons: document.querySelector("#ui-modal-buttons"),
  sheetModal: document.querySelector("#sheet-modal"),
  sheetTitle: document.querySelector("#sheet-title"),
  sheetContent: document.querySelector("#sheet-content"),
  sheetCloseButton: document.querySelector("#sheet-close-button"),
  
  // Control Center
  controlCenter: document.querySelector("#control-center"),
  controlCenterBackdrop: document.querySelector("#control-center-backdrop"),
  controlCenterCloseButton: document.querySelector("#control-center-close-button"),
  controlCenterTitle: document.querySelector("#control-center-title"),
  ccNewSession: document.querySelector("#cc-new-session"),
  ccSwitchSession: document.querySelector("#cc-switch-session"),
  ccStopSession: document.querySelector("#cc-stop-session"),
  ccKillServer: document.querySelector("#cc-kill-server"),
  ccModelChip: document.querySelector("#cc-model-chip"),
  ccGoal: document.querySelector("#cc-goal"),
  ccProject: document.querySelector("#cc-project"),
  ccStatusBadge: document.querySelector("#cc-status-badge"),
  ccModelName: document.querySelector("#cc-model-name"),
  
  // Toast notifications
  toastHost: document.querySelector("#toast-host"),
  
  // Loading overlay
  loadingOverlay: document.querySelector("#loading-overlay"),
};
