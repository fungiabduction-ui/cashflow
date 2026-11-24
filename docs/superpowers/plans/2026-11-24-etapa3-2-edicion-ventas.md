# Etapa 3.2 — Edición de ventas — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
> Preferencia del usuario: ejecución **inline**, sin pedir aprobación del plan. Push solo con su OK.

**Goal:** Editar una venta guardada sin corromperla: abrir y guardar sin cambios no toca nada; los cambios recalculan total
(con el ajuste original), costo, margen, pago, stock, cliente y textos, en un solo `sd()`.

**Architecture:** Se reescribe el bloque de edición de `modules/ventas.js` (`openEditVenta` … `saveEditVenta`). El modal
guarda su estado en `window._editVenta`; `saveEditVenta()` trabaja sobre una copia profunda de la orden y solo toca los
campos que cambiaron; si la copia queda igual, no guarda. El texto del ticket y de auditoría sale de
`buildTicketText(o)`/`buildAuditText(o)` (nuevas, en `ventas.js`), que también usa `generarTicket()`. El stock se mueve
con `moverStockEdicion(d,deltas,id)` (nueva, en `modules/inventario.js`) sobre el mismo `d` que se guarda.

**Tech Stack:** JS vanilla (ES modules), `node --test` (Node 24, sin npm), harness `tests/helpers/env.mjs`, Chrome headless
por CDP para la prueba en navegador.

---

## Reproducción (Tarea 1 del handoff) — hecha el 2026-11-24

Script en el scratchpad (`repro.mjs`/`repro2.mjs`, no versionado: lee datos reales): carga una **copia** de
`MOTOREDGE-ARCHIVO/backup_2026-08-13_1626.json` en el `localStorage` en memoria del harness, abre el modal de cada venta
con un DOM simulado (lee los `value` del HTML del modal) y guarda sin tocar nada.

| # | Resultado | Evidencia |
|---|---|---|
| a | **Confirmado** | 173 de 173 ventas cambian al guardar sin tocar nada (`_lineas` 139, `totalPastillasLinea` 71, `tcUsdt` 36, `payment` agregado en 15, `totalGeneral` y `margen` en las 10 con ajuste). |
| b | **Confirmado** | Total escrito a mano 169.000 → se guarda 170.000 (gana Σ qty×precio). |
| c | **Confirmado** | USD `V-202604-0053`: `tcUsdt` 1 → 1380 y `payment.tc_usdt` 0 → 1380 (se copia el TC USD); `total_ars` cambia; las 15 sin `payment` reciben uno. |
| d | **Confirmado** | MIX sintética (`ars 100000 + usd 50 + usdt 20`): queda `tipoPago:'MIX'` con `payment.modo:'ARS'`, usd/usdt en 0. |
| e | **Confirmado** | qty +1: `costo` 10150 → 10150, margen recalculado con el costo viejo; USD: `payment.usd` cambia pero `totales.totalUSD` no. |
| f | **Confirmado** | `totalPastillasLinea` queda en 0 en 71 ventas modernas. |
| g | **Confirmado** | Cliente `Juan "el Tano"` → `Juan`; nota `pagó "50%"` → `pagó`. |
| h | **Confirmado** | Cambiar el cliente deja el `clienteId` anterior. |
| i | **Confirmado** | Cambiar cantidades no agrega movimientos ni toca `stock`/`lotes` (269 → 269 movimientos). |
| j | **Confirmado** | Tras cambiar cantidades, `ticketText` y `auditText` quedan iguales a los viejos. |
| k | **Nuevo** | En ventas modernas, `productos.variable` no aparece en el modal: al guardar se pierde del total y queda en 0. |

Notas de los datos: no hay órdenes legacy sin `_lineas` ni órdenes MIX en ese backup (se prueban con datos sintéticos);
24 líneas usan `prodId:'p-past'` + `varId`; 48 órdenes sin `estado`; ninguna línea tiene `costo` todavía.

## Decisiones de diseño (dentro del spec)

- **Sin cambios ⇒ sin guardar:** se compara la copia editada con la original; si es igual, «Sin cambios» y no hay `sd()`.
  Los textos (`ticketText`/`auditText`) solo se regeneran si algo cambió.
- **Líneas del modal** con índice (`edit-qty-0`, `edit-prc-0`…), no con el id del producto. «Variable» es un campo aparte
  (`edit-var`), para órdenes modernas y legacy (corrige k). Líneas `__var` que dejó la edición vieja de órdenes legacy no
  se muestran (su monto ya está en `productos.variable`) y desaparecen si se reescriben las líneas.
- **Total:** si no cambió ninguna línea ni la variable, queda el total guardado. Si cambió: `ajuste` con `tipo:'libre'`
  → `libreTotal`; con otro `ajuste` → mismos campos que `calc()` (`%` sobre el subtotal nuevo + fijos); sin `ajuste`
  (órdenes viejas) → se conserva la diferencia original total − subtotal. Los inputs de cantidad, precio y variable
  recalculan el campo «Total ARS» al escribir (`oninput`). Si al guardar ese campo difiere del calculado, el usuario lo
  escribió a mano → `ajuste` libre.
- **Pago:** se reescribe `payment` solo si cambia el modo, un TC visible en ese modo, el desglose MIX, o el total (en
  ARS/USD/USDT; en MIX el desglose lo decide el usuario). `tc`/`tcUsdt` de la orden solo cambian si cambia el modo o un TC
  (fórmula de `generarTicket()`). Los inputs de TC se llenan con el TC de la orden; el del día solo como `placeholder`.
- **Costo:** `generarTicket()` guarda `costo` por línea. Al editar, el costo de cada línea es el guardado o, si no
  tiene, `o.costo` prorrateado por subtotal; escala con la cantidad (redondeado a peso). Sin cambios de cantidad,
  `o.costo` no se toca.
- **Stock:** `moverStockEdicion(d,deltas,id)` aplica en memoria el delta por producto (`varId||prodId`). Aumento →
  mismo descuento que `descontarStockPorTicket()` (FIFO en lotes, plano con `Math.max(0,…)`, grupo `grp-`), movimiento
  `VENTA` «Edición V-…». Disminución → plano + lotes en orden inverso al FIFO sin superar `qty_inicial`, movimiento
  `AJUSTE` «Edición V-…». No se llama a `descontarStockPorTicket()` porque guarda por su cuenta varias veces y el spec
  pide un solo `sd()`; `consumirStock()` no se toca (invariante #6).
- **Cliente:** si cambia según `normNombre`, `clienteId = autoRegistrarContacto(nombre, fecha)` antes de leer `d`
  (guarda el contacto por su cuenta, igual que en `generarTicket()`; leer `d` después evita pisar el contacto nuevo).
- **Auditoría:** `buildAuditText(o)` + las líneas `✏ Editada …` anteriores + `✏ Editada dd/mm/aaaa: total X → Y`.
- Venta sin productos ni variable → error, no guarda.

## Archivos

- Modify: `modules/ventas.js` — imports; reemplazo de `openEditVenta` … `saveEditVenta` (líneas 174–383); nuevas
  `buildTicketText`, `buildAuditText` (+ privadas `escV`, `lineasDeOrden`, `leerEdicion`, `pagoEdicion`).
- Modify: `modules/ticket.js` — `calc()` agrega `costo` por línea; `generarTicket()` guarda `costo` en `_lineas` y usa
  `buildTicketText`/`buildAuditText`.
- Modify: `modules/inventario.js` — nueva `moverStockEdicion(d,deltas,ventaId)` debajo de `descontarStockPorTicket`.
- Create: `tests/ventas-edicion.test.mjs`.
- Modify: `CLAUDE.md` (Tarea 5). `main.js` no cambia (las funciones expuestas mantienen sus nombres).

---

### Task 1: Ticket con costo por línea y texto compartido

**Files:** Create `tests/ventas-edicion.test.mjs`; Modify `modules/ticket.js`, `modules/ventas.js`

- [ ] **Step 1: Test de caracterización + costo por línea**

```js
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
```

- [ ] **Step 2: Correr y ver que falla** — `node --test tests/ventas-edicion.test.mjs` → FAIL (`buildTicketText` no
  existe / `costo` undefined).

- [ ] **Step 3: `calc()` y `_lineas` con costo** (`modules/ticket.js`)

En `calc()`, el `lineas.push` de líneas con precio agrega `costo:q*(prod.costo||0)`:
```js
        lineas.push({emoji:prod.emoji,nombre:prod.nombre,qty:q,unit:prod.unit,precio,tramo,subtotal,costo:q*(prod.costo||0),prodId:prod.id,legacyKey:prod.legacyKey,qGrupo:gruposVol[prod.listaPrecioId]||q});
```
En `generarTicket()`, `_lineas` agrega `costo:l.costo`:
```js
    _lineas:lineas.map(l=>({prodId:l.prodId,varId:l.varId||null,nombre:l.nombre||'',emoji:l.emoji||'',qty:l.qty,precio:l.precio,subtotal:l.subtotal,costo:l.costo}))
```

- [ ] **Step 4: `buildTicketText`/`buildAuditText` en `modules/ventas.js`** (antes de `openEditVenta`)

```js
// ── Texto del ticket y de auditoría a partir de la orden: los usan generarTicket() y la edición ──
// El cliente no va en el ticket (dato interno): queda en o.cliente y en la auditoría.
export function buildTicketText(o){
  const p=o.productos||{},t=o.totales||{},aj=o.ajuste||{ajusteNeto:t.ajusteNeto||0},pm=o.payment||{};
  const prods=getProductos();
  const unidad=l=>prods.find(x=>x.id===(l.varId||l.prodId))?.unit||'ud';
  const total=t.totalGeneral||0;
  let tk=`🧾 Orden de Venta: ${o.id}\n📅 Fecha: ${o.fechaDisplay}`;
  tk+=`\n\n🛒 Pedido\n\n`;
  const lns=(p._lineas||[]).filter(l=>l.prodId!=='__var').map(l=>`${l.emoji} ${l.qty} ${unidad(l)} × ${fv(l.precio)} = ${fv(l.subtotal)}`);
  if(p.variable>0)lns.push(`💲 ${fv(p.variable)}`);
  const ajTk=[];
  if(aj.tipo==='libre'&&aj.libreTotal>0)ajTk.push(`✏️ Total libre: ${fv(aj.libreTotal)}`);
  else{
    if(aj.recargoPctMonto>0)ajTk.push(`📈 Recargo ${aj.recargoPct}%: +${fv(aj.recargoPctMonto)}`);
    if(aj.recargoFijoMonto>0)ajTk.push(`📈 Recargo fijo: +${fv(aj.recargoFijoMonto)}`);
    if(aj.descPctMonto>0)ajTk.push(`📉 Descuento ${aj.descPct}%: -${fv(aj.descPctMonto)}`);
    if(aj.descFijoMonto>0)ajTk.push(`📉 Descuento fijo: -${fv(aj.descFijoMonto)}`);
  }
  let tkLineas=lns.join('\n');
  if(ajTk.length)tkLineas+=`\n\n${ajTk.join('\n')}\n━━━━━━━━━━━━━━━━━━━━━`;
  tk+=tkLineas+`\n\n💰 Total: ${fv(total)} ARS`;
  if(aj.ajusteNeto)tk+=`\n   (subtotal ${fv(t.subtotalBruto??total)} ${aj.ajusteNeto>0?'+':'-'} ajuste ${fv(Math.abs(aj.ajusteNeto))})`;
  if(o.tipoPago==='USD')tk+=`\n💵 Total USD: ${fu(pm.usd||0)} (TC ${fi(pm.tc_usd||0)})`;
  if(o.tipoPago==='USDT')tk+=`\n🔵 Total USDT: ${fu(pm.usdt||0)} (TC ${fi(pm.tc_usdt||0)})`;
  if(o.tipoPago==='MIX'){
    const parts=[];
    if(pm.ars>0)parts.push(`ARS ${fv(pm.ars)}`);
    if(pm.usd>0)parts.push(`USD ${fu(pm.usd)}`);
    if(pm.usdt>0)parts.push(`USDT ${fu(pm.usdt)}`);
    if(parts.length)tk+=`\n💳 Pago: ${parts.join(' + ')}`;
    if(pm.total_usdt!=null)tk+=` ≈ ${fu(pm.total_usdt)} USDT`;
  }
  if(o.nota)tk+=`\n📝 Nota: ${o.nota}`;
  return tk;
}
export function buildAuditText(o){
  const t=o.totales||{},total=t.totalGeneral||0,aj=t.ajusteNeto??o.ajuste?.ajusteNeto??0;
  return`--- AUDITORÍA ---\nSubtotal: ${fv(t.subtotalBruto??total)} | Ajuste: ${aj>=0?'+':''}${fv(aj)} | Total: ${fv(total)} | Pago: ${o.payment?.modo||o.tipoPago||'ARS'} | Costo: ${fv(o.costo||0)} | Margen: ${o.margen}% | ID: ${o.id}${o.cliente?` | Cliente: ${o.cliente}`:''}`;
}
```

- [ ] **Step 5: `generarTicket()` usa las funciones compartidas** (`modules/ticket.js`)

Importar `buildTicketText, buildAuditText` desde `./ventas.js`. Borrar el armado de `tk` (desde
`let tk=` hasta el bloque MIX inclusive), la línea `if(notaFinal)tk+=…` y la línea `const aud=…`. Reemplazar el `sO(...)`:
```js
  const o={id,fecha,fechaDisplay:fd,mesActual:mes,tipoPago,tc:tcOrden,tcUsdt:tcUsdtOrden,payment,nota:notaFinal||null,cliente:cliente||null,clienteId:clienteId||null,productos,totales,costo,margen,ajuste,estado:'pendiente'};
  o.ticketText=buildTicketText(o);o.auditText=buildAuditText(o);
  if(!sO(o))return; // no se guardó: no descontar stock ni mostrar éxito (el formulario queda lleno)
```
y `tkOut`/`audOut` muestran `o.ticketText`/`o.auditText`.

- [ ] **Step 6: Correr** `node --test "tests/**/*.test.mjs"` → todo PASS.
- [ ] **Step 7: Commit** `git -C <repo> add modules/ticket.js modules/ventas.js tests/ventas-edicion.test.mjs` +
  `git commit -m "feat: ticket con costo por linea y texto compartido (buildTicketText/buildAuditText)"`.

### Task 2: Stock de una edición en un solo guardado

**Files:** Modify `modules/inventario.js`, `tests/ventas-edicion.test.mjs`

- [ ] **Step 1: Tests**

```js
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
```

- [ ] **Step 2: Correr** → FAIL (`moverStockEdicion` no existe).
- [ ] **Step 3: Implementar** en `modules/inventario.js`, debajo de `descontarStockPorTicket`:

```js
// ── Edición de venta: aplica el delta de cantidades sobre d, sin guardar (guarda saveEditVenta en un solo sd()) ──
// delta>0 (se vendió más): mismo descuento que descontarStockPorTicket — FIFO en lotes + plano con su propia cuenta.
// delta<0 (se vendió menos): vuelve al plano y a los lotes en orden inverso al FIFO (el más reciente primero),
// sin superar qty_inicial. Cada producto deja un movimiento «Edición V-…».
export function moverStockEdicion(d,deltas,ventaId){
  if(!deltas.length)return;
  d.stock=d.stock||{};d.lotes=d.lotes||{};d.stockMovs=d.stockMovs||[];
  const fecha=new Date().toISOString();
  deltas.forEach(({key,prodId,varId,nombre,emoji,delta})=>{
    if(!delta)return;
    const lotes=(d.lotes[key]||[]).sort((a,b)=>a.fecha.localeCompare(b.fecha));
    let r=Math.abs(delta);
    if(delta>0){
      for(const l of lotes){if(l.qty_restante<=0||r<=0)continue;const c=Math.min(l.qty_restante,r);l.qty_restante-=c;r-=c;}
    } else {
      for(const l of [...lotes].reverse()){if(r<=0)break;const c=Math.min((l.qty_inicial||0)-l.qty_restante,r);if(c>0){l.qty_restante+=c;r-=c;}}
    }
    const antes=d.stock[key]||0,despues=delta>0?Math.max(0,antes-delta):antes-delta;
    d.stock[key]=despues;
    if(varId&&prodId&&d.stock['grp-'+prodId]!=null){const g=d.stock['grp-'+prodId]||0;d.stock['grp-'+prodId]=delta>0?Math.max(0,g-delta):g-delta;}
    d.stockMovs.unshift({fecha,tipo:delta>0?'VENTA':'AJUSTE',prodId:key,nombre,emoji,delta:despues-antes,antes,despues,nota:'Edición '+ventaId});
  });
  if(d.stockMovs.length>1000)d.stockMovs=d.stockMovs.slice(0,1000);
}
```

- [ ] **Step 4: Correr** → PASS. **Step 5: Commit** `modules/inventario.js tests/ventas-edicion.test.mjs`
  («feat: moverStockEdicion — delta de stock de una edicion de venta, sin guardar»).

### Task 3: Modal y guardado de la edición

**Files:** Modify `modules/ventas.js` (reemplazo de `openEditVenta` … `saveEditVenta`), `tests/ventas-edicion.test.mjs`

- [ ] **Step 1: Tests** (agregar al archivo)

```js
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
```

- [ ] **Step 2: Correr** → FAIL (idempotencia: cambian campos; ids `edit-qty-0`/`edit-var` no existen).

- [ ] **Step 3: Implementar** — en `modules/ventas.js`:

Imports nuevos:
```js
import { autoRegistrarContacto, normNombre } from './contactos.js';
import { moverStockEdicion } from './inventario.js';
```
Reemplazar `openEditVenta`, `editRecalcTotal`, `editUpdateEquiv`, `editSetMode`, `saveEditVenta` por:

```js
// ── EDICIÓN DE VENTAS ──
function escV(s){return String(s??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

// Líneas editables: _lineas (formato nuevo) o campos legacy. «Variable» va aparte (productos.variable).
function lineasDeOrden(o){
  const p=o.productos||{};
  if(p._lineas?.length)return p._lineas.filter(l=>l.prodId!=='__var').map(l=>({prodId:l.prodId,varId:l.varId||null,nombre:l.nombre||'',emoji:l.emoji||'',qty:l.qty||0,precio:l.precio||0,subtotal:l.subtotal??(l.qty||0)*(l.precio||0),costo:l.costo}));
  const catalog=getProductos();
  const precioCat=id=>catalog.find(x=>x.id===id)?.tramos?.[0]?.p||0;
  const out=[],pastPrice=p.precioPastilla||precioCat('p-past');
  [['calaveras','v-cal','💀','Calaveras'],['teddy','v-ted','🧸','Teddy'],['lucky','v-lck','🐱','Lucky Cat'],['genericas','v-gen','💊','Genéricas']].forEach(([k,varId,emoji,nombre])=>{
    if((p[k]||0)>0)out.push({prodId:'p-past',varId,nombre,emoji,qty:p[k],precio:pastPrice,subtotal:p[k]*pastPrice});
  });
  [['cristales','p-cris','💎','Cristales','precioCristales'],['hongos','p-hong','🍄','Hongos','precioHongos'],['goteros','p-got','💧','Goteros',null],['petri','p-pet','🧫','Petri',null]].forEach(([k,prodId,emoji,nombre,pf])=>{
    const qty=p[k]||0;if(!qty)return;const precio=(pf&&p[pf])||precioCat(prodId);
    out.push({prodId,varId:null,nombre,emoji,qty,precio,subtotal:qty*precio});
  });
  return out;
}

// Lee el modal: líneas, variable y total con el mismo cálculo que el ticket (calc()): subtotal ± ajuste original.
function leerEdicion(o,ed){
  const num=id=>parseFloat(document.getElementById(id)?.value)||0;
  const lineas=ed.lineas.map((l,i)=>({...l,q:Math.max(0,num('edit-qty-'+i)),p:num('edit-prc-'+i)}));
  const variable=Math.max(0,num('edit-var'));
  const subtotal=lineas.reduce((a,l)=>a+l.q*l.p,0)+variable;
  const cambio=variable!==ed.variable0||lineas.some(l=>l.q!==l.qty||l.p!==l.precio);
  const total0=o.totales?.totalGeneral||0;
  if(!cambio)return{cambio,lineas,variable,subtotal,ajuste:o.ajuste,total:total0};
  const aj=o.ajuste;
  if(aj?.tipo==='libre'){const total=aj.libreTotal||subtotal;return{cambio,lineas,variable,subtotal,ajuste:{...aj,ajusteNeto:total-subtotal},total};}
  if(aj){
    const rp=subtotal*((aj.recargoPct||0)/100),dp=subtotal*((aj.descPct||0)/100),neto=rp+(aj.recargoFijo||0)-dp-(aj.descFijo||0);
    return{cambio,lineas,variable,subtotal,ajuste:{...aj,recargoPctMonto:rp,descPctMonto:dp,ajusteNeto:neto},total:subtotal+neto};
  }
  // Sin detalle de ajuste (órdenes viejas): se conserva la diferencia original entre total y subtotal
  const sub0=ed.lineas.reduce((a,l)=>a+l.subtotal,0)+ed.variable0;
  return{cambio,lineas,variable,subtotal,ajuste:null,total:subtotal+(total0-sub0)};
}

// Composición del pago con los TC de la orden (mismo criterio que getPayment() del ticket)
function pagoEdicion(modo,total,tcUsd,tcUsdt,mix){
  if(modo==='USD'){const usd=parseFloat((total/tcUsd).toFixed(2));return{ars:0,usd,usdt:0,tc:tcUsd,tc_usd:tcUsd,tc_usdt:tcUsdt,total_ars:Math.round(usd*tcUsd),total_usdt:null,modo};}
  if(modo==='USDT'){const usdt=parseFloat((total/tcUsdt).toFixed(2));return{ars:0,usd:0,usdt,tc:tcUsdt,tc_usd:tcUsd,tc_usdt:tcUsdt,total_ars:Math.round(usdt*tcUsdt),total_usdt:usdt,modo};}
  if(modo==='MIX'){const ta=Math.round(mix.ars+mix.usd*tcUsd+mix.usdt*tcUsdt);return{ars:mix.ars,usd:mix.usd,usdt:mix.usdt,tc:0,tc_usd:tcUsd,tc_usdt:tcUsdt,total_ars:ta,total_usdt:tcUsdt>0?parseFloat((ta/tcUsdt).toFixed(2)):null,modo};}
  return{ars:total,usd:0,usdt:0,tc:0,tc_usd:0,tc_usdt:0,total_ars:total,total_usdt:null,modo:'ARS'};
}

export function openEditVenta(id){
  const o=ld().orders.find(x=>x.id===id);if(!o)return;
  const pm=o.payment||{};
  const modo0=pm.modo||o.tipoPago||'ARS';
  const total0=o.totales?.totalGeneral||0;
  // TC de la orden, nunca el del día (ese solo como placeholder)
  const tcUsd0=pm.tc_usd||(o.tipoPago==='USD'&&o.tc>1?o.tc:0);
  const tcUsdt0=pm.tc_usdt||(o.tipoPago==='USDT'&&o.tc>1?o.tc:0);
  const mix0=modo0==='MIX'?{ars:pm.ars||0,usd:pm.usd||0,usdt:pm.usdt||0}
    :{ars:modo0==='ARS'?total0:0,usd:modo0==='USD'?(pm.usd||0):0,usdt:modo0==='USDT'?(pm.usdt||0):0};
  const lineas=lineasDeOrden(o),variable0=o.productos?.variable||0;
  window._editVenta={id,o,lineas,variable0,tcUsd0,tcUsdt0,mix0};
  const IS='width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:12px;padding:8px;outline:none;min-height:40px;border-radius:0;-webkit-appearance:none';
  const LB='font-family:var(--mo);font-size:8px;color:var(--tx2);display:block;margin-bottom:4px;text-transform:uppercase';
  const NI=`${IS};min-height:30px;padding:3px 6px;font-size:12px`;
  const vis=(on,disp='block')=>`display:${on?disp:'none'}`;
  document.getElementById('mTitEl').textContent='EDIT — '+id;
  document.getElementById('mTitEl').className='mtit';
  document.getElementById('modalBox').className='modal modal-wide';
  document.getElementById('mTk').style.display='none';
  const catalog=getProductos();
  const filas=lineas.map((l,i)=>{const prod=catalog.find(x=>x.id===(l.varId||l.prodId));return`
      <div style="display:grid;grid-template-columns:1fr 80px 95px;gap:6px;align-items:center;margin-bottom:5px;padding:6px;background:var(--s2);border:1px solid var(--br)">
        <div style="font-family:var(--mo);font-size:10px;color:var(--tx)">${escV(l.emoji||prod?.emoji||'📦')} ${escV(l.nombre||prod?.nombre||l.varId||l.prodId)}</div>
        <input type="number" style="${NI};text-align:center" placeholder="qty" value="${l.qty}" id="edit-qty-${i}" oninput="editRecalcTotal()">
        <input type="number" style="${NI};text-align:right" placeholder="$ ARS" value="${l.precio}" id="edit-prc-${i}" oninput="editRecalcTotal()">
      </div>`;}).join('');
  const ajN=o.totales?.ajusteNeto||0;
  const ajInfo=(o.ajuste?.tipo==='libre'?'Total libre. ':ajN?`Incluye ajuste ${ajN>0?'+':'-'}${fv(Math.abs(ajN))}. `:'')+'Si lo cambiás a mano queda como total libre.';
  document.getElementById('mBody').innerHTML=`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
      <div><label style="${LB}">Fecha</label><input type="date" id="edit-fecha" value="${escV(o.fecha)}" style="${IS}"></div>
      <div><label style="${LB}">Cliente</label><input type="text" id="edit-cliente" value="${escV(o.cliente)}" placeholder="opcional" list="clientes-list" style="${IS}"></div>
      <div style="grid-column:1/-1"><label style="${LB}">Nota</label><input type="text" id="edit-nota" value="${escV(o.nota)}" placeholder="opcional" style="${IS}"></div>
    </div>
    <div style="margin-bottom:10px">
      <div style="font-family:var(--mo);font-size:8px;color:var(--ac);letter-spacing:1px;text-transform:uppercase;margin-bottom:6px">Productos · Cantidad · Precio (ARS)</div>
      ${filas||'<div style="font-family:var(--mo);font-size:9px;color:var(--tx3);padding:8px">Sin productos detectados</div>'}
      <div style="display:grid;grid-template-columns:1fr 181px;gap:6px;align-items:center;padding:6px;background:var(--s2);border:1px solid var(--br)">
        <div style="font-family:var(--mo);font-size:10px;color:var(--tx)">💲 Variable</div>
        <input type="number" style="${NI};text-align:right" value="${variable0}" id="edit-var" oninput="editRecalcTotal()">
      </div>
    </div>
    <div style="margin-bottom:10px"><label style="${LB}">Total ARS</label>
      <input type="number" id="edit-total-ars" value="${total0}" oninput="editUpdateEquiv()" style="${IS}">
      <div style="font-family:var(--mo);font-size:9px;color:var(--tx3);margin-top:4px">${escV(ajInfo)}</div>
    </div>
    <div style="background:var(--s2);border:1px solid var(--br);padding:10px">
      <div style="font-family:var(--mo);font-size:8px;color:var(--tx2);text-transform:uppercase;letter-spacing:.8px;margin-bottom:8px">Modo de pago</div>
      <div style="display:flex;gap:5px;margin-bottom:10px;flex-wrap:wrap">
        ${['ARS','USD','USDT','MIX'].map(m=>`<button class="tgb ${modo0===m?'active':''}" id="em-btn${m}" onclick="editSetMode('${m}')" style="font-size:9px;min-height:28px;flex:1">${m}</button>`).join('')}
      </div>
      <input type="hidden" id="edit-modo" value="${escV(modo0)}">
      <div id="em-mix" style="${vis(modo0==='MIX','grid')};grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px">
        <div><label style="${LB}">ARS</label><input type="number" id="edit-mix-ars" value="${mix0.ars}" oninput="editUpdateEquiv()" style="${IS}"></div>
        <div><label style="${LB}">USD</label><input type="number" id="edit-mix-usd" value="${mix0.usd}" oninput="editUpdateEquiv()" style="${IS}"></div>
        <div><label style="${LB}">USDT</label><input type="number" id="edit-mix-usdt" value="${mix0.usdt}" oninput="editUpdateEquiv()" style="${IS}"></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div id="em-tcusd" style="${vis(modo0==='USD'||modo0==='MIX')}"><label style="${LB}">TC ARS/USD</label><input type="number" id="edit-tc-usd" value="${tcUsd0||''}" placeholder="${window._blueARS?'hoy '+window._blueARS:'ej: 1400'}" oninput="editUpdateEquiv()" style="${IS}"></div>
        <div id="em-tcusdt" style="${vis(modo0==='USDT'||modo0==='MIX')}"><label style="${LB}">TC ARS/USDT</label><input type="number" id="edit-tc-usdt" value="${tcUsdt0||''}" placeholder="${window._usdtARS?'hoy '+window._usdtARS:'ej: 1450'}" oninput="editUpdateEquiv()" style="${IS}"></div>
      </div>
      <div id="edit-eq" style="font-family:var(--mo);font-size:10px;color:var(--wn);margin-top:6px"></div>
    </div>`;
  document.getElementById('mFooter').innerHTML=`<button class="btn btn-p" onclick="saveEditVenta('${id}')">💾 Guardar</button><button class="btn btn-s" onclick="clM()">✕ Cancelar</button>`;
  document.getElementById('modal').classList.add('open');
  editUpdateEquiv();
}

export function editRecalcTotal(){
  const ed=window._editVenta;if(!ed)return;
  const el=document.getElementById('edit-total-ars');
  if(el)el.value=String(Math.round(leerEdicion(ed.o,ed).total*100)/100);
  editUpdateEquiv();
}

export function editUpdateEquiv(){
  const el=document.getElementById('edit-eq');if(!el)return;
  const num=id=>parseFloat(document.getElementById(id)?.value)||0;
  const m=document.getElementById('edit-modo')?.value||'ARS',total=num('edit-total-ars'),tcU=num('edit-tc-usd'),tcT=num('edit-tc-usdt');
  if(m==='USD')el.textContent=tcU>0?`≈ ${fu(total/tcU)} USD`:'';
  else if(m==='USDT')el.textContent=tcT>0?`≈ ${fu(total/tcT)} USDT`:'';
  else if(m==='MIX')el.textContent=`Pago: ${fv(num('edit-mix-ars')+num('edit-mix-usd')*tcU+num('edit-mix-usdt')*tcT)} · total ${fv(total)}`;
  else el.textContent='';
}

export function editSetMode(m){
  document.getElementById('edit-modo').value=m;
  ['ARS','USD','USDT','MIX'].forEach(x=>document.getElementById('em-btn'+x)?.classList.toggle('active',x===m));
  const show=(id,on,disp='block')=>{const el=document.getElementById(id);if(el)el.style.display=on?disp:'none';};
  show('em-mix',m==='MIX','grid');show('em-tcusd',m==='USD'||m==='MIX');show('em-tcusdt',m==='USDT'||m==='MIX');
  editUpdateEquiv();
}

export function saveEditVenta(id){
  const ed=window._editVenta;if(!ed||ed.id!==id)return;
  const val=k=>String(document.getElementById(k)?.value??'');
  const num=k=>parseFloat(val(k))||0;
  const modo=val('edit-modo')||'ARS';
  const tcUsd=num('edit-tc-usd'),tcUsdt=num('edit-tc-usdt');
  const mix={ars:num('edit-mix-ars'),usd:num('edit-mix-usd'),usdt:num('edit-mix-usdt')};
  if((modo==='USD'||(modo==='MIX'&&mix.usd>0))&&!(tcUsd>0)){sN('Ingresá el TC ARS/USD',true);return;}
  if((modo==='USDT'||(modo==='MIX'&&mix.usdt>0))&&!(tcUsdt>0)){sN('Ingresá el TC ARS/USDT',true);return;}
  const r0=leerEdicion(ed.o,ed);
  if(!r0.lineas.some(l=>l.q>0)&&!r0.variable){sN('La venta no puede quedar sin productos',true);return;}
  const cli=val('edit-cliente').trim(),nota=val('edit-nota').trim(),fecha=val('edit-fecha');
  // Cliente distinto: se registra antes de leer d (autoRegistrarContacto guarda solo, como en generarTicket;
  // leer d después evita pisar el contacto nuevo)
  const cambiaContacto=normNombre(cli)!==normNombre(ed.o.cliente||'');
  const clienteId=cambiaContacto?(autoRegistrarContacto(cli,fecha||ed.o.fecha)||null):null;
  const d=ld();const idx=(d.orders||[]).findIndex(x=>x.id===id);if(idx<0)return;
  const o0=d.orders[idx],o=JSON.parse(JSON.stringify(o0));
  const total0=o0.totales?.totalGeneral||0;

  if(fecha&&fecha!==o.fecha){o.fecha=fecha;o.fechaDisplay=d2s(fecha);o.mesActual=d2m(fecha);}
  if(cli!==(o.cliente||'').trim()){o.cliente=cli||null;if(cambiaContacto)o.clienteId=clienteId;}
  if(nota!==(o.nota||'').trim())o.nota=nota||null;

  // Productos, costo y stock: solo si cambió alguna línea o la variable
  const r=leerEdicion(o0,ed);
  const deltas=[];
  if(r.cambio){
    const subL=ed.lineas.reduce((a,l)=>a+l.subtotal,0);
    const nuevas=[];
    r.lineas.forEach(l=>{
      // costo de la línea: el guardado o, en órdenes viejas, o.costo prorrateado por subtotal; escala con la cantidad
      const c0=l.costo!=null?l.costo:(subL>0?(o0.costo||0)*l.subtotal/subL:0);
      if(l.q>0)nuevas.push({prodId:l.prodId,varId:l.varId,nombre:l.nombre,emoji:l.emoji,qty:l.q,precio:l.p,subtotal:l.q*l.p,costo:Math.round(l.q===l.qty?c0:c0*l.q/l.qty)});
      const key=l.varId||l.prodId;
      if(l.q!==l.qty&&key!=='p-past')deltas.push({key,prodId:l.prodId,varId:l.varId,nombre:l.nombre,emoji:l.emoji,delta:l.q-l.qty});
    });
    const q=f=>nuevas.filter(f).reduce((a,l)=>a+l.qty,0),s=f=>nuevas.filter(f).reduce((a,l)=>a+l.subtotal,0);
    const es=(...ids)=>l=>ids.includes(l.varId)||ids.includes(l.prodId);
    const PAST=['v-cal','v-ted','v-lck','v-gen'];
    const p={...o.productos,_lineas:nuevas,variable:r.variable,
      calaveras:q(es('v-cal')),teddy:q(es('v-ted')),lucky:q(es('v-lck')),genericas:q(es('v-gen')),
      totalPastillas:q(es(...PAST)),totalPastillasLinea:s(es(...PAST)),
      cristales:q(es('p-cris')),totalCristales:s(es('p-cris')),hongos:q(es('p-hong')),totalHongos:s(es('p-hong')),
      goteros:q(es('p-got')),totalGoteros:s(es('p-got')),petri:q(es('p-pet')),totalPetri:s(es('p-pet'))};
    o.productos=p;
    o.totales={...o.totales,totalPastillasLinea:p.totalPastillasLinea,totalCristales:p.totalCristales,totalHongos:p.totalHongos,totalGoteros:p.totalGoteros,totalPetri:p.totalPetri};
    if(r.lineas.some(l=>l.q!==l.qty)){const costo=nuevas.reduce((a,l)=>a+l.costo,0);o.costo=costo;o.totales.costoTotal=costo;}
  }

  // Total: el calculado como el ticket; si el usuario lo escribió a mano, queda como ajuste libre
  const tIn=parseFloat(val('edit-total-ars'));
  const manual=!isNaN(tIn)&&Math.abs(tIn-r.total)>0.01;
  const total=manual?tIn:r.total;
  const ajuste=manual?{recargoPct:0,recargoFijo:0,descPct:0,descFijo:0,recargoPctMonto:0,recargoFijoMonto:0,descPctMonto:0,descFijoMonto:0,ajusteNeto:tIn-r.subtotal,libreTotal:tIn,tipo:'libre'}:r.ajuste;
  if(r.cambio||manual){
    o.totales={...o.totales,totalGeneral:total,subtotalBruto:r.subtotal,ajusteNeto:total-r.subtotal};
    if(ajuste)o.ajuste=ajuste;
  }
  if(total!==total0||o.costo!==o0.costo)o.margen=total>0?parseFloat(((total-(o.costo||0))/total*100).toFixed(1)):0;

  // Pago: se conservan payment y TC salvo que cambie el modo, un TC, el desglose MIX o el total (fuera de MIX)
  const modo0=o0.payment?.modo||o0.tipoPago||'ARS';
  const tcCambio=((modo==='USD'||modo==='MIX')&&tcUsd!==ed.tcUsd0)||((modo==='USDT'||modo==='MIX')&&tcUsdt!==ed.tcUsdt0);
  const mixCambio=modo==='MIX'&&(mix.ars!==ed.mix0.ars||mix.usd!==ed.mix0.usd||mix.usdt!==ed.mix0.usdt);
  if(modo!==modo0||tcCambio||mixCambio||(modo!=='MIX'&&total!==total0)){
    const pago=pagoEdicion(modo,total,tcUsd,tcUsdt,mix);
    o.payment=pago;o.tipoPago=modo;
    if(modo!==modo0||tcCambio){o.tc=modo==='ARS'?1:(pago.tc_usd||pago.tc_usdt||null);o.tcUsdt=pago.tc_usdt||1;}
    o.totales={...o.totales,totalUSDT:pago.total_usdt,totalUSD:pago.usd||null,payment:pago};
  }

  if(JSON.stringify(o)===JSON.stringify(o0)){window.clM?.();sN('Sin cambios');delete window._editVenta;return;}
  o.ticketText=buildTicketText(o);
  const ediciones=(o0.auditText||'').split('\n').filter(l=>l.startsWith('✏ Editada'));
  o.auditText=[buildAuditText(o),...ediciones,`✏ Editada ${d2s(hoy())}: total ${fv(total0)} → ${fv(total)}`].join('\n');
  d.orders[idx]=o;
  moverStockEdicion(d,deltas,id);          // stock plano + lotes + movimientos, en el mismo d
  if(!sd(d))return;                        // un solo guardado; si falla, el modal queda abierto con lo editado
  window.rfM?.();rH();rS();window.renderDash?.();window.clM?.();sN(`✓ ${id} actualizada`);window.uhd?.();window.updateClientesDatalist?.();
  delete window._editVenta;
}
```

- [ ] **Step 4: Correr** `node --test "tests/**/*.test.mjs"` → todo PASS.
- [ ] **Step 5: Commit** `modules/ventas.js tests/ventas-edicion.test.mjs` («fix: edicion de ventas — idempotente,
  conserva ajuste/TC/MIX, recalcula costo, mueve stock y regenera textos (3.2)»).

### Task 4: Build y verificación con datos de prueba

- [ ] **Step 1:** `build.bat` (o `powershell -NoProfile -ExecutionPolicy Bypass -File build.ps1`) y `node --check bundle.js`.
  Verificar que no haya nombres de función repetidos en el bundle:
  `grep -oE "^function [A-Za-z_$][A-Za-z0-9_$]*" bundle.js | sort | uniq -d` → vacío.
- [ ] **Step 2:** Repetir la reproducción sobre la copia del backup (script del scratchpad, ids nuevos): abrir y guardar
  sin tocar nada las 173 ventas → **0 cambiadas**.
- [ ] **Step 3: Navegador** — copiar `backup_2026-08-13_1626.json` a la raíz, `python -m http.server 7432 --bind 127.0.0.1`
  en segundo plano y un script CDP (copia de `docs/handoffs/2026-11-24-cdp-prueba-etapa2.mjs` →
  `docs/handoffs/2026-11-24-cdp-prueba-edicion.mjs`) que: restaura el backup; abre y guarda una venta sin tocar → orden
  idéntica y aviso «Sin cambios»; cambia la cantidad de una venta de `v-ted` (+1, con `editRecalcTotal()`) → total,
  `stock['v-ted']` −1, movimiento «Edición V-…», `ticketText` nuevo; baja la cantidad → stock vuelve; abre una venta USD
  y cambia cantidad → TC igual; sin errores de consola. Cortar el servidor con TaskStop y borrar el backup de la raíz.

### Task 5: Documentación y push

- [ ] **Step 1: CLAUDE.md** — en «Formato de una orden»: `auditoriaText` → `auditText`; las líneas viven en
  `productos._lineas` (con `costo` por línea desde la 3.2), `totales` incluye `subtotalBruto`, `ajusteNeto`, `payment`;
  `costo`, `margen` (%), `ajuste`, `payment` a nivel orden. En la estructura: `ventas.js` suma `buildTicketText(o)`,
  `buildAuditText(o)` y la edición; `inventario.js` suma `moverStockEdicion(d,deltas,id)`.
- [ ] **Step 2:** `node --test "tests/**/*.test.mjs"` en verde; commit de `CLAUDE.md` + plan + script CDP.
- [ ] **Step 3:** Pedir OK en una línea; con OK:
  `powershell -NoProfile -ExecutionPolicy Bypass -File .\deploy.ps1 -Mensaje "3.2 edicion de ventas"` y verificar
  `git rev-list --left-right --count HEAD...origin/main` → `0 0`.
