<#
.SYNOPSIS
    Lanza el Daemon de Terminal Web ttyd para QZ-HUB sobre Tailscale.
.DESCRIPTION
    Permite acceder de forma remota a PowerShell y Antigravity CLI (agy)
    desde el iPad o móvil a través de la red segura de Tailscale.
#>

$tailscaleIp = "100.105.162.78"
$port = 7681
$cwd = "C:\Users\jange"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  QZ-HUB AGY TERMINAL DAEMON (ttyd + Tailscale)" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  IP Tailscale : $tailscaleIp" -ForegroundColor Green
Write-Host "  Puerto       : $port" -ForegroundColor Green
Write-Host "  URL Remota   : http://${tailscaleIp}:${port}" -ForegroundColor Yellow
Write-Host "  URL Local    : http://localhost:${port}" -ForegroundColor Gray
Write-Host "  Working Dir  : $cwd" -ForegroundColor Gray
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "Iniciando ttyd con pwsh.exe..." -ForegroundColor White

$themeJson = '{"background": "#0b0f19", "foreground": "#f8fafc", "cursor": "#f59e0b"}'

ttyd -p $port -W -t fontSize=15 -t fontFamily="Cascadia Code, Consolas, monospace" -t "theme=$themeJson" -w $cwd pwsh.exe
