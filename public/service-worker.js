// RiskInspect Service Worker
// Permet le fonctionnement hors-ligne et la mise en cache

const CACHE_NAME = 'riskinspect-v1'
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
]

/**
 * Installation du Service Worker
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('✅ Cache ouvert:', CACHE_NAME)
      return cache.addAll(urlsToCache)
    })
  )
  self.skipWaiting() // Activer immédiatement
})

/**
 * Activation du Service Worker
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Suppression ancien cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim() // Contrôler tous les clients
})

/**
 * Stratégie de récupération des ressources
 * Network First pour les données, Cache First pour les assets
 */
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Exclure les requêtes non-GET
  if (request.method !== 'GET') {
    return
  }

  // API requests: Network First
  if (url.pathname.startsWith('/api')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Mettre en cache les réponses valides
          if (response.status === 200) {
            const cacheResponse = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, cacheResponse)
            })
          }
          return response
        })
        .catch(() => {
          // Retourner le cache en cas d'erreur réseau
          return caches.match(request)
        })
    )
    return
  }

  // Assets: Cache First
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response
        }

        return fetch(request).then((response) => {
          // Mettre en cache les réponses valides
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }

          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache)
          })

          return response
        })
      })
      .catch(() => {
        // Fallback pour les ressources non disponibles
        return new Response('Ressource non disponible hors-ligne', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/plain'
          })
        })
      })
  )
})
