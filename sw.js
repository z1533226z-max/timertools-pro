const CACHE_NAME = 'timertools-v1.0.0';
const BASE_CACHE = 'base-cache-v1';
const RUNTIME_CACHE = 'runtime-cache-v1';

// Production mode check for Service Worker
const isProduction = !self.location.hostname.includes('localhost') && !self.location.hostname.includes('127.0.0.1');
const log = (...args) => { if (!isProduction) console.log(...args); };
const logError = (...args) => console.error(...args); // Always show errors

// Base resources to cache immediately
const BASE_RESOURCES = [
    '/',
    '/index.html',
    '/timer/basic.html',
    '/timer/pomodoro.html',
    '/timer/multi.html',
    '/timer/cooking.html',
    '/timer/workout.html',
    '/dashboard.html',
    '/offline.html',
    '/assets/css/styles.css',
    '/assets/css/timer.css',
    '/assets/css/pomodoro.css',
    '/assets/css/multi.css',
    '/assets/css/cooking.css',
    '/assets/css/workout.css',
    '/assets/js/main.js',
    '/assets/js/timer.js',
    '/assets/js/pomodoro.js',
    '/assets/js/multi.js',
    '/assets/js/cooking.js',
    '/assets/js/workout.js',
    '/assets/js/pwa-utils.js',
    '/assets/images/favicon.svg',
    '/assets/icons/create_simple_icons.html',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Runtime cache strategies
const RUNTIME_STRATEGIES = {
    images: {
        maxEntries: 50,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    },
    api: {
        maxEntries: 30,
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    },
    static: {
        maxEntries: 100,
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    }
};

// Install event - cache base resources
self.addEventListener('install', (event) => {
    log('[SW] Installing service worker');
    
    event.waitUntil(
        caches.open(BASE_CACHE)
            .then((cache) => {
                log('[SW] Caching base resources');
                return cache.addAll(BASE_RESOURCES);
            })
            .then(() => {
                log('[SW] Base resources cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                logError('[SW] Failed to cache base resources:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    log('[SW] Activating service worker');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== BASE_CACHE && cacheName !== RUNTIME_CACHE) {
                            log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                log('[SW] Service worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Handle different resource types
    if (url.origin === location.origin) {
        // Same-origin requests
        if (isHTMLRequest(request)) {
            event.respondWith(handleHTMLRequest(request));
        } else if (isStaticAsset(request)) {
            event.respondWith(handleStaticAsset(request));
        } else {
            event.respondWith(handleRuntimeRequest(request));
        }
    } else {
        // Cross-origin requests (CDN, APIs, etc.)
        event.respondWith(handleCrossOriginRequest(request));
    }
});

// HTML requests - Network first, then cache
async function handleHTMLRequest(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }
        
        throw new Error('Network response not ok');
    } catch (error) {
        console.log('[SW] Network failed for HTML, trying cache:', request.url);
        
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
            return caches.match('/offline.html');
        }
        
        throw error;
    }
}

// Static assets - Cache first, then network
async function handleStaticAsset(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        // Update cache in background
        updateCache(request);
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(BASE_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('[SW] Failed to fetch static asset:', request.url);
        throw error;
    }
}

// Runtime requests with TTL
async function handleRuntimeRequest(request) {
    const cache = await caches.open(RUNTIME_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        const cachedDate = new Date(cachedResponse.headers.get('sw-cached-date') || 0);
        const now = new Date();
        const maxAge = RUNTIME_STRATEGIES.api.maxAge;
        
        if (now.getTime() - cachedDate.getTime() < maxAge) {
            // Update in background
            updateCache(request);
            return cachedResponse;
        }
    }
    
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            const headers = new Headers(responseClone.headers);
            headers.set('sw-cached-date', new Date().toISOString());
            
            const modifiedResponse = new Response(responseClone.body, {
                status: responseClone.status,
                statusText: responseClone.statusText,
                headers: headers
            });
            
            cache.put(request, modifiedResponse);
        }
        
        return networkResponse;
    } catch (error) {
        if (cachedResponse) {
            return cachedResponse;
        }
        throw error;
    }
}

// Cross-origin requests
async function handleCrossOriginRequest(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok && isStaticResource(request.url)) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        throw error;
    }
}

// Background cache update
async function updateCache(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(
                isStaticAsset(request) ? BASE_CACHE : RUNTIME_CACHE
            );
            cache.put(request, networkResponse);
        }
    } catch (error) {
        console.log('[SW] Background cache update failed:', request.url);
    }
}

// Utility functions
function isHTMLRequest(request) {
    return request.headers.get('accept')?.includes('text/html');
}

function isStaticAsset(request) {
    const url = request.url;
    return /\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/i.test(url);
}

function isStaticResource(url) {
    return /\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/i.test(url) ||
           url.includes('cdn.jsdelivr.net') ||
           url.includes('fonts.googleapis.com');
}

// Background sync for timer data
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync-timer-data') {
        event.waitUntil(syncTimerData());
    }
});

async function syncTimerData() {
    try {
        // Get pending sync data from IndexedDB
        const db = await openIndexedDB();
        const pendingData = await getPendingSync(db);
        
        if (pendingData.length > 0) {
            console.log('[SW] Syncing timer data:', pendingData.length, 'items');
            
            // Process each pending item
            for (const item of pendingData) {
                try {
                    await processSyncItem(item);
                    await markSyncComplete(db, item.id);
                } catch (error) {
                    console.error('[SW] Failed to sync item:', item.id, error);
                }
            }
        }
    } catch (error) {
        console.error('[SW] Background sync failed:', error);
    }
}

// Push notifications
self.addEventListener('push', (event) => {
    if (!event.data) return;
    
    const data = event.data.json();
    const options = {
        body: data.body,
        icon: '/assets/icons/icon-192.png',
        badge: '/assets/icons/icon-72.png',
        tag: data.tag || 'timer-notification',
        requireInteraction: data.requireInteraction || false,
        data: data.data || {},
        actions: data.actions || []
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    const data = event.notification.data;
    let url = '/';
    
    if (data.timerType) {
        url = `/timer/${data.timerType}.html`;
    }
    
    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then((clientList) => {
            // Focus existing window if available
            for (const client of clientList) {
                if (client.url.includes(url) && 'focus' in client) {
                    return client.focus();
                }
            }
            
            // Open new window
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});

// IndexedDB helpers
function openIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('TimerToolsDB', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            if (!db.objectStoreNames.contains('syncQueue')) {
                const store = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
                store.createIndex('timestamp', 'timestamp');
                store.createIndex('status', 'status');
            }
        };
    });
}

function getPendingSync(db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['syncQueue'], 'readonly');
        const store = transaction.objectStore('syncQueue');
        const index = store.index('status');
        const request = index.getAll('pending');
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

function markSyncComplete(db, id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['syncQueue'], 'readwrite');
        const store = transaction.objectStore('syncQueue');
        const request = store.delete(id);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}

function processSyncItem(item) {
    // Process timer data sync logic here
    return Promise.resolve();
}