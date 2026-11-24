import { resetStorage, leer } from './helpers/env.mjs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sO, confirmarOrden } from '../modules/ventas.js';
import { sE } from '../modules/egresos.js';
import { applyPriceAdjustment } from '../modules/price-manager.js';

function conSetItemRoto(fn){
  const orig=localStorage.setItem;
  localStorage.setItem=(k,v)=>{if(k==='motoredge_v4'){const e=new Error('lleno');e.name='QuotaExceededError';throw e;}orig(k,v);};
  try{return fn();}finally{localStorage.setItem=orig;}
}
test('sO() y sE() devuelven el resultado del guardado', ()=>{
  resetStorage({orders:[],egresos:[]});
  assert.equal(sO({id:'V-202611-0001',estado:'pendiente'}),true);
  assert.equal(sE({id:'E-202611-0001'}),true);
  assert.equal(conSetItemRoto(()=>sO({id:'V-202611-0002'})),false);
  assert.equal(conSetItemRoto(()=>sE({id:'E-202611-0002'})),false);
  assert.deepEqual(leer().orders.map(o=>o.id),['V-202611-0001']);
});
test('confirmarOrden() devuelve false y no informa éxito si no se guardó', ()=>{
  resetStorage({orders:[{id:'V-202611-0001',estado:'pendiente'}],egresos:[]});
  assert.equal(conSetItemRoto(()=>confirmarOrden('V-202611-0001')),false);
  assert.equal(leer().orders[0].estado,'pendiente');
});
import { registrarIngreso } from '../modules/inventario.js';
test('registrarIngreso(): si no se guardó el ingreso, no queda un lote suelto ni movimiento', ()=>{
  resetStorage({orders:[],egresos:[],lotes:{},ingresos:[],stockMovs:[]});
  const vals={'ing-prod':'v-cal','ing-fecha':'2026-11-24','ing-qty':'10','ing-costo':'500','ing-prov':'','ing-nota':''};
  const orig=document.getElementById,origSet=localStorage.setItem;
  document.getElementById=id=>({...orig(id),value:vals[id]??''});
  // Falla solo la escritura que lleva el ingreso: con dos escrituras separadas quedaba el lote sin su ingreso
  localStorage.setItem=(k,v)=>{if(k==='motoredge_v4'&&v.includes('"ingresos":[{')){const e=new Error('lleno');e.name='QuotaExceededError';throw e;}origSet(k,v);};
  try{registrarIngreso();}finally{document.getElementById=orig;localStorage.setItem=origSet;}
  const d=leer();
  assert.deepEqual([d.lotes,d.ingresos,d.stockMovs],[{},[],[]]);
});
test('applyPriceAdjustment() → ok:false y sin entrada de log si no se guardó', ()=>{
  resetStorage({orders:[],egresos:[],priceLog:[],
    listasPrecios:[{id:'lp-a',nombre:'A',tramos:[{t:1,p:1000}]}],
    productos:[{id:'v-cal',nombre:'Calaveras',emoji:'💀',listaPrecioId:'lp-a',tramos:[],activo:true}]});
  const res=conSetItemRoto(()=>applyPriceAdjustment({listaIds:['lp-a'],pct:10}));
  assert.equal(res.ok,false);
  assert.equal(leer().priceLog.length,0);
  assert.equal(leer().listasPrecios[0].tramos[0].p,1000);
});
