@echo off
echo Deteniendo ttyd.exe...
taskkill /F /IM ttyd.exe /T >nul 2>&1
echo Daemon de terminal detenido.
pause
