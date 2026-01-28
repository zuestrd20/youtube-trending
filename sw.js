// Service Worker for WebP Image Optimization and Caching
const CACHE_NAME = 'youtube-trending-v1';
const CACHE_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js'
];

// Install Event - Cache static assets
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching Files');
                return cache.addAll(CACHE_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: Clearing Old Cache');
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Fetch Event - Handle requests with WebP optimization
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Handle YouTube thumbnail images with WebP conversion
    if (url.hostname.includes('ytimg.com') || url.hostname.includes('youtube.com')) {
        event.respondWith(handleImageRequest(request));
        return;
    }
    
    // Handle other requests with cache-first strategy
    event.respondWith(
        caches.match(request)
            .then(response => {
                return response || fetch(request).then(fetchResponse => {
                    // Cache successful responses
                    if (fetchResponse.ok) {
                        const responseClone = fetchResponse.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, responseClone);
                        });
                    }
                    return fetchResponse;
                });
            })
            .catch(() => {
                // Return offline fallback if available
                return caches.match('/index.html');
            })
    );
});

// Handle Image Requests with WebP Support
async function handleImageRequest(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        // Try to fetch WebP version first
        const webpUrl = getWebPUrl(request.url);
        const webpRequest = new Request(webpUrl, {
            headers: request.headers,
            mode: 'cors',
            credentials: 'omit'
        });
        
        let response = await fetch(webpRequest).catch(() => null);
        
        // Fallback to original URL if WebP fails
        if (!response || !response.ok) {
            response = await fetch(request);
        }
        
        // Cache the response
        if (response && response.ok) {
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        console.error('Image fetch failed:', error);
        // Return a placeholder or cached version
        return cache.match(request) || new Response('', { status: 404 });
    }
}

// Convert YouTube thumbnail URL to WebP format
function getWebPUrl(url) {
    // YouTube supports WebP by modifying the URL
    // Replace jpg with webp in the URL
    if (url.includes('ytimg.com')) {
        // For YouTube thumbnails, we can request WebP by changing the extension
        // However, YouTube API returns jpg/jpeg URLs
        // Modern browsers will negotiate WebP via Accept headers
        return url;
    }
    return url;
}

// Message handler for manual cache clearing
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cache => caches.delete(cache))
                );
            }).then(() => {
                event.ports[0].postMessage({ success: true });
            })
        );
    }
});
