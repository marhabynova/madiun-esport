$ErrorActionPreference = 'Stop'
$repo = "D:\MADIUN ESPORT ARENA (MADIRA)\madira-web"
Set-Location $repo
Write-Host "Working in: $repo"
# Ensure branch exists
git checkout -B staging-for-pr upstream/main
# List files changed on staging compared to upstream main
$files = git diff --name-only upstream/main..staging | Where-Object { $_ -ne '' }
if (-not $files) { Write-Host 'No differing files found'; exit 0 }
Write-Host "Files to copy:`n" + ($files -join "`n")
foreach ($f in $files) {
    Write-Host "Checking out: $f"
    git checkout staging -- "$f"
}
# Commit
git add -A
$commitMsg = 'Import staging changes for PR (squashed)'
$commitExit = & git commit -m "$commitMsg" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host 'Nothing to commit or commit failed'
    Write-Host $commitExit
}
# Push
git push origin staging-for-pr --set-upstream
Write-Host 'Done: pushed staging-for-pr to origin'
