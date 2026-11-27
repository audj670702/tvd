/* Instalación pública, sin registro, conservando el diálogo de CFCX. */
(function(){
  'use strict';
  var button=document.getElementById('installApp'),dialog=document.getElementById('installDialog');
  var pending=null,installed=false,manifestUrl=null,nombre='TV Digital';
  var display=matchMedia('(display-mode: standalone)');
  var params=new URLSearchParams(location.search),cuenta=params.get('eo')||params.get('codigoEO')||'HUB';
  var installedKey='tvd.instalada.'+cuenta;
  function recordar(valor){try{if(valor)localStorage.setItem(installedKey,'1');else localStorage.removeItem(installedKey);}catch(_){}}
  try{installed=localStorage.getItem(installedKey)==='1';}catch(_){}

  function refresh(){if(display.matches||navigator.standalone===true){installed=true;recordar(true);}button.hidden=installed||display.matches||navigator.standalone===true;}
  function enlace(){var u=new URL(location.pathname,location.origin),params=new URLSearchParams(location.search),eo=params.get('eo')||params.get('codigoEO');if(eo)u.searchParams.set('eo',eo);u.hash='/inicio';return u.href;}
  function manifest(){
    var base=new URL('.',location.href),m={id:enlace().split('#')[0],name:nombre,short_name:nombre.slice(0,20),start_url:enlace(),scope:base.href,display:'standalone',background_color:'#0E0F13',theme_color:'#0E0F13',lang:'es-MX',icons:[192,512].map(function(n){return {src:new URL('assets/icon-'+n+'.png',base).href,sizes:n+'x'+n,type:'image/png'};})};
    if(manifestUrl)URL.revokeObjectURL(manifestUrl);manifestUrl=URL.createObjectURL(new Blob([JSON.stringify(m)],{type:'application/manifest+json'}));document.querySelector('link[rel=manifest]').href=manifestUrl;
  }
  function guide(){
    document.getElementById('installTitle').textContent='Instalar '+nombre;
    var el=document.getElementById('installInstructions');el.replaceChildren();
    var text=document.createElement('p');text.textContent='Instala esta app para volver directamente a '+nombre+'.';el.append(text);
    var pasos=document.createElement('ol');['iPhone o iPad: abre este enlace en Safari, toca Compartir y Agregar a pantalla de inicio.','Android: abre el menú del navegador y selecciona Instalar app o Agregar a pantalla principal.','Computadora: usa la opción de instalación del navegador.'].forEach(function(t){var li=document.createElement('li');li.textContent=t;pasos.append(li);});el.append(pasos);
  }
  button.onclick=async function(){if(pending){var p=pending;pending=null;button.disabled=true;try{await p.prompt();await p.userChoice;}catch(_){guide();dialog.showModal();}finally{button.disabled=false;refresh();}}else{guide();dialog.showModal();}};
  document.getElementById('closeInstall').onclick=function(){dialog.close();};
  window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();pending=e;installed=false;recordar(false);refresh();});
  window.addEventListener('appinstalled',function(){installed=true;recordar(true);pending=null;refresh();if(dialog.open)dialog.close();});
  window.addEventListener('tvd-identidad',function(e){var nuevo=e.detail.nombre||'TV Digital';if(nombre!==nuevo){nombre=nuevo;manifest();}});
  window.addEventListener('storage',function(e){if(e.key===installedKey){installed=e.newValue==='1';refresh();}});
  if(display.addEventListener)display.addEventListener('change',refresh);
  manifest();refresh();
})();
