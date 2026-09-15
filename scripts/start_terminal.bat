@echo off
title QZ-HUB Terminal Daemon (ttyd + Tailscale)
cls
echo ======================================================================
echo   QZ-HUB AGY TERMINAL DAEMON (ttyd + Tailscale)
echo ======================================================================
echo   IP Tailscale: 100.105.162.78
echo   Puerto: 7681
echo   Acceso Remoto (iPad / Movil): http://100.105.162.78:7681
echo   Acceso Local (PC):            http://localhost:7681
echo ======================================================================
echo   Directorio inicial: C:\Users\jange
echo   Shell: pwsh.exe
echo   Presiona Ctrl+C para detener el daemon.
echo ======================================================================
echo.

ttyd -p 7681 -W -t fontSize=15 -t fontFamily="Cascadia Code, Consolas, monospace" -t theme="{\"background\": \"#0b0f19\", \"foreground\": \"#f8fafc\", \"cursor\": \"#f59e0b\"}" -w "C:\Users\jange" pwsh.exe
