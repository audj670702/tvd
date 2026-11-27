/* ==========================================================
   App TVD · aplicación (rutas y pantallas)
   Navegación por hash: #/inicio, #/espacios, #/espacio/<id>,
   #/revista, #/videoteca, #/buscar, #/arcade, #/cupones, #/mi
   ========================================================== */
(function () {
  var CFG = window.TVD_CONFIG;
  var contexto, contextoError='';
  try { contexto=window.TVD_CONTEXTO.resolver(location.search,CFG); } catch (_) { contexto={app:'TVD',modo:'EO',eo:''};contextoError='El enlace de esta empresa no es válido.'; }
  var versionEl = document.getElementById('appVersion');
  if (versionEl) versionEl.textContent = CFG.version || 'v0.1.0';
  var footerVersionEl = document.getElementById('footerVersion');
  if (footerVersionEl) footerVersionEl.textContent = CFG.version || 'v0.1.0';
  var STORE = window.CFCX_STORE;
  var view = document.getElementById('view');
  var DATA = {canales:[],espacios:[],programas:[],cupones:[],articulos:[]};
  var errorCanales='', consultaEnCurso=false;
  var audiencia = window.TVD_AUDIENCIA && !contextoError ? new window.TVD_AUDIENCIA({ url: CFG.audienciaUrl, contexto: contexto }) : null;
  function audienciaDelMonitor(evento) { if (audiencia) audiencia.actualizar(evento); }
  var monitorActual = null;
  var origenCanales = '';
  var limpieza = []; // funciones a ejecutar al salir de una pantalla

  // ---------------------------------------------------------- utilidades
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function norm(s) {
    return String(s || '').toLocaleLowerCase('es-MX').normalize('NFD').replace(/[̀-ͯ]/g, '');
  }
  function hoy() { return new Date().toISOString().slice(0, 10); }
  function vigente(item) {
    var d = hoy();
    return (!item.desde || item.desde <= d) && (!item.hasta || item.hasta >= d);
  }
  function espacioPorId(id) {
    return (DATA.espacios || []).filter(function (e) { return e.id === id; })[0];
  }
  // Panel TV es la única fuente de asociación canal-espacio.
  function canalPorEspacio(id) {
    var canales = DATA.canales || [];
    var asignado = canales.filter(function (c) {
      return String(c.espacio || '').trim().toLowerCase() === String(id || '').trim().toLowerCase();
    })[0];
    if (asignado) return asignado;
    // Compatibilidad si el servicio público no incluye el campo espacio.
    var espacio = espacioPorId(id);
    return espacio ? canales.filter(function (c) {
      return norm(c.nombre) === norm(espacio.nombre);
    })[0] || null : null;
  }
  var toastTimer;
  function toast(msg) {
    var t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2800);
  }

  var I = {
    grid: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>',
    book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h12a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2z"/><path d="M18 8h2v10a2 2 0 0 1-2 2M8 8h6M8 12h6M8 16h4"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3z"/></svg>',
    game: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="7" width="20" height="11" rx="4"/><path d="M7 11v3M5.5 12.5h3"/><circle cx="16" cy="11.5" r=".8"/><circle cx="18" cy="13.5" r=".8"/></svg>',
    ticket: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z"/></svg>',
    people: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20a6 6 0 0 1 12 0M14 20a4.5 4.5 0 0 1 7-3.7"/></svg>',
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18 9 12l6-6"/></svg>',
    chev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
    lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
    moon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    sun: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>'
  };

  // ---------------------------------------------------------- tema
  var mqLight = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;
  function temaEfectivo() {
    var t = STORE.getTheme();
    if (t !== 'auto') return t;
    return mqLight && mqLight.matches ? 'light' : 'dark';
  }
  function aplicarTema(t) {
    STORE.setTheme(t);
    if (t === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', t);
    pintarBotonTema();
  }
  function pintarBotonTema() {
    var b = document.getElementById('themeToggle');
    var oscuro = temaEfectivo() === 'dark';
    b.innerHTML = oscuro ? I.moon : I.sun;
    b.setAttribute('aria-label', oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
  }
  document.getElementById('themeToggle').addEventListener('click', function () {
    aplicarTema(temaEfectivo() === 'dark' ? 'light' : 'dark');
    if (location.hash.indexOf('#/mi') === 0) router();
  });
  if (mqLight && mqLight.addEventListener) mqLight.addEventListener('change', pintarBotonTema);

  // ---------------------------------------------------------- sesión en barra superior
  function nombreApp() { return DATA.identidad && DATA.identidad.nombre || (contexto.modo==='HUB'?'TV Digital':'TV Digital'); }
  function pintarSesion() {
    var a=document.getElementById('sessionLink');a.textContent='Mi app';a.setAttribute('aria-label','Mi app');
  }
  function pintarIdentidad() {
    var nombre=nombreApp(),marca=document.querySelector('.wordmark');
    document.title=nombre+' · TV Digital';marca.replaceChildren();
    if(DATA.identidad && /^https:\/\//i.test(DATA.identidad.logo||'')) {
      var logo=document.createElement('img');logo.className='context-logo';logo.alt='';logo.src=DATA.identidad.logo;marca.append(logo);
    }
    var palabras=nombre.toUpperCase().split(/\s+/),acento=document.createElement('span');acento.textContent=palabras.pop();
    if(palabras.length)marca.append(document.createTextNode(palabras.join(' ')+' '));marca.append(acento);marca.setAttribute('aria-label',nombre+', inicio');
    document.getElementById('contextFooter').textContent=nombre.toUpperCase()+(contexto.modo==='HUB'?' · HUB':' · TV DIGITAL');
    var titulo=document.querySelector('.portada-masthead small');if(titulo)titulo.textContent=nombre;
    window.dispatchEvent(new CustomEvent('tvd-identidad',{detail:{nombre:nombre,modo:contexto.modo,eo:contexto.eo}}));
  }
  function enlaceContexto(eo) {
    var u=new URL(location.pathname,location.origin);if(eo)u.searchParams.set('eo',eo);u.hash='/inicio';return u.href;
  }
  function imagenCanal(logo,clase){return '<span class="'+clase+'">'+(/^https:\/\//i.test(logo||'')?'<img src="'+esc(logo)+'" alt="" loading="lazy" onerror="this.hidden=true">':I.play)+'</span>';}
  function insigniaActual(){return DATA.canales.find(function(c){return c.esInsigniaEO===true;});}
  function direccionamiento() {
    if(contexto.modo!=='HUB')return '<section class="section context-direction"><a class="row context-toggle" href="'+esc(enlaceContexto(''))+'"><span class="thumb">'+I.grid+'</span><span class="meta"><span class="title">TVD HUB</span></span><span class="chev">'+I.chev+'</span></a></section>';
    return '<section class="section context-direction"><a class="context-buy" href="'+esc(CFG.compraUrl)+'" target="_blank" rel="noopener noreferrer">Adquiere tu canal</a><button type="button" class="row context-toggle" id="abrirCanalesEO" aria-expanded="false" aria-controls="canalesEO"><span class="thumb">'+I.grid+'</span><span class="meta"><span class="title">Canales insignia</span></span><span class="chev">'+I.chev+'</span></button><div class="context-dropdown" id="canalesEO" hidden><div class="search-wrap"><input class="search" id="buscarCanalEO" type="search" placeholder="Buscar canal" aria-label="Buscar canal"><button type="button" class="icon-btn" id="limpiarCanalEO" aria-label="Limpiar búsqueda">✕</button></div><div class="list" id="listaCanalesEO"></div></div></section>';
  }
  function cerrarSelectorEO(){var panel=document.getElementById('canalesEO'),boton=document.getElementById('abrirCanalesEO');if(panel)panel.hidden=true;if(boton)boton.setAttribute('aria-expanded','false');}
  document.addEventListener('click',function(e){if(!e.target.closest('.context-direction'))cerrarSelectorEO();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'){var boton=document.getElementById('abrirCanalesEO'),panel=document.getElementById('canalesEO');if(panel&&!panel.hidden){cerrarSelectorEO();boton.focus();}}});
  function pintarSelectorEO() {
    var filtro=norm(document.getElementById('buscarCanalEO').value);
    var empresas=(DATA.directorioEO||[]).filter(function(e){return norm(e.nombre+' '+e.canalInsignia.nombre+' '+e.canalInsignia.codigo).includes(filtro);});
    var lista=document.getElementById('listaCanalesEO');lista.replaceChildren();
    empresas.forEach(function(e){
      var enlace=document.createElement('a');enlace.className='row';enlace.href=enlaceContexto(e.codigoEO);
      enlace.setAttribute('aria-label',e.canalInsignia.codigo+' '+e.canalInsignia.nombre);
      enlace.innerHTML=imagenCanal(e.logo,'flagship-logo')+'<span class="channel-code">'+esc(e.canalInsignia.codigo)+'</span><span class="channel-name">'+esc(e.canalInsignia.nombre)+'</span><span class="chev">'+I.chev+'</span>';
      lista.append(enlace);
    });
    if(!empresas.length){var aviso=document.createElement('p');aviso.className='muted';aviso.textContent=errorCanales||!DATA.directorioDisponible?'Los canales no están disponibles en este momento.':filtro?'No hay canales con este criterio.':'Todavía no hay canales insignia disponibles.';lista.append(aviso);}
  }
  function canalInicial() {
    if(contexto.modo!=='EO')return '';
    var preferido=STORE.getCanalPredeterminado();
    if(DATA.canales.some(function(c){return c.codigo===preferido;}))return '';
    var insignias=DATA.canales.filter(function(c){return c.esInsigniaEO===true;});
    return insignias.length===1?insignias[0].numero:'';
  }
  // ---------------------------------------------------------- reproductor de videoteca
  var modal = document.createElement('div');
  modal.className = 'modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.innerHTML = '<div class="modal-inner"><div class="modal-head"><strong data-role="t"></strong>' +
    '<button type="button" class="icon-btn" data-role="x" aria-label="Cerrar">' + I.close + '</button></div>' +
    '<div class="frame" data-role="f"></div></div>';
  document.body.appendChild(modal);
  function abrirPlaylist(nombre, playlist) {
    modal.querySelector('[data-role="t"]').textContent = nombre;
    modal.querySelector('[data-role="f"]').innerHTML =
      '<iframe title="' + esc(nombre) + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen src="https://www.youtube-nocookie.com/embed/videoseries?list=' +
      encodeURIComponent(playlist) + '&autoplay=1&playsinline=1&rel=0"></iframe>';
    modal.classList.add('open');
    modal.querySelector('[data-role="x"]').focus();
  }
  function cerrarModal() {
    modal.classList.remove('open');
    modal.querySelector('[data-role="f"]').innerHTML = '';
  }
  modal.addEventListener('click', function (e) {
    if (e.target === modal || e.target.closest('[data-role="x"]')) cerrarModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('open')) cerrarModal();
  });

  // ---------------------------------------------------------- piezas reutilizables
  function filaArticulo(a) {
    return '<a class="row" ' + atributosEnlaceArticulo(a) + ' data-art="' + esc(a.id) + '">' +
      '<span class="thumb" style="width:64px;aspect-ratio:3/4;height:auto;overflow:visible">' + portadaRevista(a, 'mini') + '</span>' +
      '<span class="meta"><span class="kicker">' + esc(a.tipo || 'Artículo') + '</span>' +
      '<span class="title" style="display:block">' + esc(a.titulo) + '</span></span>' +
      '<span class="chev">' + I.chev + '</span></a>';
  }
  function filaPrograma(p) {
    var e = espacioPorId(p.espacio);
    return '<button type="button" class="row" data-play="' + esc(p.playlist) + '" data-name="' + esc(p.nombre) + '">' +
      '<span class="thumb">' + I.play + '</span>' +
      '<span class="meta"><span class="kicker">' + (e ? esc(e.nombre) : 'Programa') + '</span>' +
      '<span class="title" style="display:block">' + esc(p.nombre) + '</span></span>' +
      '<span class="chev">' + I.chev + '</span></button>';
  }
  function enlazarProgramas(root) {
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-play]');
      if (b) abrirPlaylist(b.getAttribute('data-name'), b.getAttribute('data-play'));
    });
  }

  // ---------------------------------------------------------- pantallas
  var V = {};

  // REVISTA: las portadas se componen aquí, no son capturas del video.
  function fechaEditorial(a) {
    var d = new Date(a.fecha || a.fechaPublicacion || '');
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('es-MX', {day:'numeric', month:'long', year:'numeric', timeZone:'UTC'});
  }
  function audioRevista(a) {
    var src = urlExterna(a && a.audioUrl);
    if (!src) return '';
    return '<div class="revista-audio-compact"><span class="revista-audio-label">Escuchar artículo</span>' +
      '<audio controls preload="none" aria-label="Escuchar artículo: ' + esc(a.titulo || '') +
      '" src="' + esc(src) + '">Tu navegador no admite reproducción de audio.</audio></div>';
  }
  function portadaRevista(a, variante) {
    var foto = urlExterna(a.portada);
    var arteFinal = urlExterna(a.portadaDisenada);
    if (arteFinal) return '<div class="portada-revista portada-' + (variante || 'normal') +
      ' portada-imagen-final"><img loading="lazy" src="' + esc(arteFinal) +
      '" alt="Portada REVISTA TVD: ' + esc(a.titulo || '') + '"></div>';
    return '<div class="portada-revista portada-' + (variante || 'normal') + '">' +
      '<div class="portada-masthead">REVISTA <small>'+esc(nombreApp())+'</small></div>' +
      '<div class="portada-edicion">' + esc(a.edicion || 'EDICIÓN DIGITAL') + (fechaEditorial(a) ? ' · ' + esc(fechaEditorial(a)) : '') + '</div>' +
      '<div class="portada-foto">' + (foto ? '<img loading="lazy" src="' + esc(foto) + '" alt="' + esc(a.portadaAlt || '') + '">' : '<span>TVD</span>') + '</div>' +
      '<div class="portada-titular"><small>' + esc(a.tipo || 'ARTÍCULO') + '</small><strong>' + esc(a.titulo) + '</strong>' +
      '<p>' + esc(a.subtitulo || a.resumen || '') + '</p></div><div class="portada-firma">'+esc(a.autor || ('Redacción '+nombreApp()))+'</div></div>';
  }
  function revistaSinArticulos() {
    return '<div class="revista-vacia"><strong>' +
      (DATA.revistaError ? 'No se pudo consultar REVISTA' : 'La primera edición está en preparación') +
      '</strong><p>' + (DATA.revistaError ? 'Intenta consultar las publicaciones más tarde.' :
      'Las publicaciones aparecerán aquí cuando estén disponibles.') + '</p></div>';
  }
  function urlExterna(u) { return /^https:\/\//i.test(String(u || '')) ? String(u) : ''; }
  // El blog es el lector oficial. Solo se aceptan entradas publicadas en SCaD.
  function enlaceArticulo(a) {
    var url = urlExterna(a && a.publicacionUrl);
    return /^https:\/\/(?:www\.)?scad\.mx\/post\/[^\s"'<>]+$/i.test(url) ? url : '';
  }
  function atributosEnlaceArticulo(a) {
    var url = enlaceArticulo(a);
    return url ? 'href="' + esc(url) + '" target="_blank" rel="noopener noreferrer"' : 'href="#/revista"';
  }

  V.inicio = function () {
    var recientes = (DATA.articulos || []).filter(function(a){return a.enBanner !== false;}).slice(0,5);
    view.innerHTML =
      direccionamiento() + '<section class="section"><div id="monitor"></div><div id="canalesEstado" class="muted" style="font-size:12px;padding-top:8px"></div></section>' +
      '<section class="section revista-home"><div class="revista-head"><div><p class="eyebrow">PUBLICACIÓN EDITORIAL</p><h2 class="h1">REVISTA TVD</h2></div></div>' +
      (recientes.length
      ? '<div id="inicioRevista" role="region" aria-label="Últimas cinco publicaciones de REVISTA">' + recientes.map(function(x,i){return '<div class="revista-home-feature revista-home-slide" data-home-slide="'+i+'" '+(i?'hidden':'')+'>'+
        '<a class="revista-home-cover" '+atributosEnlaceArticulo(x)+' aria-label="Leer artículo completo: '+esc(x.titulo)+'">'+portadaRevista(x,'home')+'</a>'+
        '<div class="revista-home-copy"><p class="eyebrow">'+esc(x.tipo || 'ARTÍCULO')+'</p><h3>'+esc(x.titulo)+'</h3><p class="muted">'+esc(x.resumen || '')+'</p>'+
        audioRevista(x)+'<a class="link-arrow" '+atributosEnlaceArticulo(x)+'>Leer artículo completo '+I.chev+'</a></div></div>';}).join('') +
        (recientes.length>1?'<div class="revista-home-controls"><button type="button" data-home-step="-1" aria-label="Artículo anterior">'+I.back+'</button><div class="revista-puntos">'+recientes.map(function(x,i){return '<button type="button" data-home-index="'+i+'" aria-label="Mostrar artículo '+(i+1)+': '+esc(x.titulo)+'" aria-pressed="'+(i===0)+'"></button>';}).join('')+'</div><button type="button" data-home-step="1" aria-label="Artículo siguiente">'+I.chev+'</button><button class="revista-pausa" type="button" id="inicioRevistaPausa">Pausar</button></div>':'')+'</div>'
      : '<div class="revista-vacia"><strong>Próxima edición de REVISTA TVD</strong><p>Las publicaciones aparecerán aquí cuando estén disponibles.</p></div>') +
      '<div class="revista-explorar"><a class="btn" href="#/revista">Explorar más '+I.chev+'</a></div></section>';
    if(recientes.length>1){
      var zona=document.getElementById('inicioRevista'), indice=0;
      var pausado=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var pausa=document.getElementById('inicioRevistaPausa');
      function pintarPausa(){pausa.textContent=pausado?'Reanudar':'Pausar';pausa.setAttribute('aria-pressed',String(pausado));}
      function detener(){pausado=true;pintarPausa();}
      function elegir(n,manual){
        if(manual) detener();
        indice=(n+recientes.length)%recientes.length;
        zona.querySelectorAll('[data-home-slide]').forEach(function(el,i){el.hidden=i!==indice;});
        zona.querySelectorAll('[data-home-index]').forEach(function(el,i){el.setAttribute('aria-pressed',String(i===indice));});
        var actual=zona.querySelector('[data-home-slide="'+indice+'"]');
        if(actual.animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) actual.animate([{opacity:.25},{opacity:1}],{duration:350});
      }
      zona.addEventListener('click',function(e){var paso=e.target.closest('[data-home-step]'),punto=e.target.closest('[data-home-index]');if(paso)elegir(indice+Number(paso.dataset.homeStep),true);if(punto)elegir(Number(punto.dataset.homeIndex),true);});
      zona.addEventListener('pointerdown',function(e){if(e.target!==pausa)detener();});
      zona.addEventListener('play',function(e){if(e.target.tagName==='AUDIO')detener();},true);
      zona.addEventListener('focusin',function(e){if(e.target!==pausa)detener();});
      zona.addEventListener('keydown',function(e){if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();elegir(indice+(e.key==='ArrowRight'?1:-1),true);}});
      pausa.onclick=function(){pausado=!pausado;pintarPausa();};pintarPausa();
      var timerInicio=setInterval(function(){if(!pausado&&!document.hidden)elegir(indice+1,false);},6000);
      limpieza.push(function(){clearInterval(timerInicio);});
    }
    var mon = new window.CFCXMonitor(document.getElementById('monitor'), {
      onAudiencia: audienciaDelMonitor, canales: DATA.canales, mostrarCanales: true, inicial:canalInicial()
    });
    monitorActual = mon;
    limpieza.push(function () { if (monitorActual === mon) monitorActual = null; mon.destroy(); });
    var acceso=document.getElementById('abrirCanalesEO');if(acceso){acceso.onclick=function(){var panel=document.getElementById('canalesEO');panel.hidden=!panel.hidden;acceso.setAttribute('aria-expanded',String(!panel.hidden));if(!panel.hidden){pintarSelectorEO();document.getElementById('buscarCanalEO').focus();}};document.getElementById('buscarCanalEO').oninput=pintarSelectorEO;document.getElementById('limpiarCanalEO').onclick=function(){var campo=document.getElementById('buscarCanalEO');campo.value='';pintarSelectorEO();campo.focus();};}
    actualizarLeyendaCanales();
  };

  V.espacios = function () {
    view.innerHTML = '<section class="section"><a class="back" href="#/inicio">' + I.back + 'Inicio</a>' +
      '<h1 class="h1">Espacios</h1><p class="lead">Cada Espacio tiene su canal, su revista y su comunidad.</p></section>' +
      '<section class="section"><div class="space-grid">' +
      (DATA.espacios || []).map(function (e) {
        var canal = canalPorEspacio(e.id);
        var leyenda = canal ? 'CH ' + esc(canal.numero) : 'SIN CANAL ACTIVO';
        return '<a class="space-card" href="#/espacio/' + esc(e.id) + '"><span class="mono">' + leyenda + '</span><strong>' + esc(e.nombre) + '</strong><span>' + esc(e.descripcion) + '</span></a>';
      }).join('') + '</div></section>';
  };

  V.espacio = function (id, tab) {
    var e = espacioPorId(id);
    if (!e) { location.hash = '#/espacios'; return; }
    var canalEspacio = canalPorEspacio(id);
    tab = tab || 'revista';
    var arts = (DATA.articulos || []).filter(function (a) { return a.espacio === id; });
    var progs = (DATA.programas || []).filter(function (p) { return p.espacio === id; });

    var cuerpo = '';
    if (tab === 'revista') {
      cuerpo = arts.length ? '<div class="list">' + arts.map(filaArticulo).join('') + '</div>' : '<p class="muted">Pronto habrá contenido en este Espacio.</p>';
    } else if (tab === 'talentos') {
      cuerpo = '<div class="talents">' + (e.talentos || []).map(function (t) {
        return '<div class="talent"><div class="face"></div>' + esc(t) + '</div>';
      }).join('') + '</div>';
    } else {
      cuerpo = progs.length ? '<div class="list">' + progs.map(filaPrograma).join('') + '</div>' : '<p class="muted">Sin programas asignados todavía.</p>';
    }

    var tabs = [['revista', 'Revista'], ['talentos', id === 'comunidad' ? 'Asociaciones' : 'Talentos'], ['videoteca', 'Videoteca']];

    view.innerHTML =
      '<section class="section"><a class="back" href="#/espacios">' + I.back + 'Espacios</a>' +
      '<p class="mono muted" style="margin:0 0 4px">ESPACIO · ' + (canalEspacio ? 'CH ' + esc(canalEspacio.numero) : 'SIN CANAL ACTIVO') + '</p>' +
      '<h1 class="h1">' + esc(e.nombre) + '</h1><p class="lead">' + esc(e.descripcion) + '</p></section>' +
      '<section class="section"><div id="monitor"></div></section>' +
      '<section class="section"><div class="tabs" role="tablist">' +
        tabs.map(function (t) {
          return '<button type="button" role="tab" aria-selected="' + (t[0] === tab) + '" data-tab="' + t[0] + '">' + t[1] + '</button>';
        }).join('') +
      '</div><div id="tabBody">' + cuerpo + '</div></section>' +
      '<section class="section"><div class="box"><strong>¿Tienes algo que compartir?</strong>' +
        '<p>Envía tu información y el equipo de TVD la revisa y la publica.</p>' +
        '<button type="button" class="btn ghost block" style="margin-top:12px" id="comparte">Comparte con TVD</button></div></section>';

    var mon = new window.CFCXMonitor(document.getElementById('monitor'), {
      onAudiencia: audienciaDelMonitor, canales: canalEspacio ? DATA.canales : [], inicial: canalEspacio ? canalEspacio.numero : '', mostrarCanales: false
    });
    monitorActual = mon;
    limpieza.push(function () { if (monitorActual === mon) monitorActual = null; mon.destroy(); });

    view.querySelector('.tabs').addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-tab]');
      if (b) history.replaceState(null, '', '#/espacio/' + id + '/' + b.getAttribute('data-tab'));
      if (b) router();
    });
    document.getElementById('comparte').addEventListener('click', function () {
      toast('El formulario para enviar contenido llega en la siguiente fase');
    });
    enlazarProgramas(view);
  };

  V.revista = function () {
    var todos = (DATA.articulos || []).slice().sort(function(a,b){
      return (Date.parse(b.fecha || b.fechaPublicacion) || 0) - (Date.parse(a.fecha || a.fechaPublicacion) || 0);
    });
    var portadas = todos.filter(function(a){return a.enBanner !== false;}).slice(0,5);
    var indice=0, pausado=false;
    var reducido=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    view.innerHTML='<section class="section"><a class="back" href="#/inicio">'+I.back+'Inicio</a><p class="eyebrow">TV DIGITAL · PUBLICACIÓN EDITORIAL</p><h1 class="h1 revista-nombre">REVISTA</h1><p class="lead">Historias para leer más allá de la pantalla.</p></section>'+
      (portadas.length ? '<section class="section revista-ediciones" aria-label="Carrusel editorial"><div class="revista-head"><h2 class="eyebrow">PORTADAS DESTACADAS</h2><button class="revista-pausa" id="revistaPausa" type="button"></button></div><div class="revista-carrusel"><button type="button" data-mover="-1" aria-label="Portada anterior">'+I.back+'</button><div id="revistaDestacada"></div><button type="button" data-mover="1" aria-label="Portada siguiente">'+I.chev+'</button></div><div class="revista-puntos" id="revistaPuntos" aria-label="Elegir portada"></div><p class="note" id="revistaCuenta" aria-live="off"></p><div id="revistaTira" class="revista-tira" aria-label="Miniportadas de publicaciones"></div></section>':'')+
      (todos.length ? '<section class="section"><h2 class="h1 revista-nombre">Hemeroteca</h2><div class="search-wrap">'+I.search+'<input type="search" class="search" id="buscarRevista" placeholder="Título, tema, invitado o programa" aria-label="Buscar en la hemeroteca"></div><p id="hemerotecaCuenta" class="note" role="status"></p><div id="hemerotecaLista" class="list"></div></section>':'<section class="section">'+revistaSinArticulos()+'</section>');
    if (!todos.length) return;
    function hemeroteca(){
      var q=norm(document.getElementById('buscarRevista').value);
      var lista=todos.filter(function(p){return norm([p.titulo,p.resumen,p.tipo,p.espacio,p.programa,p.invitado,(p.etiquetas || []).join(' ')].join(' ')).indexOf(q)>=0;});
      document.getElementById('hemerotecaCuenta').textContent=lista.length+' publicaciones · Más recientes primero';
      document.getElementById('hemerotecaLista').innerHTML=lista.map(filaArticulo).join('') || '<p class="muted">No se encontraron publicaciones.</p>';
    }
    document.getElementById('buscarRevista').oninput=hemeroteca;
    hemeroteca();
    if (!portadas.length) return;
    function pausa(){pausado=true;pintarPausa();}
    function pintarPausa(){
      var el=document.getElementById('revistaPausa');
      el.textContent=pausado || reducido?'Reanudar movimiento':'Pausar movimiento';
      el.setAttribute('aria-pressed',String(pausado || reducido));
      el.disabled=portadas.length<2;
    }
    function pintar(animar){
      var x=portadas[indice],destino=document.getElementById('revistaDestacada');
      destino.innerHTML='<a '+atributosEnlaceArticulo(x)+' aria-label="Leer artículo completo: '+esc(x.titulo)+'">'+portadaRevista(x,'grande')+'</a>' +
        '<div class="revista-destacada-copy"><p class="eyebrow">'+esc(x.tipo || 'ARTÍCULO')+'</p><h3>'+esc(x.titulo)+'</h3><p class="muted">'+esc(x.resumen || '')+'</p>'+
        audioRevista(x)+(enlaceArticulo(x)?'<a class="link-arrow" '+atributosEnlaceArticulo(x)+'>Leer artículo completo '+I.chev+'</a>':'')+'</div>';
      if(animar && !reducido && destino.animate) destino.animate([{opacity:.3,transform:'translateX(8px)'},{opacity:1,transform:'translateX(0)'}],{duration:350});
      document.getElementById('revistaCuenta').textContent=(indice+1)+' de '+portadas.length;
      document.getElementById('revistaPuntos').innerHTML=portadas.map(function(p,i){return '<button type="button" data-elegir="'+i+'" aria-label="Portada '+(i+1)+': '+esc(p.titulo)+'" aria-pressed="'+(indice===i)+'"></button>';}).join('');
      document.getElementById('revistaTira').innerHTML=portadas.map(function(p,i){return '<button type="button" data-elegir="'+i+'" aria-label="Seleccionar: '+esc(p.titulo)+'" aria-pressed="'+(indice===i)+'" class="revista-miniatura'+(indice===i?' activa':'')+'">'+portadaRevista(p,'mini')+'</button>';}).join('');
      var tira=document.getElementById('revistaTira'),activa=tira.querySelector('.activa');
      if(activa)tira.scrollLeft=Math.max(0,activa.offsetLeft-tira.offsetLeft-tira.clientWidth/2+activa.clientWidth/2);
    }
    function seleccionar(n){pausa();indice=(n+portadas.length)%portadas.length;pintar(true);}
    function click(e){
      var mover=e.target.closest('[data-mover]'),elegir=e.target.closest('[data-elegir]');
      if(mover) seleccionar(indice+Number(mover.dataset.mover));
      else if(elegir){
        var grupo=elegir.closest('#revistaTira')?'#revistaTira':'#revistaPuntos';
        var elegido=Number(elegir.dataset.elegir);
        seleccionar(elegido);
        var nuevo=view.querySelector(grupo+' [data-elegir="'+elegido+'"]');
        if(nuevo) nuevo.focus({preventScroll:true});
      }
    }
    view.addEventListener('click',click);
    limpieza.push(function(){view.removeEventListener('click',click);});
    var zona=view.querySelector('.revista-ediciones');
    zona.addEventListener('pointerdown',function(e){if(e.target.id!=='revistaPausa') pausa();});
    zona.addEventListener('focusin',function(e){if(e.target.id!=='revistaPausa') pausa();});
    zona.addEventListener('play',function(e){if(e.target.tagName==='AUDIO') pausa();},true);
    zona.addEventListener('keydown',function(e){if(e.key==='ArrowRight' || e.key==='ArrowLeft'){e.preventDefault();seleccionar(indice+(e.key==='ArrowRight'?1:-1));}});
    document.getElementById('revistaPausa').onclick=function(){pausado=!(pausado || reducido);reducido=false;pintarPausa();};
    pintar(false);pintarPausa();
    var timer=setInterval(function(){if(pausado || reducido || document.hidden || portadas.length<2) return;indice=(indice+1)%portadas.length;pintar(true);},6000);
    limpieza.push(function(){clearInterval(timer);});
  };

  V.articulo = function (id) {
    // Compatibilidad con enlaces antiguos #/articulo/id.
    var articulo = (DATA.articulos || []).filter(function (a) { return a.id === id; })[0];
    var url = enlaceArticulo(articulo);
    if (url) { window.location.assign(url); return; }
    location.hash = '#/revista';
  };

  V.videoteca = function () {
    var progs = DATA.programas || [];
    view.innerHTML = '<section class="section"><a class="back" href="#/inicio">' + I.back + 'Inicio</a>' +
      '<h1 class="h1">Videoteca</h1><p class="lead">Programas del acervo de TV Digital.</p></section>' +
      '<section class="section"><div class="search-wrap">' + I.search +
      '<input class="search" id="vq" type="search" placeholder="Buscar programa" aria-label="Buscar programa"></div></section>' +
      '<section class="section"><div class="list" id="vlist">' + (progs.length ? progs.map(filaPrograma).join('') : '<p class="muted">Aún no hay programas disponibles.</p>') + '</div></section>';
    var q = document.getElementById('vq');
    q.addEventListener('input', function () {
      var t = norm(q.value);
      document.getElementById('vlist').innerHTML = progs.filter(function (p) { return norm(p.nombre).indexOf(t) > -1; }).map(filaPrograma).join('') ||
        '<p class="muted">Sin resultados.</p>';
    });
    enlazarProgramas(view);
  };

  V.buscar = function () {
    view.innerHTML = '<section class="section"><h1 class="h1">Buscar</h1></section>' +
      '<section class="section"><div class="search-wrap">' + I.search +
      '<input class="search" id="q" type="search" placeholder="Programas, espacios, revista…" aria-label="Buscar en TVD"></div></section>' +
      '<section class="section" id="res"><p class="muted">Escribe para buscar en el acervo y la revista.</p></section>';
    var q = document.getElementById('q');
    var res = document.getElementById('res');
    q.addEventListener('input', function () {
      var t = norm(q.value).trim();
      if (!t) { res.innerHTML = '<p class="muted">Escribe para buscar en el acervo y la revista.</p>'; return; }
      var esp = (DATA.espacios || []).filter(function (e) { return norm(e.nombre + ' ' + e.descripcion).indexOf(t) > -1; });
      var pro = (DATA.programas || []).filter(function (p) { return norm(p.nombre).indexOf(t) > -1; });
      var art = (DATA.articulos || []).filter(function (a) { return norm(a.titulo + ' ' + a.tipo).indexOf(t) > -1; });
      var html = '';
      if (esp.length) html += '<h2 class="eyebrow">Espacios</h2><div class="list" style="margin-bottom:18px">' + esp.map(function (e) {
        var canal = canalPorEspacio(e.id);
        return '<a class="row" href="#/espacio/' + esc(e.id) + '"><span class="meta"><span class="kicker">' + (canal ? 'CH ' + esc(canal.numero) : 'SIN CANAL ACTIVO') + '</span><span class="title" style="display:block">' + esc(e.nombre) + '</span></span><span class="chev">' + I.chev + '</span></a>';
      }).join('') + '</div>';
      if (pro.length) html += '<h2 class="eyebrow">Programas</h2><div class="list" style="margin-bottom:18px">' + pro.map(filaPrograma).join('') + '</div>';
      if (art.length) html += '<h2 class="eyebrow">Revista</h2><div class="list">' + art.map(filaArticulo).join('') + '</div>';
      res.innerHTML = html || '<p class="muted">Sin resultados.</p>';
    });
    enlazarProgramas(view);
    q.focus();
  };

  V.arcade = function () {
    var juegos = [
      { id: 'laberinto', tag: 'L', nombre: 'Laberinto', desc: 'Responde para abrir caminos hasta la salida.' },
      { id: 'serpientes', tag: 'S', nombre: 'Serpientes y escaleras', desc: 'Aciertas, subes; fallas, bajas.' },
      { id: 'colores', tag: 'C', nombre: 'Colores', desc: 'Asociación rápida, partidas cortas.' }
    ];
    var sel = { j: 0, e: 0 };
    var esps = DATA.espacios || [];
    var sesion = null;

    function pintar() {
      view.innerHTML = '<section class="section"><p class="mono muted" style="margin:0 0 4px">ARCADE TVD</p>' +
        '<h1 class="h1">¿Cuánto sabes del canal?</h1>' +
        '<p class="lead">Trivia de programas, entrevistas y talentos.</p></section>' +
        '<section class="section"><h2 class="eyebrow">1 · Elige tu juego</h2><div class="list">' +
          juegos.map(function (g, i) {
            return '<button type="button" class="game" data-j="' + i + '" aria-pressed="' + (i === sel.j) + '"><span class="tag">' + g.tag + '</span><span><strong>' + esc(g.nombre) + '</strong><span>' + esc(g.desc) + '</span></span></button>';
          }).join('') +
        '</div></section>' +
        '<section class="section"><h2 class="eyebrow">2 · Elige el Espacio</h2><div class="pick-row">' +
          esps.map(function (e, i) {
            return '<button type="button" class="chip" style="min-height:44px;font-size:14px" data-e="' + i + '" aria-pressed="' + (i === sel.e) + '">' + esc(e.nombre) + '</button>';
          }).join('') +
        '</div></section>' +
        '<section class="section"><button type="button" class="btn block" id="jugar" disabled>Jugar ' + esc(juegos[sel.j].nombre) + ' · ' + esc(esps[sel.e] ? esps[sel.e].nombre : '') + '</button>' +
        '<p class="note">Los juegos estarán disponibles al habilitar su contenido.</p>' +
        '</section>';
    }
    pintar();
    view.addEventListener('click', function onArc(ev) {
      var b = ev.target.closest('button');
      if (!b) return;
      if (b.hasAttribute('data-j')) { sel.j = +b.getAttribute('data-j'); pintar(); }
      else if (b.hasAttribute('data-e')) { sel.e = +b.getAttribute('data-e'); pintar(); }
      else if (b.id === 'jugar') toast('Los juegos (RIAs) se integran en la siguiente fase');
    });
  };

  V.cupones = function () {
    view.innerHTML='<section class="section"><a class="back" href="#/inicio">'+I.back+'Inicio</a><h1 class="h1">Cupones</h1><p class="lead">Promociones de aliados.</p></section><section class="section"><div class="list">'+
      (DATA.cupones.length?DATA.cupones.filter(vigente).map(function(c){return '<div class="coupon"><div class="value"><b>'+esc(c.descuento)+'</b><small>DESCUENTO</small></div><div class="body"><strong>'+esc(c.aliado)+'</strong><span class="muted">'+esc(c.detalle)+'</span></div></div>';}).join(''):'<p class="muted">No hay promociones disponibles.</p>')+'</div></section>';
  };
  V.mi = function () {
    var tema=STORE.getTheme(),nombre=nombreApp(),insignia=insigniaActual(),logo=DATA.identidad&&DATA.identidad.logo;
    view.innerHTML='<section class="section"><h1 class="h1">Mi app</h1></section>'+
      '<section class="section"><div class="idcard"><div class="top">'+imagenCanal(logo,'identity-channel-logo')+'<div class="identity-channel-text"><small>'+(contexto.modo==='HUB'?'TVD HUB':'TV DIGITAL')+'</small><span class="brand">'+esc(nombre.toUpperCase())+'</span></div></div><div><div class="name">'+(insignia?'<span class="channel-code">'+esc(insignia.codigo)+'</span> <span class="channel-name">'+esc(insignia.nombre)+'</span>':esc(nombre))+'</div><div class="foot"><span>Acceso público</span><span>TV Digital</span></div></div></div></section>'+
      '<section class="section"><a class="link-arrow" href="'+esc(enlaceContexto(contexto.eo))+'" id="compartirApp">Compartir esta app '+I.chev+'</a><a class="link-arrow" href="'+esc(CFG.portalUrl)+'" target="_blank" rel="noopener">Portal TV Digital '+I.chev+'</a></section>'+
      '<section class="section"><h2 class="eyebrow">Apariencia</h2><div class="segmented" id="tema">'+[['auto','Automático'],['light','Claro'],['dark','Oscuro']].map(function(t){return '<button type="button" data-theme="'+t[0]+'" aria-pressed="'+(t[0]===tema)+'">'+t[1]+'</button>';}).join('')+'</div><p class="note">Automático sigue la configuración de tu celular.</p></section>'+
      '<section class="section"><a class="link-arrow" href="#/cupones">Promociones y cupones '+I.chev+'</a><a class="link-arrow" href="#/espacios">Espacios '+I.chev+'</a><a class="link-arrow" href="#/buscar">Buscar '+I.chev+'</a></section>';
    document.getElementById('tema').onclick=function(e){var b=e.target.closest('[data-theme]');if(b){aplicarTema(b.dataset.theme);router();}};
    document.getElementById('compartirApp').onclick=async function(e){
      if(navigator.share){e.preventDefault();try{await navigator.share({title:nombre,url:enlaceContexto(contexto.eo)});}catch(_) {}}
      else if(navigator.clipboard){e.preventDefault();try{await navigator.clipboard.writeText(enlaceContexto(contexto.eo));toast('Enlace copiado');}catch(_){toast('Puedes copiar el enlace desde la barra del navegador');}}
    };
  };

  // ---------------------------------------------------------- router
  var TABS = { revista: 'revista', articulo: 'revista', videoteca: 'videoteca', arcade: 'arcade', mi: 'mi' };

  function router() {
    while (limpieza.length) { try { limpieza.pop()(); } catch (e) {} }
    var nuevo = view.cloneNode(false); // quita escuchas de la pantalla anterior
    view.parentNode.replaceChild(nuevo, view);
    view = nuevo;

    var partes = (location.hash || '#/inicio').replace(/^#\/?/, '').split('/');
    var ruta = partes[0] || 'inicio';
    if (ruta==='ajustes') ruta='mi';
    if (!V[ruta]) ruta = 'inicio';

    if (ruta === 'espacio') V.espacio(partes[1], partes[2]);
    else if (ruta === 'articulo') V.articulo(decodeURIComponent(partes[1] || ''));
    else V[ruta]();

    var activa = TABS[ruta] || 'inicio';
    var links = document.querySelectorAll('.tabbar a');
    for (var i = 0; i < links.length; i++) {
      if (links[i].getAttribute('data-tab') === activa) links[i].setAttribute('aria-current', 'page');
      else links[i].removeAttribute('aria-current');
    }
    pintarIdentidad();
    window.scrollTo(0, 0);
  }

  // ---------------------------------------------------------- catálogo general CH01+ (CH00 opcional por EO)
  function actualizarLeyendaCanales() {
    var el=document.getElementById('canalesEstado');if(!el)return;
    el.textContent=errorCanales || (consultaEnCurso?'Actualizando canales…':'');
    if(errorCanales){var b=document.createElement('button');b.className='pill context-retry';b.type='button';b.textContent='Reintentar';b.onclick=consultarContexto;el.append(' ',b);}
  }
  function aplicarDatos(nuevo) {
    DATA.canales=nuevo.canales;DATA.identidad=nuevo.eo;DATA.directorioEO=nuevo.directorioEO||[];DATA.directorioDisponible=nuevo.directorioDisponible===true;
    var contenido=nuevo.contenido || {};
    ['espacios','programas','cupones'].forEach(function(k){DATA[k]=Array.isArray(contenido[k])?contenido[k]:[];});

  }
  async function consultarContexto() {
    if(consultaEnCurso)return;
    consultaEnCurso=true;actualizarLeyendaCanales();
    var anterior=JSON.stringify(DATA),nuevo;
    try {
      if(contextoError)throw new Error('EO_INVALIDA');
      nuevo=await window.TVD_CANALES.cargar(CFG,contexto);errorCanales='';aplicarDatos(nuevo);
    } catch(error) {
      DATA.canales=[];DATA.espacios=[];DATA.programas=[];DATA.cupones=[];DATA.identidad=null;DATA.directorioEO=[];DATA.directorioDisponible=false;
      errorCanales=contextoError || 'No se pudieron cargar los canales. Vuelve a intentar en un momento.';
      console.warn('TVD · consulta pública',error.message);
    } finally {consultaEnCurso=false;}
    if(anterior!==JSON.stringify(DATA)){router();}else actualizarLeyendaCanales();
  }
  var revistaEnCurso=false;
  async function consultarRevista(){
    if(revistaEnCurso)return;
    revistaEnCurso=true;
    try{var resultado=await window.TVD_REVISTA.cargar(CFG);var anterior=JSON.stringify([DATA.articulos,DATA.revistaError]);DATA.articulos=resultado.articulos;DATA.revistaError=resultado.error;if(anterior!==JSON.stringify([DATA.articulos,DATA.revistaError]))router();}
    finally{revistaEnCurso=false;}
  }
  pintarBotonTema();pintarSesion();
  window.addEventListener('hashchange',router);
  router();consultarContexto();consultarRevista();
  setInterval(function(){consultarContexto();consultarRevista();},CFG.intervaloMs);
  window.addEventListener('online',function(){consultarContexto();consultarRevista();});
  document.addEventListener('visibilitychange',function(){if(!document.hidden){consultarContexto();consultarRevista();}});

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./service-worker.js').catch(function () {});
    });
  }
})();
