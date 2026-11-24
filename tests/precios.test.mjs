import { resetStorage, leer, contarEscrituras } from './helpers/env.mjs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newPriceLogId } from '../core/ids.js';

const MES=new Date().toISOString().slice(0,7).replace('-','');
test('newPriceLogId usa Math.max del mes, no el conteo', ()=>{
  assert.equal(newPriceLogId([]),`PCH-${MES}-001`);
  assert.equal(newPriceLogId([{id:`PCH-${MES}-001`},{id:`PCH-${MES}-005`},{id:'PCH-202001-009'}]),`PCH-${MES}-006`);
});

import { ajustarPrecio, tramosRepetidos, agruparProductosPorLista, validarAjuste, previewAjuste,
  applyPriceAdjustment, pctSugerido, calcSyncStatus, buildPreciosJson, restoreFromPriceLog } from '../modules/price-manager.js';

const LISTAS=[
  {id:'lp-past',nombre:'Pastillas GRP',tramos:[{t:1,p:22785},{t:10,p:22740},{t:50,p:22700},{t:100,p:20000}]},
  {id:'lp-cris',nombre:'Cristales',tramos:[{t:1,p:1000},{t:10,p:950}]},
  {id:'lp-sola',nombre:'Sin productos',tramos:[{t:1,p:500}]},
];
const PRODS=[
  {id:'v-cal',emoji:'💀',nombre:'Calaveras',listaPrecioId:'lp-past',tramos:[],activo:true},
  {id:'v-ted',emoji:'🧸',nombre:'Teddy',listaPrecioId:'lp-past',tramos:[],activo:true},
  {id:'p-cris',emoji:'💎',nombre:'Cristales',listaPrecioId:'lp-cris',tramos:[],activo:true},
  {id:'p-got',emoji:'💧',nombre:'Goteros',listaPrecioId:null,tramos:[{t:1,p:3000}],activo:true},
  {id:'v-gen',emoji:'💊',nombre:'Genéricas',listaPrecioId:'lp-past',tramos:[],activo:false},
];
function seed(extra={}){resetStorage({orders:[],egresos:[],listasPrecios:structuredClone(LISTAS),
  productos:structuredClone(PRODS),priceLog:[],...extra});}

test('ajuste sin redondeo trunca como siempre; con redondeo va al más cercano', ()=>{
  assert.equal(ajustarPrecio(22785,10),25063);
  assert.equal(ajustarPrecio(22785,-10),20506);
  assert.equal(ajustarPrecio(22785,10,100),25100);
  assert.equal(ajustarPrecio(22785,10,500),25000);
  assert.equal(ajustarPrecio(22785,10,1000),25000);
});
test('redondear mantiene los tramos no crecientes y detecta precios repetidos', ()=>{
  seed();
  const [c]=previewAjuste(['lp-past'],10,100);
  assert.deepEqual(c.after.map(t=>t.p),[25100,25000,25000,22000]);
  c.after.forEach((t,i)=>{if(i)assert.ok(t.p<=c.after[i-1].p);});
  assert.deepEqual(tramosRepetidos(c.after),[50]);
  assert.deepEqual(tramosRepetidos(previewAjuste(['lp-past'],10)[0].after),[]);
});
test('validación: precio > 0 (incluye redondeo), al menos una lista, pct ≠ 0', ()=>{
  seed();
  assert.match(validarAjuste([],10),/al menos un producto/);
  assert.match(validarAjuste(['lp-cris'],0),/distinto de cero/);
  assert.match(validarAjuste(['lp-cris'],-100),/a \$0/);
  assert.match(validarAjuste(['lp-sola'],-60,1000),/Sin productos/);
  assert.equal(validarAjuste(['lp-past','lp-cris'],10,100),null);
});
test('agrupación: los que comparten lista van juntos; sin lista aparte; inactivos fuera', ()=>{
  seed();
  const {grupos,sinLista}=agruparProductosPorLista();
  assert.deepEqual(grupos.map(g=>[g.listaId,g.productos.map(p=>p.id)]),[['lp-past',['v-cal','v-ted']],['lp-cris',['p-cris']]]);
  assert.deepEqual(sinLista.map(p=>p.id),['p-got']);
});
test('aplicar: un solo sd() con listas + productos + log (productos, redondeo, scope)', ()=>{
  seed();
  let res;
  const n=contarEscrituras(()=>{res=applyPriceAdjustment({listaIds:['lp-past'],pct:10,redondeo:100,motivo:'m',
    productos:PRODS.slice(0,2)});});
  assert.equal(n,1);
  assert.ok(res.ok);
  const d=leer();
  assert.equal(d.listasPrecios[0].tramos[0].p,25100);
  assert.equal(d.listasPrecios[1].tramos[0].p,1000);
  assert.equal(d.productos.find(p=>p.id==='v-ted').tramos[0].p,25100);
  const e=d.priceLog.at(-1);
  assert.equal(e.tipo,'pct');assert.equal(e.redondeo,100);assert.deepEqual(e.scope,['lp-past']);
  assert.deepEqual(e.productos,[{id:'v-cal',nombre:'Calaveras',emoji:'💀'},{id:'v-ted',nombre:'Teddy',emoji:'🧸'}]);
  assert.equal(applyPriceAdjustment({listaIds:['lp-past','lp-cris','lp-sola'],pct:1}).entry.scope,'all');
  assert.equal(applyPriceAdjustment({listaIds:['lp-cris'],pct:-100}).ok,false);
});
test('% sugerido: entrada más reciente con TC que tocó alguna lista elegida', ()=>{
  seed({priceLog:[
    {id:'PCH-202601-001',ts:'2026-01-10T00:00:00Z',tipo:'pct',tc:1000,cambios:[{listaId:'lp-past'}]},
    {id:'PCH-202602-001',ts:'2026-02-10T00:00:00Z',tipo:'pct',tc:null,cambios:[{listaId:'lp-past'}]},
    {id:'PCH-202603-001',ts:'2026-03-10T00:00:00Z',tipo:'pct',tc:1100,cambios:[{listaId:'lp-cris'}]},
  ]});
  assert.deepEqual(pctSugerido(['lp-past'],1150),{pct:15,tc:1000,ts:'2026-01-10T00:00:00Z'});
  assert.equal(pctSugerido(['lp-past','lp-cris'],1155).pct,5);
  assert.equal(pctSugerido(['lp-sola'],1150),null);
  assert.equal(pctSugerido(['lp-past'],null),null);
});
test('estado de sync: sin payload / igual / distinto', ()=>{
  seed();
  assert.equal(calcSyncStatus(),'unverified');
  const {updated,...payload}=buildPreciosJson();
  seed({priceLog:[{id:'PCH-202601-001',tipo:'sync',cambios:[]}]});
  assert.equal(calcSyncStatus(),'unverified');
  seed({priceLog:[{id:'PCH-202601-001',tipo:'sync',cambios:[]},{id:'PCH-202601-002',tipo:'sync',cambios:[],payload}]});
  assert.equal(calcSyncStatus(),'ok');
  applyPriceAdjustment({listaIds:['lp-cris'],pct:10});
  assert.equal(calcSyncStatus(),'stale');
});
test('restaurar: un solo sd() y vuelve al before', ()=>{
  seed();
  const {entry}=applyPriceAdjustment({listaIds:['lp-cris'],pct:10});
  const n=contarEscrituras(()=>restoreFromPriceLog(entry.id));
  assert.equal(n,1);
  const d=leer();
  assert.deepEqual(d.listasPrecios[1].tramos,LISTAS[1].tramos);
  assert.equal(d.priceLog.at(-1).tipo,'restore');
  assert.equal(d.priceLog.at(-1).restoreFrom,entry.id);
});
