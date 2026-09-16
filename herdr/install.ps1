# Install herdr config for Windows
$dest = "$env:APPDATA\herdr"

if (-not (Test-Path "$dest\scripts")) { New-Item -ItemType Directory -Force "$dest\scripts" | Out-Null }

Copy-Item "config.toml" "$dest\config.toml" -Force
Copy-Item "scripts\goto.mjs" "$dest\scripts\goto.mjs" -Force

# El servidor lee config.toml en caliente; si no corre, no pasa nada.
herdr server reload-config 2>$null | Out-Null

Write-Host "herdr config installed!" -ForegroundColor Green
Write-Host "Ctrl+P needs node and fzf on PATH." -ForegroundColor DarkGray
