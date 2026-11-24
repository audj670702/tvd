const {JSDOM}=require('jsdom');
const fs=require('fs'),assert=require('assert/strict'),path=require('path');
const root=path.join(__dirname,'..');
async function abrir(eo,fallo=false){
 const dom=new JSDOM(fs.readFileSync(root+'/index.html','utf8'),{url:'https://tvd.scad.mx/'+(eo?'?eo='+eo:''),runScripts:'outside-only',pretendToBeVisual:true});const w=dom.window;
 w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});w.scrollTo=()=>{};
 w.URL.createObjectURL=()=> 'blob:https://tvd.scad.mx/test';w.URL.revokeObjectURL=()=>{};
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};
 w.HTMLMediaElement.prototype.play=()=>Promise.resolve();w.HTMLMediaElement.prototype.pause=function(){};w.HTMLMediaElement.prototype.load=function(){};w.HTMLMediaElement.prototype.canPlayType=()=> 'probably';
 w.fetch=async url=>({ok:true,json:async()=>fallo?{ok:true,canales:[]}:{ok:true,ahora:new Date().toISOString(),contexto:eo?{app:'TVD',codigoEO:eo,codigoContexto:eo+'-TVD-DEMO'}:{app:'TVD',tipo:'HUB'},eo:eo?{nombre:'Empresa de prueba',logo:''}:undefined,directorioEO:eo?undefined:[{codigoEO:'EO013',nombre:'Empresa Uno',canalInsignia:{codigo:'CH01',nombre:'Insignia Uno'}},{codigoEO:'EO015',nombre:'De Tocho Morocho',canalInsignia:{codigo:'CH07',nombre:'De Tocho Morocho'}}],canales:[{codigo:'CH01',tipo:'VPS',senal:'https://signal.test/live.m3u8',nombre:'Canal Uno'},{codigo:'CH07',tipo:'VPS',senal:'https://signal.test/dos.m3u8',nombre:'Canal Siete',esInsigniaEO:!!eo}]}});
 let errores=[];w.addEventListener('error',e=>errores.push(e.error));w.console.warn=()=>{};
 for(const name of ['config','contexto','store','canales','monitor','install','app'])w.eval(fs.readFileSync(root+'/js/'+name+'.js','utf8'));
 await new Promise(r=>setTimeout(r,30));assert.equal(errores.length,0,String(errores));return dom;
}
(async()=>{
 for(const eo of ['', 'EO013']){
  const dom=await abrir(eo),w=dom.window,d=w.document;
  assert.equal(d.querySelectorAll('.tabbar a').length,5);assert(d.querySelector('.revista-home'));assert(d.querySelector('#monitor .tv-screen'));assert.equal(d.querySelector('#codigoEO'),null);assert.equal(d.querySelector('#login'),null);
  if(!eo){
   d.querySelector('#abrirCanalesEO').click();assert.equal(d.querySelector('#canalesEO').hidden,false);assert.equal(d.querySelector('#abrirCanalesEO').textContent,'Canales insignia');assert.equal(d.querySelector('dialog#canalesEO'),null);assert.equal(d.querySelector('#abrirCanalesEO').getAttribute('aria-expanded'),'true');assert.equal(d.querySelector('#listaCanalesEO .title').textContent,'CH01 Insignia Uno');assert.equal(d.querySelectorAll('#listaCanalesEO .row').length,2);
   d.querySelector('#buscarCanalEO').value='Tocho';d.querySelector('#buscarCanalEO').dispatchEvent(new w.Event('input'));assert.equal(d.querySelectorAll('#listaCanalesEO .row').length,1);
   const enlace=d.querySelector('#listaCanalesEO .row');assert.equal(enlace.tagName,'A');assert.equal(new URL(enlace.href).searchParams.get('eo'),'EO015');assert.equal(w.location.search,'');assert(d.querySelector('[data-role=osd]').textContent.includes('01'));d.querySelector('#limpiarCanalEO').click();assert.equal(d.querySelectorAll('#listaCanalesEO .row').length,2);d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape'}));assert(d.querySelector('#canalesEO').hidden);d.querySelector('#abrirCanalesEO').click();d.body.click();assert(d.querySelector('#canalesEO').hidden);
  }else{
   assert(d.querySelector('.wordmark').textContent.includes('EMPRESA DE PRUEBA'));
   assert(d.querySelector('[data-role=osd]').textContent.includes('07'));
   assert.equal(new URL(d.querySelector('.context-direction a').href).search,'');
  }
  for(const route of ['revista','videoteca','arcade','mi']){w.location.hash='/'+route;await new Promise(r=>setTimeout(r,20));assert(d.querySelector('#view .h1'));assert.equal(d.querySelector('#login'),null);}
  d.querySelector('[data-theme=light]').click();assert.equal(d.documentElement.getAttribute('data-theme'),'light');dom.window.close();
 }
 const dom=await abrir('',true);assert(dom.window.document.querySelector('.revista-home'));assert(dom.window.document.querySelector('#canalesEstado').textContent.includes('No se pudieron cargar'));assert.equal(dom.window.document.querySelector('#codigoEO'),null);dom.window.close();
 assert.equal(require('node:crypto').createHash('sha256').update(fs.readFileSync(root+'/css/app.css')).digest('hex'),'1d7d54374087799de44a1c7631233ad3926ec47394e708c712f119fccab13634');
 console.log('PASS: base CSS CFCX exacta; cabecera, monitor y revista; cinco pestañas; modo HUB/EO sin login/código; directorio filtra EO y enlaza su app sin sintonizar en HUB; EO inicia en insignia; enlace EO→HUB; rutas, tema y estados de error.');
})().catch(e=>{console.error(e);process.exit(1)});
