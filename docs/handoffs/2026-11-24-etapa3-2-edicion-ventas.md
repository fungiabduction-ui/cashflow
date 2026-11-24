# Handoff — 3.2 Edición de ventas (2026-11-24)

## Objetivo
Construir la **3.2 — Edición de ventas** del spec aprobado `docs/superpowers/specs/2026-11-24-motoredge-mejoras-design.md`
(§Etapa 3, desde «3.2 Edición de ventas»: tabla de 10 defectos a–j + «Comportamiento esperado»). Después, en otra
sesión: **Etapa 5** (diagnóstico + recordatorio de backup, §Etapa 5).

## Qué dijo el usuario
- Con spec aprobado: escribir el plan (`superpowers:writing-plans`) y ejecutarlo **sin pedir aprobación del plan ni
  elegir modo de ejecución** (inline). Preguntar solo ante una decisión nueva de verdad, en una línea de texto.
- Opus siempre. La app nunca queda rota entre etapas. Push con `deploy.ps1` solo con su OK (pedirlo en una línea).
- Token de GitHub: «no rote el token pero no hace falta» → **no recordarlo más**.
- Sin respuesta todavía (no hacerlo sin que lo pida): cache-busting de `bundle.js`. El loader de `index.html`
  (~línea 975) usa `bundle.js?v=` + `?v` de la URL, por defecto `1`, así que el navegador sirve el viejo hasta borrar
  caché (le pasó hoy). Arreglo posible: que `build.ps1` escriba una versión nueva en el loader en cada build.

## Estado
- **Etapas 1, 2, 3.1 y 4 hechas y subidas** (`bf00e53`, local `main` = `origin/main`). Plan de la 2:
  `docs/superpowers/plans/2026-11-24-etapa2-robustez.md`.
- Etapa 2 dejó: `sd()` devuelve `true/false` y da el mensaje; modo protegido (CLAUDE.md invariante #1).
  **`saveEditVenta()` ya corta si `sd()` falla** (`modules/ventas.js`, `if(!sd(d))return;`): mantenerlo. El spec pide
  un solo `sd()` para orden + stock + movimientos.
- Tests: 22 en verde (`run-tests.bat` o `node --test "tests/**/*.test.mjs"`). Harness `tests/helpers/env.mjs`
  (`localStorage` en memoria, `globalThis.__store`, `resetStorage`, `leer`, `contarEscrituras`); ejemplos de cómo
  simular DOM y storage lleno en `tests/guardado.test.mjs`.
- Aviso vigente al usuario: evitar editar ventas con descuento o en USD/USDT/MIX hasta que salga la 3.2.

## Tareas en orden
1. Reproducir los defectos con `superpowers:systematic-debugging` sobre una copia de datos (no los reales).
   **Terminado:** cada defecto a–j confirmado o descartado con evidencia, anotado en el plan.
2. Plan en `docs/superpowers/plans/2026-11-24-etapa3-2-edicion-ventas.md` (o fecha del día). **Terminado:** guardado y
   commiteado.
3. Construir con TDD (test de idempotencia con órdenes ARS, USD, USDT, MIX, con ajuste y legacy; stock delta; cliente;
   escapado). **Terminado:** tests nuevos + los 22 en verde; `node --check bundle.js` ok.
4. Prueba en navegador con datos de prueba (abajo). **Terminado:** editar sin cambios no altera la orden; cambios de
   cantidad mueven stock; sin errores de consola.
5. CLAUDE.md: corregir `auditoriaText` → `auditText` (el código usa `auditText`); documentar `buildTicketText(o)` y
   `costo` por línea. Push con OK: `powershell -NoProfile -ExecutionPolicy Bypass -File .\deploy.ps1 -Mensaje "..."`.
   **Terminado:** `git rev-list --left-right --count HEAD...origin/main` da `0 0`.
6. Avisar al usuario que ya puede editar ventas con descuento/USD/USDT/MIX. `/handoff` para la Etapa 5.

## Cómo verificar en navegador
- Servidor: `python -m http.server 7432 --bind 127.0.0.1` en segundo plano desde la raíz; cortarlo con TaskStop.
- Scripts CDP (Chrome headless, Node 24, sin npm) para copiar y adaptar: `docs/handoffs/2026-11-24-cdp-prueba-etapa2.mjs`
  (el más nuevo), `…-cdp-prueba-ticket.mjs`. Uso: `node <script> <carpeta-perfil-en-scratchpad>`. Elegir productos
  con stock > 0 (v-cal tiene 0 en el backup de prueba; v-ted tiene 613).
- Hacen `fetch('/backup_2026-08-13_1626.json')`: copiarlo desde `C:\Users\JET\Desktop\MOTOREDGE-ARCHIVO\` a la raíz
  solo para probar y borrarlo al terminar (está en `.gitignore`; el hook lo bloquea).
- Nunca probar sobre los datos reales del usuario (origen `file://`).

## Qué no hacer
- Nunca `git add .` / `-A` ni `--no-verify`. Commits sueltos: rutas explícitas; subir con `deploy.ps1`.
- No imprimir tokens: enmascarar salidas con `sed -E 's#https://[^@]*@#https://***@#g'`.
- En Bash, rutas absolutas o `git -C`; commits multilínea con `-m` multilínea en Bash.
- No matar procesos por nombre: TaskStop con el ID.
- No recalcular TC histórico (invariante #5); no tocar FIFO de `consumirStock` (invariante #6); no usar
  `getActualQty()` para el stock plano (invariante #11).
- Eliminar una venta sigue sin devolver stock (fuera de alcance).
