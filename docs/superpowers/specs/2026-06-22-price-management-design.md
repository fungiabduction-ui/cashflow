# Sistema de Gestión de Precios — Design Spec
**Fecha:** 2026-06-22  
**Estado:** Aprobado por usuario  
**Alcance:** MotorEdge 3.9-E + Calculadora pública (fungiabduction-ui/calculadora)

---

## Problema

El sistema actual permite editar listas de precios manualmente tramo por tramo, pero no tiene:
- Ajuste porcentual masivo ("subir todo 10%")
- Registro auditable de cuándo y cuánto cambiaron los precios
- Mecanismo para mantener la calculadora pública sincronizada con MotorEdge

Los datos históricos ya están aislados correctamente: cada orden guarda `lineas[].precioUnit` y `totales` sellados al momento de la venta. Cambiar precios nunca afecta márgenes pasados.

---

## Solución elegida: Ajuste Bulk + Log Inmutable + Sync Manual

**No elegido:**
- Snapshots completos (overkill de storage, sin beneficio real dado el aislamiento existente)
- Precios versionados con vigencia temporal (rompe schema, complejidad innecesaria)

---

## Componentes

### 1. Módulo `modules/price-manager.js` (nuevo)

Responsabilidades únicas:
- Calcular precios nuevos a partir de porcentaje (truncado a entero, sin redondeo)
- Aplicar cambio de forma atómica (una sola llamada `sd()`)
- Escribir entrada en el log de auditoría
- Construir `precios.json` para la calculadora

**Funciones exportadas:**
```js
applyPriceAdjustment(scope, pct, motivo)
// scope: 'all' | listaId (string)
// pct: número con signo, ej: +10, -5
// motivo: string libre
// Retorna: { ok: boolean, entry: PriceLogEntry }

buildPreciosJson()
// Lee listas actuales, retorna objeto JSON para la calculadora
// Formato: { updated: ISO, pastillas: [...], cristales: [...], hongos: [...], goteros: [...], petri: [...] }

getPriceLog()
// Retorna array de PriceLogEntry desde localStorage 'me_price_log'

getPriceLogEntry(id)
// Retorna una entrada específica del log
```

**Fórmula de ajuste (invariante crítico):**
```js
nuevoP = Math.trunc(precioActual * (1 + pct/100))
// Math.trunc: trunca hacia cero, nunca redondea
// Ejemplo: 22785 * 1.10 = 25063.5 → Math.trunc → 25063
// Ejemplo con baja: 85000 * 0.95 = 80750.0 → 80750
```

**Operación atómica:** `applyPriceAdjustment` hace UNA sola escritura `sd(d)` que incluye:
1. Las listas de precios actualizadas
2. Los `tramos` sincronizados en cada producto asignado a esas listas

El log se escribe a `me_price_log` en una operación separada inmediata después (no es parte de `motoredge_v4`).

---

### 2. Storage: `me_price_log` (nueva clave localStorage)

Clave independiente de `motoredge_v4` para no contaminar el schema principal.

**Schema de cada entrada:**
```js
{
  id: "PCH-202606-001",         // Inmutable. Formato PCH-AAAAMM-NNN. Math.max sobre IDs del mes.
  ts: "2026-06-22T15:30:41Z",   // ISO 8601 UTC. Inmutable.
  motivo: "Actualización junio", // String libre. Puede estar vacío.
  tipo: "pct",                   // Solo "pct" en v1. Extensible.
  valor: 10,                     // Número con signo. +10 = aumento 10%, -5 = baja 5%.
  scope: "all",                  // "all" | listaId. "all" = todas las listas en ese momento.
  cambios: [                     // Snapshot de cada lista afectada.
    {
      listaId: "lp-past",
      listaNombre: "Pastillas GRP",
      before: [{ t: 5, p: 22785 }, ...],   // Copia profunda ANTES del cambio.
      after:  [{ t: 5, p: 25063 }, ...]    // Copia profunda DESPUÉS del cambio.
    }
  ]
}
```

**Reglas de escritura:**
- `me_price_log` es append-only desde la app. Nunca mutar entradas existentes.
- `before` y `after` son snapshots profundos — no referencias vivas.
- Si `me_price_log` no existe o está corrupto, se inicializa como `[]` sin error.
- El log NO tiene límite de tamaño en v1 (los cambios son raros — no es stockMovs).
- El log se incluye en el backup JSON exportado por `expJSON()`.

**ID generation:**
```js
function newPriceLogId() {
  const mes = new Date().toISOString().slice(0,7).replace('-','');
  const log = getPriceLog();
  const del_mes = log.filter(e => e.id.startsWith('PCH-' + mes));
  const nums = del_mes.map(e => parseInt(e.id.split('-')[2]) || 0);
  const n = (Math.max(0, ...nums) + 1).toString().padStart(3, '0');
  return `PCH-${mes}-${n}`;
}
```

---

### 3. UI: dos nuevos sub-tabs en Inventario

#### Sub-tab "🎚 Ajuste de Precios"

Contenido:
1. **Banner de sync** — estado de última sincronización con la calculadora + botón "↑ SINCRONIZAR CALCULADORA"
2. **Panel de ajuste:**
   - Selector de alcance: "▸ Todas las listas" (default) o lista individual
   - Input numérico de porcentaje (admite positivo y negativo)
   - Selector tipo: Aumento / Descuento (controla el signo del porcentaje)
   - Campo motivo (texto libre, recomendado para auditoría)
   - Botón **PREVISUALIZAR** → renderiza tabla before/after sin escribir nada
   - Botón **APLICAR** → llama `applyPriceAdjustment`, graba log, muestra notificación
3. **Tabla preview** (visible solo tras Previsualizar):
   - Columnas: Lista / Tramo, Precio actual, →, Precio nuevo, Δ ($)
   - Agrupada por lista con header de color
   - Los "…N tramos más" colapsan si la lista tiene más de 4 tramos

**Validaciones:**
- Porcentaje = 0 → bloquear con `sN('El porcentaje debe ser distinto de cero', true)`
- Porcentaje > 100% aumento → confirmar con `confirm()` antes de aplicar
- Porcentaje de baja que llevaría algún precio a ≤ 0 → bloquear con error

#### Sub-tab "📋 Historial"

Lista de entradas del log, más reciente primero.

Cada fila muestra: timestamp, motivo, ID, scope (badge), porcentaje (verde/rojo).

Botón "▸ ver detalle" expande inline una tabla before/after de esa entrada.

Sin paginación en v1 (el log crece lento).

---

### 4. Sync calculadora: `ghSyncCalc()` en `modules/github.js`

**Config:** La calculadora necesita su propio repo. Se usa `me_gh_config` existente para el token (ya está guardado). El repo de la calculadora está hardcodeado como `fungiabduction-ui/calculadora` — no hay configuración adicional para el usuario.

**Flujo:**
1. Leer token desde `me_gh_config`
2. Llamar `buildPreciosJson()` — obtiene listas actuales
3. Obtener SHA actual de `precios.json` en el repo (GET `/repos/.../contents/precios.json`)
   - Si no existe (404) → SHA = null, operación = crear
   - Si existe → usar SHA para update
4. PUT `/repos/fungiabduction-ui/calculadora/contents/precios.json` con el JSON en Base64
5. Notificar resultado con `sN()`

**Manejo de errores:**
- Sin token configurado → `sN('Configurá GitHub primero en el tab GitHub', true)`
- 401/403 → `sN('Token sin permisos para el repo de la calculadora', true)`
- Red offline → `sN('Sin conexión — intentá de nuevo', true)`
- El botón se desactiva durante el push y se restaura siempre (success o error)

**`buildPreciosJson()` — formato de `precios.json`:**
```json
{
  "updated": "2026-06-22T15:30:41Z",
  "motoredge_version": "3.9-E",
  "pastillas": [{ "t": 5, "p": 25063 }, ...],
  "cristales": [{ "t": 1, "p": 87964 }, ...],
  "hongos":    [{ "t": 5, "p": 15400 }, ...],
  "goteros":   [{ "t": 1, "p": 93500 }],
  "petri":     [{ "t": 1, "p": 61600 }]
}
```

Mapeo desde listas: lee los productos con `id` `p-cris`, `p-hong`, `p-got`, `p-pet`, `v-cal` (como representante de pastillas) y extrae sus tramos vigentes via `getTramosProducto()`.

---

### 5. Modificación `calculadora/index.html`

Agregar al final de la definición de `PRODUCTOS` (antes de cualquier función de render), usando `.then()` en lugar de `async/await` para evitar race condition:

```js
// Precios dinámicos — override silencioso si precios.json está disponible
// Usa .then() en lugar de async/await para garantizar que el override ocurre
// antes de que el usuario interactúe (calcular() se re-dispara si ya cargó)
fetch('./precios.json?v=' + Date.now(), { cache: 'no-store' })
  .then(function(r) { return r.ok ? r.json() : null; })
  .then(function(p) {
    if (!p) return;
    var MAP = { g_pastillas: 'pastillas', g_cristales: 'cristales',
                g_hongos: 'hongos', g_goteros: 'goteros', g_petri: 'petri' };
    PRODUCTOS.forEach(function(prod) {
      var key = MAP[prod.id];
      if (key && p[key] && Array.isArray(p[key])) prod.tramos = p[key];
    });
    // Re-disparar cálculo por si el usuario ya ingresó cantidades
    if (typeof calcular === 'function') calcular();
  })
  .catch(function() { /* fallback silencioso a precios hardcodeados */ });
```

**Por qué `.then()` y no `async/await`:** El fetch es async. Con `async/await` el código POSTERIOR a `await` se ejecuta DESPUÉS del render inicial, causando que la calculadora muestre precios hardcodeados al cargar. Con `.then()`, el override se aplica en cuanto llega la respuesta y re-dispara `calcular()` — sin bloquear el render inicial pero actualizando inmediatamente al resolverse.

**Invariantes de seguridad:**
- Si `precios.json` no existe (404) → `r.ok` es false → `null` → silencioso, usa hardcodeados
- Si el JSON está malformado → `.catch()` silencioso, usa hardcodeados
- Si un producto no aparece en el JSON → ese producto conserva sus tramos hardcodeados
- `cache: 'no-store'` garantiza que no sirve una versión cacheada al cliente
- No modifica la variable `PRODUCTOS` si el fetch falla por cualquier motivo

Esta modificación se pushea al repo `fungiabduction-ui/calculadora` como parte del desarrollo — es un cambio único que no se repite.

---

## Integración con módulos existentes

### `modules/io.js` — `expJSON()` e `impJSONFile()`

**`expJSON()`** — incluir `me_price_log` en el objeto exportado:
```js
// Agregar al objeto de export junto a los datos de motoredge_v4:
priceLog: JSON.parse(localStorage.getItem('me_price_log') || '[]')
```

**`impJSONFile()`** — restaurar `me_price_log` si viene en el backup:
```js
// Después de restaurar motoredge_v4, si el backup tiene priceLog:
if (data.priceLog && Array.isArray(data.priceLog)) {
  localStorage.setItem('me_price_log', JSON.stringify(data.priceLog));
}
```
Sin esto, una restauración desde backup borra el historial de cambios de precios.

### `modules/github.js`
Agregar `ghSyncCalc()` como función exportada adicional. No modifica el flujo de `ghAutoPush()` ni `ghPush()`.

### `main.js`
- Exponer en `window`: `applyPriceAdjustment`, `buildPreciosJson`, `getPriceLog`, `ghSyncCalc`, `renderPriceAdjust`, `renderPriceLog`
- Agregar los dos nuevos sub-tabs al HTML de Inventario

### `build.bat` / `build.ps1`
Agregar `modules/price-manager.js` al orden de concatenación (después de `listas-precios.js`, antes de `github.js`).

---

## Orden de inicialización — sin cambios

El módulo `price-manager.js` no tiene dependencias de inicialización. Solo lee localStorage cuando se invoca.

---

## Lo que NO hace este sistema

- No hace rollback automático (el log es de auditoría, no de undo)
- No programa cambios de precios futuros
- No calcula el impacto en ventas pasadas (no tiene sentido — los precios históricos están en las órdenes)
- No ajusta el campo `costo` de los productos (solo precios de venta)
- No modifica `me_gh_config` — usa el token existente

---

## Checklist de invariantes

- [ ] `applyPriceAdjustment` hace exactamente UN `sd()` por ejecución
- [ ] El log usa `Math.max` para IDs, nunca conteo
- [ ] `before` en el log es copia profunda tomada ANTES de mutar
- [ ] Precios truncados con `Math.trunc`, nunca `Math.round`
- [ ] Precios resultantes nunca negativos ni cero (validación previa)
- [ ] `ghSyncCalc` siempre restaura el botón a su estado original (success o error)
- [ ] La calculadora tiene fallback silencioso si `precios.json` falla
- [ ] `me_price_log` se inicializa como `[]` si no existe o está corrupto
- [ ] El log se exporta con `expJSON()`
