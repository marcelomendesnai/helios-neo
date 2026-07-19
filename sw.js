// Service Worker pra Helios Neo
// ESTRATEGIA:
// - index.html: NETWORK-FIRST (sempre busca rede primeiro, cache so como fallback offline).
//   Garante que mudancas de UI aparecem assim que voce subir o deploy. Sem cache stale.
// - assets estaticos (manifest, icons): cache-first (rapido, raramente mudam).
// - Apps Script: nunca cacheia (dados em tempo real).
//
// IMPORTANTE: Toda vez que mudar arquivos do shell ou estrategia, BUMP CACHE_NAME (v2 -> v3 etc).
// Isso forca o SW antigo a cair e limpar caches obsoletos.
const CACHE_NAME = 'helios-neo-v5.3';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting(); // ativa o novo SW imediatamente, sem esperar tabs antigas fecharem
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim(); // toma controle de paginas abertas imediatamente
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Apps Script: sempre rede (dados nunca cacheados)
  if (url.hostname.includes('script.google.com') || url.hostname.includes('googleusercontent.com')) {
    return;
  }
  // Detecta se eh navegacao HTML (index.html ou raiz)
  const isHtml = event.request.mode === 'navigate' ||
                 url.pathname.endsWith('/') ||
                 url.pathname.endsWith('/index.html');

  if (isHtml) {
    // NETWORK-FIRST: busca rede, atualiza cache em background, fallback p/ cache se offline
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Outros assets: cache-first (manifest, icons quase nunca mudam)
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
});
