# Unificar sistema de guardado (tab Config) — Design

## Contexto

El tab Config (⚙) tiene hoy 3 sistemas de guardado que se armaron por separado y ya divergieron:

1. **`ghPush()`/`ghPull()`** (`modules/github.js`) — sincroniza un archivo mutable (`datos.json`) que se pisa en cada guardado. Se dispara automáticamente vía `ghAutoPush()` (debounce 8s) después de operaciones de guardado, y manualmente con el botón "⚠️ Guardar en GitHub".
2. **`ghBackupNow()`/`ghListBackups()`/`ghRestoreBackup()`** (`modules/github.js`) — backups con timestamp en `backups/`, nunca se pisan. Solo manual.
3. **`expJSON()`/`impJSONFile()`** (`modules/io.js`) — backup/restore a un archivo local descargado por el navegador.

Cada uno arma el payload de guardado por separado (código duplicado) y ya divergieron: `ghBackupNow()` no incluye `_meta` ni `_version` que sí tienen `ghPush()` y `expJSON()`; `ghPush()` usa el campo `_savedAt` y `expJSON()` usa `_exportedAt` para lo mismo. Misma duplicación del lado de restaurar (`ghPull`, `ghRestoreBackup`, `impJSONFile` repiten la misma lógica de reintegración de `_distSlices`/`_apariencia`/etc y el mismo re-render).

Adicionalmente, dos bugs encontrados en la auditoría de un incidente de leak de datos (ver `CLAUDE.md` invariante #19):
- El input "Usuario / Repo" en `index.html:881` tiene `value="fungiabduction-ui/cashflow"` (el repo **público**) hardcodeado como default — cualquier dispositivo nuevo arranca apuntando al lugar equivocado.
- El botón "🔄 Forzar recarga" usa `location.reload(true)`, parámetro ignorado en navegadores Chromium modernos — no fuerza nada realmente.

Se usa como referencia el sistema ya implementado en `MOBY DICK/biolab-app/cfg/cfg_app.js`, que resolvió el mismo problema (`MEJ-0020`: eliminó su propio `ghPush`/`ghPull` por redundantes con el backup inmutable).

## Decisiones (confirmadas con el usuario)

1. **Sin auto-save.** Se elimina `ghAutoPush()` y sus 11 call sites. El guardado a GitHub pasa a ser 100% manual, respaldado por un indicador visual de "cambios sin guardar" (fingerprint), igual que biolab-app.
2. **Se unifica también el código interno**, no solo la UI — una función arma el payload, una función restaura, usadas por los 3 puntos de entrada (GitHub backup, GitHub restore/load-latest, local download/upload).
3. **Sin la feature "¿Qué cambió?"** (diff entre backups) de biolab — fuera de alcance, se puede agregar después si hace falta.
4. `ghSyncCalc()` (sube `precios.json` a la calculadora pública, repo hardcodeado aparte) **no se toca** — es un sistema aparte sin relación con este refactor.

## Diseño

### Módulo nuevo `modules/backup.js`

Sin conocimiento de GitHub — solo maneja "qué es un backup" y "cómo se restaura". Dependencias: `core/storage.js`, `ui/notif.js`.

```js
export function buildBackupPayload()
// ld() + me_dist_slices + me_liq_dist_slices + me_dist_kpi_hidden + me_apariencia + me_theme
// + _meta {orders, egresos, inversiones, productos, listasPrecios, ingresos, lotesItems, contactos}
// + _version='motoredge_v5' + _savedAt=ISO now
// Reemplaza la lógica hoy duplicada en ghPush/ghBackupNow/expJSON.

export function restoreBackupPayload(data, opts)
// Valida data.orders (Array). Descarga backup de seguridad pre-restore del estado ACTUAL
// (universaliza lo que hoy solo hace impJSONFile). Reintegra _distSlices/_liqDistSlices/
// _distKpiHidden/_apariencia/_theme, compat priceLog (_priceLog legado, o preserva el local
// si el backup no trae ninguno), borra campos _meta, sd(data), dispara el mismo re-render
// completo que ya usan ghPull/ghRestoreBackup/impJSONFile (rfM, rH, rS, rEH, rES, renderDash,
// renderSettings, renderInventario, renderInvAll, rfInvM, updateClientesDatalist, uhd,
// renderPriceTerminal, renderPriceLog, loadConfig, buildTicketUI, upd).
// Retorna la cantidad de campos restaurados para el mensaje de confirmación.

export function backupFingerprint(dataObj)
// FNV-1a doble (siguiendo el patrón de biolab-app) sobre JSON.stringify(dataObj) EXCLUYENDO
// _savedAt/_meta (para que no cambie solo por la hora al recalcularlo). Usado para detectar
// "hay cambios sin guardar" comparando contra el último fingerprint guardado.
```

### `modules/github.js`

Se borran `ghPush`, `ghPull`, `ghAutoPush`, `ghGetFileSha` (ya no hay archivo mutable que trackear por SHA). Se mantiene intacto el guard `ghIsUnsafeRepo()` agregado hoy — pasa a proteger solo `ghSaveToken` y `ghBackupNow`.

Quedan / se agregan:
- `ghBackupNow()` → usa `buildBackupPayload()`, mantiene el nombre de archivo exactamente como está hoy (`backups/backup_YYYY-MM-DD_HHMM.json`, sin cambios de formato), guarda `lastBackupFp`/`lastBackupSource:'save'`/`lastSync` dentro de `me_gh_config`.
- `ghListBackups()` → agrega botón "⬇ Descargar" por fila (nuevo `ghDownloadBackup(path)`, mismo patrón blob-decode-download que ya usa `ghRestoreBackup`), además de "↩ Restaurar" que ya existe.
- `ghLoadLatest()` (nuevo) → busca el backup más reciente en `backups/` (mismo criterio de orden que ya calcula `ghListBackups`) y lo restaura vía `restoreBackupPayload()`. Guarda `lastBackupFp`/`lastBackupSource:'load'` (no toca `lastSync` — cargar no es guardar).
- `ghRestoreBackup(path)` → usa `restoreBackupPayload()`.
- `ghInit()` → además de cargar la config, calcula el fingerprint actual vs `lastBackupFp` guardado y pinta el indicador de cambios sin guardar. Ya se llama en cada render del tab Settings (`tabs.js:102`), no hace falta wiring nuevo.
- Se borra el campo "Archivo de datos" de `ghCfg`/`ghSaveToken`/`index.html` — ya no aplica, el nombre de archivo de backup es fijo (`backup_FECHA_HORA.json`).
- `index.html:881` → el input repo pasa a `value="fungiabduction-ui/motoredge-data"` (el repo privado correcto).

### `modules/io.js`

`expJSON()` e `impJSONFile()` pasan a ser wrappers finos: arman el nombre de archivo y disparan la descarga/lectura, pero el payload y la restauración vienen de `backup.js`. `hardReset()` sin cambios de lógica, pero el reload final usa el cache-bust nuevo (ver abajo) en vez de `location.reload()` a secas.

### Los 11 call sites de `ghAutoPush()` — se eliminan sin reemplazo

| Archivo | Línea | Función |
|---|---|---|
| contactos.js | 108 | guardarInfoContacto (edit contacto) |
| contactos.js | 483 | ejecutarMigracionContactos |
| egresos.js | 7 | sE() |
| liquidez.js | 15 | sLiqExterna / registrarLiqExterna |
| mp-import.js | 128 | confirmación de import MP |
| price-manager.js | 114 | applyPriceAdjustment |
| price-manager.js | 366 | restoreFromPriceLog |
| inversiones.js | 22 | sInv() |
| inversiones.js | 895 | invGenerar / liquidación |
| ventas.js | 10 | sO() |
| ventas.js | 15 | confirmarOrden |

### Botón "Forzar recarga" — cache-bust real

Sin Service Worker ni Cache API en toda la app (confirmado, no hace falta agregar ninguno). El mecanismo de biolab (purgar `caches`/desregistrar SW) no aplica. Fix equivalente para un `<script src="bundle.js">` estático:

- `index.html` reemplaza el `<script src="bundle.js"></script>` fijo por un loader inline mínimo que arma el `src` con un query param tomado de `location.search` (o `Date.now()` la primera vez), insertado como `<script>` real (no `document.write`) para no perder el orden de ejecución.
- El botón "Forzar recarga" navega a `location.pathname+'?v='+Date.now()` en vez de `location.reload(true)` — URL nueva → el navegador no puede servir `bundle.js` desde caché con la query distinta.
- `hardReset()` usa el mismo patrón al recargar tras borrar todo.

### UI del tab Config

Se fusionan las cards "☁ GitHub Sync" + "🔒 Backup de seguridad" en una sola card "☁ Backups en GitHub":
- Config: token + repo (sin campo "archivo").
- Estado: "✓ Todo guardado (último: HH:MM)" o "⚠ Cambios sin guardar desde el último backup" — basado en `backupFingerprint`.
- Botones: "🔒 Guardar backup ahora" / "⬇ Cargar el más reciente" / "📋 Ver todos los backups" (lista con Descargar + Restaurar por fila).

La card "📂 Datos" (local) queda igual en estructura (Descargar JSON / Restaurar desde .json), solo cambia su implementación interna para usar `backup.js`.

### `main.js`

- Línea 7: el import de `github.js` pierde `ghPush, ghPull, ghAutoPush`, gana `ghLoadLatest, ghDownloadBackup`. `main.js` NO importa `backup.js` directamente — `buildBackupPayload`/`restoreBackupPayload`/`backupFingerprint` quedan internas, consumidas solo por `github.js` e `io.js` (nada en `index.html` las llama por `onclick`, no necesitan exposición a `window`).
- Línea 53: actualizar comentario ("antes del primer ghAutoPush" → ya no aplica).
- Línea 156 (`Object.assign(window,...)`): pierde `ghPush, ghPull`, gana `ghLoadLatest, ghDownloadBackup`.

### `build.ps1`

Se agrega `"modules/backup.js"` al array `$files`, entre `"core/config.js"` y `"modules/github.js"` (backup.js solo necesita storage.js+notif.js, ya cargados antes; github.js e io.js lo consumen después).

### `CLAUDE.md`

- Reemplaza el invariante #8 (ghAutoPush obligatorio tras sO/sE/sLiqExterna/sInv) por el nuevo modelo: guardado 100% manual, `buildBackupPayload()`/`restoreBackupPayload()` como única fuente de verdad, fingerprint para el indicador de cambios sin guardar.
- Reescribe la tabla "Flujos de backup — cobertura completa" (quita filas de ghPush/ghPull, agrega ghLoadLatest/ghDownloadBackup).
- Agrega `backup` al grafo de dependencias de módulos: `backup ← storage, notif`; `github ← storage, notif, backup`; `io ← storage, notif, formatters, productos, stock, inventario, listas-precios, backup`.
- Actualiza sección "Estructura de archivos" con `modules/backup.js`.

## Fuera de alcance

- Feature "¿Qué cambió?" (diff entre backups consecutivos).
- Tocar `ghSyncCalc()` / sync con la calculadora pública.
- Cifrado/ofuscación del token guardado en `me_gh_config` (biolab hace un `btoa` trivial, no es seguridad real — no se replica salvo pedido explícito).
- Migrar o borrar el `datos.json` viejo que quedó en el repo privado `motoredge-data` — queda huérfano sin uso, inofensivo, no se toca.
