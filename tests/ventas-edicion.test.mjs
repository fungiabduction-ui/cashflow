import { resetStorage, leer, contarEscrituras } from './helpers/env.mjs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generarTicket } from '../modules/ticket.js';
import { buildTicketText, buildAuditText } from '../modules/ventas.js';

// DOM simulado con elementos persistentes por id (el de env.mjs crea uno nuevo en cada llamada)
const reg=new Map();
const mk=v=>({value:v??'',textContent:'',innerHTML:'',style:{},className:'',dataset:{},parentElement:null,
  classList:{add(){},remove(){},toggle(){},contains:()=>false},scrollIntoView(){},
  appendChild(){},remove(){},querySelector:()=>null,querySelectorAll:()=>[]});
document.getElementById=id=>{if(!reg.has(id))reg.set(id,mk());return reg.get(id);};
const PRODS=[
  {id:'v-ted',nombre:'Teddy',emoji:'🧸',unit:'ud',tipo:'tramos',listaPrecioId:'lp-a',costo:300,activo:true,tramos:[]},
  {id:'p-cris',nombre:'Cristales',emoji:'💎',unit:'g',tipo:'tramos',listaPrecioId:'lp-b',costo:1000,activo:true,tramos:[]}];
const LISTAS=[{id:'lp-a',nombre:'A',tramos:[{t:1,p:1000},{t:5,p:900}]},{id:'lp-b',nombre:'B',tramos:[{t:1,p:5000}]}];
const base=(orders,extra={})=>({orders,egresos:[],productos:PRODS,listasPrecios:LISTAS,
  stock:{'v-ted':10,'p-cris':10},lotes:{},stockMovs:[],contactos:[],...extra});

test('generarTicket(): mismo ticket y auditoría de siempre, y costo por línea', ()=>{
  resetStorage(base([]));reg.clear();
  const vals={fecha:'2026-11-20',nota:'sin TACC',cliente:'Ana','q-v-ted':'3','q-p-cris':'2','q-var':'500',
    'ajuste-tipo':'desc-pct','desc-pct':'10'};
  for(const[k,v]of Object.entries(vals))reg.set(k,mk(v));
  generarTicket();
  const o=leer().orders[0];
  assert.equal(o.ticketText,['🧾 Orden de Venta: V-202611-0001','📅 Fecha: 20/11/2026','','🛒 Pedido','',
    '🧸 3 ud × $ 1,000 = $ 3,000','💎 2 g × $ 5,000 = $ 10,000','💲 $ 500','',
    '📉 Descuento 10%: -$ 1,350','━━━━━━━━━━━━━━━━━━━━━','','💰 Total: $ 12,150 ARS',
    '   (subtotal $ 13,500 - ajuste $ 1,350)','📝 Nota: sin TACC | Dto 10%'].join('\n'));
  assert.equal(o.auditText,'--- AUDITORÍA ---\nSubtotal: $ 13,500 | Ajuste: $ -1,350 | Total: $ 12,150 | Pago: ARS | '+
    'Costo: $ 2,900 | Margen: 76.1% | ID: V-202611-0001 | Cliente: Ana');
  assert.deepEqual(o.productos._lineas.map(l=>l.costo),[900,2000]);
  assert.equal(buildTicketText(o),o.ticketText);
  assert.equal(buildAuditText(o),o.auditText);
});

import { moverStockEdicion } from '../modules/inventario.js';
test('moverStockEdicion(): aumento descuenta FIFO + plano; baja devuelve en orden inverso sin pasar qty_inicial', ()=>{
  const d={stock:{'v-ted':10},lotes:{'v-ted':[
    {id:'L2',fecha:'2026-11-01',qty_inicial:10,qty_restante:9},{id:'L1',fecha:'2026-10-01',qty_inicial:5,qty_restante:4}]},stockMovs:[]};
  moverStockEdicion(d,[{key:'v-ted',prodId:'v-ted',varId:null,nombre:'Teddy',emoji:'🧸',delta:-3}],'V-202611-0001');
  assert.equal(d.stock['v-ted'],13);
  assert.deepEqual(d.lotes['v-ted'].map(l=>[l.id,l.qty_restante]),[['L1',5],['L2',10]]);
  assert.deepEqual([d.stockMovs[0].tipo,d.stockMovs[0].delta,d.stockMovs[0].nota],['AJUSTE',3,'Edición V-202611-0001']);
  moverStockEdicion(d,[{key:'v-ted',prodId:'v-ted',varId:null,nombre:'Teddy',emoji:'🧸',delta:7}],'V-202611-0001');
  assert.equal(d.stock['v-ted'],6);
  assert.deepEqual(d.lotes['v-ted'].map(l=>[l.id,l.qty_restante]),[['L1',0],['L2',8]]);
  assert.deepEqual([d.stockMovs[0].tipo,d.stockMovs[0].delta],['VENTA',-7]);
  const vacio={};moverStockEdicion(vacio,[],'V-1');assert.deepEqual(vacio,{});
});

import { openEditVenta, editRecalcTotal, saveEditVenta } from '../modules/ventas.js';
import { normNombre } from '../modules/contactos.js';
import { hoy, d2s } from '../core/formatters.js';

const EMO={'v-ted':'🧸','p-cris':'💎'};
const ln=(prodId,qty,precio,costo)=>({prodId,varId:null,nombre:'',emoji:EMO[prodId]||'',qty,precio,subtotal:qty*precio,...(costo!=null?{costo}:{})});
const AJ0={recargoPct:0,recargoFijo:0,descPct:0,descFijo:0,recargoPctMonto:0,recargoFijoMonto:0,descPctMonto:0,descFijoMonto:0,ajusteNeto:0,libreTotal:0,tipo:'ninguno'};
function orden(id,lineas,{variable=0,ajuste=AJ0,pago=null,...extra}={}){
  const sub=lineas.reduce((a,l)=>a+l.subtotal,0)+variable;
  const total=ajuste.tipo==='libre'?ajuste.libreTotal:sub+ajuste.ajusteNeto;
  const costo=lineas.reduce((a,l)=>a+(l.costo||0),0)||1000;
  const payment=pago||{ars:total,usd:0,usdt:0,tc:0,tc_usd:0,tc_usdt:0,total_ars:total,total_usdt:null,modo:'ARS'};
  return{id,fecha:'2026-11-10',fechaDisplay:'10/11/2026',mesActual:'202611',tipoPago:payment.modo,tc:1,tcUsdt:1,payment,
    nota:null,cliente:null,clienteId:null,productos:{_lineas:lineas,variable},
    totales:{totalGeneral:total,subtotalBruto:sub,ajusteNeto:total-sub,costoTotal:costo,totalUSDT:payment.total_usdt,totalUSD:payment.usd||null,payment},
    costo,margen:parseFloat(((total-costo)/total*100).toFixed(1)),ajuste,ticketText:'(ticket)',auditText:'(audit)',estado:'confirmada',...extra};
}
const O={
  ars:orden('V-202611-0001',[ln('v-ted',3,1000)]),
  desc:orden('V-202611-0002',[ln('p-cris',2,5000,2000)],{ajuste:{...AJ0,descPct:10,descPctMonto:1000,ajusteNeto:-1000,tipo:'desc-pct'}}),
  usd:orden('V-202611-0003',[ln('v-ted',5,22785)],{pago:{ars:0,usd:82.55,usdt:0,tc:1380,tc_usd:1380,tc_usdt:0,total_ars:113919,total_usdt:null,modo:'USD'},tc:1380,tcUsdt:1}),
  usdt:orden('V-202611-0004',[ln('v-ted',5,22786)],{pago:{ars:0,usd:0,usdt:77.61,tc:1468,tc_usd:1420,tc_usdt:1468,total_ars:113931,total_usdt:77.61,modo:'USDT'},tc:1468,tcUsdt:1468}),
  mix:orden('V-202611-0005',[ln('v-ted',3,1000)],{pago:{ars:1600,usd:1,usdt:0,tc:0,tc_usd:1400,tc_usdt:1450,total_ars:3000,total_usdt:2.07,modo:'MIX'},tc:1400,tcUsdt:1450}),
  libre:orden('V-202611-0006',[ln('p-cris',2,5000)],{ajuste:{...AJ0,ajusteNeto:500,libreTotal:10500,tipo:'libre'}}),
  variable:orden('V-202611-0007',[ln('v-ted',3,1000)],{variable:500}),
  comillas:orden('V-202611-0008',[ln('v-ted',1,1000)],{cliente:'Juan "el Tano" <J&J>',clienteId:'CT-202611-0001',nota:'pagó "50%"'}),
  legacy:{id:'V-202601-0001',fecha:'2026-01-05',fechaDisplay:'05/01/2026',mesActual:'202601',tipoPago:'ARS',tc:1250,tcUsdt:1240,
    cliente:'Leo',nota:'',productos:{teddy:2,calaveras:0,totalPastillas:2,precioPastilla:1000,cristales:1,precioCristales:5000},
    totales:{totalGeneral:7000},costo:1500,margen:78.6,ticketText:'viejo',auditText:'viejo'},
};
const CT=[{id:'CT-202611-0001',nombre:'Juan "el Tano" <J&J>',nombreNorm:normNombre('Juan "el Tano" <J&J>'),tel:null,email:null,instagram:null,notas:null,fechaAlta:'2026-11-10T00:00:00.000Z',mergedFrom:[]}];
const unesc=s=>s.replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
// Abre el modal, carga los inputs desde su HTML (como los vería el navegador), aplica cambios y guarda.
function editar(id,cambios={}){
  reg.clear();window._blueARS=1500;window._usdtARS=1520;
  openEditVenta(id);
  for(const tag of reg.get('mBody').innerHTML.match(/<input[^>]*>/g)||[]){
    const k=tag.match(/\bid="([^"]*)"/)?.[1],v=tag.match(/\bvalue="([^"]*)"/)?.[1];if(k)reg.set(k,mk(v!=null?unesc(v):''));}
  const{['edit-total-ars']:totalAMano,...resto}=cambios;
  for(const[k,v]of Object.entries(resto)){assert.ok(reg.has(k),'no existe '+k);reg.get(k).value=String(v);}
  editRecalcTotal();                                   // lo que dispara oninput en el navegador
  if(totalAMano!=null)reg.get('edit-total-ars').value=String(totalAMano);
  return contarEscrituras(()=>saveEditVenta(id));
}
const datos=()=>base(Object.values(O),{contactos:CT,stock:{'v-ted':10,'p-cris':10}});
const ord=id=>leer().orders.find(o=>o.id===id);

test('abrir y guardar sin cambios no toca ninguna orden ni guarda (ARS, USD, USDT, MIX, ajustes, variable, comillas, legacy)', ()=>{
  for(const o of Object.values(O)){
    resetStorage(datos());
    assert.equal(editar(o.id),0,o.id+' guardó');
    assert.deepEqual(ord(o.id),o,o.id);
  }
});
test('cantidad: total con el mismo descuento, costo escala, stock y movimiento, textos nuevos, un solo guardado', ()=>{
  resetStorage(datos());
  assert.equal(editar(O.desc.id,{'edit-qty-0':3}),1);
  const o=ord(O.desc.id);
  assert.equal(o.totales.totalGeneral,13500);assert.equal(o.totales.subtotalBruto,15000);
  assert.equal(o.ajuste.descPctMonto,1500);assert.equal(o.totales.ajusteNeto,-1500);
  assert.equal(o.costo,3000);assert.equal(o.totales.costoTotal,3000);assert.equal(o.margen,77.8);
  assert.equal(o.productos.cristales,3);assert.equal(o.productos.totalCristales,15000);
  assert.deepEqual([o.payment.ars,o.payment.total_ars],[13500,13500]);
  assert.equal(leer().stock['p-cris'],9);
  assert.equal(leer().stockMovs[0].nota,'Edición V-202611-0002');
  assert.ok(o.ticketText.includes('💎 3 g × $ 5,000 = $ 15,000'));
  assert.ok(o.ticketText.includes('📉 Descuento 10%: -$ 1,500'));
  assert.ok(o.auditText.endsWith(`✏ Editada ${d2s(hoy())}: total $ 9,000 → $ 13,500`));
});
test('totalPastillasLinea y variable se conservan; la variable se puede editar', ()=>{
  resetStorage(datos());
  editar(O.variable.id,{'edit-qty-0':4});
  let o=ord(O.variable.id);
  assert.equal(o.totales.totalGeneral,4500);assert.equal(o.productos.variable,500);
  assert.equal(o.productos.totalPastillasLinea,4000);assert.equal(o.totales.totalPastillasLinea,4000);
  editar(O.variable.id,{'edit-var':700});
  o=ord(O.variable.id);
  assert.equal(o.totales.totalGeneral,4700);assert.equal(o.productos.variable,700);
  assert.equal(leer().stock['v-ted'],9);                // la variable no mueve stock
});
test('total escrito a mano queda como ajuste libre', ()=>{
  resetStorage(datos());
  editar(O.ars.id,{'edit-total-ars':2800});
  const o=ord(O.ars.id);
  assert.equal(o.totales.totalGeneral,2800);
  assert.deepEqual([o.ajuste.tipo,o.ajuste.libreTotal,o.ajuste.ajusteNeto],['libre',2800,-200]);
  assert.equal(o.payment.ars,2800);assert.equal(o.margen,64.3);
});
test('USD: cambiar cantidad recalcula el pago con el TC de la orden, sin tocar los TC', ()=>{
  resetStorage(datos());
  editar(O.usd.id,{'edit-qty-0':6});
  const o=ord(O.usd.id);
  assert.equal(o.totales.totalGeneral,136710);
  assert.deepEqual([o.payment.usd,o.payment.tc_usd,o.payment.tc_usdt,o.payment.total_ars],[99.07,1380,0,136717]);
  assert.deepEqual([o.tc,o.tcUsdt,o.totales.totalUSD,o.tipoPago],[1380,1,99.07,'USD']);
});
test('MIX: se edita el desglose y se puede pasar una venta ARS a MIX', ()=>{
  resetStorage(datos());
  editar(O.mix.id,{'edit-mix-ars':200});
  let o=ord(O.mix.id);
  assert.deepEqual([o.tipoPago,o.payment.modo,o.payment.ars,o.payment.usd,o.payment.tc_usd,o.payment.tc_usdt,o.payment.total_ars],['MIX','MIX',200,1,1400,1450,1600]);
  assert.deepEqual([o.tc,o.tcUsdt],[1400,1450]);
  editar(O.ars.id,{'edit-modo':'MIX','edit-mix-ars':1600,'edit-mix-usd':1,'edit-tc-usd':1400});
  o=ord(O.ars.id);
  assert.deepEqual([o.tipoPago,o.payment.ars,o.payment.usd,o.payment.total_ars,o.tc,o.tcUsdt],['MIX',1600,1,3000,1400,1]);
  assert.equal(o.totales.totalGeneral,3000);
});
test('cliente: cambiarlo re-resuelve clienteId; mayúsculas no; comillas intactas', ()=>{
  resetStorage(datos());
  editar(O.comillas.id,{'edit-cliente':'juan "el tano" <j&j>'});
  assert.equal(ord(O.comillas.id).clienteId,'CT-202611-0001');
  editar(O.comillas.id,{'edit-cliente':'María "Mery"'});
  const o=ord(O.comillas.id);
  assert.equal(o.cliente,'María "Mery"');assert.equal(o.clienteId,'CT-202611-0002');
  assert.equal(leer().contactos.find(c=>c.id==='CT-202611-0002').nombre,'María "Mery"');
  assert.equal(o.nota,'pagó "50%"');
});
test('legacy: pasa a _lineas, costo prorrateado, conserva tc viejos', ()=>{
  resetStorage(datos());
  editar(O.legacy.id,{'edit-qty-0':3});
  const o=ord(O.legacy.id);
  assert.deepEqual(o.productos._lineas.map(l=>[l.prodId,l.varId,l.qty,l.subtotal,l.costo]),[['p-past','v-ted',3,3000,643],['p-cris',null,1,5000,1071]]);
  assert.deepEqual([o.totales.totalGeneral,o.productos.teddy,o.productos.totalPastillasLinea,o.costo],[8000,3,3000,1714]);
  assert.deepEqual([o.tc,o.tcUsdt,o.payment.modo],[1250,1240,'ARS']);
  assert.equal(leer().stock['v-ted'],9);
});
test('sacar una línea devuelve su stock; quedarse sin productos no guarda', ()=>{
  resetStorage(datos());
  assert.equal(editar(O.variable.id,{'edit-qty-0':0}),1);
  assert.equal(leer().stock['v-ted'],13);assert.equal(ord(O.variable.id).productos._lineas.length,0);
  assert.equal(editar(O.ars.id,{'edit-qty-0':0}),0);
  assert.deepEqual(ord(O.ars.id),O.ars);
});
