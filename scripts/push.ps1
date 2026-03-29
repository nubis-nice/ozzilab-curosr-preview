#Requires -Version 5.1
<#
.SYNOPSIS
  Ustawia remote origin i wypycha gałąź main na GitHub.
.EXAMPLE
  .\scripts\push.ps1 "https://github.com/moj-login/ozzilb-browser-preview.git"
.EXAMPLE
  $env:GITHUB_REPO_URL = "https://github.com/moj-login/ozzilb-browser-preview.git"; .\scripts\push.ps1
#>
param(
  [Parameter(Mandatory = $false)]
  [string] $RepoUrl
)

$ErrorActionPreference = "Stop"
Set-Location (Resolve-Path (Join-Path $PSScriptRoot ".."))

if (-not $RepoUrl -or $RepoUrl.Trim() -eq "") {
  $RepoUrl = $env:GITHUB_REPO_URL
}
if (-not $RepoUrl -or $RepoUrl.Trim() -eq "") {
  Write-Host "Podaj URL klonowania HTTPS lub SSH repozytorium GitHub, np.:" -ForegroundColor Yellow
  Write-Host '  .\scripts\push.ps1 "https://github.com/TWOJ_LOGIN/ozzilb-browser-preview.git"' -ForegroundColor Cyan
  Write-Host "Albo ustaw zmienną: `$env:GITHUB_REPO_URL = '...'" -ForegroundColor Cyan
  exit 1
}

$RepoUrl = $RepoUrl.Trim()

git remote get-url origin 2>$null | Out-Null
if ($LASTEXITCODE -eq 0) {
  Write-Host "Zmieniam URL origin na: $RepoUrl"
  git remote set-url origin $RepoUrl
} else {
  Write-Host "Dodaję origin: $RepoUrl"
  git remote add origin $RepoUrl
}

Write-Host "Wypycham main..."
git push -u origin main
Write-Host "Gotowe." -ForegroundColor Green
