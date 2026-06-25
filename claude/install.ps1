# Install personal Claude/agent skills via symlinks.
# On Windows, falls back to junctions when symlink privileges are unavailable.
$ErrorActionPreference = "Stop"

$src = Join-Path $PSScriptRoot "skills"
$destinations = @(
    (Join-Path $env:USERPROFILE ".claude\skills"),
    (Join-Path $env:USERPROFILE ".agents\skills")
)

function New-SkillLink {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Path,
        [Parameter(Mandatory = $true)]
        [string] $Target
    )

    try {
        New-Item -ItemType SymbolicLink -Path $Path -Target $Target | Out-Null
        return "symlink"
    }
    catch {
        New-Item -ItemType Junction -Path $Path -Target $Target | Out-Null
        return "junction"
    }
}

foreach ($dest in $destinations) {
    if (-not (Test-Path $dest)) {
        New-Item -ItemType Directory -Path $dest -Force | Out-Null
    }

    Get-ChildItem -Directory $src | ForEach-Object {
        $link = Join-Path $dest $_.Name
        if (Test-Path $link) {
            Remove-Item -Recurse -Force $link
        }
        $linkType = New-SkillLink -Path $link -Target $_.FullName
        Write-Host "Linked $($_.Name) -> $($_.FullName) in $dest ($linkType)" -ForegroundColor Green
    }
}

Write-Host "Claude and agent skills installed!" -ForegroundColor Green
