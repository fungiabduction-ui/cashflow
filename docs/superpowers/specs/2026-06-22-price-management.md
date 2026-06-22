# Spec: Consolidación Lista de Precios + Generador WhatsApp

**Fecha:** 2026-06-22  
**Área:** Inventario → sub-tab 💲 Lista de Precios  

---

## Problema

El panel Inventario tiene 6 sub-tabs. Tres de ellos son de precios y están fragmentados:
- `💲 Lista de Precios` — listas y asignación
- `🎚 Ajuste Precios` — cambio bulk + terminal activity log
- `📋 Historial Precios` — log detallado expandible

Además no existe ninguna forma de generar texto de lista de precios listo para pegar en WhatsApp.

---

## Objetivo

1. Reducir sub-tabs de 6 a 4 fusionando todo lo de precios en `💲 Lista de Precios`.
2. Agregar generador de texto WhatsApp al fondo del tab.

---

## Cambios de navegación

**Antes (6 sub-tabs):**
`📥 Ingresos | 💲 Lista de Precios | 📦 Stock | 📋 Historial | 🎚 Ajuste Precios | 📋 Historial Precios`

**Después (4 sub-tabs):**
`📥 Ingresos | 💲 Lista de Precios | 📦 Stock | 📋 Historial`

Archivos afectados: `index.html`, `modules/inventario.js`

---

## Estructura del sub-tab `inv-sub-precios` (apilada)

```
inv-sub-precios
  ├── [existente] Listas y tramos          ← renderListasPrecios()
  ├── [existente] Asignación a productos   ← renderAsignacionPrecios()
  ├── [movido]   💸 Cambio de precios      ← renderPriceAdjust() — contenido de inv-sub-price-adjust
  ├── [movido]   📋 Historial de cambios   ← renderPriceLog() — contenido de inv-sub-price-log
  └── [nuevo]    📱 Lista para WhatsApp    ← renderWAText()
```

Los `div#inv-sub-price-adjust` y `div#inv-sub-price-log` se eliminan del HTML.  
`renderPriceAdjust()` y `renderPriceLog()` apuntan a nuevos contenedores dentro de `inv-sub-precios`.

---

## Cambios en `invSubNav()`

```js
// Antes:
['ingresos','precios','stock','movs','price-adjust','price-log']

// Después:
['ingresos','precios','stock','movs']
```

Al activar `precios` se llama secuencialmente:
```js
window.renderListasPrecios?.()
window.renderAsignacionPrecios?.()
window.renderPriceAdjust?.()
window.renderPriceLog?.()
renderWAText()
```

`renderPriceAdjust()` y `renderPriceLog()` usan nuevos IDs de contenedor:
- `inv-price-adjust-wrap` (dentro de inv-sub-precios)
- `inv-price-log-wrap` (dentro de inv-sub-precios)

---

## Generador de texto WhatsApp

### Función: `renderWAText()`

**Ubicación:** `modules/listas-precios.js` (exportada + expuesta en window)

**Disparador:** llamada desde `invSubNav('precios')` en `modules/inventario.js`

**Contenedor HTML:** `<div id="inv-wa-wrap">` dentro de `inv-sub-precios`

### Lógica

```
productos = getProductos().filter(p => p.activo !== false && p.listaPrecioId)
por cada producto:
  tramos = getTramosProducto(producto)
  generar bloque de texto
texto final = bloques unidos por \n\n
```

### Regla de emojis semáforo

Con `n` tramos totales:
- 🔴 índice `0` (primer tramo — mínimo)
- 🟢 índices `>= n - Math.ceil(n / 3)` (mayorista)
- 🟡 todo lo demás (comerciante)

Ejemplos:
| n | 🔴 | 🟡 | 🟢 |
|---|---|---|---|
| 3 | 0 | 1 | 2 |
| 5 | 0 | 1-2 | 3-4 |
| 8 | 0 | 1-4 | 5-7 |

### Formato de línea

```
[emoji][t] × $[fi(p)] = $[fi(t * p)]
```

Ejemplo: `🔴5 × $34.177 = $170.885`

### Formato de bloque por producto

```
[emoji] *[nombre]*
🔴[t] × $[p] = $[total]
🟡[t] × $[p] = $[total]
...
```

### Formato texto completo (múltiples productos)

```
💀 *Calaveras*
🔴5 × $34.177 = $170.885
🟡10 × $32.602 = $326.020
...

🧸 *Teddy*
🔴5 × $xx.xxx = $xxx.xxx
...
```

### UI del bloque

```html
<div class="inv-module">
  <div class="inv-module-hdr">
    📱 Lista para WhatsApp
    <button id="btn-wa-copy">📋 Copiar</button>
  </div>
  <textarea id="wa-text" readonly></textarea>   <!-- auto-height, font monospace -->
</div>
```

- Si no hay productos con lista asignada: mensaje "Asigná listas a productos para generar el texto."
- Botón Copiar: `navigator.clipboard.writeText()` + cambia a "✓ Copiado" por 2s.

---

## Archivos a modificar

| Archivo | Cambio |
|---|---|
| `index.html` | Eliminar botones sub-tab price-adjust y price-log; eliminar divs inv-sub-price-adjust e inv-sub-price-log; agregar contenedores inv-price-adjust-wrap, inv-price-log-wrap, inv-wa-wrap dentro de inv-sub-precios |
| `modules/inventario.js` | Reducir array de sub-tabs a 4; agregar llamadas a render en rama `precios` |
| `modules/price-manager.js` | Cambiar IDs target en renderPriceAdjust() e renderPriceLog() |
| `modules/listas-precios.js` | Agregar renderWAText() + exportar |
| `main.js` | Agregar renderWAText a window exposure |
| `build.bat` | Regenerar bundle.js |

---

## Lo que NO cambia

- Lógica de `applyPriceAdjustment()`, `getPriceLog()`, `ghSyncCalc()` — sin tocar.
- IDs de listas de precios, formato de storage — sin tocar.
- El terminal activity log dentro de `renderPriceAdjust()` se mantiene tal cual.
- La etiqueta del botón en UI de ajuste se actualiza de "🎚 Ajuste de precios" a "💸 Cambio de precios" solo en el header visual, no en IDs ni keys de storage.
