/**
 * Abdullah Portfolio Website
 * Service Worker
 */

// Cache name with version
const CACHE_NAME = 'abdullah-portfolio-v1';

// Assets to cache
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/projects.html',
  '/blog.html',
  '/contact.html',
  '/admin.html',
  '/css/style.css',
  '/css/blog.css',
  '/js/theme.js',
  '/js/language.js',
  '/js/main.js',
  '/js/projects-data.js',
  '/js/projects.js',
  '/js/advanced-filter.js',
  '/js/blog-data.js',
  '/js/blog.js',
  '/js/certifications.js',
  '/js/contact.js',
  '/js/scroll-effects.js',
  '/js/skills.js',
  '/manifest.json',
  '/assets/icons/icon-72x72.png',
  '/assets/icons/icon-96x96.png',
  '/assets/icons/icon-128x128.png',
  '/assets/icons/icon-144x144.png',
  '/assets/icons/icon-152x152.png',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-384x384.png',
  '/assets/icons/icon-512x512.png',
  '/assets/icons/projects-icon.png',
  '/assets/icons/blog-icon.png',
  '/assets/icons/contact-icon.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.startsWith('https://fonts.googleapis.com') && 
      !event.request.url.startsWith('https://cdnjs.cloudflare.com')) {
    return;
  }
  
  // For navigation requests (HTML pages), use network-first strategy
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response to store in cache
          const clonedResponse = response.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, clonedResponse);
            });
            
          return response;
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // For other requests, use cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached response if found
        if (response) {
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        // Make network request
        return fetch(fetchRequest)
          .then((response) => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            // Store in cache
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          })
          .catch((error) => {
            console.error('Fetch failed:', error);
            // For image requests, return a fallback image
            if (event.request.destination === 'image') {
              return caches.match('/assets/icons/icon-512x512.png');
            }
            
            return new Response('Network error happened', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Background sync for contact form
self.addEventListener('sync', (event) => {
  if (event.tag === 'contact-form-sync') {
    event.waitUntil(syncContactForm());
  }
});

// Function to sync contact form data
async function syncContactForm() {
  try {
    // Get all pending form submissions from IndexedDB
    const pendingFormData = await getPendingContactForms();
    
    // Process each pending form
    const promises = pendingFormData.map(async (formData) => {
      try {
        // Attempt to send the form data
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        
        if (response.ok) {
          // If successful, remove from pending queue
          await removePendingContactForm(formData.id);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Failed to sync form data:', error);
        return false;
      }
    });
    
    // Wait for all submissions to complete
    await Promise.all(promises);
    
    // Show notification if supported
    if (self.registration.showNotification) {
      self.registration.showNotification('Contact Form', {
        body: 'Your message has been sent successfully!',
        icon: '/assets/icons/icon-192x192.png'
      });
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Placeholder functions for IndexedDB operations
// These would be implemented with actual IndexedDB code
async function getPendingContactForms() {
  // This would retrieve pending forms from IndexedDB
  return [];
}

async function removePendingContactForm(id) {
  // This would remove a processed form from IndexedDB
  return true;
}

// Push notification event
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/badge-icon.png',
        data: data.url ? { url: data.url } : null
      })
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
