/* TVD · adaptador público HUB/EO v0.3.0. Nunca acepta el catálogo global de CFCX. */
(function () {
  'use strict';
  function programaDe(item, desfase) {
    var p = item && item.programacion;
    if (!p || !Array.isArray(p.videos)) return null;
    var origen = Date.parse(p.cicloOrigen);
    if (!Number.isFinite(origen)) return null;
    var videos = p.videos.map(function (v) {
      return { id:String(v && v.id || '').trim(),titulo:String(v && v.titulo || '').slice(0,200),duracion:Math.floor(Number(v && v.duracion)||0) };
    }).filter(function (v) { return /^[\w-]{11}$/.test(v.id) && v.duracion > 0; });
    return videos.length ? { videos:videos,origen:origen,desfase:desfase } : null;
  }
  function normalizar(items, desfase) {
    var vistos = new Set();
    return items.map(function (c) {
      if (!c || typeof c !== 'object') return null;
      var codigo=String(c.codigo||'').trim().toUpperCase(),tipo=String(c.tipo||'').toUpperCase();
      if (!/^CH\d{2,}$/.test(codigo)||vistos.has(codigo)||c.activo===false||!['VPS','VIRTUAL'].includes(tipo)) return null;
      vistos.add(codigo);
      var url=String(c.rutaHls||c.senal||c.url||'').trim(),playlist=String(c.playlistYoutube||'').trim();
      var match=/[?&]list=([\w-]+)/.exec(playlist);if(match)playlist=match[1];
      return { codigo:codigo,numero:codigo.slice(2),nombre:String(c.nombre||codigo).slice(0,100),
        logo:/^https:\/\//i.test(c.logo||'')?c.logo:'',
        tipo:tipo==='VPS'?'hls':'youtube',url:tipo==='VPS'&&/^https:\/\//i.test(url)?url:'',
        playlist:tipo==='VIRTUAL'&&/^[\w-]{8,}$/.test(playlist)?playlist:'',
        programa:tipo==='VIRTUAL'?programaDe(c,desfase):null,espacio:c.espacio||null,esInsigniaEO:c.esInsigniaEO===true,
        eo:c.eo&&typeof c.eo.nombre==='string'?{nombre:c.eo.nombre,codigoEO:c.eo.codigoEO}:null,
        relacion:c.relacion==='COMPARTIDO'?'COMPARTIDO':'PROPIO',orden:Number(c.orden)||Number(codigo.slice(2)) };
    }).filter(Boolean).sort(function(a,b){return a.orden-b.orden || a.codigo.localeCompare(b.codigo);});
  }
  function directorio(items) {
    var vistos=new Set();
    return (Array.isArray(items)?items:[]).filter(function(e){
      if(!e || !/^EO\d{3,}$/.test(e.codigoEO||'') || vistos.has(e.codigoEO) ||
        typeof e.nombre!=='string' || !e.nombre.trim() || !e.canalInsignia ||
        !/^CH\d{2,}$/.test(e.canalInsignia.codigo||'') || typeof e.canalInsignia.nombre!=='string')return false;
      vistos.add(e.codigoEO);return true;
    }).map(function(e){return {codigoEO:e.codigoEO,nombre:e.nombre.slice(0,120),logo:/^https:\/\//i.test(e.logo||'')?e.logo:'',
      canalInsignia:{codigo:e.canalInsignia.codigo,nombre:e.canalInsignia.nombre.slice(0,120)}};});
  }
  function validar(datos, eo) {
    if (!datos || datos.ok!==true || !Array.isArray(datos.canales)) throw new Error('RESPUESTA_INVALIDA');
    var hub=!eo;
    if (hub ? !(datos.contexto && datos.contexto.app==='TVD' && datos.contexto.tipo==='HUB') : !window.TVD_CONTEXTO.coincide(datos.contexto,eo)) throw new Error('CONTEXTO_NO_CONFIRMADO');
    if (!hub && (!datos.eo || typeof datos.eo.nombre!=='string' || !datos.eo.nombre.trim())) throw new Error('IDENTIDAD_NO_CONFIRMADA');
    var servidor=Date.parse(datos.ahora);
    return { canales:normalizar(datos.canales,Number.isFinite(servidor)?servidor-Date.now():0),
      directorioEO:hub?directorio(datos.directorioEO):[],directorioDisponible:hub&&Array.isArray(datos.directorioEO),
      contexto:datos.contexto,eo:hub?{nombre:'TV Digital',logo:''}:datos.eo,contenido:datos.contenido || {},origen:'PANEL_TV' };
  }
  async function cargar(cfg, contexto) {
    if (contexto.modo==='EO' && !contexto.eo) throw new Error('EO_REQUERIDA');
    var url=new URL(cfg.canalesPublicosUrl);
    if(contexto.modo==='HUB')url.searchParams.set('hub','1');
    else {url.searchParams.set('codigoEO',contexto.eo);url.searchParams.set('app','TVD');}
    var controller=new AbortController(),timer=setTimeout(function(){controller.abort();},cfg.timeoutMs);
    try {
      var r=await fetch(url.href,{cache:'no-store',mode:'cors',credentials:'omit',signal:controller.signal});
      if (!r.ok) throw new Error('HTTP_'+r.status);
      return validar(await r.json(),contexto.eo);
    } finally { clearTimeout(timer); }
  }
  window.TVD_CANALES={cargar:cargar,validar:validar,normalizar:normalizar,directorio:directorio};
})();
