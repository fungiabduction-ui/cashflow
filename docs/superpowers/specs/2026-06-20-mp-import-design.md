# Importador MercadoPago — Design Spec
**Fecha:** 2026-06-20  
**Módulo:** `modules/mp-import.js` (nuevo)  
**Estado:** Aprobado

---

## Qué resuelve

El usuario tiene gastos mensuales en MercadoPago (QR, PedidosYa, suscripciones, transferencias) que hoy carga manualmente en Egresos. La solución permite descargar el CSV oficial de MP y cargarlo masivamente con un modal, reemplazando la carga manual.

---

## Formato del CSV de MP

Descargado desde MercadoPago → Actividad → Exportar → CSV.

```
INITIAL_BALANCE;CREDITS;DEBITS;FINAL_BALANCE
43.135,71;632.708,96;-551.944,25;123.900,42

RELEASE_DATE;TRANSACTION_TYPE;REFERENCE_ID;TRANSACTION_NET_AMOUNT;PARTIAL_BALANCE
02-06-2026;Pago PedidosYa;161454707537;-13.921,20;29.676,12
```

- Separador: `;`
- Fechas: `DD-MM-YYYY`
- Números: formato argentino (`.` miles, `,` decimal)
- `TRANSACTION_NET_AMOUNT < 0` → egreso  
- `REFERENCE_ID` → identificador único por transacción

---

## UX — Flujo completo

### Entrada
Botón **"⬆ Importar MP"** en la barra del tab Egresos, al lado de "+ Nuevo egreso".

### Estado 1 — Drop zone
Modal con zona drag & drop. El usuario arrastra el CSV descargado de MP, o clickea para seleccionar archivo.

### Estado 2 — Preview
Tabla filtrada con **solo los egresos** (TRANSACTION_NET_AMOUNT < 0). Columnas:

| Col | Detalle |
|---|---|
| Checkbox | Pre-chequeado. Desmarcable por el usuario. |
| Fecha | `DD/MM` display |
| Concepto | Input editable. Pre-llenado con `TRANSACTION_TYPE`. |
| Monto | ARS, formato `fi()`. Read-only. |

**Estados de fila:**
- **Normal**: checkbox ☑, concepto editable, monto en rojo
- **Deseleccionada**: checkbox ☐, concepto disabled (gris)
- **Ya importada** (REFERENCE_ID duplicado): checkbox disabled, badge `MP` gris, no se puede seleccionar

Header del preview:
- Contador: `14 egresos detectados · $551.944 ARS total`
- Link: `☑ todos / ☐ ninguno`

Footer del preview:
- Info: `X ya importados · Y deseleccionados`
- Botón: `Importar N egresos →`

### Post-importación
Notificación toast. Modal se cierra. La lista de egresos se refresca.

---

## Schema del egreso importado

Igual al egreso manual. Campo extra: `mpRefId` (string | null).

```js
{
  id: "E-202606-0042",        // generado con nEId()
  fecha: "2026-06-02",        // parseada de DD-MM-YYYY → YYYY-MM-DD
  concepto: "Pago PedidosYa", // editable en preview
  montoTotal: 13921.20,       // |TRANSACTION_NET_AMOUNT|
  cuotas: 1,                  // siempre 1 para importaciones
  impactoCaja: 13921.20,      // montoTotal / cuotas = montoTotal
  moneda: "ARS",              // siempre ARS
  obs: "",
  mpRefId: "161454707537",    // REFERENCE_ID — para dedup. null en egresos manuales.
  ticketText: "..."
}
```

`mpRefId` es el único campo nuevo en el schema. Los egresos manuales no lo tienen (undefined/null), lo que es retrocompatible.

---

## Detección de duplicados

Al cargar el CSV, buscar cada `REFERENCE_ID` entre los egresos existentes:

```js
const importados = new Set(gE().filter(e => e.mpRefId).map(e => e.mpRefId));
```

Si `importados.has(row.REFERENCE_ID)` → fila en estado "ya importada" (disabled, no seleccionable).

---

## Módulo nuevo: `modules/mp-import.js`

### Funciones exportadas

| Función | Qué hace |
|---|---|
| `parseMPCsv(text)` | Parsea el texto del CSV. Retorna array de `{fecha, concepto, monto, refId}` solo con negativos. |
| `renderMPImportModal()` | Construye y muestra el modal. Llama a `parseMPCsv()` al cargar el archivo. |
| `ejecutarImportMP(filas)` | Recibe las filas seleccionadas, crea egresos con `nEId()` + `sd()`, llama `ghAutoPush()`, refresca `rEH()`. |

### Dependencias
```
mp-import ← storage, notif, formatters, ids, github, egresos
```

No hay dependencias circulares. `rEH()` se llama via `window.rEH?.()`.

---

## Integración en archivos existentes

### `modules/egresos.js`
Agregar botón "⬆ Importar MP" en el HTML generado por `rEH()` (o en el HTML estático de `index.html`).

### `main.js`
Agregar import de `mp-import.js` y exponer `renderMPImportModal` en `window`.

### `build.bat` / `build.ps1`
Incluir `modules/mp-import.js` en el orden de concatenación (después de `egresos.js`).

### `index.html`
El botón puede ser estático en el HTML del tab Egresos:
```html
<button onclick="renderMPImportModal()">⬆ Importar MP</button>
```

---

## Lo que NO hace esta feature

- No llama a la API de MP (CORS bloqueado en browser sin backend)
- No importa ingresos ni rendimientos
- No divide en cuotas (siempre cuotas=1; el usuario puede editar después)
- No crea contactos a partir de "Transferencia enviada X"

---

## Archivos a crear/modificar

| Archivo | Acción |
|---|---|
| `modules/mp-import.js` | CREAR |
| `modules/egresos.js` | Agregar botón Importar MP |
| `main.js` | Agregar import + window exposure |
| `index.html` | Botón en tab Egresos (si va estático) |
| `build.ps1` | Incluir mp-import.js en el bundle |
| `CLAUDE.md` | Documentar mpRefId en schema de egreso |
