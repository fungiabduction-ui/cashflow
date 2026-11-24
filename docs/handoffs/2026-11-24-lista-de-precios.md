# Handoff — Lista de precios (Etapa 4) (2026-11-24)

## Objetivo
Construir la **Etapa 4 — Precios por producto** del spec aprobado
`docs/superpowers/specs/2026-11-24-motoredge-mejoras-design.md` (§Etapa 4, líneas ~166-212). Después, ejecutar la
Etapa 1 con su plan ya escrito.

## Qué dijo el usuario
- «lo que más necesito es la lista de precios y el tiket». El ticket ya está hecho; falta la lista de precios.
- «me estas haciendo muchas preguntas pense que el plan ya estaba escrito». El spec está aprobado: escribir el plan de
  la Etapa 4 y ejecutarlo sin pedir aprobación del plan ni elegir modo de ejecución. Preguntar solo ante una decisión
  nueva de verdad, y en una línea de texto (no diálogo).
- Decisiones del spec que siguen vigentes: productos que comparten lista se tildan juntos; tras aplicar, preguntar si
  sincronizar la calculadora + aviso persistente «calculadora desactualizada»; el redondeo se elige al aplicar.
- Opus siempre (nunca Sonnet). La app nunca queda rota entre etapas.

## Estado
- **3.1 ticket sin nombre del cliente: hecha y subida** (`51bb403`). Local = `origin/main`.
  Prueba hecha: ticket nuevo sin nombre; cliente en `auditText`; `vTk()` oculta «👤 Cliente» de ventas viejas.
- **Etapa 1: plan escrito, NO ejecutado** → `docs/superpowers/plans/2026-11-24-etapa1-limpieza-antifiltracion.md`.
  Por eso siguen sueltos en la carpeta datos financieros (`BACKUPS DATA/`, `MP/`, `backup_2026-08-13*.json`, `OLD2/`…),
  no hay hook ni `.gitignore` nuevo, y la rama local sigue llamándose `clean-main`.
- Etapas 2, 3.2 y 5: sin empezar. No existe `tests/`.
- Datos de las Etapas 1 y 4 medidos en `docs/handoffs/2026-11-24-mejoras-motoredge.md` («Datos medidos»). Para la 4:
  `v-cal` y `v-ted` → `lp-past` «Pastillas GRP» (comparten); `p-cris`, `p-hong`, `p-got`, `p-pet` → lista propia cada uno.

## Tareas en orden
1. `superpowers:writing-plans` solo para la Etapa 4 (4.1 panel por producto + redondeo + % sugerido + preview con
   margen; 4.2 aplicar; 4.3 modal de sync; 4.4 aviso calculadora desactualizada; 4.5 log completo sin «×», tipo
   `edit`, `payload` en sync, restore con un solo `sd()`). Código en `modules/price-manager.js`,
   `modules/listas-precios.js`, `main.js`. **Terminado:** plan guardado en `docs/superpowers/plans/`.
2. Tests de la Etapa 4 (lista en el spec, «Tests:»). No existe el harness de la Etapa 2: crear lo mínimo que piden
   (spec §2.3: `tests/helpers/env.mjs` con `localStorage` en memoria y stubs de `window`/`document`, `node --test`,
   archivos `tests/**/*.test.mjs`). **Terminado:** `node --test "tests/**/*.test.mjs"` pasa; incluye 22785 +10% → 25063.
3. Construir. `build.bat` (o `powershell -NoProfile -ExecutionPolicy Bypass -File .\build.ps1`) y `node --check bundle.js`.
4. Verificación en navegador con datos de prueba (ver abajo). **Terminado:** ajuste por producto, preview con margen,
   redondeo, modal de sync y aviso funcionan sin errores de consola.
5. CLAUDE.md: schema `priceLog` (tipo `edit`; `productos`, `redondeo`, `payload`; `scope` puede ser array; sin borrado).
6. Commit con rutas explícitas y push con OK del usuario (pedirlo en una línea).
7. Si queda sesión: ejecutar el plan de la Etapa 1 tal cual. Si no, `/handoff`.

## Cómo verificar en navegador (la extensión de Chrome no estaba conectada)
- Servidor en segundo plano: `python -m http.server 7432 --bind 127.0.0.1` desde la raíz; cortarlo con TaskStop.
- Chrome headless con perfil temporal en el scratchpad, manejado por CDP desde Node 24 (sin npm). Ejemplo que funcionó:
  `docs/handoffs/2026-11-24-cdp-prueba-ticket.mjs` (`node <script> <carpeta-perfil>`). Hace: abre localhost:7432,
  salta el PIN en ese perfil (`me_pin_h='x'`, `me_pin_s=Date.now()+86400000`, reload), restaura
  `backup_2026-08-13_1626.json` con `restoreBackupPayload()`, ejecuta funciones globales del bundle y lee el DOM.
- Nunca probar sobre los datos reales del usuario (origen `file://`).

## Qué no hacer
- **Nunca `git add .`**: hay datos financieros sin ignorar (la Etapa 1 no se ejecutó). Siempre rutas explícitas.
- Push: `git push origin clean-main:main` (la rama aún no se renombró). Enmascarar el token al mostrar remotos.
- No matar procesos por nombre (`taskkill /IM python.exe` fue denegado): usar TaskStop con el ID del background.
- En Bash, no hacer `cd` a subcarpetas: rutas absolutas o `git -C`.
- Aviso vigente al usuario: evitar editar ventas con descuento o en USD/USDT/MIX hasta la 3.2.
