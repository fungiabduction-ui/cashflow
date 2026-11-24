# Etapa 2 — Robustez base — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** que un `motoredge_v4` corrupto nunca se pise con un estado vacío (modo protegido) y que ningún flujo
importante muestre "✓" ni siga con pasos secundarios cuando el guardado falló (`sd()` devuelve booleano).

**Architecture:** el estado del bloqueo vive en `core/storage.js` (variables de módulo). `ld()` lo activa al no poder
parsear; `sd()` lo respeta; `desbloquearEscritura()` es la única salida y solo la llaman `restoreBackupPayload()` y
`hardReset()`. Los llamadores listados en el spec (§2.2) chequean el booleano y cortan antes de efectos secundarios.

**Tech Stack:** JS vanilla (ES modules), `node --test` (Node 24, sin npm), harness `tests/helpers/env.mjs`.

**Spec:** `docs/superpowers/specs/2026-11-24-motoredge-mejoras-design.md` §Etapa 2.

---

## Archivos

| Archivo | Cambio |
|---|---|
| `core/storage.js` | `ld()` modo protegido + copia `motoredge_v4_corrupt_<AAAAMMDD-HHMM>` + aviso persistente; `sd()` → booleano; `escrituraBloqueada()`, `desbloquearEscritura()` |
| `modules/backup.js` | `restoreBackupPayload()` desbloquea antes de `sd()`; si `sd()` falla, lanza Error (los 3 llamadores ya hacen catch) |
| `modules/io.js` | `hardReset()` desbloquea tras borrar las claves |
| `modules/ventas.js` | `sO()` devuelve el booleano; `confirmarOrden()` y `saveEditVenta()` cortan si falla |
| `modules/ticket.js` | `generarTicket()` no descuenta stock ni muestra éxito si `sO()` falla; `confirmarDesdeOutput()` no pinta "confirmada" si falló |
| `modules/egresos.js` | `sE()` devuelve booleano; `generarEgreso()` corta si falla |
| `modules/inventario.js` | `registrarIngreso()`: lote + ingreso en un solo `sd()`; corta si falla |
| `modules/price-manager.js` | `applyPriceAdjustment()` → `{ok:false}` si falla; `restoreFromPriceLog()` corta |
| `modules/listas-precios.js` | Guardado del editor de listas corta si falla |
| `tests/storage.test.mjs` | nuevo: modo protegido, `sd()` booleano, restore/hardReset |
| `tests/storage-sin-espacio.test.mjs` | nuevo: la copia del texto crudo falla por espacio → se sigue igual (instancia limpia del módulo) |
| `tests/guardado.test.mjs` | nuevo: llamadores cortan si `sd()` falla |
| `tests/ids.test.mjs` | nuevo: IDs con `Math.max` tras eliminaciones |
| `run-tests.bat` | nuevo |
| `CLAUDE.md` | invariante #1, tabla de funciones, claves separadas |

Decisión: el mensaje de error lo da `sd()` (una sola fuente: storage lleno / error / bloqueado). Los llamadores solo
cortan (`return`), así no hay dos toasts contradictorios.

---

### Task 1: Modo protegido y `sd()` booleano

**Files:** Modify `core/storage.js:1-12` · Test `tests/storage.test.mjs`, `tests/storage-sin-espacio.test.mjs`

- [ ] **Step 1: tests que fallan** — `tests/storage.test.mjs`:

```js
import { resetStorage, leer, contarEscrituras } from './helpers/env.mjs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ld, sd, escrituraBloqueada, desbloquearEscritura } from '../core/storage.js';

const clavesCorrupt=()=>[...globalThis.__store.keys()].filter(k=>k.startsWith('motoredge_v4_corrupt_'));

test('storage vacío no es corrupción: arranque normal y sd() escribe', ()=>{
  resetStorage();
  assert.deepEqual(ld().orders,[]);
  assert.equal(escrituraBloqueada(),false);
  assert.equal(sd({orders:[{id:'V-1'}],egresos:[]}),true);
  assert.equal(leer().orders[0].id,'V-1');
});
test('sd() devuelve false si setItem tira (storage lleno)', ()=>{
  resetStorage();
  const orig=localStorage.setItem;
  localStorage.setItem=()=>{const e=new Error('lleno');e.name='QuotaExceededError';throw e;};
  try{assert.equal(sd({orders:[]}),false);}finally{localStorage.setItem=orig;}
});
test('JSON corrupto: copia el texto crudo una vez, bloquea y sd() no escribe', ()=>{
  globalThis.__store.clear();globalThis.__store.set('motoredge_v4','{"orders":[ROTO');
  assert.deepEqual(ld().orders,[]);
  ld(); // segunda lectura en la misma carga: no hace otra copia
  assert.equal(escrituraBloqueada(),true);
  const ks=clavesCorrupt();
  assert.equal(ks.length,1);
  assert.match(ks[0],/^motoredge_v4_corrupt_\d{8}-\d{4}$/);
  assert.equal(globalThis.__store.get(ks[0]),'{"orders":[ROTO');
  assert.equal(contarEscrituras(()=>assert.equal(sd({orders:[]}),false)),0);
  assert.equal(globalThis.__store.get('motoredge_v4'),'{"orders":[ROTO'); // intacto
});
test('desbloquearEscritura() levanta el bloqueo', ()=>{
  desbloquearEscritura();
  assert.equal(escrituraBloqueada(),false);
  assert.equal(sd({orders:[],egresos:[]}),true);
  assert.deepEqual(leer().orders,[]);
});
```

(Para `clavesCorrupt` el harness expone el `Map`: en `tests/helpers/env.mjs` agregar `globalThis.__store=store;`.)

`tests/storage-sin-espacio.test.mjs` (archivo aparte = proceso aparte = módulo recién cargado):

```js
import { resetStorage } from './helpers/env.mjs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ld, sd, escrituraBloqueada } from '../core/storage.js';

test('si la copia del texto crudo falla por espacio, se bloquea igual', ()=>{
  resetStorage();globalThis.__store.set('motoredge_v4','{roto');
  const orig=localStorage.setItem;
  localStorage.setItem=(k,v)=>{if(k.startsWith('motoredge_v4_corrupt_')){const e=new Error('lleno');e.name='QuotaExceededError';throw e;}orig(k,v);};
  try{assert.deepEqual(ld().orders,[]);}finally{localStorage.setItem=orig;}
  assert.equal(escrituraBloqueada(),true);
  assert.equal(sd({orders:[]}),false);
});
```

- [ ] **Step 2:** `node --test tests/storage.test.mjs tests/storage-sin-espacio.test.mjs` → FAIL (`escrituraBloqueada` no existe).

- [ ] **Step 3: implementación** — reemplazar `core/storage.js:3-12` por:

```js
export const SK='motoredge_v4';
const VACIO=()=>({orders:[],egresos:[],precios:null,costos:null,productos:null});
// Modo protegido: si motoredge_v4 no parsea, se bloquea toda escritura para que el estado vacío que devuelve ld()
// nunca pise los datos. Solo restoreBackupPayload() y hardReset() lo levantan (desbloquearEscritura()).
let _bloqueado=false,_copiaHecha=false;
export function escrituraBloqueada(){return _bloqueado;}
export function desbloquearEscritura(){_bloqueado=false;try{document.getElementById('me-bloqueo')?.remove();}catch(e){}}
function sello(){const n=new Date(),p=x=>String(x).padStart(2,'0');return`${n.getFullYear()}${p(n.getMonth()+1)}${p(n.getDate())}-${p(n.getHours())}${p(n.getMinutes())}`;}
function avisoBloqueo(){
  try{
    if(!document.body||document.getElementById('me-bloqueo'))return;
    const el=document.createElement('div');el.id='me-bloqueo';
    el.style.cssText='position:fixed;top:0;left:0;right:0;z-index:99999;background:#c0392b;color:#fff;font:bold 13px/1.4 monospace;padding:10px 14px;text-align:center';
    el.textContent='⚠ Datos dañados — escrituras bloqueadas. Restaurá un backup desde Config';
    document.body.prepend(el);
  }catch(e){}
}
export function ld(){
  let r=null;
  try{r=localStorage.getItem(SK);if(r)return JSON.parse(r);}
  catch(e){
    if(r){
      _bloqueado=true;
      if(!_copiaHecha){_copiaHecha=true;try{localStorage.setItem(SK+'_corrupt_'+sello(),r);}catch(e2){/* sin espacio: se sigue igual */}}
      avisoBloqueo();
    }
  }
  return VACIO();
}
export function sd(d){
  if(_bloqueado){sN('⚠ Escrituras bloqueadas: datos dañados. Restaurá un backup desde Config',true);return false;}
  try{localStorage.setItem(SK,JSON.stringify(d));return true;}
  catch(e){if(e.name==='QuotaExceededError'||e.code===22)sN('⚠ Storage LLENO — exportá un backup JSON y borrá meses viejos desde Configuración',true);else sN('Error al guardar',true);return false;}
}
```

El aviso vive en el DOM (no se va solo); en tests `document.body` no existe → no hace nada.

- [ ] **Step 4:** mismos tests → PASS. Correr también `node --test "tests/**/*.test.mjs"` (los 9 de precios siguen verdes).
- [ ] **Step 5: Commit** `git add core/storage.js tests/storage.test.mjs tests/storage-sin-espacio.test.mjs tests/helpers/env.mjs` ·
  `git commit -m "feat: modo protegido en ld() y sd() que devuelve booleano (2.1)"`

### Task 2: Restaurar y hard reset levantan el bloqueo

**Files:** Modify `modules/backup.js:1,83` · `modules/io.js:532` · Test `tests/storage.test.mjs`

- [ ] **Step 1: tests que fallan** (agregar a `tests/storage.test.mjs`; `restoreBackupPayload` necesita `Blob`/`URL` solo si
  hay órdenes actuales — en estos tests el estado actual es vacío):

```js
import { restoreBackupPayload } from '../modules/backup.js';
test('restoreBackupPayload levanta el bloqueo y guarda', ()=>{
  globalThis.__store.clear();globalThis.__store.set('motoredge_v4','{roto');
  ld();assert.equal(escrituraBloqueada(),true);
  assert.equal(restoreBackupPayload({orders:[{id:'V-202611-0001'}],egresos:[],priceLog:[]}),1);
  assert.equal(escrituraBloqueada(),false);
  assert.equal(leer().orders[0].id,'V-202611-0001');
});
test('restoreBackupPayload lanza si el guardado falla (no informa éxito)', ()=>{
  resetStorage({orders:[],egresos:[]});
  const orig=localStorage.setItem;
  localStorage.setItem=(k,v)=>{if(k==='motoredge_v4'){const e=new Error('lleno');e.name='QuotaExceededError';throw e;}orig(k,v);};
  try{assert.throws(()=>restoreBackupPayload({orders:[{id:'V-1'}],egresos:[],priceLog:[]}),/No se pudo guardar/);}
  finally{localStorage.setItem=orig;}
});
```

- [ ] **Step 2:** `node --test tests/storage.test.mjs` → FAIL.
- [ ] **Step 3:** `modules/backup.js` línea 1 → `import { ld, sd, desbloquearEscritura } from '../core/storage.js';`; línea 83
  `sd(data);` →

```js
  desbloquearEscritura(); // restaurar es una de las dos salidas del modo protegido
  if(!sd(data))throw new Error('No se pudo guardar el backup restaurado (¿storage lleno?)');
```

  `modules/io.js`: importar `desbloquearEscritura` junto a `ld, sd` de `../core/storage.js`; en `hardReset()` tras
  `present.forEach(...removeItem...)` agregar `desbloquearEscritura();`.
- [ ] **Step 4:** tests → PASS.
- [ ] **Step 5: Commit** `git add modules/backup.js modules/io.js tests/storage.test.mjs` ·
  `git commit -m "feat: restaurar backup y hard reset levantan el modo protegido"`

### Task 3: Los flujos chequean el guardado (2.2)

**Files:** `modules/ventas.js:9-16,378` · `modules/ticket.js:381-382,409` · `modules/egresos.js:6,29` ·
`modules/inventario.js:431-442` · `modules/price-manager.js:115,521` · `modules/listas-precios.js:304` · Test `tests/guardado.test.mjs`

- [ ] **Step 1: tests que fallan** — `tests/guardado.test.mjs`:

```js
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
test('applyPriceAdjustment() → ok:false y sin entrada de log si no se guardó', ()=>{
  resetStorage({orders:[],egresos:[],priceLog:[],
    listasPrecios:[{id:'lp-a',nombre:'A',tramos:[{t:1,p:1000}]}],
    productos:[{id:'v-cal',nombre:'Calaveras',emoji:'💀',listaPrecioId:'lp-a',tramos:[],activo:true}]});
  const res=conSetItemRoto(()=>applyPriceAdjustment({listaIds:['lp-a'],pct:10}));
  assert.equal(res.ok,false);
  assert.equal(leer().priceLog.length,0);
  assert.equal(leer().listasPrecios[0].tramos[0].p,1000);
});
```

  (`confirmarOrden` con éxito llama a `rH()`/`rS()`, que tocan el DOM; por eso solo se prueba el camino de fallo, que
  corta antes. Si `rH()` rompe con los stubs en el camino feliz, no se prueba acá: lo cubre el navegador, Task 6.)

- [ ] **Step 2:** `node --test tests/guardado.test.mjs` → FAIL (`sO` devuelve `undefined`).
- [ ] **Step 3: implementación**

`modules/ventas.js:9`:
```js
export function sO(o){const d=ld();d.orders.push(o);const ok=sd(d);window.updateClientesDatalist?.();return ok;}
```
`modules/ventas.js` `confirmarOrden` (líneas 11-16):
```js
export function confirmarOrden(id){
  const d=ld();const o=(d.orders||[]).find(x=>x.id===id);if(!o)return false;
  o.estado='confirmada';o.fechaConfirmacion=new Date().toISOString();
  if(!sd(d))return false;
  window.rfM?.();rH();rS();window.renderDash?.();window.renderDashFlowChart?.();window.uhd?.();
  sN('✓ '+id+' — CONFIRMADA');
  return true;
}
```
`modules/ventas.js:378` `saveEditVenta`: `sd(d);window.rfM?.();…` → `if(!sd(d))return;window.rfM?.();…` (el modal queda
abierto con lo editado para reintentar).

`modules/ticket.js:381-382`: `sO({...});` → `if(!sO({...}))return; // no se guardó: no descontar stock ni mostrar éxito`
(el formulario queda lleno para reintentar). `modules/ticket.js:409`: `confirmarOrden(id);` →
`if(!confirmarOrden(id))return;`.

`modules/egresos.js:6`:
```js
export function sE(e){const d=ld();if(!d.egresos)d.egresos=[];d.egresos.push(e);return sd(d);}
```
`modules/egresos.js:29`: `sE(egreso);window.rfM?.();…` → `if(!sE(egreso))return;window.rfM?.();…`.

`modules/inventario.js:431-442` (`registrarIngreso`): hoy son dos escrituras (`saveLotes` y `saveIngreso`); si la
segunda falla queda un lote sin ingreso. Pasar a una sola:
```js
  // Lote + ingreso en un solo sd(): si falla, no queda un lote sin su ingreso
  const lotes=getLotes();
  if(!lotes[prod])lotes[prod]=[];
  const loteId=id+'-L1';
  lotes[prod].push({id:loteId,ingreso_id:id,fecha:ts,qty_inicial:qty,qty_restante:qty,
    costo_unitario:costo,proveedor:prov,nota});
  const ing={id,fecha:ts,fecha_display:d2s(fecha)+' '+ts.substring(11,16),
    prod_id:prod,qty,costo_unitario:costo,total:qty*costo,proveedor:prov,nota,lote_id:loteId};
  const d=ld();d.lotes=lotes;if(!d.ingresos)d.ingresos=[];d.ingresos.push(ing);
  if(!sd(d))return;
```
(`getLotes()` ya aplica sus defaults sobre `ld().lotes`; el id es nuevo, así que `push` equivale al find-or-replace de
`saveIngreso`.)

`modules/price-manager.js:115`: `sd(d); // atomic…` → `if(!sd(d))return{ok:false}; // atomic…`.
`modules/price-manager.js:521`: `sd(data);` → `if(!sd(data))return;`.
`modules/listas-precios.js:304`: `sd(d); // un solo write…` → `if(!sd(d))return; // un solo write…` (el modal queda
abierto).

- [ ] **Step 4:** `node --test "tests/**/*.test.mjs"` → todo PASS.
- [ ] **Step 5: Commit** rutas explícitas de los 7 archivos + `tests/guardado.test.mjs` ·
  `git commit -m "feat: los flujos principales no informan exito ni siguen si el guardado fallo (2.2)"`

### Task 4: Tests de IDs con Math.max tras eliminaciones

**Files:** Test `tests/ids.test.mjs` (sin cambios de código: ya usan `Math.max`; el test lo fija)

- [ ] **Step 1:**

```js
import { resetStorage } from './helpers/env.mjs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nId, nEId, newIngresoId, invNuevoId } from '../core/ids.js';
import { hoy, d2m } from '../core/formatters.js';

test('ventas y egresos: Math.max del mes, no conteo (hueco por eliminación)', ()=>{
  resetStorage({orders:[{id:'V-202611-0001'},{id:'V-202611-0005'},{id:'V-202610-0009'}],
    egresos:[{id:'E-202611-0003'}]});
  assert.equal(nId('202611'),'V-202611-0006');
  assert.equal(nId('202612'),'V-202612-0001');
  assert.equal(nEId('202611'),'E-202611-0004');
});
test('ingresos e inversiones: Math.max del mes', ()=>{
  const mes=d2m(hoy());
  resetStorage({orders:[],egresos:[],ingresos:[{id:`ING-${mes}-0002`},{id:`ING-${mes}-0007`}],
    inversiones:[{id:'I-202611-0004',mesActual:'202611'},{id:'I-202611-0001',mesActual:'202611'}]});
  assert.equal(newIngresoId(),`ING-${mes}-0008`);
  assert.equal(invNuevoId('202611'),'I-202611-0005');
});
```

- [ ] **Step 2:** `node --test tests/ids.test.mjs` → PASS directo (comportamiento existente). Verificar que el test
  detecta la regresión: cambiar temporalmente `nId` a conteo y ver FAIL; deshacer.
- [ ] **Step 3: Commit** `git add tests/ids.test.mjs` · `git commit -m "test: IDs con Math.max tras eliminaciones"`

### Task 5: `run-tests.bat`

- [ ] Crear `run-tests.bat`:

```bat
@echo off
cd /d "%~dp0"
node --test "tests/**/*.test.mjs"
pause
```

- [ ] Commit `git add run-tests.bat` · `git commit -m "feat: run-tests.bat"`

### Task 6: Build y prueba en navegador (datos de prueba)

- [ ] `build.bat` (o `powershell -NoProfile -ExecutionPolicy Bypass -File .\build.ps1`) → `node --check bundle.js`.
- [ ] Copiar `C:\Users\JET\Desktop\MOTOREDGE-ARCHIVO\backup_2026-08-13_1626.json` a la raíz (solo para probar).
- [ ] Servidor `python -m http.server 7432 --bind 127.0.0.1` en segundo plano.
- [ ] Script CDP `docs/handoffs/2026-11-24-cdp-prueba-etapa2.mjs` (basado en `…-cdp-prueba-ticket.mjs`), escenarios:
  1. Restaurar backup → generar ticket normal → orden pendiente creada, stock descontado → confirmar → `estado`
     `confirmada`.
  2. Storage lleno simulado: parchear `Storage.prototype.setItem` para tirar `QuotaExceededError` si la clave es
     `motoredge_v4` y el valor contiene el próximo `nId`; generar ticket → sin orden nueva, `d.stock` y `d.lotes`
     iguales a antes, `#tkOut` sin el id nuevo. Quitar el parche.
  3. Corrupto: `localStorage.setItem('motoredge_v4','{roto')` + reload → `#me-bloqueo` visible, existe una clave
     `motoredge_v4_corrupt_*`, `generarEgreso()` con datos válidos no cambia el texto crudo; `restoreBackupPayload(backup)`
     → `#me-bloqueo` desaparece, `gO().length>0`, un egreso nuevo se guarda.
  4. Sin excepciones en consola.
- [ ] Cortar el servidor (TaskStop), borrar la copia del backup de la raíz y el perfil temporal.

### Task 7: Documentación y push

- [ ] `CLAUDE.md`:
  - Invariante #1 → "`ld()` / `sd(d)`: únicas funciones para leer/escribir `motoredge_v4`. **Modo protegido:** si
    `ld()` no puede parsear, copia el texto crudo (una vez por carga) a `motoredge_v4_corrupt_<AAAAMMDD-HHMM>`, bloquea
    toda escritura y muestra un aviso fijo (`#me-bloqueo`). Con el bloqueo, `sd()` no escribe y devuelve `false`. Solo
    `restoreBackupPayload()` y `hardReset()` lo levantan (`desbloquearEscritura()`). Clave inexistente no es corrupción.
    **`sd()` devuelve `true`/`false`**: `generarTicket`, `confirmarOrden`, `saveEditVenta`, `generarEgreso`,
    `registrarIngreso`, `applyPriceAdjustment`, `restoreFromPriceLog` y el editor de listas cortan si es `false` (el
    mensaje lo da `sd()`). Un flujo nuevo que guarda debe chequearlo antes de efectos secundarios."
  - Tabla "Leer/escribir datos": `sd(d)` → "Guarda motoredge_v4; devuelve true/false"; agregar `escrituraBloqueada()` /
    `desbloquearEscritura()`.
  - "Claves separadas": `motoredge_v4_corrupt_<AAAAMMDD-HHMM>` — copia del texto crudo dañado; no se respalda ni se
    borra sola.
  - Tests: mencionar `run-tests.bat`.
- [ ] Pedir OK de push en una línea. Con OK:
  `powershell -NoProfile -ExecutionPolicy Bypass -File .\deploy.ps1 -Mensaje "feat: Etapa 2 robustez (modo protegido, sd booleano, tests)"`
  → `git rev-list --left-right --count HEAD...origin/main` = `0 0`.
- [ ] Actualizar el handoff / `/handoff` para la 3.2.
