// Theme and UI Constants
export const THINKING_LEVELS = ["off", "minimal", "low", "medium", "high", "xhigh"];

export const LOCAL_COMMAND_DEFINITIONS = [
  { name: "new", description: "Start a new session" },
  { name: "compact", description: "Compact the current session" },
  { name: "reload", description: "Reload extensions, skills, prompts, and themes" },
  { name: "stats", description: "Show session stats" },
  { name: "cost", description: "Show session cost stats" },
  { name: "model", description: "Open model picker" },
  { name: "thinking", description: "Open thinking level picker" },
  { name: "commands", description: "Browse commands, skills, and prompts" },
  { name: "sessions", description: "Browse saved sessions" },
  { name: "tree", description: "Browse the current session tree" },
  { name: "cd", description: "Change Pi working directory", insertOnly: true },
  { name: "refresh", description: "Refresh snapshot" },
];

export const LOCAL_COMMAND_NAMES = new Set(LOCAL_COMMAND_DEFINITIONS.map((command) => command.name));
export const COMMAND_CATEGORY_ORDER = ["local", "extension", "prompt", "skill"];
export const AUTOCOMPLETE_DELIMITERS = new Set([" ", "\t", "\n", '"', "'", "="]);
export const TOKEN_STORAGE_KEY = "pi-phone-token";
export const THEME_STORAGE_KEY = "pi-phone-theme";

export const THEME_CSS_VARIABLES = {
  mdCode: "--md-code",
  mdCodeBlock: "--md-code-block",
  mdCodeBlockBorder: "--md-code-block-border",
};

export const TOOL_LANGUAGE_LABELS = {
  c: "C",
  cc: "C++",
  cpp: "C++",
  css: "CSS",
  go: "Go",
  h: "Header",
  hpp: "C++",
  html: "HTML",
  java: "Java",
  js: "JS",
  jsx: "JSX",
  json: "JSON",
  kt: "Kotlin",
  md: "Markdown",
  mjs: "JS",
  php: "PHP",
  py: "Python",
  rb: "Ruby",
  rs: "Rust",
  scss: "SCSS",
  sh: "Shell",
  sql: "SQL",
  swift: "Swift",
  toml: "TOML",
  ts: "TypeScript",
  tsx: "TSX",
  txt: "Text",
  yaml: "YAML",
  yml: "YAML",
  zsh: "Shell",
};

// UI Enhancement Constants
export const UI_VERSION = "20260320-1";
export const ANIMATION_DURATION = {
  fast: 150,
  base: 250,
  slow: 350,
};

export const TOAST_DURATION = 3500;
export const DEBOUNCE_DELAY = 300;
export const THROTTLE_DELAY = 100;

// Mobile UX Constants
export const TOUCH_TARGET_MIN_SIZE = 44; // Minimum touch target size in pixels
export const SWIPE_THRESHOLD = 50; // Minimum swipe distance in pixels
export const LONG_PRESS_DURATION = 500; // Long press duration in milliseconds

// Accessibility
export const FOCUS_VISIBLE_CLASS = "focus-visible";
export const LIVE_REGION_POLITE = "polite";
export const LIVE_REGION_ASSERTIVE = "assertive";
