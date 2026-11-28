/* Solo la interfaz. Sin catálogos, permisos, datos EO ni contenido audiovisual. */
const CACHE='tvd-app-v0.4.5';
const SHELL=['./index.html','./css/app.css?v=0.4.5','./css/contexto.css?v=0.4.5','./js/config.js?v=0.4.5','./js/contexto.js?v=0.4.5','./js/store.js?v=0.4.5','./js/canales.js?v=0.4.5','./js/monitor.js?v=0.4.5','./js/install.js?v=0.4.5','./js/revista.js?v=0.4.5','./js/audiencia.js?v=0.4.5','./js/app.js?v=0.4.5','./manifest.webmanifest','./assets/icon.svg','./assets/tvd-logo-180-v1.png','./assets/tvd-logo-192-v1.png','./assets/tvd-logo-512-v1.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('tvd-app-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==self.location.origin||e.request.headers.has('range'))return;
  const relative='./'+u.pathname.slice(new URL(self.registration.scope).pathname.length)+u.search;
  if(e.request.mode!=='navigate'&&!SHELL.includes(relative))return;
  e.respondWith(fetch(e.request).catch(()=>caches.match(e.request.mode==='navigate'?'./index.html':e.request).then(r=>r||Response.error())));
});
