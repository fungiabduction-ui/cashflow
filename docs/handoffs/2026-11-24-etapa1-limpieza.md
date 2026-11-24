# Handoff — Etapa 1 (limpieza y anti-filtración) y lo que queda (2026-11-24)

## Objetivo
Ejecutar el plan **ya escrito** de la Etapa 1: `docs/superpowers/plans/2026-11-24-etapa1-limpieza-antifiltracion.md`
(Tasks 1-8). Spec aprobado: `docs/superpowers/specs/2026-11-24-motoredge-mejoras-design.md`.

## Qué dijo el usuario
- «me estas haciendo muchas preguntas pense que el plan ya estaba escrito» y «otro plan mas que paso?»: el plan de la
  Etapa 1 YA existe → ejecutarlo tal cual, sin pedir aprobación ni elegir modo de ejecución. Preguntar solo ante una
  decisión nueva de verdad, en una línea de texto.
- Opus siempre (nunca Sonnet). La app nunca queda rota entre etapas. Push solo con su OK (pedirlo en una línea).

## Estado
- **Etapa 4 (precios por producto): hecha y subida** (`4bd0f42`, local = `origin/main`). 9 tests en `tests/`
  (`node --test "tests/**/*.test.mjs"`). Probada en Chrome headless con el backup de agosto, sin errores.
  Script de prueba reutilizable: `docs/handoffs/2026-11-24-cdp-prueba-etapa4.mjs`.
- **3.1 ticket sin nombre: hecha** (`51bb403`).
- **Pendientes, una sesión cada una y en este orden:** Etapa 1 (plan escrito) → Etapa 2 robustez (`sd()` booleano,
  modo protegido; ya existe el harness `tests/helpers/env.mjs`, sumarle `run-tests.bat`) → 3.2 edición de ventas
  (10 defectos) → Etapa 5 diagnóstico + recordatorio de backup. Las 2, 3.2 y 5 necesitan su plan.
- Datos medidos para la Etapa 1: `docs/handoffs/2026-11-24-mejoras-motoredge.md` («Datos medidos»).

## Tareas en orden
1. Ejecutar el plan de la Etapa 1, Tasks 1-7. **Terminado:** cada task con su verificación del plan en verde.
2. Task 8: verificación final. **Terminado:** `git status --porcelain` solo muestra lo esperado; un commit de prueba con un
   `.json` lo rechaza el hook (y se deshace); la app abre con sus datos.
3. Push con OK del usuario; recordarle rotar el token de GitHub (1.9).
4. `/handoff` para la Etapa 2.

## Ojo (cambió desde que se escribió el plan de la Etapa 1)
- Ahora existe `tests/`: `deploy.ps1` tiene que correr `node --test "tests/**/*.test.mjs"` y abortar si falla.
- `docs/handoffs/` está sin versionar y `deploy.ps1` agrega `docs`: antes del primer deploy, revisar que esos archivos no
  tengan tokens ni datos de clientes (el hook igual rechaza tokens).

## Qué no hacer
- **Nunca `git add .`** hasta que existan el `.gitignore` nuevo y el hook: rutas explícitas.
- Hasta renombrar la rama, push con `git push origin clean-main:main`. Enmascarar el token al mostrar remotos o salidas
  de push (`sed -E 's#https://[^@]*@#https://***@#g'`).
- En la Etapa 1 no tocar código de la app ni borrar datos financieros (solo moverlos a `C:\Users\JET\Desktop\MOTOREDGE-ARCHIVO\`).
- En Bash no hacer `cd` a subcarpetas ni bucles `for` con variables sobre rutas (los frena el chequeo de seguridad): usar
  Grep/rutas absolutas. Commits con mensaje multilínea: `git commit -F <archivo>` (el here-string de PowerShell 5.1 se
  rompe con comillas).
- No matar procesos por nombre: TaskStop con el ID del proceso en segundo plano.
- Aviso vigente al usuario: evitar editar ventas con descuento o en USD/USDT/MIX hasta la 3.2.
