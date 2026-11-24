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
