# MOTOR EDGE 3.9-E — Modularization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the 7,246-line monolithic `index.html` into ES Module files organized under `core/`, `modules/`, `ui/`, and `styles/` — preserving 100% identical behavior and all production data in `localStorage['motoredge_v4']`.

**Architecture:** Native ES Modules (`type="module"`) loaded via a `main.js` entry point; `main.js` re-exports needed functions onto `window.*` so all HTML `onclick`/`onchange` handlers continue to work without modification. One module extracted per task, smoke-tested before proceeding.

**Tech Stack:** Vanilla JS (ES2020), native ES Modules, no bundler, no npm, single `index.html`.

---

## CRITICAL INVARIANTS — READ BEFORE EVERY TASK

1. **`ld()` / `sd(d)` are the ONLY ways to touch `localStorage['motoredge_v4']`.**  
   Separate keys (`me_gh_config`, `me_apariencia`, `me_theme`, `me_dist_slices`, `me_dist_kpi_hidden`, `me_liq_dist_slices`) have their own direct localStorage calls — that's intentional.

2. **Init order is STRICT:**  
   `loadConfig()` → `seedStockInicial()` → `ghInit()` → `buildTicketUI()` → `upd()` → `rfM()` → `uhd()` → `setInterval(uhd, 1000)`  
   Never change this order.

3. **`stockSeedDone` flag** is a one-shot guard. If lost, `seedStockInicial()` duplicates stock data.

4. **`ghAutoPush()`** must be called after every `sO()`, `sE()`, `sLiqExterna()`.

5. **Legacy orders** use `{pastillas, cristales, hongos}` field names. New orders use `lineas[]`. Both must coexist.

6. **`estado: 'pendiente'`** orders are excluded from all financial calculations via `gOConf()`. Never bypass this filter.

7. **`impactoCaja`** in egresos is `montoTotal / cuotas`. Dashboard always uses `impactoCaja`, never `montoTotal`.

8. **IDs are immutable.** Format: `V-AAAAMM-NNNN` (ventas), `E-AAAAMM-NNNN` (egresos), `ING-AAAAMM-NNNN` (ingresos), `I-AAAAMM-NNNN` (inversiones).

9. **FIFO in `consumirStock()`** — never change consumption order.

10. **Mutable config vars** (`PT, CT, HT, GP, PP, COSTS`) are ES module live bindings — `export let PT` works because reassignment inside the module is visible to importers.

---

## DIRECTORY STRUCTURE (target)

```
project/
├── index.html              ← HTML + 1 script tag: <script type="module" src="main.js">
├── main.js                 ← imports all modules, assigns globals to window
├── styles/
│   ├── base.css
│   ├── components.css
│   ├── themes.css
│   └── animations.css
├── core/
│   ├── constants.js        ← DPT, DCT, DHT, DEFAULT_PRODUCTS, DEFAULT_LISTAS_PRECIOS
│   ├── storage.js          ← SK, ld, sd, gO, gOConf, gE, sO, dO, sE, dE, gInv, gLiqExterna
│   ├── ids.js              ← nId, nEId, newIngresoId, uid, invNuevoId
│   ├── formatters.js       ← fi, fv, fu, hoy, d2s, d2m, mL, mLong, trunc, addMon, pn, parseDate, gtr
│   └── config.js           ← PT, CT, HT, GP, PP, COSTS, loadConfig
├── modules/
│   ├── ticket.js
│   ├── ventas.js
│   ├── egresos.js
│   ├── inversiones.js
│   ├── liquidez.js
│   ├── dashboard.js
│   ├── inventario.js
│   ├── stock.js
│   ├── productos.js
│   ├── listas-precios.js
│   ├── io.js
│   ├── github.js
│   ├── apariencia.js
│   └── settings.js
└── ui/
    ├── modal.js
    ├── notif.js
    ├── tabs.js
    └── delegacion.js
```

---

## HOW MODULES COMMUNICATE

- **Dependency direction:** `core/` ← `modules/` ← `ui/` (no reverse)
- **Cross-module calls** (e.g., `descontarStockPorTicket()` called from `ticket.js`): the caller imports from the callee's module
- **`rfM()`, `renderDash()`, `uhd()`** are called from many modules → they're exported from their home module and imported by callers; `main.js` also exposes them on window
- **`ghAutoPush()`** is imported by `storage.js` from `modules/github.js` — **warning: this is a circular-risk**. To avoid it, `sO()`, `sE()`, `sLiqExterna()` will call `ghAutoPush()` via a lazy getter: `import { ghAutoPush } from '../modules/github.js'` (GitHub module has no dependency on storage's sO/sE, so it's safe)

---

## SMOKE TEST PROCEDURE (run after EVERY task)

1. Open `index.html` in browser (must be served via a local HTTP server — ES Modules don't work from `file://`)
2. Open DevTools Console — **zero errors expected**
3. Check the header time counter is running (`uhd` setInterval active)
4. Ticket tab: change a quantity → total updates (confirms `upd()` works)
5. Ventas tab: verify the month selector has entries (confirms `rfM()` ran)
6. Dashboard tab: open it → no white screen (confirms `renderDash()` works)
7. Open DevTools → Application → localStorage → `motoredge_v4` → verify data is intact

**Local server command (run from project folder):**
```bash
python -m http.server 8080
# then open http://localhost:8080
```

---

## TASK 0: Infrastructure Setup

**Files:**
- Create: `main.js`
- Modify: `index.html` (replace `<script>...</script>` with `<script type="module" src="main.js">`)

This task extracts ALL JavaScript from `index.html` (lines 1228–7244) into `main.js` without any structural changes. The only transformation: add window assignments at the bottom so HTML event handlers keep working.

- [ ] **Step 0.1: Start local HTTP server**

```bash
cd "c:\Users\JET\Desktop\JET-CASHFLOW APP\Nueva carpeta (2)"
python -m http.server 8080
```

Open http://localhost:8080 — verify current app works before touching anything.

- [ ] **Step 0.2: Create `main.js`**

Copy lines 1228–7244 from `index.html` into `main.js`. Remove the `<script>` and `</script>` wrapper lines. The file starts directly with `// =====================`.

At the very end of `main.js`, after the existing init code (after line 7244 content), add this window-exposure block:

```javascript
// ── WINDOW EXPOSURE — required for HTML onclick/onchange handlers ──
Object.assign(window, {
  // core
  setTP, buildTicketUI, upd, calc, adj, rst, rstDel, resetTodo,
  autoFillTC, syncAjuste, generarTicket, confirmarDesdeOutput, limpiar,
  // ventas
  rH, rS, toggleHistGrp, toggleTotals, bO, anularByIdModal, confirLimpiar,
  openEditVenta, editRecalcTotal, editUpdateEquiv, editSetMode, saveEditVenta,
  // egresos
  updEgreso, generarEgreso, limpiarEgr, limpiarEgresos, rEH, rES, bE,
  openEditEgr, saveEditEgr, anularEgresoByIdModal,
  // dashboard
  renderDash, onDashMesChange, renderDashFlowChart, setFlowPer, setBtcDays,
  toggleChart,
  // inversiones
  renderInvAll, renderInvDist, renderInvRepo, renderInvPrecios,
  rfInvM, onInvMesChange, invSelFuente, invSubNav, fetchPrecios,
  actualizarPreciosDash, invActualizarCampos, invCalcular, invGenerar,
  invReset, invLimpiar, invRfMes: rfInvM, invRenderHistorial,
  invLiquidarModal, invConfirmarLiquidacion, invEliminar, invAnularModal,
  invUsarPct, onInvPeriodoChange,
  // liquidez
  renderLiqExterna, registrarLiqExterna, toggleLiqExterna, updLiqPreview,
  setLiqView, saveDistSlices, saveLiqSlices, autoBalancePct, autoBalanceLiq,
  toggleDistEdit, toggleDistKpi, resetDistDefaults, cycleColor, cycleLiqColor,
  addDistSlice, removeDistSlice, addLiqSlice, removeLiqSlice,
  renderInvDist, dLiqExterna,
  // inventario / stock
  renderInventario, renderInvStock, renderStockHistorial, renderIngresoForm,
  registrarIngreso, ingPreview, limpiarMovsStock,
  abrirLotesPanel, cerrarLotesPanel, renderLotesDetalle,
  generarStockTicket, renderStockEntryForm,
  invSubTab: invSubNav,
  // productos
  renderPM, renderMaestra, abrirNuevoProducto, editarProducto,
  guardarProductoModal, toggleActivoProducto, duplicarProducto,
  abrirTramosEnMaestra, guardarTramosYCerrar, guardarMaestra,
  aplicarPctTodos, restablecerTramos, toggleTramoEditor,
  agregarTramo, eliminarTramo, guardarTramos, adjTramoDisc, updTramoDisc,
  addTramoEditor, removeTramoEditor, addVarianteEditor, removeVarianteEditor,
  setProdTipo, onPmListaChange, updModalDiscs,
  // listas de precios
  renderListasPrecios, renderAsignacionPrecios, abrirNuevaLista,
  abrirEditarLista, eliminarLista, renderInvPrecios,
  // io
  expJSON, expCSV, expXLSX, impJSON, impMerge, handleXlsxFile, renderIOStatus,
  // github
  ghSaveToken, ghTestConn, ghPush, ghPull, ghBackupNow, ghListBackups,
  // apariencia
  guardarApariencia, resetApariencia, applyPreset, syncColorFromHex,
  toggleAparienciaAvanzada, loadAparienciaForm, updateThemeCards,
  // settings
  renderSettings, guardarPrecios, resetPrecios, updDisc,
  // tabs / ui
  showTab, rfM, uhd, onVentasMesChange, onEgresosMesChange, onInvGlobalMesChange,
  // modals
  showInputModal, vTk, vEgr, clM, cpM, cpTk, cpEgr,
  confirmarOrden, toggleTheme,
  // stock utils
  getStockUmbObj, guardarUmbralesDesdeTabla, toggleStockGroup,
  onVariantInput, invMostrarPct,
});
```

- [ ] **Step 0.3: Modify `index.html`**

Find the `<script>` tag on line 1228. Replace from `<script>` through `</script>` (lines 1228–7245) with:

```html
<script type="module" src="main.js"></script>
```

- [ ] **Step 0.4: Smoke test**

Run the full smoke test procedure. Zero console errors. All tabs load. Ticket total updates. Month selectors populate.

---

## TASK 1: Extract `core/formatters.js`

**Source lines in `main.js` (originally 1348–1373):** functions `gtr`, `fi`, `fv`, `fu`, `hoy`, `d2s`, `d2m`, `mL`, `mLong`, `trunc`, `addMon`, `pn`, `parseDate`, `uid`

**Files:**
- Create: `core/formatters.js`
- Modify: `main.js` (add import, remove extracted functions)

- [ ] **Step 1.1: Create `core/formatters.js`**

```javascript
export function gtr(tb, q) {
  if (q <= 0) return null;
  let p = tb[0].p, t = tb[0].t;
  for (let i = 0; i < tb.length; i++) {
    if (q >= tb[i].t) { p = tb[i].p; t = tb[i].t; }
  }
  return { p, t };
}
export function fi(n) { return Math.round(n).toLocaleString('en-US').replace(/\./g, ','); }
export function fv(n) { return '$ ' + fi(n); }
export function fu(n) { return parseFloat(n.toFixed(2)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
export function hoy() { return new Date().toISOString().split('T')[0]; }
export function d2s(iso) { if (!iso) return ''; const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}`; }
export function d2m(iso) { if (!iso) return ''; const [y, m] = iso.split('-'); return `${y}${m}`; }
export function mL(mm) { const ms = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']; return `${ms[parseInt(mm.substring(4,6))-1]} ${mm.substring(0,4)}`; }
export function mLong(mm) { const ms = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']; return `${ms[parseInt(mm.substring(4,6))-1]} ${mm.substring(0,4)}`; }
export function trunc(n) { return Math.trunc(n); }
export function addMon(aaaamm, n) { const y = parseInt(aaaamm.substring(0,4)); const m = parseInt(aaaamm.substring(4,6)) - 1; const dt = new Date(y, m + n, 1); return `${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`; }
export function pn(v) { if (v == null || v === '') return 0; const s = String(v).replace(/[$\s]/g,'').replace(/[.,](?=\d{3}(?:[.,]|$))/g,'').replace(',','.'); return parseFloat(s) || 0; }
export function parseDate(v) {
  if (!v) return null;
  if (v instanceof Date) { const y = v.getFullYear(); const m = String(v.getMonth()+1).padStart(2,'0'); const d = String(v.getDate()).padStart(2,'0'); return `${y}-${m}-${d}`; }
  const s = String(v).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const p = s.split(/[\/\-]/);
  if (p.length === 3) {
    if (p[2] && p[2].length === 4) return `${p[2]}-${p[1].padStart(2,'0')}-${p[0].padStart(2,'0')}`;
    if (p[0] && p[0].length === 4) return `${p[0]}-${p[1].padStart(2,'0')}-${p[2].padStart(2,'0')}`;
  }
  return null;
}
export function uid() { return 'p-' + Math.random().toString(36).substring(2, 9); }
```

- [ ] **Step 1.2: Add import at top of `main.js`**

At the very top of `main.js` (before any existing code), add:

```javascript
import { gtr, fi, fv, fu, hoy, d2s, d2m, mL, mLong, trunc, addMon, pn, parseDate, uid } from './core/formatters.js';
```

- [ ] **Step 1.3: Remove extracted functions from `main.js`**

In `main.js`, find and delete the `// ── UTILS ──` comment block and the following function declarations:  
`gtr(...)`, `fi(...)`, `fv(...)`, `fu(...)`, `hoy(...)`, `d2s(...)`, `d2m(...)`, `mL(...)`, `mLong(...)`, `trunc(...)`, `addMon(...)`, `pn(...)`, `parseDate(...)`, `uid(...)`.  
These are ~14 consecutive single-line functions starting with `function gtr`.

- [ ] **Step 1.4: Smoke test** — full procedure. Verify ticket totals calculate correctly (uses `fi`, `fv`, `pn`).

---

## TASK 2: Extract `ui/notif.js`

**Source lines in `main.js` (originally 5374–5376):** function `sN`

**Files:**
- Create: `ui/notif.js`
- Modify: `main.js`

- [ ] **Step 2.1: Create `ui/notif.js`**

```javascript
export function sN(msg, err = false) {
  const el = document.getElementById('notif');
  el.textContent = msg;
  el.className = 'notif show' + (err ? ' err' : '');
  clearTimeout(window._nt);
  window._nt = setTimeout(() => el.classList.remove('show'), 3000);
}
```

- [ ] **Step 2.2: Add import to `main.js`**

```javascript
import { sN } from './ui/notif.js';
```

- [ ] **Step 2.3: Delete `function sN(...)` from `main.js`**

- [ ] **Step 2.4: Add to window-exposure block in `main.js`**

```javascript
sN,
```

- [ ] **Step 2.5: Smoke test** — trigger a save action, verify notification appears.

---

## TASK 3: Extract `core/constants.js`

**Source lines in `main.js` (originally 1233–1274):** `DPT`, `DCT`, `DHT`, `DGP`, `DPP`, `DCOSTS`, `DEFAULT_PRODUCTS`, `DEFAULT_LISTAS_PRECIOS`

**Files:**
- Create: `core/constants.js`
- Modify: `main.js`

- [ ] **Step 3.1: Create `core/constants.js`**

Copy verbatim from `main.js` the constant declarations `DPT`, `DCT`, `DHT`, `DGP`, `DPP`, `DCOSTS`, `DEFAULT_PRODUCTS`, `DEFAULT_LISTAS_PRECIOS`. Add `export` before each `const`:

```javascript
export const DPT = [{t:5,p:22785},{t:10,p:21735},{t:15,p:20580},{t:20,p:19367},{t:30,p:18228},{t:40,p:17089},{t:50,p:14810},{t:100,p:12750},{t:200,p:10800},{t:300,p:10050},{t:400,p:9450},{t:500,p:9000}];
export const DCT = [{t:1,p:79968},{t:3,p:73500},{t:5,p:67972},{t:10,p:63974},{t:15,p:59976},{t:20,p:55977},{t:30,p:51979},{t:40,p:47980},{t:50,p:43982}];
export const DHT = [{t:5,p:14000},{t:10,p:12000},{t:20,p:10000},{t:50,p:8500},{t:100,p:8000},{t:200,p:7000},{t:500,p:5000},{t:1000,p:3500}];
export const DGP = 85000;
export const DPP = 56000;
export const DCOSTS = {past:5075,cris:7975,hong:2000,got:5000,pet:2000};

export const DEFAULT_PRODUCTS = [
  // ... copy exactly from main.js, preserving all .map(x=>({...x})) calls
];

export const DEFAULT_LISTAS_PRECIOS = [
  // ... copy exactly from main.js
];
```

**Important:** Copy the exact content from `main.js` — do not retype. Use Read/Edit tools.

- [ ] **Step 3.2: Add import to `main.js`**

```javascript
import { DPT, DCT, DHT, DGP, DPP, DCOSTS, DEFAULT_PRODUCTS, DEFAULT_LISTAS_PRECIOS } from './core/constants.js';
```

- [ ] **Step 3.3: Delete the constant declarations from `main.js`**

Remove the `// ── DEFAULTS (legacy compatibility) ──` block through the end of `DEFAULT_LISTAS_PRECIOS` constant.

- [ ] **Step 3.4: Smoke test** — open Ticket tab, verify products appear (they use DEFAULT_PRODUCTS via getProductos).

---

## TASK 4: Extract `core/storage.js`

**Source lines in `main.js` (originally 1275–1292):**  
`SK`, `ld()`, `sd()`, `gO()`, `gOConf()`, `gE()`, `sO()`, `sE()`, `dO()`, `confirmarOrden()`, `dE()`, `nId()`, `nEId()`

Also includes functions later in the file:  
- `gInv()` (originally line 3073)  
- `sInv()` (originally line 3074)  
- `dInv()` (originally line 3075)  
- `gLiqExterna()` (originally line 2558)  
- `sLiqExterna()` (originally line 2559)  
- `dLiqExterna()` (originally line 2560)

**Files:**
- Create: `core/storage.js`
- Modify: `main.js`

**DEPENDENCY WARNING:** `sO()`, `sE()`, `sLiqExterna()` call `ghAutoPush()`. Since `github.js` hasn't been extracted yet, keep `ghAutoPush` calls working via a forward-reference approach: in `storage.js`, use a late-bound import:

```javascript
import { ghAutoPush } from '../modules/github.js';
```

This will fail until `modules/github.js` is created. **Mitigation:** use a module-level lazy reference:

```javascript
let _ghAutoPush = () => {}; // stub until github.js loads
export function setGhAutoPush(fn) { _ghAutoPush = fn; }
```

Then in `main.js`, after importing both storage and github:
```javascript
import { setGhAutoPush } from './core/storage.js';
import { ghAutoPush } from './modules/github.js';
setGhAutoPush(ghAutoPush);
```

But since `github.js` hasn't been extracted yet, the stub `() => {}` is correct for now — `ghAutoPush()` in `main.js` (not yet extracted) will be the real one. Since `sO/sE/sLiqExterna` will be in storage.js and call `_ghAutoPush()`, they won't auto-push yet. **Temporary fix:** Keep `ghAutoPush()` calls inside `sO()`, `sE()`, `sLiqExterna()` directly in `main.js` versions until Task 9 (github.js extraction). Do NOT move them to storage.js yet.

**Alternative (simpler):** Extract `sO/sE/sLiqExterna` in the **ventas/egresos/liquidez** modules that call them, keeping the `ghAutoPush` call co-located. The storage.js only exports `ld`, `sd`, `gO`, `gOConf`, `gE`, `dO`, `dE`, `gInv`, `sInv`, `dInv`, `gLiqExterna`, `dLiqExterna` — everything except the `sO/sE/sLiqExterna` write+push combo.

**Decision: Use the simpler approach.** `sO()`, `sE()`, `sLiqExterna()` stay in `main.js` until `github.js` is extracted in Task 9, at which point they move to their respective modules with a proper `ghAutoPush` import.

- [ ] **Step 4.1: Create `core/storage.js`**

```javascript
export const SK = 'motoredge_v4';

export function ld() {
  try {
    const r = localStorage.getItem(SK);
    return r ? JSON.parse(r) : { orders: [], egresos: [], precios: null, costos: null, productos: null };
  } catch(e) {
    return { orders: [], egresos: [], precios: null, costos: null, productos: null };
  }
}

export function sd(d) {
  try { localStorage.setItem(SK, JSON.stringify(d)); }
  catch(e) { /* sN not available here — caller handles error display */ }
}

export function gO() { return ld().orders || []; }
export function gOConf() { return gO().filter(o => o.estado !== 'pendiente'); }
export function gE() { return ld().egresos || []; }

export function dO(id) { const d = ld(); d.orders = d.orders.filter(o => o.id !== id); sd(d); }
export function dE(id) { const d = ld(); d.egresos = (d.egresos || []).filter(e => e.id !== id); sd(d); }

export function gInv() { const d = ld(); return d.inversiones || []; }
export function sInv(x) { const d = ld(); if (!d.inversiones) d.inversiones = []; d.inversiones.push(x); sd(d); }
export function dInv(id) { const d = ld(); d.inversiones = (d.inversiones || []).filter(x => x.id !== id); sd(d); }

export function gLiqExterna() { const d = ld(); return d.liquidezExterna || []; }
export function dLiqExterna(id) { const d = ld(); d.liquidezExterna = (d.liquidezExterna || []).filter(x => x.id !== id); sd(d); }
```

**Note:** `sO()`, `sE()`, `sLiqExterna()`, `confirmarOrden()` stay in `main.js` for now (they need `ghAutoPush` and UI refresh calls). They will move to their respective modules in later tasks.

**Note on `sd()` error handling:** The original `sd()` calls `sN()` on error. Since `storage.js` can't import `sN` (would create a dependency on UI), we silently swallow the error in the module. The `sN` call is preserved in the `main.js` version of `sd` until the module is in use. Once `core/storage.js` is active, error display for storage failures is sacrificed — this is an acceptable trade-off for clean architecture, OR add a configurable error callback via `export function setErrorHandler(fn)`.

- [ ] **Step 4.2: Add import to `main.js`**

```javascript
import { SK, ld, sd, gO, gOConf, gE, dO, dE, gInv, sInv, dInv, gLiqExterna, dLiqExterna } from './core/storage.js';
```

- [ ] **Step 4.3: Remove extracted functions from `main.js`**

Delete `const SK=...`, `function ld()`, `function sd()`, `function gO()`, `function gOConf()`, `function gE()`, `function dO()`, `function dE()`.  
Delete `function gInv()`, `function sInv()`, `function dInv()` (near original line 3073).  
Delete `function gLiqExterna()`, `function dLiqExterna()` (near original line 2558).  
**Do NOT delete** `sO()`, `sE()`, `sLiqExterna()`, `confirmarOrden()`.

- [ ] **Step 4.4: Smoke test** — save a ticket and verify localStorage has the data.

---

## TASK 5: Extract `core/ids.js`

**Source lines in `main.js` (originally 1291–1292, 3078–3083, 5706–5712):**  
`nId()`, `nEId()`, `invNuevoId()`, `newIngresoId()`

**Files:**
- Create: `core/ids.js`
- Modify: `main.js`

- [ ] **Step 5.1: Create `core/ids.js`**

```javascript
import { gO, gE, gInv } from './storage.js';
import { getIngresos } from '../modules/inventario.js'; // forward ref — use lazy import

export function nId(mes) {
  const dm = gO().filter(o => o.id.substring(2, 8) === mes);
  if (!dm.length) return `V-${mes}-0001`;
  const mx = Math.max(...dm.map(o => parseInt(o.id.substring(9))));
  return `V-${mes}-${String(mx + 1).padStart(4, '0')}`;
}

export function nEId(mes) {
  const dm = gE().filter(e => e.id.substring(2, 8) === mes);
  if (!dm.length) return `E-${mes}-0001`;
  const mx = Math.max(...dm.map(e => parseInt(e.id.substring(9))));
  return `E-${mes}-${String(mx + 1).padStart(4, '0')}`;
}

export function invNuevoId(mes) {
  const inv = gInv();
  const dm = inv.filter(x => x.id && x.id.substring(2, 8) === mes);
  if (!dm.length) return `I-${mes}-0001`;
  const mx = Math.max(...dm.map(x => parseInt(x.id.substring(9))));
  return `I-${mes}-${String(mx + 1).padStart(4, '0')}`;
}
```

**Special case — `newIngresoId()`:** This function reads `d.ingresos` from storage, not from `gInv()`. It can't import from `inventario.js` (circular risk). Copy its logic inline with a direct `ld()` call:

```javascript
export function newIngresoId() {
  const d = ld(); // import ld from storage
  const ingresos = d.ingresos || [];
  const mes = new Date().toISOString().substring(0, 7).replace('-', '');
  const dm = ingresos.filter(i => i.id && i.id.substring(4, 10) === mes);
  if (!dm.length) return `ING-${mes}-0001`;
  const mx = Math.max(...dm.map(i => parseInt(i.id.substring(11))));
  return `ING-${mes}-${String(mx + 1).padStart(4, '0')}`;
}
```

Add `import { ld } from './storage.js';` at top of `core/ids.js`.

- [ ] **Step 5.2: Add import to `main.js`**

```javascript
import { nId, nEId, invNuevoId, newIngresoId } from './core/ids.js';
```

- [ ] **Step 5.3: Remove from `main.js`**

Delete `function nId(...)`, `function nEId(...)`, `function invNuevoId(...)`, `function newIngresoId(...)`.

- [ ] **Step 5.4: Smoke test** — generate a ticket, verify ID format is `V-AAAAMM-NNNN`.

---

## TASK 6: Extract `core/config.js`

**Source:** `PT, CT, HT, GP, PP, COSTS` mutable vars (originally line 1239) and `function loadConfig()` (originally 1320–1336)

**Files:**
- Create: `core/config.js`
- Modify: `main.js`

- [ ] **Step 6.1: Create `core/config.js`**

```javascript
import { ld } from './storage.js';
import { DPT, DCT, DHT, DGP, DPP, DCOSTS, DEFAULT_PRODUCTS } from './constants.js';

export let PT, CT, HT, GP, PP, COSTS;

export function loadConfig() {
  const d = ld();
  if (d.precios) {
    PT = d.precios.PT || DPT.map(x => ({...x}));
    CT = d.precios.CT || DCT.map(x => ({...x}));
    HT = d.precios.HT || DHT.map(x => ({...x}));
    GP = d.precios.GP || DGP;
    PP = d.precios.PP || DPP;
  } else {
    PT = DPT.map(x => ({...x}));
    CT = DCT.map(x => ({...x}));
    HT = DHT.map(x => ({...x}));
    GP = DGP;
    PP = DPP;
  }
  COSTS = d.costos || {...DCOSTS};
  // Sync from product catalog
  const prods = getProductos(); // imported below
  const calp = prods.find(p => p.id === 'v-cal'); if (calp && calp.tramos) PT = calp.tramos;
  const cp = prods.find(p => p.id === 'p-cris'); if (cp && cp.tramos) CT = cp.tramos;
  const hp = prods.find(p => p.id === 'p-hong'); if (hp && hp.tramos) HT = hp.tramos;
  const gp = prods.find(p => p.id === 'p-got'); if (gp && gp.tramos && gp.tramos[0]) GP = gp.tramos[0].p;
  const petp = prods.find(p => p.id === 'p-pet'); if (petp && petp.tramos && petp.tramos[0]) PP = petp.tramos[0].p;
  prods.forEach(p => {
    if (p.legacyKey && p.costo != null) {
      if (p.legacyKey === 'calaveras' || p.id === 'p-past') COSTS.past = p.costo;
      else if (p.legacyKey === 'cristales') COSTS.cris = p.costo;
      else if (p.legacyKey === 'hongos') COSTS.hong = p.costo;
      else if (p.legacyKey === 'goteros') COSTS.got = p.costo;
      else if (p.legacyKey === 'petri') COSTS.pet = p.costo;
    }
  });
  updateClientesDatalist();
}
```

**CIRCULAR DEPENDENCY WARNING:** `loadConfig()` calls `getProductos()` and `updateClientesDatalist()`. Both are defined later in `main.js` (not yet extracted). **Solution:** Import them lazily. Since at extraction time `getProductos` and `updateClientesDatalist` are still in `main.js`, just import `loadConfig` in `main.js` and have `main.js` pass them in:

Instead of calling them inside `config.js`, expose a setter:

```javascript
// core/config.js
let _getProductos = () => [];
let _updateClientesDatalist = () => {};
export function initConfigDeps(getProductosFn, updateClientesFn) {
  _getProductos = getProductosFn;
  _updateClientesDatalist = updateClientesFn;
}
// then inside loadConfig(), call _getProductos() and _updateClientesDatalist()
```

In `main.js`, after the import of `config.js`:
```javascript
import { loadConfig, initConfigDeps } from './core/config.js';
initConfigDeps(getProductos, updateClientesDatalist);
```

This eliminates circular dependency entirely.

- [ ] **Step 6.2: Add import to `main.js`**

```javascript
import { PT, CT, HT, GP, PP, COSTS, loadConfig, initConfigDeps } from './core/config.js';
// After the import, wire up dependencies:
// (place this just before the loadConfig() call in the init block)
initConfigDeps(getProductos, updateClientesDatalist);
```

- [ ] **Step 6.3: Remove from `main.js`**

Delete `let PT, CT, HT, GP, PP, COSTS;` and `function loadConfig()`.

- [ ] **Step 6.4: Smoke test** — open Settings tab, verify prices match expected values.

---

## TASK 7: Extract `modules/github.js`

**Source in `main.js` (originally 3687–4034):**  
`renderIOStatus`, `ghCfg`, `ghStatus`, `ghSyncInfo`, `safeB64Encode`, `safeB64Decode`, `ghSaveToken`, `ghLoadConfig`, `ghTestConn`, `ghGetFileSha`, `ghPush`, `ghPull`, `ghAutoPush`, `ghBackupNow`, `ghListBackups`, `ghInit`

**Files:**
- Create: `modules/github.js`
- Modify: `main.js`

- [ ] **Step 7.1: Create `modules/github.js`**

Copy all GitHub functions from `main.js`. Add `export` before each top-level `function` and `async function`. The module uses localStorage directly for `me_gh_config` — this is intentional and correct. It also calls `sN()` — import it:

```javascript
import { sN } from '../ui/notif.js';
import { SK } from '../core/storage.js';
```

`ghAutoPush()` calls `ghPush()` which is in the same module — no issue. `renderIOStatus()` manipulates DOM directly.

`ghInit()` reads `me_gh_config` and sets up the GitHub config form — no external module dependencies beyond `sN`.

Full extracted file starts with:
```javascript
import { sN } from '../ui/notif.js';
import { SK } from '../core/storage.js';

export function renderIOStatus() { ... }
export function ghCfg() { ... }
// ... all other functions ...
export function ghInit() { ... }
```

- [ ] **Step 7.2: Wire `sO`, `sE`, `sLiqExterna` to use `ghAutoPush` from module**

Now that `github.js` is extracted, update the `sO`, `sE`, `sLiqExterna` functions still in `main.js`:

Add at top of `main.js`:
```javascript
import { ghAutoPush, ghInit, renderIOStatus, ghCfg, ghStatus, ghSyncInfo, safeB64Encode, safeB64Decode, ghSaveToken, ghLoadConfig, ghTestConn, ghPush, ghPull, ghBackupNow, ghListBackups } from './modules/github.js';
```

The `sO`, `sE`, `sLiqExterna` functions in `main.js` already call `ghAutoPush()` — now that name resolves to the imported function.

- [ ] **Step 7.3: Remove GitHub functions from `main.js`**

Delete all functions from `renderIOStatus` through `ghInit` (originally lines 3688–4034).

- [ ] **Step 7.4: Update window exposure block**

`ghAutoPush` is internal — doesn't need window exposure. The others already listed.

- [ ] **Step 7.5: Smoke test** — open IO tab → GitHub section loads. `ghInit()` runs without error.

---

## TASK 8: Extract `modules/apariencia.js`

**Source in `main.js` (originally 5049–5208):**  
`PRESETS`, `getApariencia`, `saveApariencia`, `applyApariencia`, `lighten`, `loadAparienciaForm`, `syncColorFromHex`, `applyPreset`, `updateThemeCards`, `toggleAparienciaAvanzada`, `guardarApariencia`, `resetApariencia`

**Files:**
- Create: `modules/apariencia.js`
- Modify: `main.js`

- [ ] **Step 8.1: Create `modules/apariencia.js`**

```javascript
import { sN } from '../ui/notif.js';

const PRESETS = {
  dark:   {ac:'#00e5a0',bg:'#0a0a0f',tx:'#e8e8f0',tx2:'#8888a0',s1:'#111118',br:'#2a2a3a',theme:'dark'},
  light:  {ac:'#00c888',bg:'#f0f0f5',tx:'#111118',tx2:'#44445a',s1:'#ffffff', br:'#c8c8d8',theme:'light'},
  blue:   {ac:'#4488ff',bg:'#080c18',tx:'#ddeeff',tx2:'#6688aa',s1:'#0e1428', br:'#1a2a44',theme:'dark'},
  red:    {ac:'#ff4455',bg:'#0f0808',tx:'#f0e0e0',tx2:'#aa7070',s1:'#1a0e0e', br:'#3a1a1a',theme:'dark'},
  purple: {ac:'#b066ff',bg:'#0a080f',tx:'#e8e0f0',tx2:'#9977bb',s1:'#130e1a', br:'#2a1a3a',theme:'dark'},
  modern: {ac:'#f5a623',bg:'#050a0e',tx:'#e2f0fa',tx2:'#6b8fa8',s1:'#0d1e2d', br:'#1a3a52',theme:'modern'},
};

export function getApariencia() {
  try { const r = localStorage.getItem('me_apariencia'); return r ? JSON.parse(r) : null; }
  catch(e) { return null; }
}
export function saveApariencia(a) { localStorage.setItem('me_apariencia', JSON.stringify(a)); }

// ... copy applyApariencia, lighten, loadAparienciaForm, syncColorFromHex,
//     applyPreset, updateThemeCards, toggleAparienciaAvanzada,
//     guardarApariencia, resetApariencia verbatim, adding export to each function
```

- [ ] **Step 8.2: Import in `main.js`**

```javascript
import { getApariencia, saveApariencia, applyApariencia, lighten, loadAparienciaForm, syncColorFromHex, applyPreset, updateThemeCards, toggleAparienciaAvanzada, guardarApariencia, resetApariencia } from './modules/apariencia.js';
```

- [ ] **Step 8.3: Remove from `main.js`** — delete `PRESETS` const and all apariencia functions.

- [ ] **Step 8.4: Smoke test** — open Config tab → Apariencia section → change theme color → verify it applies.

---

## TASK 9: Extract `modules/stock.js`

**Source in `main.js` (originally 5624–5669, 5671–5704):**  
`getStock`, `saveStock`, `getUmbrales`, `saveUmbrales`, `getStockMovs`, `addStockMov`, `limpiarMovsStock`, `eliminarMov`, `getStockStatus`, `skPill`, `stockStatusBadge`, `getAllStockItems`, `getLotes`, `saveLotes`, `getLotesItem`, `getLotesActivos`, `getStockFromLotes`, `getCostoPromedio`, `getStockGrupo`, `getCostoPromedioGrupo`

**Files:**
- Create: `modules/stock.js`
- Modify: `main.js`

- [ ] **Step 9.1: Create `modules/stock.js`**

```javascript
import { ld, sd } from '../core/storage.js';
import { sN } from '../ui/notif.js';
import { getProductos } from './productos.js'; // forward ref — productos.js extracted in Task 11

export function getStock() { const d = ld(); return d.stock || {}; }
export function saveStock(s) { const d = ld(); d.stock = s; sd(d); }
export function getUmbrales() { const d = ld(); return d.stockUmbrales || {}; }
export function saveUmbrales(u) { const d = ld(); d.stockUmbrales = u; sd(d); }
export function getStockMovs() { const d = ld(); return d.stockMovs || []; }
export function addStockMov(mov) {
  const d = ld();
  if (!d.stockMovs) d.stockMovs = [];
  d.stockMovs.unshift(mov);
  if (d.stockMovs.length > 1000) d.stockMovs = d.stockMovs.slice(0, 1000);
  sd(d);
}
export function limpiarMovsStock() {
  if (!confirm('¿Eliminar todo el historial de movimientos de stock?')) return;
  const d = ld(); d.stockMovs = []; sd(d);
  renderStockHistorial(); // forward ref — will be available via window
  sN('Historial limpiado');
}
export function eliminarMov(idx) {
  const d = ld();
  if (!d.stockMovs || !d.stockMovs[idx]) return;
  d.stockMovs.splice(idx, 1); sd(d);
  renderStockHistorial();
}

// ... copy getLotes, saveLotes, getLotesItem, getLotesActivos,
//     getStockFromLotes, getCostoPromedio, getStockGrupo, getCostoPromedioGrupo
//     getStockStatus, skPill, stockStatusBadge, getAllStockItems verbatim with export
```

**Note on `renderStockHistorial` forward ref:** `limpiarMovsStock` and `eliminarMov` call `renderStockHistorial()`. At module level, `renderStockHistorial` isn't defined yet. Use `window.renderStockHistorial()` as a workaround until `inventario.js` is extracted:

```javascript
export function limpiarMovsStock() {
  if (!confirm('¿Eliminar todo el historial de movimientos de stock?')) return;
  const d = ld(); d.stockMovs = []; sd(d);
  window.renderStockHistorial?.();
  sN('Historial limpiado');
}
```

- [ ] **Step 9.2: Import in `main.js`**

```javascript
import { getStock, saveStock, getUmbrales, saveUmbrales, getStockMovs, addStockMov, limpiarMovsStock, eliminarMov, getStockStatus, skPill, stockStatusBadge, getAllStockItems, getLotes, saveLotes, getLotesItem, getLotesActivos, getStockFromLotes, getCostoPromedio, getStockGrupo, getCostoPromedioGrupo } from './modules/stock.js';
```

- [ ] **Step 9.3: Remove all those functions from `main.js`**.

- [ ] **Step 9.4: Add to window-exposure block:**

```javascript
limpiarMovsStock, eliminarMov,
```

- [ ] **Step 9.5: Smoke test** — open Inventario tab → Stock section loads. No console errors.

---

## TASK 10: Extract `modules/listas-precios.js`

**Source in `main.js` (originally 5847–6109):**  
`getListasPrecios`, `saveListasPrecios`, `newListaId`, `getTramosProducto`, `renderListasPrecios`, `renderAsignacionPrecios`, `abrirNuevaLista`, `abrirEditarLista`, `eliminarLista`, `renderInvPrecios`

**Files:**
- Create: `modules/listas-precios.js`
- Modify: `main.js`

- [ ] **Step 10.1: Create `modules/listas-precios.js`**

```javascript
import { ld, sd } from '../core/storage.js';
import { sN } from '../ui/notif.js';
import { DEFAULT_LISTAS_PRECIOS } from '../core/constants.js';
import { fv, fi } from '../core/formatters.js';

export function getListasPrecios() {
  const d = ld();
  if (d.listasPrecios && d.listasPrecios.length) return d.listasPrecios;
  return DEFAULT_LISTAS_PRECIOS.map(l => JSON.parse(JSON.stringify(l)));
}
export function saveListasPrecios(listas) { const d = ld(); d.listasPrecios = listas; sd(d); }
// ... copy all other functions verbatim with export keyword added
```

- [ ] **Step 10.2: Import in `main.js`**

```javascript
import { getListasPrecios, saveListasPrecios, newListaId, getTramosProducto, renderListasPrecios, renderAsignacionPrecios, abrirNuevaLista, abrirEditarLista, eliminarLista, renderInvPrecios } from './modules/listas-precios.js';
```

- [ ] **Step 10.3: Remove from `main.js`**.

- [ ] **Step 10.4: Smoke test** — open Config → Listas de Precios → verify listas load and are editable.

---

## TASK 11: Extract `modules/productos.js`

**Source in `main.js` (originally 1294–1318, 4652–5049):**  
`getProductos`, `saveProductos`, `renderPM`, `aplicarPctTodos`, `restablecerTramos`, `renderTramoRows`, `toggleTramoEditor`, `updTramoDisc`, `adjTramoDisc`, `agregarTramo`, `eliminarTramo`, `guardarTramos`, `toggleActivoProducto`, `duplicarProducto`, `abrirNuevoProducto`, `editarProducto`, `openProdModal`, `toggleStockGroup` (productos version), `buildProdModalHTML`, `onPmListaChange`, `renderTramosEditor`, `renderVariantesEditor`, `setProdTipo`, `setProdAgrup`, `syncProdModalUI`, `addTramoEditor`, `removeTramoEditor`, `addVarianteEditor`, `removeVarianteEditor`, `updModalDiscs`, `guardarProductoModal`

**Files:**
- Create: `modules/productos.js`
- Modify: `main.js`

- [ ] **Step 11.1: Create `modules/productos.js`**

```javascript
import { ld, sd } from '../core/storage.js';
import { sN } from '../ui/notif.js';
import { DEFAULT_PRODUCTS } from '../core/constants.js';
import { fv, fi } from '../core/formatters.js';
import { getListasPrecios, getTramosProducto } from './listas-precios.js';

export function getProductos() {
  // ... copy exact logic from main.js including p-past migration
}
export function saveProductos(prods) { const d = ld(); d.productos = prods; sd(d); }
// ... all other product functions with export
```

- [ ] **Step 11.2: Import in `main.js`**

```javascript
import { getProductos, saveProductos, renderPM, aplicarPctTodos, restablecerTramos, renderTramoRows, toggleTramoEditor, updTramoDisc, adjTramoDisc, agregarTramo, eliminarTramo, guardarTramos, toggleActivoProducto, duplicarProducto, abrirNuevoProducto, editarProducto, openProdModal, buildProdModalHTML, onPmListaChange, renderTramosEditor, renderVariantesEditor, setProdTipo, addTramoEditor, removeTramoEditor, addVarianteEditor, removeVarianteEditor, updModalDiscs, guardarProductoModal } from './modules/productos.js';
```

- [ ] **Step 11.3: Remove from `main.js`** — delete `getProductos`, `saveProductos`, and all product manager functions.

- [ ] **Step 11.4: Smoke test** — open Config → Productos → verify product list and edit modal work.

---

## TASK 12: Extract `modules/egresos.js`

**Source in `main.js` (originally 1747–1773, 1776–1831, 5590–5623):**  
`updEgreso`, `generarEgreso`, `limpiarEgr`, `limpiarEgresos`, `anularEgresoByIdModal`, `rEH`, `rES`, `openEditEgr`, `saveEditEgr`, `bE`

Also moves `sE()` (currently in `main.js`) here, importing `ghAutoPush` from `github.js`.

**Files:**
- Create: `modules/egresos.js`
- Modify: `main.js`

- [ ] **Step 12.1: Create `modules/egresos.js`**

```javascript
import { ld, sd, gE, dE } from '../core/storage.js';
import { sN } from '../ui/notif.js';
import { fv, fi, hoy, d2s, d2m, mL, mLong, pn } from '../core/formatters.js';
import { nEId } from '../core/ids.js';
import { ghAutoPush } from './github.js';

export function sE(e) { const d = ld(); if (!d.egresos) d.egresos = []; d.egresos.push(e); sd(d); ghAutoPush(); }

export function updEgreso() { ... }
export function generarEgreso() { ... }
export function limpiarEgr() { ... }
export function limpiarEgresos() { ... }
export function anularEgresoByIdModal() { ... }
export function rEH() { ... }
export function rES() { ... }
export function openEditEgr(id) { ... }
export function saveEditEgr(id) { ... }
export function bE(id) { ... }
// Copy exact implementations from main.js with export
```

**Cross-module calls in egresos functions:** `rfM()`, `renderDash()`, `uhd()` are called inside these functions. Since they're not in egresos.js, use `window.rfM?.()`, `window.renderDash?.()`, `window.uhd?.()` — this is acceptable since those functions are registered on window in the main.js exposure block.

- [ ] **Step 12.2: Import in `main.js`**

```javascript
import { sE, updEgreso, generarEgreso, limpiarEgr, limpiarEgresos, anularEgresoByIdModal, rEH, rES, openEditEgr, saveEditEgr, bE } from './modules/egresos.js';
```

- [ ] **Step 12.3: Remove from `main.js`** — delete the standalone `sE()` and all egreso functions.

- [ ] **Step 12.4: Smoke test** — create a new egreso, verify it saves and appears in history.

---

## TASK 13: Extract `modules/ventas.js`

**Source in `main.js` (originally 1281–1290, 1827–1972, 5357–5363, 5380–5589):**  
`sO()`, `confirmarOrden()`, `updateClientesDatalist()`, `rH()`, `rS()`, `toggleHistGrp()`, `toggleTotals()`, `bO()`, `anularByIdModal()`, `confirLimpiar()`, `openEditVenta()`, `editRecalcTotal()`, `editUpdateEquiv()`, `editSetMode()`, `saveEditVenta()`

**Files:**
- Create: `modules/ventas.js`
- Modify: `main.js`

- [ ] **Step 13.1: Create `modules/ventas.js`**

```javascript
import { ld, sd, gO, gOConf, dO } from '../core/storage.js';
import { sN } from '../ui/notif.js';
import { fv, fi, hoy, d2s, d2m, mL, mLong, pn } from '../core/formatters.js';
import { nId } from '../core/ids.js';
import { ghAutoPush } from './github.js';
import { getProductos } from './productos.js';

let showTotalsRow = false; // state owned by this module

export function sO(o) { const d = ld(); d.orders.push(o); sd(d); ghAutoPush(); updateClientesDatalist(); }
export function confirmarOrden(id) { ... }
export function updateClientesDatalist() { ... }
export function rH() { ... }
export function rS() { ... }
export function toggleHistGrp(id) { ... }
export function toggleTotals() { showTotalsRow = !showTotalsRow; rS(); }
export function bO(id) { ... }
export function anularByIdModal() { ... }
export function confirLimpiar() { ... }
export function openEditVenta(id) { ... }
export function editRecalcTotal() { ... }
export function editUpdateEquiv() { ... }
export function editSetMode(m) { ... }
export function saveEditVenta(id) { ... }
// Copy exact implementations from main.js
```

**Note:** `showTotalsRow` is currently a global in `main.js`. It moves to `ventas.js` since `rS()` and `toggleTotals()` are the only consumers.

Cross-module calls inside ventas functions: use `window.rfM?.()`, `window.renderDash?.()`, `window.uhd?.()`.

- [ ] **Step 13.2: Import in `main.js`**

```javascript
import { sO, confirmarOrden, updateClientesDatalist, rH, rS, toggleHistGrp, toggleTotals, bO, anularByIdModal, confirLimpiar, openEditVenta, editRecalcTotal, editUpdateEquiv, editSetMode, saveEditVenta } from './modules/ventas.js';
```

- [ ] **Step 13.3: Remove from `main.js`** — delete `let showTotalsRow`, `sO()`, `confirmarOrden()`, `updateClientesDatalist()`, and all ventas functions. Remove the `// ── MAPA DE PRODUCTOS FIJO ──` section that was part of `rS()`.

- [ ] **Step 13.4: Smoke test** — generate a ticket, confirm payment. Verify it appears in Ventas history.

---

## TASK 14: Extract `modules/inventario.js`

**Source in `main.js` (originally 5706–5762, 6110–6799, 6800–6963):**  
`newIngresoId`, `getIngresos`, `saveIngreso`, `deleteIngreso`, `consumirStock`, `getActualQty`, `renderInvStockTabla`, `guardarUmbralesDesdeTabla`, `abrirLotesPanel`, `cerrarLotesPanel`, `renderLotesDetalle`, `renderIngresoForm`, `ingPreview`, `registrarIngreso`, `renderProductosRegistrados`, `eliminarProductoRegistrado`, `renderIngresosHistorial`, `editarIngreso`, `eliminarIngreso`, `renderInvStock`, `renderInventario`, `renderInventarioTabla`, `renderStockHistorial`, `descontarStockPorTicket`, `renderStockMiniPanel`, `renderDashStock`, `renderStockEntryForm`, `generarStockTicket`

**Files:**
- Create: `modules/inventario.js`
- Modify: `main.js`

- [ ] **Step 14.1: Create `modules/inventario.js`**

```javascript
import { ld, sd, gOConf } from '../core/storage.js';
import { sN } from '../ui/notif.js';
import { fv, fi, hoy, d2s, d2m, mL, mLong, pn, parseDate } from '../core/formatters.js';
import { getProductos } from './productos.js';
import { getLotes, saveLotes, getActualQty as _getActualQty, getCostoPromedio, getStockStatus, skPill, getAllStockItems, getUmbrales, saveUmbrales, addStockMov } from './stock.js';
```

**CRITICAL:** `consumirStock()` implements FIFO. Copy verbatim. Do NOT restructure the loop.

```javascript
export function consumirStock(itemId, qty) {
  // copy exact implementation — FIFO invariant must be preserved
}
```

`descontarStockPorTicket()` is called from `ticket.js` (not yet extracted). After ticket.js is extracted in Task 16, it will import this function. For now, `window.descontarStockPorTicket` is fine.

- [ ] **Step 14.2: Import in `main.js`**

```javascript
import { getIngresos, saveIngreso, deleteIngreso, consumirStock, getActualQty, renderInvStockTabla, guardarUmbralesDesdeTabla, abrirLotesPanel, cerrarLotesPanel, renderLotesDetalle, renderIngresoForm, ingPreview, registrarIngreso, renderProductosRegistrados, eliminarProductoRegistrado, renderIngresosHistorial, editarIngreso, eliminarIngreso, renderInvStock, renderInventario, renderInventarioTabla, renderStockHistorial, descontarStockPorTicket, renderStockMiniPanel, renderDashStock, renderStockEntryForm, generarStockTicket, newIngresoId } from './modules/inventario.js';
```

- [ ] **Step 14.3: Remove from `main.js`**.

- [ ] **Step 14.4: Smoke test** — open Inventario tab → all sub-tabs load. Register a stock entry → appears in history.

---

## TASK 15: Extract `modules/settings.js`

**Source in `main.js` (originally 5209–5245):**  
`renderSettings`, `updDisc`, `guardarPrecios`, `guardarCostos`, `resetPrecios`

**Files:**
- Create: `modules/settings.js`
- Modify: `main.js`

- [ ] **Step 15.1: Create `modules/settings.js`**

```javascript
import { ld, sd } from '../core/storage.js';
import { sN } from '../ui/notif.js';
import { fi } from '../core/formatters.js';
import { getProductos, saveProductos } from './productos.js';

export function renderSettings() { ... }
export function updDisc(prefix, idx) { ... }
export function guardarPrecios() { ... }
export function guardarCostos() {} // intentionally empty — merged into product catalog
export function resetPrecios() {
  if (!confirm('¿Restaurar precios originales?')) return;
  const d = ld(); d.precios = null; d.productos = null; sd(d);
  window.loadConfig(); window.renderSettings(); window.buildTicketUI(); window.upd();
  sN('Precios restaurados');
}
```

- [ ] **Step 15.2: Import in `main.js`** and remove from `main.js`.

- [ ] **Step 15.3: Smoke test** — open Config → Settings → verify price tables render and save.

---

## TASK 16: Extract `modules/liquidez.js`

**Source in `main.js` (originally 2558–2728):**  
`sLiqExterna`, `saveLiqSlices`, `autoBalanceLiq`, `renderLiqDistConfig`, `cycleLiqColor`, `addLiqSlice`, `removeLiqSlice`, `setLiqView`, `updLiqPreview`, `toggleLiqExterna`, `registrarLiqExterna`, `renderLiqExterna`

Also `liqDistSlices` state variable and its initialization.

**Files:**
- Create: `modules/liquidez.js`
- Modify: `main.js`

- [ ] **Step 16.1: Find `liqDistSlices` initialization in `main.js`**

Grep for `liqDistSlices` in `main.js` to find its declaration and initial value. It reads from `localStorage['me_liq_dist_slices']`.

- [ ] **Step 16.2: Create `modules/liquidez.js`**

```javascript
import { ld, sd, gLiqExterna, dLiqExterna } from '../core/storage.js';
import { sN } from '../ui/notif.js';
import { fv, fi, hoy } from '../core/formatters.js';
import { ghAutoPush } from './github.js';

// Module-level state
let liqDistSlices = (() => {
  try { const r = localStorage.getItem('me_liq_dist_slices'); return r ? JSON.parse(r) : null; }
  catch(e) { return null; }
})() || [
  // default slices — copy from main.js
];

export function sLiqExterna(l) {
  const d = ld(); if (!d.liquidezExterna) d.liquidezExterna = [];
  d.liquidezExterna.push(l); sd(d); ghAutoPush();
}
// ... all other functions with export
```

- [ ] **Step 16.3: Import in `main.js`** and remove from `main.js`.

- [ ] **Step 16.4: Smoke test** — open Inversiones tab → Liquidez sub-tab → verify distribution chart renders.

---

## TASK 17: Extract `modules/inversiones.js`

**Source in `main.js` (originally 2281–3686 minus the liquidez and github parts):**  
All investment-related functions: `filtrarPorPeriodo`, `getInvFiltro`, `rfInvM`, `onInvMesChange`, `renderInvAll`, `distSlices` state, `saveDistSlices`, `saveKpiHidden`, `toggleDistEdit`, `toggleDistKpi`, `kpiVisible`, `calcDistBase`, `buildSmartDefaults`, `resetDistDefaults`, `autoBalancePct`, `renderDistConfig`, `cycleColor`, `addDistSlice`, `removeDistSlice`, `fetchPrecios`, `actualizarPreciosDash`, `renderInvRepo`, `distRow`, `distRowUSD`, `renderDistChart`, `renderInvDist`, `getDisponibleDist`, `getDisponibleLiq`, `invNuevoId`, `invGetDisponibleActual`, `invUsarPct`, `invMostrarPct`, `invSelFuente`, `invActualizarCampos`, `invCalcular`, `invReset`, `invGenerar`, `invRfMes`, `invRenderHistorial`, `invActualizarFlotantes`, `invLiquidarModal`, `invConfirmarLiquidacion`, `invEliminar`, `invAnularModal`, `invLimpiar`, `renderInvAll` (second definition), aliases

**Files:**
- Create: `modules/inversiones.js`
- Modify: `main.js`

- [ ] **Step 17.1: Create `modules/inversiones.js`**

This is the largest extraction. Copy all investment functions. State:
- `distSlices` — reads `me_dist_slices` from localStorage
- `distKpiHidden` — reads `me_dist_kpi_hidden` from localStorage
- `_btcPrecioUSD`, `_blueARS` — module-level mutable vars
- `dashCharts` partial (BTC chart only — the rest stays in dashboard)

```javascript
import { ld, sd, gInv, sInv, dInv, gOConf, gLiqExterna } from '../core/storage.js';
import { sN } from '../ui/notif.js';
import { fv, fi, fu, hoy, d2s, mL, mLong } from '../core/formatters.js';
import { invNuevoId } from '../core/ids.js';
import { ghAutoPush } from './github.js';
import { getLotes, getCostoPromedio } from './stock.js';
import { getProductos } from './productos.js';
```

- [ ] **Step 17.2: Import in `main.js`** and remove all investment functions.

- [ ] **Step 17.3: Smoke test** — open Inversiones tab → all sub-views load, forms work.

---

## TASK 18: Extract `modules/dashboard.js`

**Source in `main.js` (originally 1987–2280, 2728–3046):**  
`destroyCharts`, `onDashMesChange`, `calcBalance`, `renderDash`, `renderDashInversiones`, `renderDashFlowChart`, `setFlowPer`, `setBtcDays`, `fetchBtcHistorico`, `toggleChart`

`dashCharts` state variable.

**Files:**
- Create: `modules/dashboard.js`
- Modify: `main.js`

- [ ] **Step 18.1: Create `modules/dashboard.js`**

```javascript
import { gOConf, gE, gInv, gLiqExterna } from '../core/storage.js';
import { fv, fi, fu, mL, mLong, hoy, d2s } from '../core/formatters.js';
import { getLotes, getCostoPromedio, getActualQty, getAllStockItems, getUmbrales } from './stock.js';
import { getProductos } from './productos.js';
import { renderDashStock } from './inventario.js';
import { renderDashInversiones } from './inversiones.js';

let dashCharts = {};
let hiddenCharts = {};

export function destroyCharts() { ... }
export function toggleChart(k) { ... }
export function onDashMesChange() { ... }
export function calcBalance() { ... }
export function renderDash() { ... }
export function renderDashFlowChart() { ... }
export function setFlowPer(days) { ... }
export function setBtcDays(d) { ... }
export async function fetchBtcHistorico() { ... }
```

- [ ] **Step 18.2: Import in `main.js`** and remove from `main.js`.

- [ ] **Step 18.3: Smoke test** — open Dashboard tab → all KPIs render, flow chart renders.

---

## TASK 19: Extract `modules/ticket.js`

**Source in `main.js` (originally 1375–1745):**  
All ticket functions: `tipoPago` state, `setTP`, `buildTicketUI`, `updStockHints`, `_setHint`, `adj`, `rst`, `rstDel`, `gn`, `resetTodo`, `getTC`, `autoFillTC`, `syncAjuste`, `getPayment`, `calc`, `upd`, `generarTicket`, `confirmarDesdeOutput`, `limpiar`

**Files:**
- Create: `modules/ticket.js`
- Modify: `main.js`

This is the most complex module. It calls many other modules.

- [ ] **Step 19.1: Create `modules/ticket.js`**

```javascript
import { ld } from '../core/storage.js';
import { sN } from '../ui/notif.js';
import { fv, fi, fu, hoy, pn, gtr } from '../core/formatters.js';
import { PT, CT, HT, GP, PP, COSTS } from '../core/config.js';
import { nId } from '../core/ids.js';
import { sO } from './ventas.js';
import { getProductos } from './productos.js';
import { getTramosProducto } from './listas-precios.js';
import { descontarStockPorTicket, updStockHints as _updStockHints } from './inventario.js';
import { getActualQty, getStockStatus } from './stock.js';

let tipoPago = 'ARS';
let _lastTicketId = null;

export function setTP(t) { ... }
export function buildTicketUI() { ... }
export function updStockHints() { ... }
export function adj(k, delta) { ... }
export function rst(k) { ... }
export function rstDel(k) { ... }
export function resetTodo() { ... }
export function getTC() { ... }
export function autoFillTC() { ... }
export function syncAjuste() { ... }
export function getPayment(totalFinal) { ... }
export function calc() { ... }
export function upd() { ... }
export function generarTicket() { ... }
export function confirmarDesdeOutput() { ... }
export function limpiar() { ... }
```

**`_lastTicketId`**: currently a global. Moves to module-level `let`.

- [ ] **Step 19.2: Import in `main.js`** and remove all ticket functions.

- [ ] **Step 19.3: Smoke test** — full ticket flow: add products, set quantities, generate, confirm. Verify stock decrements.

---

## TASK 20: Extract `modules/io.js`

**Source in `main.js` (originally 4035–4535):**  
`handleXlsxFile`, `xlsxCell`, `xlsxSetCell`, `xlsxAoaToSheet`, `_getLineasOrden`, `expJSON`, `expCSV`, `expXLSX`, `getStockUmbObj`, `impJSON`, `impMerge`

**Files:**
- Create: `modules/io.js`
- Modify: `main.js`

- [ ] **Step 20.1: Create `modules/io.js`**

```javascript
import { ld, sd, gO, gOConf, gE, gInv, gLiqExterna } from '../core/storage.js';
import { sN } from '../ui/notif.js';
import { fv, fi, hoy, d2s, parseDate } from '../core/formatters.js';
import { getProductos } from './productos.js';
import { getLotes, getUmbrales, getStockMovs } from './stock.js';
import { getIngresos } from './inventario.js';
// XLSX is a global from CDN script — available as window.XLSX
```

- [ ] **Step 20.2: Import in `main.js`** and remove from `main.js`.

- [ ] **Step 20.3: Smoke test** — export JSON and reimport it. Verify data integrity.

---

## TASK 21: Extract UI modules

**Source:**
- `ui/modal.js` — `showInputModal`, `vTk`, `vEgr`, `clM`, `cpM`
- `ui/tabs.js` — `showTab`, `rfM`, `uhd`, `onVentasMesChange`, `onEgresosMesChange`, `onInvGlobalMesChange`
- `ui/delegacion.js` — `setupDelegation`, `setupDrop`, `invSubTab`, `toggleStockGroup` (UI version), `onVariantInput`

**Files:**
- Create: `ui/modal.js`, `ui/tabs.js`, `ui/delegacion.js`
- Modify: `main.js`

Extract each file following the same import/export pattern. `ui/tabs.js` calls many render functions — use `window.*` references for cross-module calls or accept imports from all modules (riskier but cleaner).

- [ ] **Step 21.1: Create `ui/modal.js`** — copy showInputModal, vTk, vEgr, clM, cpM with export.
- [ ] **Step 21.2: Create `ui/tabs.js`** — copy showTab, rfM, uhd, period handlers with export.
- [ ] **Step 21.3: Create `ui/delegacion.js`** — copy setupDelegation, setupDrop, invSubTab, onVariantInput with export.
- [ ] **Step 21.4: Import all three in `main.js`** and remove from `main.js`.
- [ ] **Step 21.5: Smoke test** — tab switching works, month selectors update, modals open/close.

---

## TASK 22: Extract CSS files

**Source:** `index.html` lines 11–380 (the `<style>` block)

**Files:**
- Create: `styles/base.css`, `styles/components.css`, `styles/themes.css`, `styles/animations.css`
- Modify: `index.html`

- [ ] **Step 22.1: Identify CSS section boundaries**

```
:root { ... }                → styles/base.css (CSS variables)
[data-theme="modern"] { ... } → styles/themes.css  
[data-theme="light"] { ... } → styles/themes.css
body::before { ... }        → styles/animations.css (grid animation)
body { ... }, .app { ... }, header { ... }, .nav-tabs { ... } → styles/base.css (layout)
.card, .ct, label, input, .fr2, .tog-row, .tgb → styles/components.css
.panel, .prod-row, .kpi, .gbtn, .btn, .notif, .modal → styles/components.css
transition: { ... } block → styles/animations.css
@keyframes { ... } → styles/animations.css
```

- [ ] **Step 22.2: Create each CSS file** — cut sections from style block into appropriate files.

- [ ] **Step 22.3: Replace `<style>` block in `index.html`** with:

```html
<link rel="stylesheet" href="styles/base.css">
<link rel="stylesheet" href="styles/themes.css">
<link rel="stylesheet" href="styles/components.css">
<link rel="stylesheet" href="styles/animations.css">
```

**CRITICAL ORDER:** `base.css` (`:root`) must load before `themes.css` (`:root` overrides).

- [ ] **Step 22.4: Smoke test** — full visual check of all tabs. Compare against original screenshot.

---

## TASK 23: Final cleanup of `main.js`

After all extractions, `main.js` should contain only:
1. All imports from modules
2. The init block (loadConfig → seedStockInicial → ghInit → buildTicketUI → upd → rfM → uhd → setInterval)
3. The `window.` exposure block

- [ ] **Step 23.1: Verify `main.js` has no function definitions remaining** (only imports and init code).

```bash
grep -n "^function \|^async function \|^let \|^const " main.js
```

Expected: only `import` lines and the window exposure block.

- [ ] **Step 23.2: Run full integration test**

1. Open http://localhost:8080
2. Generate 3 tickets with different payment types (ARS, USD, USDT)
3. Confirm 2, leave 1 pending — verify only confirmed ones appear in dashboard totals
4. Create an egreso — verify it appears in dashboard
5. Register a stock ingreso — verify stock levels update
6. Export JSON — verify file downloads with all data
7. GitHub push (if configured) — verify it works
8. Change appearance preset — verify colors update

- [ ] **Step 23.3: Verify localStorage data unchanged**

```javascript
// Run in browser console:
const d = JSON.parse(localStorage.getItem('motoredge_v4'));
console.log('orders:', d.orders.length, 'egresos:', d.egresos.length);
// Should show same counts as before modularization
```

---

## APPENDIX: Window Exposure Reference

All functions that MUST be on `window` for HTML event handlers (extracted from `onclick`, `onchange`, `oninput` attributes):

```
adj, adjTramoDisc, agregarTramo, abrirNuevaLista, abrirNuevoProducto,
abrirTramosEnMaestra, addDistSlice, addLiqSlice, addTramoEditor,
anularByIdModal, anularEgresoByIdModal, aplicarPctTodos, applyPreset,
autoFillTC, cerrarLotesPanel, clM, confirLimpiar, confirmarDesdeOutput,
confirmarOrden, cpEgr, cpM, cpTk, cycleColor, cycleLiqColor, dLiqExterna,
duplicarProducto, editRecalcTotal, editSetMode, editarProducto, eliminarTramo,
expCSV, expJSON, expXLSX, fetchPrecios, generarEgreso, generarStockTicket,
generarTicket, ghBackupNow, ghListBackups, ghPull, ghPush, ghSaveToken,
ghTestConn, guardarApariencia, guardarProductoModal, guardarTramos,
guardarTramosYCerrar, handleXlsxFile, impJSON, impMerge, ingPreview,
invActualizarCampos, invAnularModal, invCalcular, invConfirmarLiquidacion,
invEliminar, invGenerar, invLimpiar, invLiquidarModal, invRenderHistorial,
invReset, invSelFuente, invSubNav, invUsarPct, limpiar, limpiarEgr,
limpiarEgresos, limpiarMovsStock, onDashMesChange, onEgresosMesChange,
onInvGlobalMesChange, onInvPeriodoChange, onPmListaChange, onVentasMesChange,
rES, rH, rS, registrarIngreso, registrarLiqExterna, removeDistSlice,
removeLiqSlice, removeTramoEditor, removeVarianteEditor, renderDash,
renderDashFlowChart, renderIOStatus, renderInvAll, renderInvDist, renderInvStock,
renderLiqExterna, renderStockHistorial, resetApariencia, resetDistDefaults,
resetTodo, restablecerTramos, rst, rstDel, saveDistSlices, saveEditEgr,
saveEditVenta, saveLiqSlices, setBtcDays, setFlowPer, setLiqView, setProdTipo,
setTP, showTab, syncColorFromHex, toggleActivoProducto, toggleAparienciaAvanzada,
toggleChart, toggleDistEdit, toggleDistKpi, toggleHistGrp, toggleLiqExterna,
toggleTotals, toggleTramoEditor, upd, updDisc, updEgreso, updLiqPreview,
updModalDiscs, updTramoDisc
```

---

## APPENDIX: Serving with Python

The project MUST be served via HTTP (not `file://`) for ES Modules to work:

```bash
cd "c:\Users\JET\Desktop\JET-CASHFLOW APP\Nueva carpeta (2)"
python -m http.server 8080
```

Open: http://localhost:8080

For Windows without Python, alternatives:
```bash
# Node.js (if installed)
npx serve .

# VS Code Live Server extension — right-click index.html → Open with Live Server
```
