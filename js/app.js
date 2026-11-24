/* TV Digital · App pública EO v0.1.0. Monitor original CFCX sin cambios. */
(function () {
  'use strict';
  var CFG=window.TVD_CONFIG,STORE=window.CFCX_STORE,view=document.getElementById('view');
  var contexto,datos=null,monitor=null,error='',consultando=false,instalacion=null,manifestUrl=null;
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function aplicarTema(){var t=STORE.getTheme();if(t==='auto')document.documentElement.removeAttribute('data-theme');else document.documentElement.setAttribute('data-theme',t);}
  aplicarTema();
  document.getElementById('tema').onclick=function(){var oscuro=document.documentElement.getAttribute('data-theme')==='dark'||(STORE.getTheme()==='auto'&&matchMedia('(prefers-color-scheme: dark)').matches);STORE.setTheme(oscuro?'light':'dark');aplicarTema();};
  function ruta(){return (location.hash||'#/inicio').split('/')[1]||'inicio';}
  function destruir(){if(monitor){monitor.destroy();monitor=null;}}
  function estado(){
    var el=document.getElementById('estadoCanales');if(!el)return;
    el.className='eo-status'+(error?' error':'');
    el.textContent=consultando?'Actualizando canales…':error||(!datos?'Cargando canales…':datos.canales.length?'Catálogo actualizado.':'No hay canales disponibles para esta empresa.');
    var b=document.getElementById('actualizar');if(b)b.disabled=consultando;
  }
  function formulario(){
    view.innerHTML='<section class="section"><h1 class="h1">TV Digital</h1><p class="lead">Abre el enlace de tu empresa o escribe su código.</p><form class="eo-form" id="empresa"><label for="codigoEO">Código de empresa</label><input id="codigoEO" name="eo" placeholder="EO013" required pattern="EO[0-9]{3,}(-TVD-[A-Za-z0-9_-]+)?" autocomplete="off"><button class="btn" type="submit">Abrir app</button></form><p class="eo-status error" role="status">'+esc(error)+'</p></section>';
    document.getElementById('empresa').onsubmit=function(e){e.preventDefault();var url=new URL(location.href);url.search='';url.searchParams.set('eo',document.getElementById('codigoEO').value.trim());url.hash='/inicio';location.assign(url.href);};
  }
  function render(){
    destruir();
    document.querySelectorAll('[data-tab]').forEach(function(a){if(a.dataset.tab===ruta())a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    if(!contexto||!contexto.eo){formulario();return;}
    if(ruta()==='ajustes'){
      var nombre=datos?datos.eo.nombre:'TV Digital';
      view.innerHTML='<section class="section"><h1 class="h1">Mi app</h1><div class="box"><h2>'+esc(nombre)+'</h2><p>Empresa: '+esc(contexto.eo)+'</p><p>Acceso público a los canales propios y compartidos autorizados.</p><p class="eo-link"><a id="enlaceEmpresa" class="link-arrow">Enlace de esta empresa</a></p><a href="'+esc(location.pathname)+'" class="btn ghost">Abrir otra empresa</a></div></section><section class="section"><h2 class="h2">Apariencia</h2><div class="segmented" id="apariencia"><button data-tema="auto">Automático</button><button data-tema="light">Claro</button><button data-tema="dark">Oscuro</button></div></section>';
      document.getElementById('enlaceEmpresa').href=enlaceEO();
      document.querySelectorAll('[data-tema]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.tema===STORE.getTheme()));b.onclick=function(){STORE.setTheme(b.dataset.tema);aplicarTema();render();};});
      return;
    }
    view.innerHTML='<section class="section"><div class="eo-intro"><div><p class="eyebrow">TV DIGITAL</p><h1 id="tituloEO">'+esc(datos?datos.eo.nombre:'Canales de tu empresa')+'</h1></div><button class="pill" id="actualizar">Actualizar</button></div><div id="monitor"></div><p id="estadoCanales" class="eo-status" role="status"></p></section><section class="section"><h2 class="h2">Canales disponibles</h2><ul class="eo-canal-lista" id="listaCanales"></ul></section>';
    monitor=new window.CFCXMonitor(document.getElementById('monitor'),{canales:datos?datos.canales:[],mostrarCanales:true});
    document.getElementById('actualizar').onclick=consultar;lista();estado();
  }
  function lista(){var el=document.getElementById('listaCanales');if(el)el.innerHTML=datos&&datos.canales.length?datos.canales.map(function(c){return '<li><span><strong>'+esc(c.codigo)+'</strong> · '+esc(c.nombre)+'</span><span class="eo-relacion">'+(c.relacion==='COMPARTIDO'?'Compartido':'Propio')+'</span></li>';}).join(''):'<li class="muted">Sin canales disponibles.</li>';}
  function enlaceEO(){var u=new URL(location.pathname,location.origin);u.searchParams.set('eo',contexto.eo);u.hash='/inicio';return u.href;}
  function identidad(){
    var nombre=datos?datos.eo.nombre:'TV Digital';document.title=nombre+' · TV Digital';
    var marca=document.getElementById('nombreApp');marca.textContent=nombre;
    if(datos&&/^https:\/\//i.test(datos.eo.logo||'')){var img=document.createElement('img');img.src=datos.eo.logo;img.alt='';img.className='eo-logo';marca.prepend(img);}
    document.getElementById('identidadFooter').textContent=nombre+' · TV Digital';
    if(contexto&&contexto.eo){
      var base=new URL('.',location.href),icons=[192,512].map(function(n){return {src:new URL('assets/icon-'+n+'.png',base).href,sizes:n+'x'+n,type:'image/png'};});
      var m={id:enlaceEO().split('#')[0],name:nombre,short_name:nombre.slice(0,20),start_url:enlaceEO(),scope:base.href,display:'standalone',background_color:'#0E0F13',theme_color:'#0E0F13',lang:'es-MX',icons:icons};
      if(manifestUrl)URL.revokeObjectURL(manifestUrl);manifestUrl=URL.createObjectURL(new Blob([JSON.stringify(m)],{type:'application/manifest+json'}));document.querySelector('link[rel=manifest]').href=manifestUrl;
    }
  }
  async function consultar(){
    if(consultando||!contexto||!contexto.eo)return;consultando=true;estado();
    try{
      var nuevo=await window.TVD_CANALES.cargar(CFG,contexto);datos=nuevo;error='';identidad();
      if(monitor){monitor.actualizarCanales(datos.canales);document.getElementById('tituloEO').textContent=datos.eo.nombre;lista();}
      else render();
    }catch(e){
      console.warn('TVD · catálogo EO',e.message);datos=null;
      error=e.message==='CONTEXTO_NO_CONFIRMADO'?'El servicio aún no confirma el catálogo de esta empresa.':e.message==='HTTP_404'?'La empresa no está disponible.':'No se pudieron cargar los canales de esta empresa. Comprueba la conexión y vuelve a intentar.';
      identidad();if(monitor){monitor.actualizarCanales([]);lista();}else render();
    }finally{consultando=false;estado();}
  }
  window.addEventListener('hashchange',render);
  window.addEventListener('online',consultar);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)consultar();});
  window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();instalacion=e;});
  var boton=document.getElementById('instalar');boton.hidden=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  boton.onclick=async function(){if(instalacion){var p=instalacion;instalacion=null;await p.prompt();await p.userChoice;}else{document.getElementById('guiaInstalacion').textContent='Conserva el enlace de tu empresa al instalar: '+(contexto&&contexto.eo?enlaceEO():location.href);document.getElementById('instalacion').showModal();}};
  document.getElementById('cerrarInstalacion').onclick=function(){document.getElementById('instalacion').close();};
  window.addEventListener('appinstalled',function(){boton.hidden=true;instalacion=null;});
  try{contexto=window.TVD_CONTEXTO.resolver(location.search,CFG);}catch(e){error='El código de empresa no es válido.';}
  render();consultar();setInterval(consultar,CFG.intervaloMs);
  if('serviceWorker' in navigator)navigator.serviceWorker.register('./service-worker.js').catch(function(e){console.warn('TVD · instalación',e.message);});
})();
