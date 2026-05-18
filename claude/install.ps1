# Install personal Claude Code skills via symlinks
# Requires Developer Mode enabled, or run as Administrator
$ErrorActionPreference = "Stop"

$src = Join-Path $PSScriptRoot "skills"
$dest = Join-Path $env:USERPROFILE ".claude\skills"

if (-not (Test-Path $dest)) {
    New-Item -ItemType Directory -Path $dest -Force | Out-Null
}

Get-ChildItem -Directory $src | ForEach-Object {
    $link = Join-Path $dest $_.Name
    if (Test-Path $link) {
        Remove-Item -Recurse -Force $link
    }
    New-Item -ItemType SymbolicLink -Path $link -Target $_.FullName | Out-Null
    Write-Host "Linked $($_.Name) -> $($_.FullName)" -ForegroundColor Green
}

Write-Host "Claude skills installed!" -ForegroundColor Green
