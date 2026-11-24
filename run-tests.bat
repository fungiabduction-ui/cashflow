@echo off
cd /d "%~dp0"
node --test "tests/**/*.test.mjs"
pause
