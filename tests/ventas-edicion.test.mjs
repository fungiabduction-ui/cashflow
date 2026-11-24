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
