param(
  [string]$NodePath = 'node',
  [int]$RestartDelaySec = 5
)

Write-Host "Starting madira submissions worker (PowerShell loop)"
while ($true) {
  try {
    & $NodePath 'scripts/workerProcess.cjs'
  } catch {
    Write-Host "Worker crashed: $_"
  }
  Write-Host "Worker exited. Restarting in $RestartDelaySec seconds..."
  Start-Sleep -Seconds $RestartDelaySec
}
