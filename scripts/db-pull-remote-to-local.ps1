<#
.SYNOPSIS
  Copy schema + data from a remote Postgres (e.g. Neon) into local Docker Postgres.

.DESCRIPTION
  1) Starts local Postgres via docker compose.
  2) Runs pg_dump in a postgres:17 client container (no local PostgreSQL tools required).
  3) Pipes SQL into the hrm-postgres container with psql.

  Prerequisites: Docker Desktop running.

.PARAMETER RemoteUrl
  SOURCE database URI. If omitted, reads DATABASE_URL from server/.env.

.EXAMPLE
  .\scripts\db-pull-remote-to-local.ps1
  .\scripts\db-pull-remote-to-local.ps1 -RemoteUrl "postgresql://user:pass@host/db?sslmode=require"
#>
param(
  [string]$RemoteUrl = ""
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot

function Read-DatabaseUrlFromEnvFile {
  param([string]$Path)
  if (-not (Test-Path $Path)) { return $null }
  foreach ($line in Get-Content $Path) {
    $t = $line.Trim()
    if ($t.StartsWith("#") -or $t.Length -eq 0) { continue }
    if ($t -match '^\s*DATABASE_URL=(.+)$') {
      $v = $matches[1].Trim()
      if (($v.StartsWith('"') -and $v.EndsWith('"')) -or ($v.StartsWith("'") -and $v.EndsWith("'"))) {
        $v = $v.Substring(1, $v.Length - 2)
      }
      return $v
    }
  }
  return $null
}

if ([string]::IsNullOrWhiteSpace($RemoteUrl)) {
  $RemoteUrl = $env:REMOTE_DATABASE_URL
}
if ([string]::IsNullOrWhiteSpace($RemoteUrl)) {
  $RemoteUrl = Read-DatabaseUrlFromEnvFile -Path (Join-Path $repoRoot "server\.env")
}

if ([string]::IsNullOrWhiteSpace($RemoteUrl)) {
  Write-Error "Set -RemoteUrl, or environment REMOTE_DATABASE_URL, or DATABASE_URL in server/.env (Neon URI)."
  exit 1
}

Write-Host "Repo root: $repoRoot"
Write-Host "Source:    $(($RemoteUrl -replace ':[^:@/]+@', ':****@'))"
Write-Host "Target:    Docker container hrm-postgres (db hrm_skill_matrix, user hrm)"

Push-Location $repoRoot
try {
  docker compose up -d postgres 2>$null
  if ($LASTEXITCODE -ne 0) {
    docker-compose up -d postgres
  }
  Start-Sleep -Seconds 2

  $container = "hrm-postgres"
  $exists = docker ps -q -f "name=$container"
  if (-not $exists) {
    Write-Error "Container '$container' is not running. Run from repo root: docker compose up -d postgres"
    exit 1
  }

  Write-Host "Streaming pg_dump -> local psql (this may take a while) ..."

  docker run --rm `
    -e "REMOTE_DATABASE_URL=$RemoteUrl" `
    postgres:17-alpine `
    sh -c 'pg_dump "$REMOTE_DATABASE_URL" --no-owner --no-acl --clean --if-exists' `
    | docker exec -i $container psql -U hrm -d hrm_skill_matrix -v ON_ERROR_STOP=1

  if ($LASTEXITCODE -ne 0) {
    Write-Error "Restore failed (exit $LASTEXITCODE). Check remote credentials, SSL, and Docker logs."
    exit 1
  }

  Write-Host ""
  Write-Host "Done. Use local DB in server/.env:"
  Write-Host "  DATABASE_URL=postgresql://hrm:password123@127.0.0.1:5432/hrm_skill_matrix?sslmode=disable"
}
finally {
  Pop-Location
}
