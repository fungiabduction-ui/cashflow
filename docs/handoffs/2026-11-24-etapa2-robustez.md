# Handoff — Etapa 2 robustez (2026-11-24)

## Objetivo
Construir la **Etapa 2 — Robustez base** del spec aprobado `docs/superpowers/specs/2026-11-24-motoredge-mejoras-design.md`
(§Etapa 2, líneas ~84-110): `sd()` que devuelve booleano y verifica el guardado, modo protegido, tests
(`run-tests.bat`). Después, en sesiones separadas y en este orden: **3.2 edición de ventas** (§Etapa 3, 10 defectos) →
**Etapa 5** diagnóstico + recordatorio de backup (§Etapa 5). Cada una necesita su plan.

## Qué dijo el usuario
- «me estas haciendo muchas preguntas pense que el plan ya estaba escrito»: con el spec aprobado, escribir el plan
  (`superpowers:writing-plans`) y ejecutarlo sin pedir aprobación del plan ni elegir modo de ejecución. Preguntar solo
  ante una decisión nueva de verdad, en una línea de texto (no diálogo).
- Opus siempre (nunca Sonnet). La app nunca queda rota entre etapas. Push solo con su OK (pedirlo en una línea).

## Estado
- **Etapa 1 hecha y subida** (`99bbb80`, local `main` = `origin/main`). La rama `clean-main` ya no existe.
  Datos sueltos archivados en `C:\Users\JET\Desktop\MOTOREDGE-ARCHIVO\` (con manifiestos md5). Hook
  `.githooks/pre-commit` activo (`core.hooksPath=.githooks`): rechaza `.json/.csv/.xlsx/.pdf`, tokens y archivos > 1 MB.
  Probado: los tres casos bloquean; el bash de Git for Windows lo corre bien aunque tenga CRLF.
- **Etapa 4 y 3.1 hechas y subidas.** 9 tests en `tests/precios.test.mjs`; harness en `tests/helpers/env.mjs`
  (`localStorage` en memoria + stubs de `window`/`document`).
- **Pendiente del usuario (1.9): rotar el token de GitHub.** Ya se le avisa en el cierre de esta sesión; si no lo hizo,
  recordarlo en una línea: token nuevo en github.com/settings/tokens, revocar el viejo, línea 2 de `token github.txt`,
  `git remote set-url origin "https://<TOKEN>@github.com/fungiabduction-ui/cashflow.git"`, y Config → GitHub en la app.

## Tareas en orden
1. Plan de la Etapa 2 en `docs/superpowers/plans/`. **Terminado:** plan guardado.
2. Construir con TDD sobre el harness existente; crear `run-tests.bat` (`node --test "tests/**/*.test.mjs"`; ya está en
   la lista de `deploy.ps1`). **Terminado:** tests nuevos + los 9 viejos en verde; `node --check bundle.js` ok.
3. Prueba en navegador con datos de prueba (ver abajo). **Terminado:** sin errores de consola; la app carga y guarda.
4. CLAUDE.md: invariante #1 / schema si cambia la firma de `sd()`. Push con OK:
   `powershell -NoProfile -ExecutionPolicy Bypass -File .\deploy.ps1 -Mensaje "..."` (build → tests → commit solo de
   código → push). **Terminado:** `git rev-list --left-right --count HEAD...origin/main` da `0 0`.
5. `/handoff` para la 3.2.

## Cómo verificar en navegador
- Servidor: `python -m http.server 7432 --bind 127.0.0.1` en segundo plano desde la raíz; cortarlo con TaskStop.
- Scripts CDP (Chrome headless, Node 24, sin npm): `docs/handoffs/2026-11-24-cdp-prueba-etapa4.mjs` y
  `…-cdp-prueba-ticket.mjs` (`node <script> <carpeta-perfil-en-scratchpad>`). Hacen `fetch('/backup_2026-08-13_1626.json')`
  desde la raíz: **ese archivo ahora está en `C:\Users\JET\Desktop\MOTOREDGE-ARCHIVO\`** → copiarlo a la raíz solo
  para probar (está en `.gitignore` y el hook lo bloquea) y borrarlo al terminar.
- Nunca probar sobre los datos reales del usuario (origen `file://`).

## Qué no hacer
- Nunca `git add .` / `-A` ni `--no-verify`: subir con `deploy.ps1`. Commits sueltos: rutas explícitas.
- No imprimir tokens: enmascarar remotos/salidas con `sed -E 's#https://[^@]*@#https://***@#g'`.
- En Bash, no `cd` a subcarpetas ni bucles `for` con variables sobre rutas: rutas absolutas o `git -C`. Commits
  multilínea: `git commit -F <archivo>` o `-m` multilínea en Bash (no here-strings de PowerShell 5.1).
- No matar procesos por nombre: TaskStop con el ID del proceso en segundo plano.
- No agregar `async` a `ld()`/`sd()` (CLAUDE.md, «Qué NO hacer»).
- Aviso vigente al usuario: evitar editar ventas con descuento o en USD/USDT/MIX hasta la 3.2.
