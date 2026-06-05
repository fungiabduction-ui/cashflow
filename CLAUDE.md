# MOTOR EDGE 3.9-E — Guía para Claude

Sistema de gestión financiera personal (ventas, egresos, inversiones, inventario).
SPA vanilla JS sin framework, sin bundler externo, sin backend.

---

## ⚠️ Reglas para agentes — GitHub repo

**Repo de código fuente:** `https://github.com/fungiabduction-ui/cashflow`

**Credenciales GitHub:**
- Usuario/Org: `fungiabduction-ui`
- Repo: `cashflow`
- Email git: `jetdatalog@gmail.com`
- Personal Access Token: guardado en `token github.txt` (gitignored, en el directorio raíz del proyecto).
  Leer ese archivo al inicio de cada sesión para obtener el token actual.
  Si no existe, pedirle al usuario que lo comparta — va a settings.github.com/tokens

**NUNCA eliminar la carpeta `backups/` del repo.** Contiene históricos de data sync que el usuario preserva. Cualquier `git rm`, force push o reescritura de historia que elimine esa carpeta está prohibida.

**Workflow para agentes que hacen cambios:**
1. Leer el token desde `token github.txt` (en raíz del proyecto, gitignored)
2. Editar archivos fuente en `core/`, `modules/`, `ui/`, `styles/`
3. Correr `build.bat` → regenera `bundle.js`
4. `git add .` + `git commit -m "descripción del cambio"`
5. `git push "https://$TOKEN@github.com/fungiabduction-ui/cashflow.git" main`

Si el repo no está inicializado localmente:
```powershell
# Leer token desde archivo local
$TOKEN = (Get-Content "token github.txt" -Raw).Trim()
git init
git config user.email "jetdatalog@gmail.com"
git config user.name "JET"
git remote add origin "https://$TOKEN@github.com/fungiabduction-ui/cashflow.git"
git fetch origin
git reset --soft origin/main
git add .
git commit -m "descripción"
git push "https://$TOKEN@github.com/fungiabduction-ui/cashflow.git" main
```

El archivo `datos.json` en el repo es regenerado automáticamente por `ghAutoPush`. No lo edites ni lo borres manualmente.

---

## Qué es

App de un solo usuario que corre en el navegador. Gestiona:
- **Ventas** con ticket generado, soporte ARS/USD/USDT/MIX
- **Egresos** en cuotas con impacto mensual
- **Inversiones** (BTC, USD Blue, USDT, ARS) con seguimiento de flotante
- **Inventario FIFO** por lotes con costo promedio ponderado
- **Dashboard** con balance multimoneda y cash flow chart
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
│   ├── settings.js     ← renderSettings(), guardarPrecios(), resetPrecios()
│   ├── github.js       ← ghAutoPush(), ghPush(), ghPull(), ghInit(), safeB64Encode/Decode()
│   ├── apariencia.js   ← applyApariencia(), PRESETS, guardarApariencia()
│   └── io.js           ← expJSON(), expCSV(), expXLSX(), impJSONFile(), hardReset()
│                         (impJSON, impMerge, handleXlsxFile ELIMINADOS — no reintroducirlos)
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
}
```

**Claves separadas** (NO parte de motoredge_v4, tienen localStorage directo propio):
- `me_gh_config` — token/repo/file de GitHub
- `me_dist_slices` — slices de distribución de capital (inversiones)
- `me_liq_dist_slices` — slices de distribución de liquidez
- `me_dist_kpi_hidden` — KPIs ocultos en panel de distribución
- `me_apariencia` — colores y tema visual
- `me_theme` — 'light' | 'dark' | 'modern'
- `me_gh_last_push` — timestamp del último push

---

## Formato de una orden (venta)

```js
{
  id: "V-202506-0001",          // Inmutable. Formato V-AAAAMM-NNNN.
  fecha: "2025-06-04",
  fechaDisplay: "04/06/2025",
  cliente: "Juan",
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

8. **`ghAutoPush()`**: se llama automáticamente después de `sO()`, `sE()`, `sLiqExterna()`, `sInv()`. No sacarlo de esas funciones.

9. **Compatibilidad legacy**: órdenes antiguas tienen `{pastillas, cristales, hongos}`. Nuevas usan `lineas[]`. Ambos formatos conviven. `_getLineasOrden(o)` en `modules/io.js` es el bridge. No tocarlo. `getInvPeriodoSoldMap()` maneja ambos formatos.

10. **Orden de inicialización** (en `main.js`, al final): `initConfigDeps()` → `loadConfig()` → `seedStockInicial()` → `ghInit()` → tema/apariencia → `buildTicketUI()` → `upd()` → `rfM()` → `uhd()` → `setInterval` → `setupDelegation()` → `setupDrop()`.

11. **`descontarStockPorTicket(lineas)`**: decrementa DOS sistemas en paralelo. Primero `consumirStock(key, qty)` (lotes FIFO). Luego `stock[key] = Math.max(0, stock[key]-qty)` (stock plano). **NUNCA** usar `getActualQty()` para calcular el valor post-descuento del plano — los lotes pueden estar inflados y sobreescribirían el plano correcto.

12. **Dos sistemas de stock coexisten**: `d.stock` (plano, fuente de verdad histórica) y `d.lotes` (FIFO moderno). Pueden divergir si lotes fueron seeded incorrectamente. Para sincronizar: `reconcileLotesConStock()` en Inventario → Stock. Es idempotente y registra movimientos AJUSTE en stockMovs. La UI muestra un warning de divergencia automáticamente.

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
liquidez   ←── storage, notif, formatters, github
inversiones←── storage, notif, formatters, ids, github, stock, productos
dashboard  ←── storage, formatters, config, inversiones, inventario
ticket     ←── storage, notif, formatters, config, ids, ventas, productos, listas-precios, inventario, stock
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
