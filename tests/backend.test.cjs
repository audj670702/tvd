const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
function backend(){
 const data={SCaD_EO:[{codigoEO:'EO001',codigoContexto:'EO001-TVD-A',app:'TVD',activo:true,nombre:'Empresa A',admPrincipal:'privado',codigoAcceso:'privado'},{codigoEO:'EO002',codigoContexto:'EO002-TVD-B',app:'TVD',activo:true,nombre:'Empresa B'},{codigoEO:'EO003',codigoContexto:'EO003-RESID-C',app:'RESID',activo:true},{codigoEO:'EO004',codigoContexto:'EO004-TVD-D',app:'TVD',activo:false}],TVD_Canales:[{codigo:'CH01',activo:true,tipo:'VPS',rutaHls:'https://signal.test/live.m3u8',enteOperador:'EO001-TVD-A',publicarHub:false,tokenVps:'secreto'},{codigo:'CH07',activo:true,tipo:'VIRTUAL',enteOperador:'EO002-TVD-B',eoCompartidas:['EO001-TVD-A'],publicarHub:true,playlistYoutube:'PL123456789'},{codigo:'CH08',activo:true,tipo:'VIRTUAL',enteOperador:'EO002-TVD-B',publicarHub:false},{codigo:'CH09',activo:false,tipo:'VIRTUAL',enteOperador:'EO001-TVD-A',publicarHub:true}],QTD_PlaylistElementos:[]};
 const wixData={query(col){let filters=[];const q={eq:(k,v)=>(filters.push(x=>x[k]===v),q),hasSome:(k,v)=>(filters.push(x=>v.includes(x[k])),q),ascending:()=>q,limit:()=>q,async find(){return {items:(data[col]||[]).filter(x=>filters.every(f=>f(x))),hasNext:()=>false}}};return q}};
 const ctx={wixData,console,Date,Map,Set};vm.createContext(ctx);
 const s=fs.readFileSync(root+'/wix/tvdNucleo_v2.2.0.txt','utf8').replace(/import wixData from 'wix-data';/,'').replace(/export /g,'');
 vm.runInContext(s+';globalThis.api={listarCanalesPublicos,resolverEOAppPublica};',ctx);
 return ctx.api;
}
test('EO recibe canales propios y compartidos; no ajenos ni inactivos',async()=>{const api=backend(),r=await api.listarCanalesPublicos({codigoContexto:'EO001-TVD-A'});assert.deepEqual(Array.from(r,x=>x.codigo),['CH01','CH07']);assert.equal(r[1].relacion,'COMPARTIDO');assert(!JSON.stringify(r).includes('secreto'));});
test('HUB respeta autorización independiente; legado mantiene catálogo activo',async()=>{const api=backend();assert.deepEqual(Array.from(await api.listarCanalesPublicos({hub:true}),x=>x.codigo),['CH07']);assert.equal((await api.listarCanalesPublicos()).length,3);});
test('identidad excluye datos privados y rechaza EO ajena o inactiva',async()=>{const api=backend(),r=await api.resolverEOAppPublica('EO001');assert.equal(r.eo.nombre,'Empresa A');assert(!JSON.stringify(r).includes('privado'));await assert.rejects(()=>api.resolverEOAppPublica('EO003'),/EO_NO_DISPONIBLE/);await assert.rejects(()=>api.resolverEOAppPublica('EO004'),/EO_NO_DISPONIBLE/);await assert.rejects(()=>api.resolverEOAppPublica('../'),/EO_INVALIDA/);});
test('HTTP rechaza contexto ambiguo o vacío, y conserva consulta CFCX sin parámetros',async()=>{
 const api=backend(),ctx={console,Date,ok:x=>({status:200,...x}),serverError:x=>({status:500,...x}),listarCanalesPublicos:api.listarCanalesPublicos,resolverEOAppPublica:api.resolverEOAppPublica};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync(root+'/wix/tvdPublico_v2.3.0.txt','utf8').replace(/import .*?from '[^']+';/g,'').replace(/export /g,'')+';globalThis.handler=get_tvdCanales;',ctx);
 const log=ctx.console;ctx.console={error(){}};
 for(const query of [{codigoEO:''},{app:'TVD'},{hub:'1',codigoEO:'EO001'},{app:'RESID',codigoEO:'EO001'},{hub:'0'}])assert.equal((await ctx.handler({query})).body.ok,false);
 const legacy=await ctx.handler({query:{}});assert.equal(legacy.body.canales.length,3);
 const scoped=await ctx.handler({query:{codigoEO:'EO001',app:'TVD'}});assert.equal(scoped.body.contexto.codigoEO,'EO001');assert.equal(scoped.body.canales.length,2);
 const hub=await ctx.handler({query:{hub:'1'}});assert.equal(hub.body.canales.length,1);
});
