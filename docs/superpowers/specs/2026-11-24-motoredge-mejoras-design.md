# MotorEdge — Limpieza, robustez, ventas y precios por producto — Design Spec

**Fecha:** 2026-11-24
**Estado:** Borrador para revisión del usuario
**Alcance:** MotorEdge 3.9-E (repo `cashflow`). La calculadora pública no cambia.

---

## Contexto — auditoría del 2026-11-24

- **Local = GitHub.** `clean-main` = `origin/main` (`2358dff`, 2026-10-03), sin cambios sin commitear.
  `bundle.js` coincide con un build fresco. GitHub Pages (app y calculadora) es byte a byte igual a lo local.
- **Carpeta desordenada (~85 MB no usados):** una copia completa del proyecto de agosto (su commit ya está en la
  historia actual), 25 versiones viejas de `index*.html`, Excels y extractos viejos, scripts sueltos de la
  calculadora, restos de herramientas (`.superpowers/`, `.kilo/`) y copias de credenciales en carpetas viejas.
- **Riesgo de filtración:** `BACKUPS DATA/`, `MP/` y `backup_2026-08-13*.json` contienen datos financieros reales y
  **no están en `.gitignore`**. El workflow documentado (`git add .`) los subiría al repo público (mismo tipo de
  incidente que jun/ago 2026, invariante #19).
- **Precios:** `modules/price-manager.js` ya hace ajuste % por lista (una o todas), preview, log con revertir y sync
  manual. Faltan: selección por producto, preguntar sync al aplicar, registrar ediciones manuales de listas.
  El log permite borrar entradas con una "×" sin confirmar (contradice "append-only").
- **Fragilidades:** `ld()` con JSON corrupto devuelve un estado vacío y el siguiente `sd()` lo persiste (pérdida
  total sin vuelta). `sd()` no informa fallos al llamador (se muestra error y además "✓ guardado"). Sin tests.
- **Edición de ventas:** 10 defectos detectados por lectura de código (ver Etapa 3).

## Proceso

Cinco etapas, **una sesión por etapa**: `/retomar` → `superpowers:writing-plans` (solo esa etapa) → ejecución
(Opus) → `build.bat` + tests + verificación manual → commit → push con OK del usuario → `/handoff`.

**Verificación manual siempre con una copia de los datos:** `serve.bat` (`http://localhost:7432`) es un origen
distinto al que usa el usuario a diario, con su propio localStorage. Se importa un backup ahí y se prueba ahí.
Nunca probar sobre los datos reales.

Orden y por qué: 1 elimina el riesgo de filtración sin tocar la app · 2 pone red de seguridad (datos + tests)
antes de tocar lógica · 3 corrige ventas porque hoy cada edición corrompe datos · 4 es la mejora de precios ·
5 son ayudas de mantenimiento.

---

## Etapa 1 — Limpieza y anti-filtración (no toca la app)

**1.1 Mover a `C:\Users\JET\Desktop\MOTOREDGE-ARCHIVO\`** (fuera del repo; nada se borra):
`BACKUPS DATA/`, `Data backup/`, `datos.json`, `backup_2026-08-13_1626.json`,
`backup_2026-08-13_1626_corregido.json`, `MP/`, los scripts y planillas sueltos de `CALCULADORA/` (todo menos
`CALCULADORA/index.html`, que está versionado), y de `OLD2/`: planillas, CSV, JSON y documentos `.md`/`.txt`.
Un archivo con credenciales y contenido útil se archiva con la línea del token eliminada.

**1.2 Borrar** (sin valor, ya verificados como duplicados o descartables): `CASHFLOW - copia/`, el resto de
`OLD2/` (HTML/JS viejos, archivos de token, repos `.git` anidados, caches), `.superpowers/`, `.kilo/`.
Antes de borrar `OLD2/`, listar su contenido completo y aplicar la regla de 1.1 a cada archivo.

**1.3 Repo:** `git rm` de `AUDIT.md` (desactualizado; sus pendientes de datos quedan cubiertos por el diagnóstico de
la Etapa 5) y de `INGENIERO.txt` (su contenido ya está en CLAUDE.md, "Mentalidad requerida").

**1.4 `.gitignore`:** agregar `BACKUPS DATA/`, `MP/`, `backup_*.json`, `*backup*.json`, `*.xlsx`, `*.csv`, `*.pdf`,
`OLD*/`, `* - copia/`, `.superpowers/`, `.kilo/`.

**1.5 Rama:** borrar la rama local `main` (vieja, `7767dd7`, contiene un commit antiguo con credenciales que no está
en GitHub), renombrar `clean-main` → `main` con upstream `origin/main`.

**1.6 Hook anti-filtración** versionado en `.githooks/pre-commit` (bash de Git for Windows), activado con
`git config core.hooksPath .githooks`. Rechaza el commit si hay en staging:
- archivos `.json`, `.csv`, `.xlsx`, `.pdf` (el repo no versiona ninguno);
- contenido que matchee `gh[pousr]_[A-Za-z0-9]{36}` o `github_pat_`;
- archivos de más de 1 MB.
El mensaje de rechazo dice qué archivo y por qué.

**1.7 `deploy.bat` → `deploy.ps1`:** build → tests (si existe `tests/`) → muestra `git status` → agrega **solo**
rutas de código (`core modules ui styles main.js index.html bundle.js build.ps1 CALCULADORA/index.html docs
CLAUDE.md .gitignore .githooks tests deploy.*`) → pide mensaje → commit → `git push origin main`. Aborta ante
cualquier fallo.

**1.8 CLAUDE.md:** reemplazar el workflow `git add .` por `deploy.bat`; actualizar la sección de sincronía (rama
`main`); documentar el hook.

**1.9 Paso manual recomendado al usuario:** rotar el token de GitHub (existió en texto plano en varias copias).

**Verificación:** `git status` limpio (solo ignorados); un commit de prueba con un `.json` es rechazado por el hook
(y se deshace); la app abre y muestra los datos (viven en el navegador, mover archivos no los afecta).

---

## Etapa 2 — Robustez base

**2.1 Modo protegido** (`core/storage.js`):
- Si `ld()` no puede parsear `motoredge_v4`: copia el texto crudo (una sola vez por carga de la app) a `motoredge_v4_corrupt_<AAAAMMDD-HHMM>`
  (si la copia falla por espacio, se sigue igual), activa un bloqueo de escritura y muestra un aviso **persistente**
  (no un toast): "Datos dañados — escrituras bloqueadas. Restaurá un backup desde Config".
- Con el bloqueo activo, `sd()` no escribe y devuelve `false`.
- Solo `restoreBackupPayload()` y `hardReset()` levantan el bloqueo.
- Storage vacío (clave inexistente) no es corrupción: arranque normal.

**2.2 Guardado verificado:**
- `sd()` devuelve `true`/`false`. Los llamadores que ignoran el valor siguen funcionando.
- `sO()` devuelve el resultado de `sd()`.
- Flujos que deben chequearlo y no mostrar éxito ni seguir con pasos secundarios si falla: `generarTicket()`
  (hoy descuenta stock aunque la orden no se haya guardado), `confirmarOrden()`, `saveEditVenta()`, `sE()`,
  `registrarIngreso()`, `applyPriceAdjustment()`, `restoreFromPriceLog()`, guardado del editor de listas.

**2.3 Tests automáticos** (sin npm, `node --test`, Node 24 detecta ES modules solo):
- `tests/helpers/env.mjs`: `localStorage` en memoria y stubs mínimos de `window`/`document`, instalados antes de
  importar los módulos fuente. Los tests nunca tocan datos del navegador.
- Tests de esta etapa: modo protegido (JSON corrupto → bloqueo, `sd()` no escribe), `sd()` devuelve booleano,
  IDs con `Math.max` tras eliminaciones.
- `run-tests.bat`. `deploy.ps1` corre los tests y aborta si fallan.
- Las etapas 3 y 4 agregan sus tests.

---

## Etapa 3 — Ventas

**3.1 Ticket sin nombre del cliente** (el cliente es dato interno):
- `generarTicket()`: el texto para el cliente (`ticketText` guardado y `#tkOut`) ya no lleva la línea
  "👤 Cliente". El cliente queda en `o.cliente`/`o.clienteId` y se agrega al texto de auditoría (`auditText`).
- Se eliminan `obfuscarNombreTicket()` y `tkDisplay`.
- `vTk()` (detalle desde historial): en órdenes viejas cuyo `ticketText` tiene esa línea, se oculta al mostrar y
  copiar, sin modificar el dato guardado (histórico sellado). El cliente se muestra aparte, fuera del texto copiable.
- Test: el `ticketText` generado no contiene el nombre del cliente.

**3.2 Edición de ventas** — reproducir primero con `superpowers:systematic-debugging` sobre una copia de datos.

Defectos detectados en `openEditVenta()`/`saveEditVenta()` (`modules/ventas.js`):

| # | Defecto |
|---|---|
| a | Guardar sin tocar nada cambia la orden: total = Σ(qty×precio) e ignora descuento/recargo/total libre. |
| b | El campo "Total ARS" se ignora cuando hay líneas. |
| c | TC histórico pisado (viola invariante #5): en órdenes ARS `tcUsdt` queda en 1 o en el TC del día; en USD/USDT viejas sin `payment` se prellena el blue actual. |
| d | Órdenes MIX: el modal no tiene modo MIX; al guardar quedan `tipoPago:'MIX'` con `payment` ARS y se pierde el desglose. |
| e | Costo, margen y `totalUSD` no se recalculan al cambiar cantidades. |
| f | `totalPastillasLinea` queda en 0 en órdenes modernas (filtra `prodId==='p-past'`, que solo existe en legacy). |
| g | Cliente o nota con comillas se truncan al guardar (valores sin escapar en el HTML). |
| h | Cambiar el cliente no actualiza `clienteId`: la venta sigue en el historial del contacto anterior. |
| i | Cambiar cantidades no mueve stock (ni plano ni lotes). |
| j | `ticketText`/`auditText` no se regeneran: el detalle muestra datos viejos. |

Comportamiento esperado:
- **Idempotencia:** abrir y guardar sin cambios no modifica ningún campo (test con órdenes ARS, USD, USDT, MIX,
  con ajuste y legacy).
- **Total** = subtotal de líneas ± ajuste original, con el mismo cálculo que el ticket. Si el usuario cambia
  "Total ARS" a mano, se guarda como ajuste libre.
- **TC:** se conservan `tc`, `tcUsdt` y `payment` salvo edición explícita del usuario; nunca se prellena el TC del día
  si la orden ya tiene uno.
- **MIX** soportado (ARS + USD + USDT con sus TC).
- **Costo:** `generarTicket()` pasa a guardar `costo` por línea (ya está en el schema documentado). Al editar, el
  costo de la línea escala con la cantidad. En órdenes viejas sin costo por línea, el costo unitario se estima
  prorrateando `o.costo` según el subtotal de cada línea. Sin cambios de cantidad, el costo no se toca.
- **Stock:** el delta de cantidades se aplica. Aumento → `descontarStockPorTicket()` con el delta. Disminución →
  vuelve al stock plano y a los lotes en orden inverso al FIFO (primero el lote consumido más reciente por `fecha`,
  sin superar su `qty_inicial`), con movimiento `AJUSTE` ("edición V-…") en `stockMovs`.
- **Cliente:** si cambió (según `normNombre`), `clienteId` se re-resuelve con `autoRegistrarContacto()` (mismo
  patrón que `generarTicket()`).
- Valores escapados en el HTML del modal.
- `ticketText`/`auditText` se regeneran con una función compartida con `generarTicket()` (`buildTicketText(o)`), y
  `auditText` suma "✏ Editada dd/mm/aaaa: total X → Y".
- Un solo `sd()` para orden + stock + movimientos.

Fuera de alcance: eliminar una venta sigue sin devolver stock (comportamiento actual).

---

## Etapa 4 — Precios por producto

**4.1 Panel "Cambio de precios"** (`renderPriceAdjust()`):
- El selector "Alcance" se reemplaza por toggles de productos activos (emoji + nombre). Los que comparten lista se
  dibujan unidos con la etiqueta "comparten <lista>" y se tildan/destildan juntos. Productos sin lista: deshabilitados
  ("asigná una lista"). Botones "Todos" / "Ninguno".
- Variación % y Aumento/Descuento (como hoy).
- **Redondeo:** Sin redondeo (trunca, default actual) / $100 / $500 / $1.000, al más cercano:
  `Math.round(x/r)*r`. Con `r=0`, `Math.trunc` como hoy.
- **% sugerido por dólar:** "Desde el último ajuste de estas listas (dd/mm, TC $X) el blue subió Y% → [usar Y%]".
  Base: la entrada más reciente del log con `tc` que tocó alguna lista seleccionada;
  `Y = (blue actual / tc de esa entrada − 1) × 100`, con un decimal. Si `window._blueARS` no está
  cargado, se obtiene con la función de fetch existente (`actualizarPreciosDash()`). Sin datos previos: oculto.
- Motivo (como hoy).
- **Vista previa:** tramos antes/después por lista (como hoy) + por producto: costo promedio
  (`getCostoPromedio()`), margen del tramo base actual → nuevo, con los colores existentes (>30% verde, >15% amarillo,
  resto rojo). Aviso si el redondeo deja dos tramos con el mismo precio.
- "APLICAR" se habilita solo después de previsualizar con los mismos parámetros.

**4.2 Aplicación** (`applyPriceAdjustment`): recibe `{listaIds, pct, redondeo, motivo, productos}`. Un solo `sd()`
para listas + productos + log (como hoy). Validación de precio > 0 como hoy, incluyendo el redondeo.

**4.3 Después de aplicar:** modal propio (no `confirm()`): "✓ Precios actualizados (+10% · N listas).
¿Sincronizar la calculadora online ahora?" → [↑ Sincronizar ahora] [Más tarde]. Usa `ghSyncCalc()`; sin token,
explica cómo configurarlo.

**4.4 Aviso "calculadora desactualizada":**
- Estado = comparar `buildPreciosJson()` (sin `updated`) contra el `payload` de la última entrada `sync` del log.
  Distinto → "⚠ Calculadora desactualizada". Si la última sync no tiene `payload` (syncs viejos) → "sin verificar"
  (neutral) hasta la próxima sync.
- Visible en el banner del panel (`renderSyncBanner()`), con un punto en el sub-tab "💲 Lista de Precios" y en el
  tab Inventario. Se recalcula al iniciar, al aplicar o restaurar ajustes, al editar listas, al cambiar asignaciones,
  al sincronizar y al restaurar un backup.
- Como el log viaja en los backups, el estado es el mismo en todos los dispositivos.

**4.5 Registro completo** (`d.priceLog`, append-only):
- Se elimina la "×" del terminal y `deletePriceLogEntry()` (también de `main.js`).
- Entradas `pct` suman `productos:[{id,nombre,emoji}]`, `redondeo` y `scope: 'all' | [listaIds]`.
- Nuevo tipo `edit`: guardar una lista existente en el editor con tramos cambiados registra before/after
  (motivo "Edición manual"), en el mismo `sd()` que guarda la lista y los productos.
- Entradas `sync` suman `payload` (el `precios.json` publicado, sin `updated`, ~1 KB).
- `restoreFromPriceLog()` pasa a un solo `sd()` (hoy hace dos).
- Terminal y log detallado muestran `edit` y etiquetas de varias listas (derivadas de `cambios[].listaNombre`,
  válido para entradas viejas y nuevas).

**Tests:** ajuste con y sin redondeo (incluye trunc actual: 22785 +10% → 25063), validación > 0, monotonía de
tramos tras redondear, agrupación de productos por lista compartida, estado de sync (igual / distinto / sin payload).

---

## Etapa 5 — Diagnóstico y recordatorio de backup

**5.1 Diagnóstico de datos** (Config → "🩺 Diagnóstico"). Solo lectura, nunca escribe. Reporte ✓/⚠/✗ con conteos
y botón "copiar reporte":
- IDs duplicados o con formato inválido (ventas, egresos, ingresos, inversiones, contactos, priceLog).
- Órdenes sin `totales`, con `tc` nulo, o con `clienteId` inexistente.
- Productos con `listaPrecioId` inexistente; listas sin productos.
- Stock plano vs lotes por producto; claves de stock huérfanas.
- Flags one-shot (`stockSeedDone`, `contactosMigDone`).
- Tamaño de `motoredge_v4` y % del límite aproximado (5 MB).

**5.2 Recordatorio de backup:**
- Indicador global en el encabezado: verde (backup al día), amarillo (cambios sin guardar), rojo (cambios sin
  guardar y más de 7 días desde el último backup, o nunca). Usa el fingerprint existente (`backupFingerprint()` vs
  `me_gh_config.lastBackupFp`). Click → card de backup en Config.
- Para calcular días se guarda además un timestamp ISO del último backup (clave de dispositivo, no se respalda),
  porque `me_gh_last_push` es texto formateado.
- Medidor en Config: "Espacio usado: X MB de ~5 MB (Y%)", aviso desde 70%.

---

## Fuera de alcance

Mover estilos inline a CSS, reemplazar todos los `confirm()` nativos, PWA, cambios en la calculadora pública,
devolver stock al eliminar ventas, dividir `inversiones.js`.

## Documentación a actualizar (CLAUDE.md, en la etapa que corresponda)

- Invariante #14: el ticket para el cliente no lleva su nombre; se elimina la ofuscación.
- Schema `priceLog`: tipo `edit`; campos `productos`, `redondeo`, `payload`; `scope` puede ser array; sin borrado.
- `sd()` devuelve booleano; modo protegido.
- Workflow git: `deploy.bat`, hook, rama `main`.
- Corrección: el campo de auditoría de las órdenes es `auditText` (CLAUDE.md dice `auditoriaText`, que no existe en
  el código).
