# Etapa 1 — Limpieza y anti-filtración — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sacar del repo todo dato financiero suelto (archivado, no borrado), borrar duplicados, y bloquear por código
que un dato o token vuelva a subirse al repo público.

**Architecture:** Solo operaciones de archivos y git. Cero cambios en el código de la app (`core/ modules/ ui/ styles/
main.js index.html bundle.js`). Defensa en dos capas: `.gitignore` (no aparece en `git status`) + hook `pre-commit`
versionado (rechaza aunque alguien fuerce el `git add`). `deploy.ps1` reemplaza el `git add .` documentado.

**Tech Stack:** Git for Windows (bash del hook), PowerShell 5.1 (`deploy.ps1`), coreutils de Git Bash para mover y
verificar (md5sum).

**Spec:** `docs/superpowers/specs/2026-11-24-motoredge-mejoras-design.md` §Etapa 1.

---

## Reglas de ejecución

- Comandos bash con rutas absolutas o `git -C`. **No `cd`** a subcarpetas (en Bash se puede usar subshell `( cd … )`).
- **Nunca `git add .` / `git add -A`.** Siempre rutas explícitas.
- No imprimir tokens: `git remote -v | sed -E 's#https://[^@]*@#https://***@#'`.
- Variables usadas en todo el plan:
  ```bash
  R=/c/Users/JET/Desktop/CASHFLOW
  A=/c/Users/JET/Desktop/MOTOREDGE-ARCHIVO
  ```

## Inventario medido (2026-11-24)

- A archivar desde la raíz: `BACKUPS DATA/` (6 archivos: csv, pdf, xlsx, 3 json), `Data backup/` (2 json), `MP/`
  (1 csv), `datos.json`, `backup_2026-08-13_1626.json`, `backup_2026-08-13_1626_corregido.json`.
- `CALCULADORA/`: 12 archivos sueltos (todo menos `index.html`, que está versionado).
- `OLD2/`: 32 archivos a archivar (9 `.xlsx`, 18 `.md`, 2 `.txt`, 3 `.json`; sin `.csv`). Los 5 `token github.txt`
  se borran, no se archivan. `OLD2/con stock/mejoras a implementar.txt` tiene el token en la línea 1 → se archiva sin
  esa línea. `OLD2/old/files.zip` contiene solo 2 HTML viejos → se borra.
- `CASHFLOW - copia/`: HEAD `94678b1` (ancestro de HEAD). Sus únicos archivos sin copia idéntica en el proyecto son
  código versionado en ese commit; sus datos son byte a byte iguales a los de la raíz → se borra.
- `.superpowers/` (restos de brainstorming) y `.kilo/` (solo un `.gitignore`) → se borran.
- Barrido de tokens en todo lo archivable: solo los 5 `token github.txt` y la línea 1 de `mejoras a implementar.txt`.
- El repo no versiona ningún `.json/.csv/.xlsx/.pdf` ni archivos > 1 MB (`bundle.js` = 424 KB).

## Archivos

- Modify: `.gitignore` (agregar patrones de datos y restos).
- Delete (git rm): `AUDIT.md`, `INGENIERO.txt`.
- Create: `.githooks/pre-commit` — hook anti-filtración (bash).
- Create: `deploy.ps1` — build → tests → staging solo de código → commit → push.
- Create: `deploy.bat` — doble clic que llama a `deploy.ps1`.
- Modify: `CLAUDE.md` (workflow, sincronía, hook, estructura, «Qué NO hacer»).
- Fuera del repo: `C:\Users\JET\Desktop\MOTOREDGE-ARCHIVO\` (nuevo).

---

### Task 1: Archivar datos sueltos (1.1)

**Files:** ninguno del repo. Destino `$A`.

- [ ] **Step 1: Manifiesto de lo que se mueve desde la raíz y CALCULADORA**

```bash
R=/c/Users/JET/Desktop/CASHFLOW; A=/c/Users/JET/Desktop/MOTOREDGE-ARCHIVO
mkdir -p "$A/CALCULADORA"
( cd "$R" && find "BACKUPS DATA" "Data backup" MP datos.json backup_2026-08-13_1626.json backup_2026-08-13_1626_corregido.json -type f -exec md5sum {} + ; find CALCULADORA -maxdepth 1 -type f ! -name index.html -exec md5sum {} + ) > "$A/_manifest-raiz.md5"
wc -l < "$A/_manifest-raiz.md5"
```
Expected: `24` (6 + 2 + 1 + 3 + 12).

- [ ] **Step 2: Mover**

```bash
mv "$R/BACKUPS DATA" "$R/Data backup" "$R/MP" "$R/datos.json" "$R/backup_2026-08-13_1626.json" "$R/backup_2026-08-13_1626_corregido.json" "$A/"
find "$R/CALCULADORA" -maxdepth 1 -type f ! -name index.html -exec mv -t "$A/CALCULADORA" {} +
```

- [ ] **Step 3: Verificar destino íntegro y origen vacío**

```bash
( cd "$A" && md5sum -c --quiet _manifest-raiz.md5 ) && echo DESTINO-OK
ls "$R/CALCULADORA"
ls -d "$R/BACKUPS DATA" "$R/Data backup" "$R/MP" "$R/datos.json" "$R/backup_2026-08-13_1626.json" "$R/backup_2026-08-13_1626_corregido.json" 2>&1 | grep -c 'No such file'
```
Expected: `DESTINO-OK`; `CALCULADORA` lista solo `index.html`; el conteo da `6`.

- [ ] **Step 4: Manifiesto de los archivables de OLD2**

```bash
( cd "$R" && find OLD2 -path '*/.git' -prune -o -type f \( -iname '*.xlsx' -o -iname '*.csv' -o -iname '*.json' -o -iname '*.md' -o -iname '*.txt' \) ! -name 'token github.txt' -print ) > "$A/_lista-old2.txt"
wc -l < "$A/_lista-old2.txt"
( cd "$R" && grep -v 'mejoras a implementar.txt' "$A/_lista-old2.txt" | tr '\n' '\0' | xargs -0 md5sum ) > "$A/_manifest-old2.md5"
wc -l < "$A/_manifest-old2.md5"
```
Expected: `32` y `31`.

- [ ] **Step 5: Copiar OLD2 archivables (preserva rutas) y reescribir el que tiene token**

```bash
( cd "$R" && tr '\n' '\0' < "$A/_lista-old2.txt" | xargs -0 cp --parents -t "$A" )
grep -vE 'gh[pousr]_[A-Za-z0-9]{36}|github_pat_' "$R/OLD2/con stock/mejoras a implementar.txt" > "$A/OLD2/con stock/mejoras a implementar.txt"
```

- [ ] **Step 6: Verificar copia íntegra y archivo sin tokens**

```bash
( cd "$A" && md5sum -c --quiet _manifest-old2.md5 ) && echo OLD2-OK
wc -l "$R/OLD2/con stock/mejoras a implementar.txt" "$A/OLD2/con stock/mejoras a implementar.txt"
grep -rlE 'gh[pousr]_[A-Za-z0-9]{36}|github_pat_' "$A" ; echo "tokens en archivo: $?"
```
Expected: `OLD2-OK`; el archivado tiene exactamente 1 línea menos que el original; `tokens en archivo: 1` (grep no
encontró nada).

Sin commit (nada del repo cambió).

---

### Task 2: Borrar duplicados y restos (1.2)

- [ ] **Step 1: Rechequear que la copia es borrable**

```bash
git -C "$R" merge-base --is-ancestor 94678b1 HEAD && echo COPIA-EN-HISTORIA
git -C "$R/CASHFLOW - copia" status --porcelain | grep -v '^??' | wc -l
```
Expected: `COPIA-EN-HISTORIA` y `0` (sin cambios a archivos versionados; los `??` son las mismas carpetas de datos
ya verificadas como idénticas a las de la raíz).

- [ ] **Step 2: Borrar**

```bash
rm -rf "$R/CASHFLOW - copia" "$R/OLD2" "$R/.superpowers" "$R/.kilo"
```

- [ ] **Step 3: Verificar**

```bash
ls -A "$R"
```
Expected: `.git .gitignore AUDIT.md CALCULADORA CLAUDE.md INGENIERO.txt build.bat build.ps1 bundle.js core docs
index.html main.js modules serve.bat styles token github.txt ui` (y nada más).

Sin commit.

---

### Task 3: `.gitignore` + sacar AUDIT.md e INGENIERO.txt (1.3, 1.4)

**Files:** Modify `.gitignore` · Delete `AUDIT.md`, `INGENIERO.txt`

- [ ] **Step 1: Agregar al final de `.gitignore`**

```gitignore

# Datos financieros sueltos — viven en C:\Users\JET\Desktop\MOTOREDGE-ARCHIVO, nunca acá
BACKUPS DATA/
MP/
backup_*.json
*backup*.json
*.xlsx
*.csv
*.pdf

# Copias viejas y restos de herramientas
OLD*/
* - copia/
.superpowers/
.kilo/
```

- [ ] **Step 2: git rm**

```bash
git -C "$R" rm -q AUDIT.md INGENIERO.txt
```

- [ ] **Step 3: Verificar que git no ve datos**

```bash
git -C "$R" status --porcelain
git -C "$R" status --porcelain --ignored | grep '^!!'
```
Expected: solo ` M .gitignore`, `D  AUDIT.md`, `D  INGENIERO.txt`, `?? docs/handoffs/`, `?? docs/superpowers/plans/2026-11-24-etapa1-limpieza-antifiltracion.md`
(o `?? docs/superpowers/plans/` si git agrupa). Ignorados: solo `!! "token github.txt"`.

- [ ] **Step 4: Commit (rutas explícitas)**

```bash
git -C "$R" add .gitignore docs/handoffs docs/superpowers/plans/2026-11-24-etapa1-limpieza-antifiltracion.md
git -C "$R" commit -q -m "chore: ignorar datos sueltos y restos; quitar AUDIT.md e INGENIERO.txt

Agrega el plan de la Etapa 1 y el handoff.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git -C "$R" status --porcelain
```
Expected: `git status --porcelain` vacío.

---

### Task 4: Rama `main` (1.5)

- [ ] **Step 1: Borrar la `main` vieja y renombrar**

```bash
git -C "$R" branch -D main
git -C "$R" branch -m clean-main main
git -C "$R" branch -u origin/main main
```

- [ ] **Step 2: Verificar**

```bash
git -C "$R" branch -vv
git -C "$R" fetch -q origin && git -C "$R" rev-list --left-right --count HEAD...origin/main
```
Expected: una sola rama, `* main <sha> [origin/main: ahead 3] …`; el conteo da `3	0` (spec, ticket-antes-que-ventas,
commit de la Task 3).

Sin commit.

---

### Task 5: Hook anti-filtración (1.6)

**Files:** Create `.githooks/pre-commit`

Nota de diseño: el spec dice «`github_pat_`» a secas; el hook exige `github_pat_` seguido de 20+ caracteres de token,
porque si no se bloquearía a sí mismo, al spec, a este plan y a CLAUDE.md (todos mencionan el prefijo).

- [ ] **Step 1: Escribir `.githooks/pre-commit`**

```bash
#!/usr/bin/env bash
# Hook anti-filtracion de MotorEdge. Activar una vez por clon:
#   git config core.hooksPath .githooks
# Rechaza el commit si en staging hay: .json/.csv/.xlsx/.pdf, un token de GitHub, o un archivo > 1 MB.
shopt -s nocasematch
max=1048576
fail=0
while IFS= read -r -d '' f; do
  case "$f" in
    *.json|*.csv|*.xlsx|*.pdf)
      echo "BLOQUEADO: $f -> el repo no versiona .json/.csv/.xlsx/.pdf (posibles datos financieros)" >&2
      fail=1
      continue ;;
  esac
  size=$(git cat-file -s ":$f")
  if [ "$size" -gt "$max" ]; then
    echo "BLOQUEADO: $f -> pesa $size bytes (maximo 1 MB)" >&2
    fail=1
  fi
  if git cat-file -p ":$f" | grep -qE 'gh[pousr]_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{20,}'; then
    echo "BLOQUEADO: $f -> contiene un token de GitHub" >&2
    fail=1
  fi
done < <(git diff --cached --name-only --diff-filter=ACMR -z)
if [ "$fail" -ne 0 ]; then
  echo "Commit rechazado por .githooks/pre-commit. Saca esos archivos del staging: git reset -- <archivo>" >&2
  exit 1
fi
exit 0
```

- [ ] **Step 2: Activar**

```bash
git -C "$R" config core.hooksPath .githooks
git -C "$R" config --get core.hooksPath
```
Expected: `.githooks`

- [ ] **Step 3: Probar que rechaza un `.json`**

```bash
H=$(git -C "$R" rev-parse HEAD)
echo '{}' > "$R/hooktest.json"
git -C "$R" add -f hooktest.json
git -C "$R" commit -q -m "prueba hook" ; echo "exit=$?"
git -C "$R" rev-parse HEAD | grep -qx "$H" && echo HEAD-INTACTO || git -C "$R" reset -q --soft "$H"
git -C "$R" reset -q -- hooktest.json; rm -f "$R/hooktest.json"
```
Expected: `BLOQUEADO: hooktest.json -> el repo no versiona …`, `exit=1`, `HEAD-INTACTO`.
(Si no aparece `HEAD-INTACTO`, el `reset --soft` deshace el commit de prueba: el hook está mal, corregir y repetir.)

- [ ] **Step 4: Probar que rechaza un token** (se genera en el momento, el plan no contiene ninguno)

```bash
printf 'ghp_%s\n' "$(head -c 36 /dev/zero | tr '\0' 'a')" > "$R/hooktest.txt"
git -C "$R" add hooktest.txt
git -C "$R" commit -q -m "prueba hook" ; echo "exit=$?"
git -C "$R" rev-parse HEAD | grep -qx "$H" && echo HEAD-INTACTO || git -C "$R" reset -q --soft "$H"
git -C "$R" reset -q -- hooktest.txt; rm -f "$R/hooktest.txt"
```
Expected: `BLOQUEADO: hooktest.txt -> contiene un token de GitHub`, `exit=1`, `HEAD-INTACTO`.

- [ ] **Step 5: Probar que rechaza > 1 MB**

```bash
head -c 1100000 /dev/zero | tr '\0' 'x' > "$R/hooktest.bin"
git -C "$R" add hooktest.bin
git -C "$R" commit -q -m "prueba hook" ; echo "exit=$?"
git -C "$R" rev-parse HEAD | grep -qx "$H" && echo HEAD-INTACTO || git -C "$R" reset -q --soft "$H"
git -C "$R" reset -q -- hooktest.bin; rm -f "$R/hooktest.bin"
git -C "$R" status --porcelain
```
Expected: `BLOQUEADO: hooktest.bin -> pesa 1100000 bytes (maximo 1 MB)`, `exit=1`, `HEAD-INTACTO`; status solo
muestra `?? .githooks/`.

- [ ] **Step 6: Commit del hook (prueba positiva: el hook deja pasar código normal)**

```bash
git -C "$R" add --chmod=+x .githooks/pre-commit
git -C "$R" commit -q -m "feat: hook pre-commit anti-filtracion (datos, tokens, archivos grandes)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" ; echo "exit=$?"
```
Expected: `exit=0`.

---

### Task 6: `deploy.ps1` + `deploy.bat` (1.7)

**Files:** Create `deploy.ps1`, `deploy.bat`

Notas: sin caracteres no-ASCII en `deploy.ps1` (PowerShell 5.1 lee los `.ps1` sin BOM como ANSI). Se agregan a la
lista del spec `build.bat`, `serve.bat` (versionados) y `run-tests.bat` (lo crea la Etapa 2). Convención de tests
para la Etapa 2: `tests/**/*.test.mjs`. `-Mensaje` permite correrlo sin preguntar (lo usa un agente).

- [ ] **Step 1: Escribir `deploy.ps1`**

```powershell
# deploy.ps1 - MotorEdge: build -> tests -> commit SOLO de codigo -> push a origin/main.
# Uso: deploy.bat (pregunta el mensaje) o: powershell -File deploy.ps1 -Mensaje "texto"
param([string]$Mensaje)
Set-Location $PSScriptRoot

function Stop-Deploy($msg) { Write-Host " ABORTADO: $msg" -ForegroundColor Red; exit 1 }

$rama = (git rev-parse --abbrev-ref HEAD)
if ($rama -ne 'main') { Stop-Deploy "la rama actual es '$rama', no 'main'." }

# 1. Build
powershell -NoProfile -ExecutionPolicy Bypass -File .\build.ps1
if ($LASTEXITCODE -ne 0 -or -not (Test-Path bundle.js)) { Stop-Deploy 'fallo el build.' }

# 2. Tests (desde la Etapa 2)
if (Test-Path tests) {
    node --test 'tests/**/*.test.mjs'
    if ($LASTEXITCODE -ne 0) { Stop-Deploy 'fallaron los tests.' }
}

# 3. Estado antes de agregar
Write-Host ''
Write-Host ' git status:' -ForegroundColor Cyan
git status --short

# 4. Agregar SOLO rutas de codigo (nunca git add .)
$rutas = 'core','modules','ui','styles','main.js','index.html','bundle.js','build.ps1','build.bat','serve.bat',
         'CALCULADORA/index.html','docs','CLAUDE.md','.gitignore','.githooks','tests','run-tests.bat',
         'deploy.ps1','deploy.bat'
$existentes = @($rutas | Where-Object { Test-Path $_ })
git add -- $existentes
if ($LASTEXITCODE -ne 0) { Stop-Deploy 'fallo git add.' }

# 5. Commit (el hook anti-filtracion corre aca)
git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
    Write-Host ''
    Write-Host ' Se va a commitear:' -ForegroundColor Cyan
    git diff --cached --stat
    if (-not $Mensaje) { $Mensaje = Read-Host ' Mensaje del commit (vacio = abortar)' }
    if (-not $Mensaje) { Stop-Deploy 'sin mensaje de commit.' }
    git commit -m $Mensaje
    if ($LASTEXITCODE -ne 0) { Stop-Deploy 'el commit fallo (lo rechazo el hook anti-filtracion?).' }
} else {
    Write-Host ' Sin cambios de codigo para commitear.' -ForegroundColor Yellow
}

# 6. Push
git push origin main
if ($LASTEXITCODE -ne 0) { Stop-Deploy 'fallo el push.' }
Write-Host ' Listo: subido a origin/main.' -ForegroundColor Green
```

- [ ] **Step 2: Escribir `deploy.bat`**

```bat
@echo off
title MOTOR EDGE - Deploy
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy.ps1"
pause
```

- [ ] **Step 3: Probar sin commitear ni pushear** (herramienta PowerShell: es `-NonInteractive`, `Read-Host` no
obtiene mensaje → debe abortar antes del commit)

```powershell
$H = git rev-parse HEAD
powershell -NoProfile -ExecutionPolicy Bypass -File .\deploy.ps1
"exit=$LASTEXITCODE"
if ((git rev-parse HEAD) -eq $H) { 'HEAD-INTACTO' }
git diff --cached --name-only
git status --short
```
Expected: corre el build (`bundle.js: … KB`), muestra status, `ABORTADO: sin mensaje de commit.`, `exit=1`,
`HEAD-INTACTO`; staged solo `deploy.bat` y `deploy.ps1` (el build no cambia `bundle.js` ni `index.html`: el código no
se tocó). Si aparecen `bundle.js`/`index.html` modificados, revisar `git diff --stat` antes de seguir — no es esperado.

- [ ] **Step 4: Commit**

```bash
git -C "$R" add deploy.ps1 deploy.bat
git -C "$R" commit -q -m "feat: deploy.bat/deploy.ps1 — build, tests y commit solo de rutas de codigo

Reemplaza el workflow git add . (subia datos financieros al repo publico).

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" ; echo "exit=$?"
```
Expected: `exit=0`.

---

### Task 7: CLAUDE.md (1.8)

**Files:** Modify `CLAUDE.md`

- [ ] **Step 1: Línea 43 (`datos.json` y `backups/` en `.gitignore`)** — reemplazar esa línea por:

```markdown
**`datos.json`, `backups/`, `BACKUPS DATA/`, `MP/`, `backup_*.json`, `*.xlsx`, `*.csv`, `*.pdf` están en `.gitignore`
del repo `cashflow`.** No los agregues nunca al repo público. Los datos sueltos viejos están archivados fuera del repo,
en `C:\Users\JET\Desktop\MOTOREDGE-ARCHIVO\`. Además el hook `.githooks/pre-commit` rechaza cualquier commit con
`.json/.csv/.xlsx/.pdf`, tokens de GitHub (`ghp_…`, `github_pat_…`) o archivos de más de 1 MB.
```

- [ ] **Step 2: Línea 74 (sincronía)** — reemplazar por:

```markdown
La rama local es `main` con upstream `origin/main` (desde 2026-11-24; `clean-main` ya no existe).
```

- [ ] **Step 3: Bloque «Workflow para agentes…» (líneas 76-91)** — reemplazar el bloque de código por:

````markdown
```powershell
# 1. Editar archivos fuente en core/, modules/, ui/, styles/
# 2. Probar (serve.bat, con una copia de los datos importada en localhost:7432)
# 3. Subir — build, tests, commit SOLO de rutas de código, push:
.\deploy.bat                                   # pregunta el mensaje
# o, desde un agente (sin preguntar):
powershell -NoProfile -ExecutionPolicy Bypass -File .\deploy.ps1 -Mensaje "descripción del cambio"
```

**Nunca `git add .` ni `git add -A`** (hay datos financieros en la carpeta de trabajo de otros flujos) y nunca
`--no-verify`. `deploy.ps1` agrega solo: `core modules ui styles main.js index.html bundle.js build.ps1 build.bat
serve.bat CALCULADORA/index.html docs CLAUDE.md .gitignore .githooks tests run-tests.bat deploy.ps1 deploy.bat`.
Si un archivo nuevo de código vive en otra ruta, agregarla a esa lista. El push usa el remoto `origin`, cuya URL ya
lleva el token (al rotarlo: `git remote set-url origin "https://<TOKEN>@github.com/fungiabduction-ui/cashflow.git"`).
````

- [ ] **Step 4: Bloque «Si el repo local no está inicializado» (líneas 95 y 101-102)** — cambiar la lectura del token
(el archivo tiene etiquetas; el token está en la línea 2) y activar el hook:

```powershell
$TOKEN = (Get-Content "token github.txt")[1].Trim()
```
y reemplazar las dos últimas líneas del bloque por:
```powershell
git checkout -b main --track origin/main
git config core.hooksPath .githooks   # activa el hook anti-filtración (obligatorio)
# Ya tenés el código fuente descargado. Editá y subí con deploy.bat.
```

- [ ] **Step 5: Estructura de archivos (líneas 156-157)** — dejar así:

```
├── build.bat           ← Regenera bundle.js desde los módulos fuente
├── serve.bat           ← Servidor local Python en puerto 7432
├── deploy.bat          ← Doble clic: llama a deploy.ps1 (build → tests → commit de código → push)
├── deploy.ps1          ← Único camino para subir cambios. Nunca git add .
├── .githooks/pre-commit← Hook anti-filtración (activar: git config core.hooksPath .githooks)
```

- [ ] **Step 6: «Workflow de desarrollo → Con servidor»** — `http://localhost:8080` → `http://localhost:7432`.

- [ ] **Step 7: «Qué NO hacer»** — agregar al final de la lista:

```markdown
- No usar `git add .` / `git add -A` ni `git commit --no-verify` — subir siempre con `deploy.bat`
- No desactivar ni relajar `.githooks/pre-commit` (ver invariante #19)
```

- [ ] **Step 8: Verificar**

```bash
grep -nE 'clean-main|git add \.$|-Raw\)\.Trim|8080' "$R/CLAUDE.md"
grep -nE 'gh[pousr]_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{20,}' "$R/CLAUDE.md"; echo "token-match=$?"
```
Expected: el primer grep solo muestra la mención histórica «`clean-main` ya no existe»; `token-match=1`.

- [ ] **Step 9: Commit**

```bash
git -C "$R" add CLAUDE.md
git -C "$R" commit -q -m "docs: CLAUDE.md — deploy.bat, hook anti-filtracion, rama main, puerto 7432

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" ; echo "exit=$?"
```
Expected: `exit=0` (el hook deja pasar CLAUDE.md: la mención de los prefijos no matchea el patrón de token).

---

### Task 8: Verificación final, push con OK y token (1.9)

- [ ] **Step 1: La app no cambió**

```bash
git -C "$R" diff --stat 2358dff HEAD -- core modules ui styles main.js index.html bundle.js build.ps1 CALCULADORA/index.html
git -C "$R" status --porcelain; git -C "$R" status --porcelain --ignored | grep '^!!'
```
Expected: el diff no muestra nada; status vacío; ignorados solo `!! "token github.txt"`.

- [ ] **Step 2: El usuario abre `index.html`** (doble clic, como siempre) y confirma que ve sus datos. Los datos viven en
el navegador; mover archivos no los afecta.

- [ ] **Step 3: Pedir OK para el push.** Sin OK, no se pushea. Con OK:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\deploy.ps1 -Mensaje "chore: build"
```
Expected: `Sin cambios de codigo para commitear.` (el mensaje solo se usaría si el build cambiara algo) → push → `Listo: subido a origin/main.` Luego:
```bash
git -C "$R" fetch -q origin && git -C "$R" rev-list --left-right --count HEAD...origin/main
```
Expected: `0	0`.

- [ ] **Step 4: Recordarle al usuario 1.9 — rotar el token** (existió en texto plano en varias copias, ahora
borradas): crear uno nuevo en github.com/settings/tokens, revocar el viejo, ponerlo en la línea 2 de
`token github.txt`, `git remote set-url origin "https://<TOKEN>@github.com/fungiabduction-ui/cashflow.git"`, y
actualizarlo en la app (Config → GitHub) en cada dispositivo si usa el mismo token para los backups.

- [ ] **Step 5: `/handoff` para la Etapa 2** y sacar la línea de este handoff de `~/.claude/handoffs-pendientes.md`
(la que la reemplace la escribe `/handoff`).
