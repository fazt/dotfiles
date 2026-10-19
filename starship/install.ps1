# Install Starship prompt config for Windows
if (-not (Get-Command starship -ErrorAction SilentlyContinue)) {
    winget install --id Starship.Starship -e
}

$configDir = "$env:USERPROFILE\.config"
if (-not (Test-Path $configDir)) { New-Item -ItemType Directory -Force $configDir | Out-Null }
Copy-Item (Join-Path $PSScriptRoot "starship.toml") "$configDir\starship.toml" -Force

$profileDir = Split-Path $PROFILE
if (-not (Test-Path $profileDir)) { New-Item -ItemType Directory -Force $profileDir | Out-Null }
$profileContent = ""
if (Test-Path $PROFILE) { $profileContent = Get-Content $PROFILE -Raw }

if ($profileContent -notmatch "starship init") {
    Add-Content $PROFILE "`n# Starship prompt"
    Add-Content $PROFILE 'Invoke-Expression (&starship init powershell)'
    Write-Host "Starship init added to $PROFILE" -ForegroundColor Green
} else {
    Write-Host "Starship already configured" -ForegroundColor Yellow
}

Write-Host "Starship installed! Restart your terminal to apply." -ForegroundColor Green
