# Etapa 4 — Precios por producto — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** El panel «Cambio de precios» ajusta por producto (los que comparten lista van juntos), con redondeo, % sugerido por
el dólar, vista previa con margen, modal para sincronizar la calculadora, aviso de calculadora desactualizada y un log de
precios completo (sin borrado, con ediciones manuales).

**Spec:** `docs/superpowers/specs/2026-11-24-motoredge-mejoras-design.md` §Etapa 4 (aprobado).

**Architecture:** Toda la lógica nueva vive en `modules/price-manager.js` (funciones puras testeables + UI del panel).
El ID del log pasa a `core/ids.js` (`newPriceLogId(log)`, puro) para que `modules/listas-precios.js` registre ediciones
manuales sin importar `price-manager.js` (evita import circular). Cada escritura sigue siendo un solo `sd()`.

**Tech Stack:** JS vanilla ES modules, `bundle.js` vía `build.ps1`, tests con `node --test` (Node 24, sin npm).

**Datos de prueba** (backup 2026-08-13): `v-cal` y `v-ted` → `lp-past` «Pastillas GRP» (comparten);
`p-cris`, `p-hong`, `p-got`, `p-pet` → una lista cada uno.

---

## Archivos

| Archivo | Cambio |
|---|---|
| `core/ids.js` | + `newPriceLogId(log)` (Math.max sobre el mes, formato `PCH-AAAAMM-NNN`) |
| `modules/price-manager.js` | redondeo, agrupación, validar/preview/aplicar por `listaIds`, % sugerido, estado de sync, panel nuevo, modal de sync, puntos de aviso, log sin «×», tipo `edit`, restore con un `sd()` |
| `modules/listas-precios.js` | guardar lista = un `sd()` con lista + productos + entrada `edit`; refrescar aviso al guardar/eliminar/asignar |
| `modules/productos.js` | refrescar aviso al guardar el modal de producto (puede cambiar la lista asignada) |
| `modules/backup.js` | refrescar aviso tras restaurar backup |
| `main.js` | exports nuevos, sin `deletePriceLogEntry`, `renderCalcStatus()` al final del init |
| `tests/helpers/env.mjs` | `localStorage` en memoria + stubs `window`/`document` |
| `tests/precios.test.mjs` | tests de la etapa |
| `CLAUDE.md` | schema `priceLog`, dependencias, init |

---

### Task 1: Harness de tests + `newPriceLogId(log)`

**Files:** Create `tests/helpers/env.mjs`, `tests/precios.test.mjs` · Modify `core/ids.js`

- [ ] **Step 1: harness**

```js
// tests/helpers/env.mjs — importar ANTES que cualquier módulo fuente.
// localStorage en memoria y stubs mínimos de window/document: los tests nunca tocan datos del navegador.
const store=new Map();
const ls={
  getItem:k=>store.has(k)?store.get(k):null,
  setItem:(k,v)=>{store.set(k,String(v));},
  removeItem:k=>{store.delete(k);},
  clear:()=>store.clear(),
};
Object.defineProperty(globalThis,'localStorage',{value:ls,configurable:true,writable:true});
const el=()=>({textContent:'',innerHTML:'',value:'',style:{},className:'',disabled:false,
  classList:{add(){},remove(){},toggle(){},contains:()=>false},
  appendChild(){},remove(){},querySelector:()=>null,querySelectorAll:()=>[]});
globalThis.document={getElementById:()=>el(),querySelector:()=>null,querySelectorAll:()=>[],createElement:()=>el()};
globalThis.window=globalThis;
globalThis.confirm=()=>true;
export function resetStorage(data){store.clear();if(data)store.set('motoredge_v4',JSON.stringify(data));}
export function leer(){return JSON.parse(store.get('motoredge_v4'));}
// Cuenta escrituras de motoredge_v4 durante fn()
export function contarEscrituras(fn){
  let n=0;const orig=ls.setItem;
  ls.setItem=(k,v)=>{if(k==='motoredge_v4')n++;orig(k,v);};
  try{fn();}finally{ls.setItem=orig;}
  return n;
}
```

- [ ] **Step 2: test que falla**

```js
// tests/precios.test.mjs
import { resetStorage, leer, contarEscrituras } from './helpers/env.mjs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newPriceLogId } from '../core/ids.js';

const MES=new Date().toISOString().slice(0,7).replace('-','');
test('newPriceLogId usa Math.max del mes, no el conteo', ()=>{
  assert.equal(newPriceLogId([]),`PCH-${MES}-001`);
  assert.equal(newPriceLogId([{id:`PCH-${MES}-001`},{id:`PCH-${MES}-005`},{id:'PCH-202001-009'}]),`PCH-${MES}-006`);
});
```

Run: `node --test "tests/**/*.test.mjs"` → FAIL (`newPriceLogId` no exportado).

- [ ] **Step 3: implementar en `core/ids.js`** (al final)

```js
// Log de precios: PCH-AAAAMM-NNN, Math.max sobre el mes (mes UTC, como siempre). Puro: recibe el log.
export function newPriceLogId(log){
  const mes=new Date().toISOString().slice(0,7).replace('-','');
  const nums=(log||[]).filter(e=>e.id&&e.id.startsWith('PCH-'+mes)).map(e=>parseInt(e.id.split('-')[2])||0);
  return`PCH-${mes}-${(Math.max(0,...nums)+1).toString().padStart(3,'0')}`;
}
```

En `modules/price-manager.js`: borrar la función local `newPriceLogId()`, importar
`import { newPriceLogId } from '../core/ids.js';` y pasar el log en cada llamada
(`newPriceLogId(d.priceLog)`, `newPriceLogId(getPriceLog())`). Agregar también `import { fi } from '../core/formatters.js';`
(hoy se usa sin importar; solo funciona en el bundle) y `import { getCostoPromedio } from './stock.js';`.

- [ ] **Step 4:** Run tests → PASS.

### Task 2: Redondeo, repetidos, agrupación, validar/preview por `listaIds`

**Files:** Modify `modules/price-manager.js` (bloques MATH / VALIDATION / PREVIEW) · Test `tests/precios.test.mjs`

- [ ] **Step 1: tests**

```js
import { ajustarPrecio, tramosRepetidos, agruparProductosPorLista, validarAjuste, previewAjuste,
  applyPriceAdjustment, pctSugerido, calcSyncStatus, buildPreciosJson, restoreFromPriceLog, getPriceLog } from '../modules/price-manager.js';

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
```

- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3: implementar** (reemplaza MATH, VALIDATION y PREVIEW de `price-manager.js`)

```js
// ── MATH ──
// Redondeo r=0: Math.trunc, nunca sube (22785 × 1.10 = 25063.5 → 25063).
// r>0 ($100 / $500 / $1.000): al múltiplo de r más cercano.
export function ajustarPrecio(p,pct,r=0){const x=p*(1+pct/100);return r?Math.round(x/r)*r:Math.trunc(x);}
function calcNuevosTramos(tramos,pct,r){return tramos.map(t=>({t:t.t,p:ajustarPrecio(t.p,pct,r)}));}
// "Desde" de los tramos que quedan con el mismo precio que el anterior (pasa al redondear)
export function tramosRepetidos(tramos){return tramos.filter((t,i)=>i>0&&t.p===tramos[i-1].p).map(t=>t.t);}

// Productos activos agrupados por lista: los que comparten lista se ajustan juntos.
export function agruparProductosPorLista(){
  const listas=getListasPrecios();
  const grupos=[],sinLista=[];
  getProductos().filter(p=>p.activo!==false).forEach(p=>{
    const lista=p.listaPrecioId?listas.find(l=>l.id===p.listaPrecioId):null;
    if(!lista){sinLista.push(p);return;}
    let g=grupos.find(x=>x.listaId===lista.id);
    if(!g){g={listaId:lista.id,listaNombre:lista.nombre,productos:[]};grupos.push(g);}
    g.productos.push(p);
  });
  return{grupos,sinLista};
}

// ── VALIDATION ──
export function validarAjuste(listaIds,pct,r=0){
  if(!listaIds?.length)return'Elegí al menos un producto';
  if(!pct)return'El porcentaje debe ser distinto de cero';
  for(const lista of getListasPrecios().filter(l=>listaIds.includes(l.id))){
    for(const t of lista.tramos||[]){
      const nuevo=ajustarPrecio(t.p,pct,r);
      if(nuevo<=0)return`El ajuste llevaría "${lista.nombre}" (tramo ≥${t.t}) a $${nuevo}. Reducí el porcentaje o el redondeo.`;
    }
  }
  return null;
}

// ── PREVIEW (no escribe nada) ──
export function previewAjuste(listaIds,pct,r=0){
  return getListasPrecios().filter(l=>listaIds.includes(l.id)).map(lista=>({
    listaId:lista.id,listaNombre:lista.nombre,
    before:lista.tramos.map(t=>({...t})),
    after:calcNuevosTramos(lista.tramos,pct,r)
  }));
}
```

- [ ] **Step 4:** Run → PASS.

### Task 3: `applyPriceAdjustment({listaIds,pct,redondeo,motivo,productos})`

- [ ] **Step 1: test**

```js
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
```

- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3: implementar** (reemplaza `applyPriceAdjustment`)

```js
// ── APPLY (una sola sd()) ──
export function applyPriceAdjustment({listaIds,pct,redondeo=0,motivo='',productos=[]}){
  const err=validarAjuste(listaIds,pct,redondeo);
  if(err){sN(err,true);return{ok:false};}
  const d=ld();
  const listas=getListasPrecios(); // handles defaults
  const cambios=[];
  listas.forEach(lista=>{
    if(!listaIds.includes(lista.id))return;
    const before=lista.tramos.map(t=>({...t}));
    const after=calcNuevosTramos(lista.tramos,pct,redondeo);
    lista.tramos=after;
    cambios.push({listaId:lista.id,listaNombre:lista.nombre,before,after});
  });
  // Sync product .tramos for products that reference an affected lista
  const modIds=new Set(cambios.map(c=>c.listaId));
  (d.productos||[]).forEach(p=>{
    if(p.listaPrecioId&&modIds.has(p.listaPrecioId)){
      const lista=listas.find(l=>l.id===p.listaPrecioId);
      if(lista)p.tramos=lista.tramos.map(t=>({...t}));
    }
  });
  // Ensure d.priceLog existe (migration inline)
  if(!Array.isArray(d.priceLog)){
    try{const _r=localStorage.getItem('me_price_log');d.priceLog=_r?JSON.parse(_r):[];}
    catch(e){d.priceLog=[];}
    localStorage.removeItem('me_price_log');
  }
  const entry={
    id:newPriceLogId(d.priceLog),
    ts:new Date().toISOString(),
    motivo:motivo||'',
    tipo:'pct',
    valor:pct,
    redondeo,
    scope:listaIds.length>=listas.length?'all':[...listaIds],
    productos:productos.map(p=>({id:p.id,nombre:p.nombre,emoji:p.emoji})),
    tc:window._blueARS||null,
    cambios
  };
  d.listasPrecios=listas;
  d.priceLog.push(entry);
  sd(d); // atomic: listas + productos + priceLog en un solo write
  // Refresh live config so ticket engine uses new prices immediately
  window.loadConfig?.();
  window.buildTicketUI?.();
  window.upd?.();
  return{ok:true,entry};
}
```

(El toast de éxito se reemplaza por el modal de la Task 6.)

- [ ] **Step 4:** Run → PASS.

### Task 4: % sugerido + estado de sync + `payload` en sync

- [ ] **Step 1: tests**

```js
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
```

- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3: implementar** (después de `buildPreciosJson()`)

```js
// Estado de la calculadora pública: compara lo que se publicaría hoy con el payload de la última sync.
// 'ok' igual · 'stale' distinto · 'unverified' la última sync no guardó payload (o nunca hubo sync).
export function calcSyncStatus(){
  const last=getPriceLog().filter(e=>e.tipo==='sync').at(-1);
  if(!last?.payload)return'unverified';
  const {updated,...actual}=buildPreciosJson();
  return JSON.stringify(actual)===JSON.stringify(last.payload)?'ok':'stale';
}

// Entrada más reciente del log con TC que tocó alguna de estas listas (base del % sugerido)
function ultimoAjusteConTc(listaIds){
  return getPriceLog().slice().reverse().find(e=>e.tc&&(e.cambios||[]).some(c=>listaIds.includes(c.listaId)))||null;
}
export function pctSugerido(listaIds,blue){
  const e=blue?ultimoAjusteConTc(listaIds):null;
  return e?{pct:Math.round((blue/e.tc-1)*1000)/10,tc:e.tc,ts:e.ts}:null;
}
```

En `ghSyncCalc()`: `const pj=buildPreciosJson();const json=JSON.stringify(pj,null,2);` y al registrar la sync
`const {updated,...payload}=pj;` → `syncEntry={..., payload}` con `id:newPriceLogId(getPriceLog())`;
reemplazar `renderSyncBanner()` por `renderCalcStatus()`.

- [ ] **Step 4:** Run → PASS.

### Task 5: `restoreFromPriceLog()` con un solo `sd()`

- [ ] **Step 1: test**

```js
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
```

- [ ] **Step 2:** Run → FAIL (2 escrituras).
- [ ] **Step 3: implementar** — en `restoreFromPriceLog`: armar `restoreEntry` (con `id:newPriceLogId(data.priceLog)`) antes
  de guardar, `data.priceLog.push(restoreEntry)` y un único `sd(data)`; borrar el `getPriceLog()/savePriceLog()` posterior.
  Al final, `renderCalcStatus()`.
- [ ] **Step 4:** Run → PASS.

### Task 6: Panel nuevo, modal de sync y aviso «calculadora desactualizada»

**Files:** `modules/price-manager.js`, `main.js`, `modules/backup.js`, `modules/listas-precios.js`, `modules/productos.js`

Estado del panel (módulo):

```js
let _paSel=new Set();     // listas elegidas (por producto; las compartidas van juntas)
let _paPreviewKey=null;   // parámetros de la última vista previa: APLICAR exige que coincidan
let _blueFetch=null;      // una sola consulta del blue si no estaba cargado
function paParams(){
  const rawPct=parseFloat(document.getElementById('pa-pct')?.value||'0');
  const tipo=parseInt(document.getElementById('pa-tipo')?.value||'1');
  const redondeo=parseInt(document.getElementById('pa-redondeo')?.value||'0');
  return{listaIds:[..._paSel],pct:rawPct*tipo,redondeo};
}
const paKey=p=>JSON.stringify([[...p.listaIds].sort(),p.pct,p.redondeo]);
export function paInvalidar(){ /* oculta preview, deshabilita #pa-apply */ }
export function paSelTodos(on){ /* Todos / Ninguno */ }
export function paUsarSugerido(pct){ /* carga |pct| y el tipo */ }
function renderPaProductos(){ /* toggles #pa-prods con data-pa-lista; sin lista: disabled "asigná una lista" */ }
async function renderPaSugerido(){ /* #pa-sug; si falta window._blueARS: await window.actualizarPreciosDash() */ }
```

- `renderPriceAdjust()`: «Productos» (toggles + Todos/Ninguno), Variación %, Tipo, **Redondeo** (`pa-redondeo`: 0/100/500/1000),
  línea `#pa-sug`, Motivo, PREVISUALIZAR y `#pa-apply` (deshabilitado). Selección inicial: todos los grupos.
  Cambiar pct/tipo/redondeo/productos → `paInvalidar()`.
- `renderPricePreview()`: valida, arma tabla por lista (como hoy) + por producto «costo prom. · margen base actual → nuevo»
  (`getCostoPromedio`, colores >30 `--ac`, >15 `--wn`, resto `--er`) + aviso `tramosRepetidos`. Guarda `_paPreviewKey` y
  habilita `#pa-apply`.
- `applyPriceFromUI()`: exige `_paPreviewKey===paKey(paParams())`; productos = los de los grupos elegidos; tras aplicar:
  `paInvalidar()`, re-renders, `renderCalcStatus()`, `renderPaSugerido()`, `abrirModalSyncCalc(res.entry)`.
- `abrirModalSyncCalc(entry)`: usa `#modal` (como `abrirEditarLista`). Con token: «✓ Precios actualizados (+10% · N listas).
  ¿Sincronizar la calculadora online ahora?» [↑ Sincronizar ahora → `clM();ghSyncCalc()`] [Más tarde]. Sin token: explica
  «⚙️ Config → GitHub: pegá el token y tocá 🔑 Acceso; después ↑ SINCRONIZAR CALCULADORA en este panel» [Entendido].
- `renderCalcStatus()`: punto `.calc-dot` en `#isb-precios` y en `.tab-btn[data-tab="inventario"]` si `calcSyncStatus()==='stale'`;
  luego `renderSyncBanner()`, que muestra «⚠ Calculadora desactualizada» / «✓ Calculadora al día» / «Estado sin verificar
  (se verifica desde la próxima sincronización)».
- Llamadas a `renderCalcStatus()`: final del init en `main.js`; aplicar; restaurar ajuste; sync; `restoreBackupPayload()`
  (`try{window.renderCalcStatus?.();}catch(e){}`); guardar lista, eliminar lista y guardar asignaciones
  (`listas-precios.js`); `guardarProductoModal()` (`productos.js`).
- `main.js`: importar/exponer `renderCalcStatus, paInvalidar, paSelTodos, paUsarSugerido`; quitar `deletePriceLogEntry`.

### Task 7: Log completo

- Borrar `deletePriceLogEntry()` y la «×» (`DEL`) del terminal.
- `etiquetaListas(e)`: `'all'` → «Todas las listas»; si no, `cambios[].listaNombre` unidos con « · ».
- Terminal: línea `✏ EDIT` para `tipo:'edit'`; pct muestra redondeo si lo hay.
- Log detallado: badge `✏ EDIT`; muestra productos y redondeo si existen; filas de tramos sobre el máximo de
  `before`/`after` (una edición puede agregar o quitar tramos).
- `listas-precios.js`, guardar lista existente: un solo `sd(d)` con `d.listasPrecios`, `d.productos` (tramos copiados) y, si
  los tramos cambiaron, entrada `{id:newPriceLogId(d.priceLog),ts,tipo:'edit',motivo:'Edición manual',valor:null,
  scope:[lid],tc:window._blueARS||null,cambios:[{listaId,listaNombre,before,after}]}`. Lista nueva: sin entrada.

### Task 8: Build y verificación

- [ ] `node --test "tests/**/*.test.mjs"` → todo PASS.
- [ ] `powershell -NoProfile -ExecutionPolicy Bypass -File .\build.ps1` y `node --check bundle.js`.
- [ ] Navegador (Chrome headless + CDP, perfil temporal, `localhost:7432`, backup de agosto — nunca datos reales):
  toggles (Calaveras+Teddy juntos), preview con margen y aviso de repetidos, APLICAR deshabilitado hasta previsualizar
  y al cambiar parámetros, aplicar → modal de sync, punto de aviso visible, edición manual de lista → entrada `edit`,
  sin «×», restaurar, sin errores de consola.

### Task 9: CLAUDE.md + commit

- [ ] Schema `priceLog`: tipos `pct`/`restore`/`sync`/`edit`; `productos`, `redondeo`, `payload`; `scope` `'all'|[listaIds]`;
  sin borrado. Dependencias: `price-manager ← … ids, stock`; `listas-precios ← … ids`. Init: `renderCalcStatus()` al final.
- [ ] Commit con rutas explícitas (nunca `git add .`); push `git push origin clean-main:main` con OK del usuario.
