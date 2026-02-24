# Install Alacritty config for Windows
$alacrittyDir = "$env:APPDATA\alacritty"

if (-not (Test-Path $alacrittyDir)) {
    New-Item -ItemType Directory -Path $alacrittyDir -Force
}

Copy-Item "alacritty-windows.toml" "$alacrittyDir\alacritty.toml" -Force

# Install themes
$themesDir = "$alacrittyDir\themes"
if (-not (Test-Path $themesDir)) {
    git clone https://github.com/alacritty/alacritty-theme $themesDir
}

# Register right-click context menu (Open with Alacritty)
$regFile = Join-Path $PSScriptRoot "context-menu.reg"
if (Test-Path $regFile) {
    reg import $regFile 2>$null
    Write-Host "Context menu registered!" -ForegroundColor Green
}

Write-Host "Alacritty config installed!" -ForegroundColor Green
