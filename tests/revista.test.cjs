const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../js/revista.js'),'utf8');
function cargar(fetch){const c=vm.createContext({window:{},fetch,AbortController,setTimeout,clearTimeout});vm.runInContext(source,c);return c.window.TVD_REVISTA;}
const cfg={revistaApiUrl:'https://www.scad.mx/_functions/cfcxRevista',revistaInicialUrl:'./data/revista-inicial.json',timeoutMs:100};
test('misma fuente editorial sin EO; ordena publicaciones y conserva portada, audio y blog',async()=>{
 let urls=[];const a={id:'a',titulo:'A',fecha:'2026-11-01',portadaDisenada:'https://img.test/a.png',audioUrl:'https://audio.test/a.mp3',publicacionUrl:'https://www.scad.mx/post/a'};
 const api=cargar(async url=>{urls.push(url);return {ok:true,json:async()=>({articulos:[a,{id:'b',fecha:'2026-11-02'}]})};});
 const r=await api.cargar(cfg);assert.deepEqual(urls,[cfg.revistaApiUrl]);assert.equal(r.articulos[0].id,'b');assert.equal(r.articulos[1].audioUrl,a.audioUrl);assert.equal(r.articulos[1].portadaDisenada,a.portadaDisenada);assert.equal(r.articulos[1].publicacionUrl,a.publicacionUrl);
});
test('catálogo vacío oficial prevalece sobre el respaldo',async()=>{
 let calls=0;const r=await cargar(async()=>{calls++;return {ok:true,json:async()=>({articulos:[]})};}).cargar(cfg);assert.equal(calls,1);assert.equal(r.articulos.length,0);assert.equal(r.error,false);
});
test('respaldo CFCX solo ante fallo de fuente o formato',async()=>{
 let urls=[];const r=await cargar(async url=>{urls.push(url);return {ok:true,json:async()=>url===cfg.revistaApiUrl?{invalido:true}:{articulos:[{id:'respaldo'}]}};}).cargar(cfg);assert.equal(urls.length,2);assert.equal(r.respaldo,true);assert.equal(r.articulos[0].id,'respaldo');
});
test('fallo de fuente y respaldo produce estado de error',async()=>{
 const r=await cargar(async()=>{throw new Error('offline');}).cargar(cfg);assert.equal(r.error,true);assert.equal(r.articulos.length,0);
});
