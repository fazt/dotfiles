# Install PowerShell aliases
$aliasesFile = Join-Path $PSScriptRoot "aliases.ps1"

$profileContent = ""
if (Test-Path $PROFILE) {
    $profileContent = Get-Content $PROFILE -Raw
}

if ($profileContent -notmatch "aliases\.ps1") {
    Add-Content $PROFILE "`n# Dotfiles aliases"
    Add-Content $PROFILE ". `"$aliasesFile`""
    Write-Host "Aliases added to $PROFILE" -ForegroundColor Green
} else {
    Write-Host "Aliases already configured" -ForegroundColor Yellow
}

# PSReadLine: Tab con menu y sugerencias del historial
$psrlFile = Join-Path $PSScriptRoot "psreadline.ps1"
$profileContent = Get-Content $PROFILE -Raw
if ($profileContent -notmatch "psreadline\.ps1") {
    Add-Content $PROFILE "`n# Autocompletado y sugerencias del historial"
    Add-Content $PROFILE ". `"$psrlFile`""
    Write-Host "PSReadLine config added to $PROFILE" -ForegroundColor Green
} else {
    Write-Host "PSReadLine already configured" -ForegroundColor Yellow
}

Write-Host "Shell aliases installed! Restart your terminal to apply."
