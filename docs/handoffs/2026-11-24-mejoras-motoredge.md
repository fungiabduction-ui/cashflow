# Handoff — Mejoras MotorEdge (2026-11-24)

## Objetivo
Ejecutar, **una etapa por sesión**, el spec aprobado
`docs/superpowers/specs/2026-11-24-motoredge-mejoras-design.md`. Próxima sesión: **Etapa 1 — limpieza + anti-filtración**.

## Estado
- **La app no se tocó y funciona.** El código es idéntico a GitHub y a GitHub Pages (`2358dff`).
- Commits locales sin push: `1ef6c60` (spec) y `10d2d5e` (ticket antes que ventas). Rama actual: `clean-main`.

## Qué decidió el usuario
- Datos financieros sueltos → **mover** a `C:\Users\JET\Desktop\MOTOREDGE-ARCHIVO\` (no borrar).
- Productos que comparten lista → se tildan juntos. Sync de calculadora → preguntar + aviso persistente.
  Redondeo → se elige al aplicar.
- Robustez: eligió las 4 (modo protegido, guardado verificado, tests, anti-filtración). Ideas: eligió las 4
  (% sugerido por dólar, margen en preview, diagnóstico, recordatorio de backup).
- Ticket: «no muestre el nombre del cliente cifrado para copiar. eso queda solo para mi como detalle interno».
- Ventas: «cuando hay una venta cerrada la quiero editar fallan cosas. revisalo».
- Orden: «tiket tiene que ir primero que ventas por que es lo que pirmero uso ya que armo los tikets de compra ahi».
- Proceso: una etapa por sesión, con Opus (nunca Sonnet), esfuerzo *high* para construir. **Necesita la app
  funcionando: nunca dejarla rota entre etapas.**

## Atajo si hay apuro
Si pide algo rápido: la **3.1 (ticket sin nombre del cliente)** es independiente y corta
(`modules/ticket.js` `generarTicket()` + `ui/modal.js` `vTk()`). Se puede adelantar con su OK; sin el harness de
tests de la Etapa 2, verificarla a mano en `serve.bat` (localhost:7432) con una copia de datos.

## Etapa 1 — tareas en orden (detalle en el spec, §Etapa 1)
1. `superpowers:writing-plans` solo para la Etapa 1. **Hecho:** plan escrito y aprobado por el usuario.
2. 1.1 mover a archivo. **Hecho:** cada ítem está en destino y ya no en origen.
3. 1.2 borrar duplicados; antes, listar `OLD2/` completo y aplicar la regla de 1.1. **Hecho:** carpetas eliminadas.
4. 1.3 `git rm AUDIT.md INGENIERO.txt` + 1.4 `.gitignore`. **Hecho:** `git status` no lista datos financieros.
5. 1.5 borrar la `main` local vieja y renombrar `clean-main` → `main` (upstream `origin/main`). **Hecho:**
   `git branch -vv` muestra `main [origin/main]`.
6. 1.6 hook + `git config core.hooksPath .githooks`. **Hecho:** un commit de prueba con `.json` es rechazado (deshacer).
7. 1.7 `deploy.ps1`/`deploy.bat`. **Hecho:** corre el build y agrega solo rutas de código.
8. 1.8 CLAUDE.md actualizado (workflow, rama, hook).
9. Push **solo con OK del usuario** (incluye los 2 commits del spec). Recordarle 1.9: rotar el token.
10. `/handoff` para la Etapa 2.

## Datos medidos (solo estaban en la conversación)
- Tamaños: `CASHFLOW - copia/` 51 MB · `OLD2/` 33 MB · `BACKUPS DATA/` 1,6 MB · `Data backup/` 768 KB.
- `CASHFLOW - copia/`: su HEAD `94678b1` ya está en la historia actual y no tiene cambios sin commitear → borrable.
- `OLD2/` tiene: `JET-CASHFLOW EXCEL/`, `Nueva carpeta/`, `Nueva carpeta (2) - copia/`, `con inversiones/`, `con stock/`,
  `descuentos/`, `descuentos y stock/`, `mono/`, `netlify/` (repo `.git` anidado), `JETCASHFLOW5.3.xlsx`,
  `PROMPT_ARQUITECTURA_MOTOR_EDGE.md`. Varias tienen archivos con tokens; `con stock/mejoras a implementar.txt` se
  archiva sin la línea del token.
- La `main` local (`7767dd7`) tiene un commit viejo con credenciales; GitHub no lo tiene (API devuelve 422).
- Herramientas: Node v24.14.0, gh 2.94.0. Último sync de la calculadora: 2026-10-03.
- Productos → listas (backup del 2026-08-13): `v-cal` y `v-ted` → `lp-past` «Pastillas GRP»; `p-cris`, `p-hong`,
  `p-got`, `p-pet` → su propia lista. (Para la Etapa 4.)

## Cómo verificar
- `git status --porcelain` y `git status --porcelain --ignored`.
- Abrir `index.html` y ver que carga los datos (viven en el navegador; mover archivos no los afecta).
- Sincronía: `git fetch origin` y `git rev-list --left-right --count HEAD...origin/main`.

## Qué no hacer
- **Nunca `git add .`**: hasta que existan el `.gitignore` nuevo y el hook, hay datos financieros sin ignorar.
- No imprimir tokens: la URL de `origin` lo incluye → enmascarar `git remote -v` con `sed`.
- En la herramienta Bash no hacer `cd` a subcarpetas (mueve la carpeta de trabajo de la sesión): rutas absolutas o `git -C`.
- En la Etapa 1 no tocar código de la app ni borrar datos (solo moverlos). No hacer push sin OK.
- Aviso vigente al usuario: evitar editar ventas con descuento o en USD/USDT/MIX hasta la 3.2.
