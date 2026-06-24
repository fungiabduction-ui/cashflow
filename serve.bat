@echo off
title MOTOR EDGE 3.9-E — Servidor local

echo.
echo  ==========================================
echo   MOTOR EDGE 3.9-E — Iniciando servidor
echo  ==========================================
echo.

:: Intentar con Python 3
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo  Puerto: http://localhost:7432
    echo  Cerrar esta ventana para detener el servidor.
    echo.
    start "" "http://localhost:7432"
    python -m http.server 7432
    goto :eof
)

:: Intentar con Python como py
py --version >nul 2>&1
if %errorlevel% == 0 (
    echo  Puerto: http://localhost:7432
    echo  Cerrar esta ventana para detener el servidor.
    echo.
    start "" "http://localhost:7432"
    py -m http.server 7432
    goto :eof
)

:: Intentar con Node.js / npx serve
npx --version >nul 2>&1
if %errorlevel% == 0 (
    echo  Puerto: http://localhost:3000
    echo  Cerrar esta ventana para detener el servidor.
    echo.
    start "" "http://localhost:3000"
    npx serve .
    goto :eof
)

:: Nada disponible
echo  ERROR: No se encontro Python ni Node.js instalados.
echo.
echo  Instala alguna de estas opciones:
echo    - Python: https://www.python.org/downloads/
echo    - Node.js: https://nodejs.org/
echo.
pause
