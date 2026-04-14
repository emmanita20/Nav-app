const CACHE_NAME = "navi-app-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/static/js/main.js",
  "/static/css/main.css",
  "/manifest.json",
  "/icon-192x192.png",
  "/icon-512x512.png",
];

// Install event - cache files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opening cache");
      return cache.addAll(urlsToCache).catch((error) => {
        console.log("Cache addAll error:", error);
      });
    }),
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
  self.clients.claim();
});

// Fetch event - cache first strategy with network fallback
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // API requests - network first
  if (request.url.includes("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.ok) {
            // Only attempt to cache http(s) requests and handle failures gracefully
            if (
              request.url.startsWith("http://") ||
              request.url.startsWith("https://")
            ) {
              const cache = caches.open(CACHE_NAME);
              cache
                .then((c) => c.put(request, response.clone()))
                .catch((err) =>
                  console.warn("Cache put failed (API):", err, request.url),
                );
            }
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        }),
    );
    return;
  }

  // Static assets - cache first
  event.respondWith(
    caches.match(request).then((response) => {
      return (
        response ||
        fetch(request)
          .then((response) => {
            if (
              !response ||
              response.status !== 200 ||
              response.type === "error"
            ) {
              return response;
            }

            const responseToCache = response.clone();
            // Only cache http(s) static assets and guard against unsupported schemes
            if (
              request.url.startsWith("http://") ||
              request.url.startsWith("https://")
            ) {
              caches
                .open(CACHE_NAME)
                .then((cache) => cache.put(request, responseToCache))
                .catch((err) =>
                  console.warn("Cache put failed (asset):", err, request.url),
                );
            } else {
              // Skip caching unsupported schemes (e.g., chrome-extension://)
              console.warn(
                "Skipping cache for unsupported scheme:",
                request.url,
              );
            }

            return response;
          })
          .catch(() => {
            return caches.match("/index.html");
          })
      );
    }),
  );
});

// Handle background sync for offline actions
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-location") {
    event.waitUntil(syncLocation());
  }
  if (event.tag === "sync-emergency") {
    event.waitUntil(syncEmergency());
  }
});

async function syncLocation() {
  try {
    const response = await fetch("/api/gps/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: {
          type: "Point",
          coordinates: [0, 0],
        },
      }),
    });
    console.log("Location synced:", response.ok);
  } catch (error) {
    console.log("Location sync failed:", error);
  }
}

async function syncEmergency() {
  try {
    const response = await fetch("/api/emergency/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    console.log("Emergency synced:", response.ok);
  } catch (error) {
    console.log("Emergency sync failed:", error);
  }
}

// Handle push notifications
self.addEventListener("push", (event) => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: "/icon-192x192.png",
    badge: "/badge-72x72.png",
    tag: data.tag || "notification",
    requireInteraction: data.requireInteraction || false,
    data: data.data || {},
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      }),
  );
});
