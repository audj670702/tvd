/* REVISTA compartida: mismo servicio público y respaldo editorial de CFCX. */
(function(){
  'use strict';
  function validar(datos){
    if(!datos||!Array.isArray(datos.articulos))throw new Error('REVISTA_FORMATO');
    return {articulos:datos.articulos.slice().sort(function(a,b){return (Date.parse(b.fecha||b.fechaPublicacion)||0)-(Date.parse(a.fecha||a.fechaPublicacion)||0);}),error:false};
  }
  async function leer(url,timeout){
    var controller=new AbortController(),timer=setTimeout(function(){controller.abort();},timeout||15000);
    try{var r=await fetch(url,{cache:'no-cache',signal:controller.signal});if(!r.ok)throw new Error('REVISTA_HTTP');return validar(await r.json());}
    finally{clearTimeout(timer);}
  }
  async function cargar(cfg){
    try{return await leer(cfg.revistaApiUrl,cfg.timeoutMs);}
    catch(error){
      if(cfg.revistaInicialUrl){try{var respaldo=await leer(cfg.revistaInicialUrl,cfg.timeoutMs);respaldo.respaldo=true;return respaldo;}catch(_) {}}
      return {articulos:[],error:true};
    }
  }
  window.TVD_REVISTA={cargar:cargar,validar:validar};
})();
