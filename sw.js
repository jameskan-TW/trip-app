const CACHE = "tohoku2026-v6";
const ASSETS = ["./index.html", "./manifest.json"];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});

// ─── Alarm Scheduling (fallback for browsers without Notification Triggers) ──

let scheduledAlarmTimer = null;

self.addEventListener("message", e => {
  if (e.data.type === "SCHEDULE_ALARM") {
    if (scheduledAlarmTimer) clearTimeout(scheduledAlarmTimer);
    const delay = e.data.timestamp - Date.now();
    if (delay > 0 && delay < 12 * 3600 * 1000) {
      scheduledAlarmTimer = setTimeout(() => {
        self.registration.showNotification("🔔 集合時間到！", {
          body: e.data.message || "現在出發！",
          vibrate: [400, 200, 400, 200, 600],
          requireInteraction: true,
          tag: "meeting-alarm"
        });
      }, delay);
    }
  } else if (e.data.type === "CANCEL_ALARM") {
    if (scheduledAlarmTimer) {
      clearTimeout(scheduledAlarmTimer);
      scheduledAlarmTimer = null;
    }
  }
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if ("focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow("./");
    })
  );
});
