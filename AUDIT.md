# Motor Edge 3.9-E — Audit Técnico (2026-06-23)

## 1. BUGS CRÍTICOS

- [x] **Fix 1** — `modules/liquidez.js:134,149,164` — Triple `const fu=fu` (TDZ violation). Panel de Liquidez no muestra datos. ✓ Eliminadas las 3 líneas.
- [x] **Fix 2** — `modules/inventario.js:1121` — `generarStockTicket()` llama `agregarLote()` que no existe. ✓ Reemplazado con inline: getLotes/saveLotes/saveIngreso/addStockMov/sd.
- [x] **Fix 3a** — `modules/ventas.js:62` — `fv(o.totales.totalGeneral)` sin `?.` en `rH()`. ✓
- [x] **Fix 3b** — `modules/ventas.js:19` — `fv(o.totales.totalGeneral)` sin `?.` en `anularByIdModal()`. ✓
- [x] **Fix 3c** — `modules/ventas.js:135,142` — `const t=o.totales||{}` guard en `rS()`. ✓
- [x] **Fix 3d** — `modules/ventas.js:154` — `o.totales?.totalGeneral||0` en `buildTotalRow()`. ✓
- [x] **Fix 3e** — `modules/dashboard.js:81,94,95,110,111` — `o.totales?.totalGeneral||0` en reducers de `renderDash()`. ✓ (replace_all)
- [x] **Fix 3f** — `modules/inversiones.js:414` — `o.totales?.totalGeneral||0` en `getDisponibleDist()`. ✓
- [x] **Fix 4** — `modules/github.js` — `confirm()` agregado en `ghPull()`. ✓
- [x] **Fix 5** — `modules/liquidez.js:102` — ID migrado a `Math.max`. ✓

## 2. FRAGILIDADES

- [x] **Frag 1** — `modules/inversiones.js:invActualizarFlotantes()` — race condition teórica (baja prioridad, JS single-thread mitiga). Diferido.
- [x] **Frag 2** — `modules/price-manager.js:applyPriceAdjustment()` — dos `sd()` no atómicos. ✓ Fusionados: priceLog se agrega a `d` antes del único `sd(d)`.
- [x] **Frag 3** — `modules/ticket.js:limpiar()` — ID del campo TC incorrecto. ✓ Cambiado `'tc'` → `'tc-valor'`.
- [x] **Frag 4** — `modules/github.js:ghInit()` — ventana de pérdida de datos de 8s. ✓ `beforeunload` listener agregado.
- [x] **Frag 5** — `modules/github.js:ghPush()` — sin retry en SHA mismatch. ✓ Retry automático en 409/422 con SHA fresco.
- [x] **Frag 6** — `modules/inversiones.js:invConfirmarLiquidacion()` — múltiples `sd()` no atómicos. ✓ Egreso construido dentro del `d` antes del único `sd(d)` + ghAutoPush().

## 3. INCONSISTENCIAS DE DATOS

- [ ] **Dato 1** — `d.stock['p-hong'] = 0` pero lotes tienen `qty_restante = 435`. Acción: ejecutar `reconcileLotesConStock()` desde Settings.
- [ ] **Dato 2** — `d.stock['grp-p-past'] = 1770` sin lotes correspondientes (clave huérfana legacy). Incluida en reconciliación.
- [ ] **Dato 3** — 135 órdenes con `tc: null`. Migración one-shot que setea TC histórico.
- [ ] **Dato 4** — Schema real de `totales` ≠ documentado (faltan `totalUSD`, `costoTotal`, `margen`).
- [ ] **Dato 5** — `_lineas[]` sin `nombre` ni `costo` en todas las órdenes del backup.
- [ ] **Dato 6** — `V-202605-0024` sin `clienteId` (no migrada).

## 4. MEJORAS DE ROBUSTEZ

- [ ] **Rob 1** — Ejecutar `reconcileLotesConStock()` desde Settings → Herramientas (resuelve Dato 1 y 2).
- [x] **Rob 2** — Migración one-shot para `tc: null` en 135 órdenes. ✓ `migrarTcNull()` en io.js, botón en Settings, expuesto en window.
- [x] **Rob 3** — `ghPush()`: detectar 409 y re-fetch SHA antes de reintentar. ✓ (era Frag 5, ya completado)
- [x] **Rob 4** — `invConfirmarLiquidacion()`: único `sd(d)` atómico. ✓ (era Frag 6, ya completado)

## 5. MEJORAS DE ARQUITECTURA

- [ ] **Arq 1** — `ld()` con cache de 1 frame (invalidado en cada `sd()`). Elimina 4 JSON.parse por `rfM()`.
- [x] **Arq 2** — `ghPull()` / `ghRestoreBackup()`: usar `window.loadConfig?.()` en vez de calls directas (compatibilidad con modo ES Modules dev). ✓
- [ ] **Arq 3** — `modules/inversiones.js` (900+ líneas): separar en inversiones-calc.js / inversiones-render.js.

---

*Generado: 2026-06-23 | Audit completo por Claude Code*
