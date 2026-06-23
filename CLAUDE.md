# MOTOR EDGE 3.9-E — Guía para Claude

Sistema de gestión financiera personal (ventas, egresos, inversiones, inventario).
SPA vanilla JS sin framework, sin bundler externo, sin backend.

---

## ⚠️ Reglas para agentes — GitHub repos

### Arquitectura de dos repos

| Repo | Visibilidad | Contenido |
|---|---|---|
| `fungiabduction-ui/cashflow` | 🌍 Público | Solo código fuente. NUNCA datos financieros. |
| `fungiabduction-ui/motoredge-data` | 🔒 Privado | `datos.json` + `backups/` — sincronización de la app. |
| `fungiabduction-ui/calculadora` | 🌍 Público | Calculadora pública (GitHub Pages). Recibe `precios.json` via `ghSyncCalc()` desde MotorEdge. |

**`datos.json` y `backups/` están en `.gitignore` del repo `cashflow`.** No los agregues nunca al repo público.

**NUNCA hacer commits con datos financieros en `cashflow`.** Si aparece `datos.json` en `git status`, ignorarlo — está correctamente excluido por `.gitignore`.

### Credenciales GitHub

- Usuario/Org: `fungiabduction-ui`
- Email git: `jetdatalog@gmail.com`
- Personal Access Token: leerlo desde `token github.txt` (en raíz del proyecto, gitignored).
  Si no existe, pedirle al usuario — va a `github.com/settings/tokens`
  **Formato del archivo** (tiene etiquetas, el token está en línea 2):
  ```
  GitHub Token (Personal Access Token)
  ghp_xxxxxxxxxxxxxxxxxxxx
  
  Usuario / Repo
  fungiabduction-ui/cashflow
  BACKUP
  fungiabduction-ui/motoredge-data
  
  Archivo de datos
  datos.json
  ```
  Para leerlo correctamente en PowerShell: `(Get-Content "token github.txt")[1].Trim()`

### Verificación de sincronía local ↔ GitHub
```powershell
git fetch origin main
git log HEAD..origin/main --oneline   # commits en remoto que no están en local
git log origin/main..HEAD --oneline   # commits en local que no están en remoto
```
La rama local se llama `clean-main`, el remoto es `origin/main`. Verificado en sync al 2026-06-20 (commit `5a4c5bf`).

### Workflow para agentes que hacen cambios en código fuente

```powershell
# 1. Leer token
$TOKEN = (Get-Content "token github.txt" -Raw).Trim()

# 2. Editar archivos fuente en core/, modules/, ui/, styles/

# 3. Regenerar bundle
.\build.bat

# 4. Commit y push
git add .
git commit -m "descripción del cambio"
git push "https://$TOKEN@github.com/fungiabduction-ui/cashflow.git" main
```

Si el repo local no está inicializado (primera vez en una máquina nueva):
```powershell
$TOKEN = (Get-Content "token github.txt" -Raw).Trim()
git init
git config user.email "jetdatalog@gmail.com"
git config user.name "JET"
git remote add origin "https://$TOKEN@github.com/fungiabduction-ui/cashflow.git"
git fetch origin main
git checkout -b main --track origin/main
# Ya tenés el código fuente descargado. Editá y hacé push normalmente.
```

### PIN gate de la app

Bloque `<!-- ══ PIN GATE ══ -->` en `index.html`. Se ejecuta antes de que cargue la app. **No tocar ni remover ese bloque.**

**Cómo funciona:**
- **Primera vez** (sin PIN guardado): el usuario ingresa 4 dígitos → se guardan como su PIN. No hay verificación previa — los 4 números que eligió quedan establecidos.
- **Usos siguientes**: ingresa 4 dígitos → se hashean → se comparan con el hash guardado → si coinciden, entra.
- **Sesión de 24h**: al entrar, guarda `localStorage['me_pin_s']` con timestamp+24h. Mientras la sesión sea válida, no pide PIN al recargar.

**Dónde vive el PIN (localStorage del navegador):**
- `me_pin_h` — hash del PIN (función: `btoa('me39e' + PIN + 'jet')` invertido)
- `me_pin_s` — timestamp de expiración de sesión (Date.now() + 86400000)

**Resetear PIN olvidado:** DevTools → Application → LocalStorage → borrar `me_pin_h`. La próxima apertura pide elegir PIN nuevo.

**El PIN gate está en el repo local Y en GitHub** — son el mismo archivo `index.html`. Cualquier cambio en código fuente requiere correr `build.bat` y hacer push. Para usar la app localmente, basta con abrir `index.html` directo (o via `serve.bat`).

---

## Qué es

App de un solo usuario que corre en el navegador. Gestiona:
- **Ventas** con ticket generado, soporte ARS/USD/USDT/MIX
- **Egresos** en cuotas con impacto mensual
- **Inversiones** (BTC, USD Blue, USDT, ARS) con seguimiento de flotante
- **Inventario FIFO** por lotes con costo promedio ponderado
- **Dashboard** con balance multimoneda y cash flow chart
- **Contactos** con trazabilidad completa: historial de compras, stats, datos de contacto
- **Sincronización GitHub** como backup en la nube

Datos reales de producción en `localStorage['motoredge_v4']`. Un error silencioso puede corromper historial financiero completo.

---

## Stack técnico

- HTML + CSS + JS vanilla. Sin React, sin Vue, sin npm.
- ES Modules nativos (`type="module"`) durante desarrollo.
- `bundle.js` generado por `build.bat` para abrir con `file://` sin servidor.
- Chart.js y SheetJS (XLSX) cargados desde CDN en `index.html`.
- Python `http.server` via `serve.bat` para desarrollo con módulos.

---

## Estructura de archivos

```
/
├── index.html          ← HTML puro + 4 link CSS + <script src="bundle.js">
├── main.js             ← Entry point: 23 imports + init block + window exposure
├── bundle.js           ← Generado por build.bat (NO editar directamente)
├── build.bat           ← Regenera bundle.js desde los módulos fuente
├── serve.bat           ← Servidor local Python en puerto 8080
│
├── core/
│   ├── constants.js    ← DPT, DCT, DHT, DGP, DPP, DCOSTS, DEFAULT_PRODUCTS, DEFAULT_LISTAS_PRECIOS
│   ├── storage.js      ← ld(), sd(), gO(), gOConf(), gE(), gInv(), gLiqExterna() y deletes
│   ├── ids.js          ← nId(), nEId(), newIngresoId(), invNuevoId()
│   ├── formatters.js   ← fi(), fv(), fu(), hoy(), d2s(), d2m(), mL(), mLong(), pn(), gtr(), parseDate()
│   └── config.js       ← PT, CT, HT, GP, PP, COSTS (live bindings) + loadConfig() + initConfigDeps()
│
├── modules/
│   ├── ticket.js       ← Motor del ticket: calc(), upd(), generarTicket(), buildTicketUI()
│   ├── ventas.js       ← sO(), rH(), rS(), confirmarOrden(), openEditVenta(), showTotalsRow
│   ├── egresos.js      ← sE(), rEH(), rES(), generarEgreso(), openEditEgr()
│   ├── inversiones.js  ← invGenerar(), renderInvDist(), fetchPrecios(), distSlices, _btcPrecioUSD
│   ├── liquidez.js     ← sLiqExterna(), renderLiqExterna(), liqDistSlices
│   ├── dashboard.js    ← renderDash(), renderDashFlowChart(), calcBalance(), dashCharts
│   ├── inventario.js   ← consumirStock(), registrarIngreso(), descontarStockPorTicket(), renderInventario()
│   ├── stock.js        ← getLotes(), saveLotes(), getCostoPromedio(), getActualQty(), getStockStatus()
│   ├── productos.js    ← getProductos(), saveProductos(), guardarProductoModal(), updateClientesDatalist()
│   ├── listas-precios.js ← getListasPrecios(), getTramosProducto(), renderListasPrecios()
│   ├── price-manager.js ← applyPriceAdjustment(), previewAjuste(), validarAjuste(), getPriceLog(),
│   │                      buildPreciosJson(), ghSyncCalc(), renderPriceAdjust(), renderPriceLog(),
│   │                      restoreFromPriceLog(entryId) — aplica before[] de una entrada del log
│   │                      Log en 'me_price_log' (append-only, IDs PCH-AAAAMM-NNN, Math.trunc)
│   │                      Cada entrada tiene tc (tipo de cambio al momento del ajuste, desde window._blueARS)
│   │                      ghSyncCalc() pushea precios.json a fungiabduction-ui/calculadora
│   ├── settings.js     ← renderSettings(), guardarPrecios(), resetPrecios()
│   ├── contactos.js    ← normNombre(), autoRegistrarContacto(), mostrarMigracionContactos(),
│   │                     ejecutarMigracionContactos(), renderContactos(), abrirContacto()
│   ├── github.js       ← ghAutoPush(), ghPush(), ghPull(), ghInit(), safeB64Encode/Decode()
│   ├── apariencia.js   ← applyApariencia(), PRESETS, guardarApariencia()
│   └── io.js           ← expJSON(), expCSV(), expXLSX(), impJSONFile(), hardReset()
│                         (impJSON, impMerge, handleXlsxFile ELIMINADOS — no reintroducirlos)
│                         expJSON() incluye _priceLog; impJSONFile() lo restaura; hardReset() lo limpia
│
├── ui/
│   ├── notif.js        ← sN(msg, err) — notificación toast
│   ├── modal.js        ← showInputModal(), vTk(), vEgr(), clM(), cpM()
│   ├── tabs.js         ← showTab(), rfM(), uhd(), onVentasMesChange(), onEgresosMesChange()
│   └── delegacion.js   ← setupDelegation(), setupDrop() [stub vacío], invSubTab(), toggleStockGroup()
│
└── styles/
    ├── base.css        ← :root variables, layout, header, nav-tabs
    ├── themes.css      ← [data-theme="modern"] overrides
    ├── components.css  ← KPIs, botones, modales, formularios, tablas
    └── animations.css  ← transition block, @keyframes
```

---

## Storage schema — `localStorage['motoredge_v4']`

Acceso SOLO via `ld()` (load) y `sd(d)` (save). Nunca `localStorage` directo para esta clave.

```js
{
  orders: [],          // Ventas. Ver formato abajo.
  egresos: [],         // Egresos. Ver formato abajo.
  inversiones: [],     // Inversiones.
  liquidezExterna: [], // Entradas de capital externo en USD.
  stock: {},           // Snapshot plano { prodId: qty }. FUENTE DE VERDAD HISTÓRICA.
                       // Decrementado independientemente en descontarStockPorTicket().
                       // Nunca sobreescribir con valores de lotes — pueden estar desincronizados.
  stockUmbrales: {},   // { prodId: { min, warn } }
  stockMovs: [],       // Historial de movimientos, max 1000, más reciente primero.
  lotes: {},           // { prodId: [ { id, ingreso_id, fecha, qty_inicial, qty_restante, costo_unitario } ] }
  ingresos: [],        // Ingresos de stock (compras).
  productos: [],       // Catálogo de productos activos.
  precios: null,       // Tablas de precios legacy { PT, CT, HT, GP, PP }.
  costos: null,        // Costos legacy { past, cris, hong, got, pet }.
  listasPrecios: [],   // Listas de precios nombradas y reutilizables.
  stockSeedDone: bool, // Flag one-shot. Si se pierde, seedStockInicial() duplica el stock.
  contactos: [],       // Directorio de clientes. Ver ContactRecord abajo.
  contactosMigDone: bool, // Flag one-shot. Si se pierde, mostrarMigracionContactos() es idempotente.
}
```

**Claves separadas** (NO parte de motoredge_v4, tienen localStorage directo propio):
- `me_gh_config` — token/repo/file de GitHub. **Nunca se respalda** (credencial, solo vive en el dispositivo).
- `me_dist_slices` — slices de distribución de capital (inversiones). ✅ En todos los backups.
- `me_liq_dist_slices` — slices de distribución de liquidez. ✅ En todos los backups.
- `me_dist_kpi_hidden` — KPIs ocultos en panel de distribución. ✅ En todos los backups.
- `me_apariencia` — colores y tema visual. ✅ En todos los backups.
- `me_theme` — 'light' | 'dark' | 'modern'. ✅ En todos los backups.
- `me_gh_last_push` — timestamp del último push. **No se respalda** (dato de dispositivo).
- `me_gh_calc_last` — timestamp del último sync con calculadora. **No se respalda** (dato de dispositivo).
- `me_price_log` — log de cambios de precios (auditoría). ✅ En todos los backups.
  Array de `{id, ts, tc, motivo, tipo, valor, scope, cambios}`.
  Tipos: `'pct'` (ajuste %), `'restore'` (restauración desde log), `'sync'` (sync calculadora pública).
  Campo `tc`: tipo de cambio (window._blueARS) al momento del ajuste. Null si no había fetch previo.
  `cambios[]`: `{listaId, listaNombre, before:[{t,p}], after:[{t,p}]}`. `before` permite restaurar.
  Append-only. IDs `PCH-AAAAMM-NNN` con Math.max. Restaurable con `restoreFromPriceLog(entryId)`.

**Flujos de backup — cobertura completa:**
| Flujo | Escribe | Lee/restaura |
|---|---|---|
| `ghPush()` | Sube todo al repo privado (`datos.json`) | — |
| `ghPull()` | — | Restaura todo desde `datos.json` |
| `ghBackupNow()` | Sube snapshot a `backups/backup_FECHA.json` | — |
| `ghRestoreBackup(path)` | — | Restaura desde backup puntual |
| `expJSON()` | Descarga JSON local | — |
| `impJSONFile(input)` | — | Restaura desde JSON local |

---

## ContactRecord

```js
{
  id: "CT-202603-0001",      // Formato CT-AAAAMM-NNNN. Inmutable. Math.max invariant.
  nombre: "Ale Bondaruc",    // Nombre canónico editable. Fuente de verdad de display.
  nombreNorm: "ale bondaruc",// Normalizado: lowercase + sin tildes. Se regenera al editar nombre.
                              // NUNCA editar directamente — siempre via normNombre(nombre).
  tel: null,                 // String o null.
  email: null,               // String o null.
  instagram: null,           // String o null.
  notas: null,               // String libre o null.
  fechaAlta: "2026-03-01T00:00:00.000Z", // ISO timestamp completo. Siempre con tiempo.
  mergedFrom: []             // Nombres originales que se fusionaron en este contacto durante migración.
}
```

**Resolución de historial de un contacto (dual — defensiva):**
```js
orders.filter(o => o.clienteId === ct.id || (!o.clienteId && normNombre(o.cliente) === ct.nombreNorm))
```
Las órdenes nuevas tienen `clienteId`. Las históricas sin `clienteId` se resuelven por `nombreNorm` como fallback.

---

## Formato de una orden (venta)

```js
{
  id: "V-202506-0001",          // Inmutable. Formato V-AAAAMM-NNNN.
  fecha: "2025-06-04",
  fechaDisplay: "04/06/2025",
  cliente: "Juan",              // String original. Inmutable. Siempre presente.
  clienteId: "CT-202603-0001", // NUEVO. Null en órdenes pre-migración. Siempre presente en órdenes nuevas.
  nota: "",
  estado: "confirmada",         // "pendiente" | "confirmada". Pendientes NO cuentan en dashboard.
  fechaConfirmacion: "...",     // ISO string. Solo en confirmadas.
  tipoPago: "ARS",              // "ARS" | "USD" | "USDT" | "MIX"
  tc: 1250,                     // TC en el momento de la venta. Histórico sellado, nunca recalcular.
  tcUsdt: 1240,
  lineas: [                     // Productos del ticket (formato nuevo).
    { prodId: "v-cal", varId: null, nombre: "Calaveras", emoji: "💀",
      qty: 10, precioUnit: 21735, subtotal: 217350, costo: 50750 }
  ],
  // ⚠ GOTCHA varId: generarTicket() guarda _lineas con varId:null para TODOS los productos
  // (calc() no setea varId). Para filtrar v-cal/v-ted/v-lck/v-gen SIEMPRE usar:
  //   l.varId==='v-cal' || l.prodId==='v-cal'   ← NO solo l.varId (siempre null en órdenes modernas)
  // p-cris/p-hong/p-got/p-pet: filtrar por l.prodId directamente (nunca tuvieron varId).
  // Formato legacy (órdenes antiguas): { pastillas: N, cristales: N, hongos: N, goteros: N, petri: N }
  // Ambos formatos coexisten. _getLineasOrden(o) es el bridge.
  totales: {
    subtotal: 217350,
    descuento: 0,
    recargo: 0,
    totalGeneral: 217350,
    totalUSD: 173.88,
    totalUsdt: 175.28,
    costoTotal: 50750,
    margen: 166600,
  },
  ticketText: "...",            // Texto plano del ticket para copiar/WhatsApp.
  auditoriaText: "..."          // Texto de auditoría interna.
}
```

---

## Formato de un egreso

```js
{
  id: "E-202506-0001",          // Inmutable. Formato E-AAAAMM-NNNN.
  fecha: "2025-06-04",
  concepto: "Alquiler",
  montoTotal: 300000,           // Monto total de la deuda/compra.
  cuotas: 3,
  impactoCaja: 100000,          // montoTotal / cuotas. LO QUE CUENTA EN DASHBOARD.
  moneda: "ARS",
  obs: "",
  ticketText: "..."
}
```

---

## Invariantes críticos — NUNCA violar

1. **`ld()` / `sd(d)`**: únicas funciones para leer/escribir `motoredge_v4`. `ld()` detecta JSON corrupto con setTimeout y notifica al usuario. Nunca silenciar ese error.

2. **IDs inmutables**: `V-AAAAMM-NNNN` (ventas), `E-AAAAMM-NNNN` (egresos), `ING-AAAAMM-NNNN` (ingresos), `I-AAAAMM-NNNN` (inversiones). Nunca regenerar IDs existentes. Todos los generadores usan `Math.max` sobre IDs del mismo mes — NO conteo, el conteo rompe tras eliminaciones.

3. **`gOConf()` en cálculos financieros**: filtra `estado !== 'pendiente'`. Dashboard y balance siempre usan `gOConf()`, nunca `gO()` crudo. Órdenes legacy sin campo `estado` son tratadas como confirmadas (`undefined !== 'pendiente'` = true).

4. **`impactoCaja` en egresos**: es `montoTotal / cuotas`. El dashboard usa `impactoCaja`, nunca `montoTotal`.

5. **TC histórico**: `tc` y `tcUsdt` en una orden son el TC del momento de la venta. Nunca recalcular sobre órdenes pasadas.

6. **FIFO en `consumirStock(itemId, qty)`**: descuenta lotes en orden de `fecha` (más antiguo primero). No cambiar esta lógica. Está en `modules/inventario.js`.

7. **`stockSeedDone`**: flag de un solo disparo. Si se pierde, `seedStockInicial()` duplica el stock inicial de producción.

8. **`ghAutoPush()`**: se llama automáticamente después de `sO()`, `sE()`, `sLiqExterna()`, `sInv()`. No sacarlo de esas funciones. Tiene debounce de 8 segundos (`_autoPushTimer`) — múltiples operaciones rápidas se agrupan en un solo push para evitar race conditions con el SHA de GitHub.

9. **Compatibilidad legacy**: órdenes antiguas tienen `{pastillas, cristales, hongos}`. Nuevas usan `lineas[]`. Ambos formatos conviven. `_getLineasOrden(o)` en `modules/io.js` es el bridge. No tocarlo. `getInvPeriodoSoldMap()` maneja ambos formatos.

10. **Orden de inicialización** (en `main.js`, al final): `initConfigDeps()` → `loadConfig()` → `seedStockInicial()` → `ghInit()` → tema/apariencia → `buildTicketUI()` → `upd()` → `rfM()` → `uhd()` → `setInterval` → `setupDelegation()` → `setupDrop()`.

11. **`descontarStockPorTicket(lineas)`**: decrementa DOS sistemas en paralelo. Primero `consumirStock(key, qty)` (lotes FIFO). Luego `stock[key] = Math.max(0, stock[key]-qty)` (stock plano). **NUNCA** usar `getActualQty()` para calcular el valor post-descuento del plano — los lotes pueden estar inflados y sobreescribirían el plano correcto.

12. **Dos sistemas de stock coexisten**: `d.stock` (plano, fuente de verdad histórica) y `d.lotes` (FIFO moderno). Pueden divergir si lotes fueron seeded incorrectamente. Para sincronizar: `reconcileLotesConStock()` en Inventario → Stock. Es idempotente y registra movimientos AJUSTE en stockMovs. La UI muestra un warning de divergencia automáticamente.

13. **`contactosMigDone`**: flag one-shot. La migración histórica se dispara al abrir la pestaña Contactos si aún no corrió. `ejecutarMigracionContactos()` es el único writer — hace un único `sd(d)` atómico con `contactos`, `contactosMigDone=true`, y los `clienteId` en todas las órdenes históricas. No invocar a medias.

14. **`autoRegistrarContacto(nombre, fechaOrden)`**: llamado desde `generarTicket()` ANTES de `sO()`. Crea el contacto si no existe (single `sd()`), retorna `clienteId` que se guarda en la orden. El `ticketText` almacenado en la orden tiene el nombre real. La UI de `#tkOut` muestra el nombre ofuscado (random, solo display, no persistido).

15. **`normNombre(s)`**: normalización canónica para dedup y lookup de contactos. NFD + strip diacríticos + lowercase + colapso de espacios. Toda comparación de nombres de clientes DEBE pasar por esta función. Nunca comparar strings raw de `o.cliente` con `ct.nombre` directamente.

16. **`clienteId` en órdenes**: campo opcional hacia atrás. Órdenes pre-migración tienen `clienteId: null`. El historial de un contacto se resuelve con resolución dual: `o.clienteId === ct.id || (!o.clienteId && normNombre(o.cliente) === ct.nombreNorm)`. No cambiar esta lógica.

---

## Catálogo de productos (DEFAULT_PRODUCTS)

8 productos seed. IDs fijos usados en toda la lógica:

| id | emoji | nombre | unit | tipo | legacyKey |
|---|---|---|---|---|---|
| `v-cal` | 💀 | Calaveras | ud | tramos | calaveras |
| `v-ted` | 🧸 | Teddy | ud | tramos | teddy |
| `v-lck` | 🐱 | Lucky Cat | ud | tramos | lucky |
| `v-gen` | 💊 | Genéricas | ud | tramos | genericas |
| `p-cris` | 💎 | Cristales | g | tramos | cristales |
| `p-hong` | 🍄 | Hongos | g | tramos | hongos |
| `p-got` | 💧 | Goteros | ud | fijo | goteros |
| `p-pet` | 🧫 | Petri | ud | fijo | petri |

`legacyKey` mapea ordenes antiguas al producto correcto. `getProductos()` tiene migración para el formato de grupo `p-past` (versiones anteriores).

---

## Dependencias entre módulos

```
formatters ←── (ninguna)
notif      ←── (ninguna)
constants  ←── (ninguna)
storage    ←── notif
ids        ←── storage, formatters
config     ←── storage, constants   [+ DI: getProductos, updateClientesDatalist]
github     ←── storage, notif
apariencia ←── notif
stock      ←── storage, notif
listas-precios ←── storage, notif, constants, formatters, stock
productos  ←── storage, notif, constants, formatters, listas-precios
egresos    ←── storage, notif, formatters, ids, github
ventas     ←── storage, notif, formatters, ids, github, productos
inventario ←── storage, notif, formatters, productos, stock, ids, config, listas-precios
settings   ←── storage, notif, formatters, productos
contactos  ←── storage, notif, formatters, github, productos
liquidez   ←── storage, notif, formatters, github
inversiones←── storage, notif, formatters, ids, github, stock, productos
dashboard  ←── storage, formatters, config, inversiones, inventario
ticket     ←── storage, notif, formatters, config, ids, ventas, productos, listas-precios, inventario, stock, contactos
io         ←── storage, notif, formatters, productos, stock, inventario, listas-precios
modal      ←── storage, notif
tabs       ←── storage, formatters, inversiones, dashboard, ventas, egresos, settings, inventario, github
delegacion ←── notif, ventas, egresos, io, productos, stock
```

---

## Patrones usados en el código

### Acceso cross-módulo (funciones no importadas)

Cuando un módulo necesita llamar a una función de otro módulo sin importarla directamente (para evitar circular imports), usa:
```js
window.rfM?.()           // optional chaining — no falla si no está cargado
window.renderDash?.()
window.buildTicketUI?.()
```

Todas las funciones que el HTML referencia via `onclick`/`onchange` están expuestas en `main.js` via `Object.assign(window, {...})`.

### Window bridges para estado mutable cross-módulo

Variables `let` de módulo que otros módulos necesitan leer/escribir:
```js
// En inversiones.js:
window._getDistSlices = () => distSlices;
window._setDistSlices = (v) => { distSlices = v; };

// En liquidez.js:
window._getLiqDistSlices = () => liqDistSlices;
window._setLiqDistSlices = (v) => { liqDistSlices = v; };

// En inversiones.js, dentro de fetchPrecios():
window._btcPrecioUSD = _btcPrecioUSD;
window._blueARS = _blueARS;
```

### Dependency injection en config.js

`loadConfig()` necesita `getProductos()` pero no puede importarla (circular). Se resuelve así:
```js
// En core/config.js:
let _getProductos = () => [];
export function initConfigDeps(getProductosFn, updateClientesFn) { ... }

// En main.js antes de loadConfig():
initConfigDeps(getProductos, updateClientesDatalist);
loadConfig();
```

### Live bindings de config

`PT`, `CT`, `HT`, `GP`, `PP`, `COSTS` son `export let` en `config.js`. Cuando `loadConfig()` los reasigna, todos los importadores ven el valor nuevo (ES module live binding). Los módulos que los consumen (ticket.js) los importan y siempre tienen el valor actualizado.

---

## Workflow de desarrollo

### Editar y probar

```
1. Editar archivos en core/, modules/, ui/, styles/
2. Correr build.bat  → regenera bundle.js
3. Recargar index.html en el navegador
```

### Con servidor (para usar ES Modules directamente)

```
1. Correr serve.bat  → abre http://localhost:8080
2. Editar archivos
3. Recargar el navegador
   (no hace falta build.bat en este modo)
```

### Estructura de build.bat

Llama a `build.ps1` que:
1. Lee cada módulo en orden de dependencias
2. Elimina líneas `import ...`
3. Elimina palabra `export` de declaraciones (preserva el nombre)
4. Concatena en `bundle.js`
5. Actualiza `index.html` para usar `<script src="bundle.js">`

`bundle.js` NO es código fuente — se genera desde los módulos. Nunca editarlo directamente.

---

## Funciones clave por área

### Leer/escribir datos
| Función | Módulo | Qué hace |
|---|---|---|
| `ld()` | core/storage | Lee motoredge_v4 de localStorage |
| `sd(d)` | core/storage | Guarda motoredge_v4 en localStorage |
| `gO()` | core/storage | Todas las órdenes (incluyendo pendientes) |
| `gOConf()` | core/storage | Solo órdenes confirmadas (para finanzas) |
| `gE()` | core/storage | Todos los egresos |
| `loadConfig()` | core/config | Carga PT/CT/HT/GP/PP/COSTS desde d.precios o catálogo |

### Motor del ticket
| Función | Módulo | Qué hace |
|---|---|---|
| `buildTicketUI()` | modules/ticket | Renderiza las filas de productos |
| `calc()` | modules/ticket | Calcula totales según cantidades y tramos |
| `upd()` | modules/ticket | Actualiza DOM con el resultado de calc() |
| `generarTicket()` | modules/ticket | Crea la orden, llama sO() + descontarStockPorTicket() |
| `confirmarOrden(id)` | modules/ventas | Cambia estado pendiente → confirmada |

### Stock / FIFO
| Función | Módulo | Qué hace |
|---|---|---|
| `consumirStock(itemId, qty)` | modules/inventario | Descuenta FIFO de lotes (no toca stock plano) |
| `descontarStockPorTicket(lineas)` | modules/inventario | Llama consumirStock + decrementa stock plano independientemente |
| `reconcileLotesConStock()` | modules/inventario | Sincroniza lotes con stock plano. Idempotente. Audit trail en stockMovs |
| `getCostoPromedio(itemId)` | modules/stock | Promedio ponderado de costo según lotes activos |
| `getActualQty(id)` | modules/stock | Qty real: lotes si qty_restante > 0, fallback a stock plano |
| `getStockFromLotes(itemId)` | modules/stock | Suma qty_restante de lotes activos (sin fallback a plano) |

### I/O — Backup y restauración
| Función | Módulo | Qué hace |
|---|---|---|
| `expJSON()` | modules/io | Backup completo. Avisa si storage vacío (posible corrupción) |
| `impJSONFile(input)` | modules/io | Auto-restaura al seleccionar archivo. Descarga backup pre-restore primero. Confirm muestra stats |
| `hardReset()` | modules/io | Descarga backup y borra TODO el localStorage del sistema |

### GitHub sync
| Función | Módulo | Qué hace |
|---|---|---|
| `ghAutoPush()` | modules/github | Push silencioso (llamado automáticamente) |
| `ghPush(showNotif)` | modules/github | Push explícito con feedback |
| `ghPull(showNotif)` | modules/github | Pull y restauración completa de datos |
| `ghInit()` | modules/github | Inicializa UI del tab GitHub |

---

## Qué NO hacer

- No cambiar el schema de `motoredge_v4` (campos, tipos, nombres)
- No agregar `async/await` a `ld()` o `sd()` — son síncronas por diseño
- No romper el orden de init
- No escribir `localStorage.setItem('motoredge_v4', ...)` fuera de `sd()`
- No recalcular TC en órdenes históricas
- No cambiar la lógica FIFO de `consumirStock`
- No editar `bundle.js` directamente (se sobreescribe con build.bat)
- No agregar abstracciones no pedidas — 3 líneas repetidas > abstracción prematura
- No reintroducir `impJSON()`, `impMerge()`, `handleXlsxFile()` — eliminados intencionalmente
- No usar `getActualQty()` en `descontarStockPorTicket()` para calcular el valor post-descuento del plano
- No eliminar ni hacer force push que borre la carpeta `backups/` del repo GitHub
- No usar conteo (`length + 1`) para generar IDs — siempre `Math.max` sobre IDs existentes del mes
