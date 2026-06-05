# MOTOR EDGE 3.9-E - build.ps1
# Concatena todos los modulos ES en bundle.js (compatible con file://)
# Uso: ejecutar build.bat

Set-Location $PSScriptRoot

# Orden de dependencias: cada archivo solo usa funciones definidas antes
$files = @(
    "core/formatters.js",
    "ui/notif.js",
    "core/constants.js",
    "core/storage.js",
    "core/ids.js",
    "core/config.js",
    "modules/github.js",
    "modules/apariencia.js",
    "modules/stock.js",
    "modules/listas-precios.js",
    "modules/productos.js",
    "modules/egresos.js",
    "modules/ventas.js",
    "modules/inventario.js",
    "modules/settings.js",
    "modules/liquidez.js",
    "modules/inversiones.js",
    "modules/dashboard.js",
    "modules/ticket.js",
    "modules/io.js",
    "ui/modal.js",
    "ui/tabs.js",
    "ui/delegacion.js",
    "main.js"
)

Write-Host ""
Write-Host " MOTOR EDGE 3.9-E - Build" -ForegroundColor Cyan
Write-Host " =========================" -ForegroundColor Cyan

$sb = [System.Text.StringBuilder]::new()
$null = $sb.AppendLine("// MOTOR EDGE 3.9-E - bundle.js")
$null = $sb.AppendLine("// Generado automaticamente por build.bat. No editar directamente.")
$null = $sb.AppendLine("// Para modificar: editar los archivos fuente y correr build.bat")
$null = $sb.AppendLine("")

$ok = 0
$warn = 0

foreach ($f in $files) {
    if (-not (Test-Path $f)) {
        Write-Host " [!] No encontrado: $f" -ForegroundColor Yellow
        $warn++
        continue
    }

    $raw = [System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)

    # Eliminar lineas de import (siempre comienzan con 'import ')
    $lines = $raw -split '\r?\n'
    $lines = $lines | Where-Object { $_ -notmatch '^import\s+' }
    $raw = $lines -join "`n"

    # Quitar palabra 'export' de declaraciones (preservar el resto de la linea)
    $raw = $raw -replace '(?m)^export\s+async\s+function\b', 'async function'
    $raw = $raw -replace '(?m)^export\s+function\b',         'function'
    $raw = $raw -replace '(?m)^export\s+const\b',            'const'
    $raw = $raw -replace '(?m)^export\s+let\b',              'let'
    $raw = $raw -replace '(?m)^export\s+class\b',            'class'
    # Bloque export { X, Y } standalone (por si acaso)
    $raw = $raw -replace '(?m)^export\s*\{[^}]*\};\s*', ''

    $null = $sb.AppendLine("// ===== $f =====")
    $null = $sb.AppendLine($raw)
    $null = $sb.AppendLine("")
    $ok++
    Write-Host " [+] $f" -ForegroundColor DarkGray
}

$bundle = $sb.ToString()
[System.IO.File]::WriteAllText("bundle.js", $bundle, [System.Text.Encoding]::UTF8)

$kb  = [math]::Round($bundle.Length / 1024, 1)
$ln  = ($bundle -split '\n').Count
Write-Host ""
Write-Host " bundle.js: $ln lineas / $kb KB ($ok archivos)" -ForegroundColor Green

# Actualizar index.html para usar bundle.js como script clasico (sin type=module)
$html = [System.IO.File]::ReadAllText("index.html", [System.Text.Encoding]::UTF8)

if ($html -match '<script type="module" src="main\.js">') {
    $html = $html -replace '<script type="module" src="main\.js"></script>', '<script src="bundle.js"></script>'
    [System.IO.File]::WriteAllText("index.html", $html, [System.Text.Encoding]::UTF8)
    Write-Host " index.html: script tag actualizado → bundle.js" -ForegroundColor Green
} elseif ($html -match '<script src="bundle\.js">') {
    Write-Host " index.html: ya usa bundle.js (sin cambios)" -ForegroundColor Cyan
} else {
    Write-Host " [!] index.html: no se encontro el tag de script esperado" -ForegroundColor Yellow
}

if ($warn -gt 0) {
    Write-Host ""
    Write-Host " Advertencia: $warn archivo(s) no encontrado(s)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host " Listo. Abri index.html directamente en el navegador." -ForegroundColor Green
Write-Host ""
