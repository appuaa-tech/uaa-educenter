/* Service worker mínimo: permite instalar la app en el celular.
   No guarda datos de estudiantes en el dispositivo: todo se pide siempre a la red.
   Si no hay conexión, muestra un aviso en vez de una página en blanco. */
const OFFLINE = `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Sin conexión · UAA</title><body style="font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;background:#f3f5fa;color:#14213d">
<div style="max-width:340px;padding:24px;text-align:center"><img src="/icons/icon-192.png" alt="" width="96" height="96" style="border-radius:22px">
<h1 style="font-size:1.3rem">Sin conexión</h1><p>La plataforma necesita internet para mostrar y guardar la información. Revisa tu conexión y vuelve a intentar.</p>
<button onclick="location.reload()" style="font:inherit;padding:10px 18px;border-radius:999px;border:0;background:#0b3aa4;color:#fff">Reintentar</button></div></body></html>`;
self.addEventListener('install', e => { e.waitUntil(caches.open('uaa-shell-v1').then(c => c.add('/icons/icon-192.png')).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(K => Promise.all(K.filter(k => k !== 'uaa-shell-v1').map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.mode === 'navigate') { e.respondWith(fetch(r).catch(() => new Response(OFFLINE, {headers: {'Content-Type': 'text/html; charset=utf-8'}}))); return; }
  if (new URL(r.url).pathname === '/icons/icon-192.png') e.respondWith(caches.match(r).then(m => m || fetch(r)));
});
