# Consolidación Lista de Precios + Generador WhatsApp — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fusionar los sub-tabs "🎚 Ajuste Precios" y "📋 Historial Precios" dentro de "💲 Lista de Precios", y agregar un generador de texto WhatsApp al fondo de ese tab.

**Architecture:** Secciones apiladas dentro del pane `inv-sub-precios`. Se eliminan los panes `inv-sub-price-adjust` e `inv-sub-price-log` del HTML y se crean contenedores inline `inv-price-adjust-wrap`, `inv-price-log-wrap`, `inv-wa-wrap` dentro del pane unificado. La función `invSubNav()` pasa de 6 sub-tabs a 4.

**Tech Stack:** Vanilla JS ES Modules, HTML, no framework, bundle generado por `build.bat` / `build.ps1`.

---

## File Map

| Archivo | Cambio |
|---|---|
| `index.html` | Eliminar 2 botones sub-nav + 2 panes; agregar 3 contenedores en `inv-sub-precios` |
| `modules/inventario.js` | `invSubNav()`: reducir array a 4, agregar renders en rama `precios` |
| `modules/price-manager.js` | `renderPriceAdjust()`: nuevo ID contenedor + label; `renderPriceLog()`: nuevo ID contenedor |
| `modules/listas-precios.js` | Agregar `renderWAText()` + exportar |
| `main.js` | Agregar `renderWAText` al import + al `Object.assign(window, {...})` |
| `bundle.js` | Regenerado por `build.bat` (NO editar a mano) |

---

## Task 1: HTML — Eliminar sub-tabs sobrantes y agregar contenedores

**Files:**
- Modify: `index.html:224-231` (sub-nav buttons)
- Modify: `index.html:252-269` (pane inv-sub-precios)
- Modify: `index.html:329-335` (panes price-adjust y price-log)

- [ ] **Step 1: Eliminar botones de sub-nav sobrantes**

En `index.html` líneas 229-230, reemplazar:
```html
    <button class="inv-sub-btn"        id="isb-price-adjust" onclick="invSubNav('price-adjust')">🎚 Ajuste Precios</button>
    <button class="inv-sub-btn"        id="isb-price-log"    onclick="invSubNav('price-log')">📋 Historial Precios</button>
```
con: *(eliminar esas dos líneas — quedan solo 4 botones)*

- [ ] **Step 2: Agregar contenedores al pane inv-sub-precios**

En `index.html`, reemplazar:
```html
  </div><!-- /inv-sub-precios -->
```
con:
```html
    <!-- Módulo: cambio de precios -->
    <div id="inv-price-adjust-wrap"></div>
    <!-- Módulo: historial de cambios -->
    <div id="inv-price-log-wrap"></div>
    <!-- Módulo: WhatsApp -->
    <div id="inv-wa-wrap"></div>
  </div><!-- /inv-sub-precios -->
```

- [ ] **Step 3: Eliminar los panes vacíos price-adjust y price-log**

En `index.html`, reemplazar:
```html
  <!-- ── SUB: AJUSTE DE PRECIOS ── -->
  <div id="inv-sub-price-adjust" class="inv-sub-pane" style="display:none">
  </div><!-- /inv-sub-price-adjust -->

  <!-- ── SUB: HISTORIAL DE PRECIOS ── -->
  <div id="inv-sub-price-log" class="inv-sub-pane" style="display:none">
  </div><!-- /inv-sub-price-log -->
```
con: *(eliminar esas 7 líneas — no reemplazar con nada)*

- [ ] **Step 4: Verificar HTML**

Abrir `index.html` en el navegador. Sub-nav Inventario debe mostrar exactamente 4 botones: `📥 Ingresos | 💲 Lista de Precios | 📦 Stock | 📋 Historial`. Sin errores en consola.

---

## Task 2: inventario.js — Actualizar invSubNav()

**Files:**
- Modify: `modules/inventario.js:130-143`

- [ ] **Step 1: Reemplazar la función invSubNav**

En `modules/inventario.js`, reemplazar:
```js
// ── Sub-navegación ──
export function invSubNav(sub){
  ['ingresos','precios','stock','movs','price-adjust','price-log'].forEach(s=>{
    const pane=document.getElementById('inv-sub-'+s);
    const btn=document.getElementById('isb-'+s);
    if(pane)pane.style.display=s===sub?'':'none';
    if(btn){btn.classList.toggle('active',s===sub);}
  });
  if(sub==='ingresos'){renderIngresoForm();renderProductosRegistrados();}
  if(sub==='precios'){window.renderListasPrecios?.();window.renderAsignacionPrecios?.();}
  if(sub==='stock')renderInvStock();
  if(sub==='movs')renderStockHistorial();
  if(sub==='price-adjust')window.renderPriceAdjust?.();
  if(sub==='price-log')window.renderPriceLog?.();
}
```
con:
```js
// ── Sub-navegación ──
export function invSubNav(sub){
  ['ingresos','precios','stock','movs'].forEach(s=>{
    const pane=document.getElementById('inv-sub-'+s);
    const btn=document.getElementById('isb-'+s);
    if(pane)pane.style.display=s===sub?'':'none';
    if(btn){btn.classList.toggle('active',s===sub);}
  });
  if(sub==='ingresos'){renderIngresoForm();renderProductosRegistrados();}
  if(sub==='precios'){
    window.renderListasPrecios?.();
    window.renderAsignacionPrecios?.();
    window.renderPriceAdjust?.();
    window.renderPriceLog?.();
    window.renderWAText?.();
  }
  if(sub==='stock')renderInvStock();
  if(sub==='movs')renderStockHistorial();
}
```

---

## Task 3: price-manager.js — Actualizar IDs de contenedor y label

**Files:**
- Modify: `modules/price-manager.js:192`
- Modify: `modules/price-manager.js` (texto del header dentro de renderPriceAdjust)
- Modify: `modules/price-manager.js:299`

- [ ] **Step 1: Cambiar ID contenedor en renderPriceAdjust()**

En `modules/price-manager.js`, reemplazar:
```js
  const cont=document.getElementById('inv-sub-price-adjust');if(!cont)return;
```
con:
```js
  const cont=document.getElementById('inv-price-adjust-wrap');if(!cont)return;
```

- [ ] **Step 2: Cambiar label del header en renderPriceAdjust()**

En `modules/price-manager.js`, dentro del template string de `cont.innerHTML`, reemplazar:
```js
    <div style="font-family:var(--mo);font-size:9px;letter-spacing:1px;color:var(--ac);text-transform:uppercase;margin-bottom:12px">🎚 Ajustar precios en bulk</div>
```
con:
```js
    <div style="font-family:var(--mo);font-size:9px;letter-spacing:1px;color:var(--ac);text-transform:uppercase;margin-bottom:12px">💸 Cambio de precios</div>
```

- [ ] **Step 3: Cambiar ID contenedor en renderPriceLog()**

En `modules/price-manager.js`, reemplazar:
```js
  const cont=document.getElementById('inv-sub-price-log');if(!cont)return;
```
con:
```js
  const cont=document.getElementById('inv-price-log-wrap');if(!cont)return;
```

---

## Task 4: listas-precios.js — Agregar renderWAText()

**Files:**
- Modify: `modules/listas-precios.js` (agregar al final del archivo)

- [ ] **Step 1: Agregar la función al final del archivo**

En `modules/listas-precios.js`, después de la última línea (`export function renderInvPrecios(){renderListasPrecios();}`), agregar:

```js
// ── WhatsApp text generator ──
export function renderWAText(){
  const cont=document.getElementById('inv-wa-wrap');if(!cont)return;
  const prods=(window.getProductos?.()||[]).filter(p=>p.activo!==false&&p.listaPrecioId);
  if(!prods.length){
    cont.innerHTML='<div class="inv-module"><div style="padding:16px;font-family:var(--mo);font-size:10px;color:var(--tx3);text-align:center">Asigná listas a productos para generar el texto.</div></div>';
    return;
  }
  function waEmoji(i,n){
    const gs=n-Math.ceil(n/3);
    if(i===0)return'🔴';
    if(i>=gs)return'🟢';
    return'🟡';
  }
  const bloques=prods.map(p=>{
    const tramos=getTramosProducto(p);
    const n=tramos.length;
    const lineas=tramos.map((t,i)=>`${waEmoji(i,n)}${t.t} × $${fi(t.p)} = $${fi(t.t*t.p)}`);
    return`${p.emoji} *${p.nombre}*\n${lineas.join('\n')}`;
  });
  const texto=bloques.join('\n\n');
  cont.innerHTML=`<div class="inv-module">
    <div class="inv-module-hdr" style="justify-content:space-between">
      <span>📱 Lista para WhatsApp</span>
      <button id="btn-wa-copy" class="pm-btn" style="font-size:8px;height:28px;padding:0 12px">📋 Copiar</button>
    </div>
    <div style="padding:10px 14px">
      <textarea id="wa-text" readonly style="width:100%;background:var(--s1);border:1px solid var(--br);color:var(--tx);font-family:'Courier New',Courier,monospace;font-size:10px;line-height:1.6;padding:10px;outline:none;resize:none;box-sizing:border-box"></textarea>
    </div>
  </div>`;
  const ta=document.getElementById('wa-text');
  if(ta){ta.value=texto;ta.style.height='auto';ta.style.height=ta.scrollHeight+'px';}
  document.getElementById('btn-wa-copy').onclick=function(){
    navigator.clipboard.writeText(texto).then(()=>{
      this.textContent='✓ Copiado';
      setTimeout(()=>{this.textContent='📋 Copiar';},2000);
    });
  };
}
```

**Nota importante:** El texto de la textarea se asigna via `ta.value = texto` (no como innerHTML). Los asteriscos `*nombre*` son literales — WhatsApp los interpreta como negrita al pegar.

---

## Task 5: main.js — Exponer renderWAText en window

**Files:**
- Modify: `main.js:10`
- Modify: `main.js:150-151`

- [ ] **Step 1: Agregar al import de listas-precios**

En `main.js` línea 10, reemplazar:
```js
import { getListasPrecios, saveListasPrecios, newListaId, getTramosProducto, renderListasPrecios, renderAsignacionPrecios, abrirNuevaLista, abrirEditarLista, eliminarLista, renderInvPrecios } from './modules/listas-precios.js';
```
con:
```js
import { getListasPrecios, saveListasPrecios, newListaId, getTramosProducto, renderListasPrecios, renderAsignacionPrecios, abrirNuevaLista, abrirEditarLista, eliminarLista, renderInvPrecios, renderWAText } from './modules/listas-precios.js';
```

- [ ] **Step 2: Agregar al Object.assign(window)**

En `main.js`, reemplazar:
```js
  renderListasPrecios, renderAsignacionPrecios, abrirNuevaLista,
  abrirEditarLista, eliminarLista, renderInvPrecios,
```
con:
```js
  renderListasPrecios, renderAsignacionPrecios, abrirNuevaLista,
  abrirEditarLista, eliminarLista, renderInvPrecios, renderWAText,
```

---

## Task 6: Build y verificación final

- [ ] **Step 1: Regenerar bundle**

```powershell
cd "c:/Users/JET/Desktop/JET-CASHFLOW APP/Nueva carpeta (2)"
.\build.bat
```

Esperado: sin errores de sintaxis. Si falla, revisar backticks mal cerrados en los templates string de los pasos anteriores.

- [ ] **Step 2: Verificar en navegador**

Abrir `index.html`. Ir a **📦 Inventario**. Verificar en orden:

1. Sub-nav: exactamente 4 botones (`📥 Ingresos | 💲 Lista de Precios | 📦 Stock | 📋 Historial`)
2. Click **💲 Lista de Precios** → se cargan apiladas: Listas, Asignación, 💸 Cambio de precios, Historial, 📱 WhatsApp
3. Sección **💸 Cambio de precios**: sync banner + form de ajuste + terminal activity log
4. Sección **📋 Historial**: log detallado expandible con entradas previas
5. Sección **📱 Lista para WhatsApp**: textarea con texto formateado, emojis 🔴🟡🟢 según tramos
6. Click **📋 Copiar** → texto en portapapeles, botón cambia a "✓ Copiado" por 2 segundos
7. Pegar en cualquier editor de texto: verificar que los `*nombre*` son literales y los saltos de línea están correctos

- [ ] **Step 3: Commit**

```powershell
git add index.html modules/inventario.js modules/price-manager.js modules/listas-precios.js main.js bundle.js
git commit -m "feat: fusionar tabs de precios en Lista de Precios + generador WhatsApp"
```
