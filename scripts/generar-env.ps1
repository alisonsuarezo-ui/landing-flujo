# Crea .env a partir de .env.example con secretos aleatorios (Windows PowerShell).
# Uso:  powershell -ExecutionPolicy Bypass -File scripts\generar-env.ps1
$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')
if (Test-Path .env) { Write-Host 'Ya existe .env: no se modifica.'; exit 0 }

function Rnd([int]$bytes) {
  $b = New-Object byte[] $bytes
  [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b)
  ($b | ForEach-Object { $_.ToString('x2') }) -join ''
}

$adminPass = "AiA-$(Rnd 6)"
$c = Get-Content .env.example -Raw
$c = $c -replace '(?m)^POSTGRES_PASSWORD=.*$', "POSTGRES_PASSWORD=$(Rnd 18)"
$c = $c -replace '(?m)^JWT_SECRET=.*$', "JWT_SECRET=$(Rnd 32)"
$c = $c -replace '(?m)^ADMIN_PASSWORD=.*$', "ADMIN_PASSWORD=$adminPass"
$c = $c -replace '(?m)^N8N_WEBHOOK_SECRET=.*$', "N8N_WEBHOOK_SECRET=$(Rnd 24)"
[System.IO.File]::WriteAllText((Join-Path (Get-Location) '.env'), $c.Replace("`r`n", "`n"))

Write-Host '.env creado.'
Write-Host "  Panel:      http://localhost:8080/admin/"
Write-Host "  Contraseña: $adminPass"
Write-Host 'Completa TELEGRAM_BOT_TOKEN y TELEGRAM_CHAT_ID en .env para recibir los avisos.'
