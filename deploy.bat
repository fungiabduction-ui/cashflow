@echo off
title MOTOR EDGE - Deploy
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy.ps1"
pause
