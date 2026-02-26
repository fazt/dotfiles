# Install WezTerm config for Windows
$dest = "$env:USERPROFILE\.wezterm.lua"

Copy-Item "wezterm.lua" $dest -Force

Write-Host "WezTerm config installed!" -ForegroundColor Green
