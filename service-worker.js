/* Solo la interfaz. Sin catálogos, permisos, datos EO ni contenido audiovisual. */
const CACHE='tvd-app-v0.3.4';
const SHELL=['./index.html','./css/app.css?v=0.3.4','./css/contexto.css?v=0.3.4','./js/config.js?v=0.3.4','./js/contexto.js?v=0.3.4','./js/store.js?v=0.3.4','./js/canales.js?v=0.3.4','./js/monitor.js?v=0.3.4','./js/install.js?v=0.3.4','./js/revista.js?v=0.3.4','./js/app.js?v=0.3.4','./manifest.webmanifest','./assets/icon.svg','./assets/icon-180.png','./assets/icon-192.png','./assets/icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('tvd-app-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==self.location.origin||e.request.headers.has('range'))return;
  const relative='./'+u.pathname.slice(new URL(self.registration.scope).pathname.length)+u.search;
  if(e.request.mode!=='navigate'&&!SHELL.includes(relative))return;
  e.respondWith(fetch(e.request).catch(()=>caches.match(e.request.mode==='navigate'?'./index.html':e.request).then(r=>r||Response.error())));
});
