# Install herdr config for Windows
$dest = "$env:APPDATA\herdr"

if (-not (Test-Path "$dest\scripts")) { New-Item -ItemType Directory -Force "$dest\scripts" | Out-Null }

Copy-Item "config.toml" "$dest\config.toml" -Force
Copy-Item "scripts\*.mjs" "$dest\scripts" -Force

# Config propia de yazi para el explorador lateral (dos columnas).
if (-not (Test-Path "$dest\yazi-side")) { New-Item -ItemType Directory -Force "$dest\yazi-side" | Out-Null }
Copy-Item "yazi-side\yazi.toml" "$dest\yazi-side\yazi.toml" -Force

# El servidor lee config.toml en caliente; si no corre, no pasa nada.
herdr server reload-config 2>$null | Out-Null

Write-Host "herdr config installed!" -ForegroundColor Green
Write-Host "Ctrl+P needs node and fzf on PATH." -ForegroundColor DarkGray
Write-Host "prefix+Shift+F (explorador) needs yazi; prefix+Shift+L needs lazygit." -ForegroundColor DarkGray
