// Pi Phone Service Worker
// Enhanced PWA support with offline capabilities

const CACHE_NAME = "pi-phone-v20260320-1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/icon.svg",
  "/manifest.webmanifest",
];

const APP_CACHE_NAME = "pi-phone-app-v1";
const API_CACHE_NAME = "pi-phone-api-v1";

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...");
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log("[SW] Installation complete, skipping waiting");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("[SW] Cache installation failed:", error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...");
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== CACHE_NAME && 
                     cacheName !== APP_CACHE_NAME && 
                     cacheName !== API_CACHE_NAME;
            })
            .map((cacheName) => {
              console.log("[SW] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log("[SW] Activation complete, claiming clients");
        return self.clients.claim();
      })
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith("http")) {
    return;
  }
  
  // API requests - network first
  if (url.pathname.startsWith("/api/") || url.hostname !== location.hostname) {
    event.respondWith(networkFirst(request, API_CACHE_NAME));
    return;
  }
  
  // Static assets - cache first
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request, CACHE_NAME));
    return;
  }
  
  // HTML pages - network first with cache fallback
  if (request.mode === "navigate" || url.pathname.endsWith(".html")) {
    event.respondWith(networkFirst(request, APP_CACHE_NAME));
    return;
  }
  
  // Default - network first
  event.respondWith(networkFirst(request, APP_CACHE_NAME));
});

// Cache-first strategy
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    console.log("[SW] Cache hit:", request.url);
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error("[SW] Fetch failed:", error);
    return new Response("Offline", {
      status: 503,
      statusText: "Service Unavailable",
    });
  }
}

// Network-first strategy
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log("[SW] Network failed, trying cache:", request.url);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === "navigate") {
      const offlineResponse = await cache.match("/");
      if (offlineResponse) {
        return offlineResponse;
      }
    }
    
    return new Response("Offline", {
      status: 503,
      statusText: "Service Unavailable",
    });
  }
}

// Check if URL is a static asset
function isStaticAsset(pathname) {
  const staticExtensions = [
    ".css",
    ".js",
    ".svg",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".ico",
    ".woff",
    ".woff2",
    ".ttf",
    ".eot",
  ];
  
  return staticExtensions.some((ext) => pathname.endsWith(ext));
}

// Background sync for offline messages (future enhancement)
self.addEventListener("sync", (event) => {
  console.log("[SW] Sync event:", event.tag);
  if (event.tag === "sync-messages") {
    event.waitUntil(syncMessages());
  }
});

async function syncMessages() {
  // TODO: Implement offline message sync
  console.log("[SW] Syncing messages...");
}

// Push notifications (future enhancement)
self.addEventListener("push", (event) => {
  console.log("[SW] Push received:", event);
  
  const options = {
    body: event.data?.text() || "New notification",
    icon: "/icon.svg",
    badge: "/icon.svg",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
  };
  
  event.waitUntil(
    self.registration.showNotification("Pi Phone", options)
  );
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event);
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow("/")
  );
});

// Message handler for communication with main app
self.addEventListener("message", (event) => {
  console.log("[SW] Message received:", event.data);
  
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === "CACHE_URLS") {
    event.waitUntil(
      caches.open(APP_CACHE_NAME)
        .then((cache) => cache.addAll(event.data.urls))
    );
  }
});

console.log("[SW] Service worker loaded");
