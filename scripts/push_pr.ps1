param(
    [string]$remoteUrl,
    [string]$baseBranch = 'main',
    [switch]$draft
)

if (-not $remoteUrl) {
    Write-Error "remoteUrl param required. Example: ./push_pr.ps1 -remoteUrl 'https://github.com/owner/repo.git' -draft"
    exit 1
}

Write-Host "Adding remote origin if missing..."
try {
    git remote get-url origin > $null 2>&1
} catch {
    git remote add origin $remoteUrl
}

Write-Host "Fetching remote..."
git fetch origin

Write-Host "Pushing branch fix/prisma-downgrade to origin..."
git push origin fix/prisma-downgrade

# create PR via gh if available
if (Get-Command gh -ErrorAction SilentlyContinue) {
    $title = 'chore(prisma): downgrade to v4.15.0 for local compatibility'
    $bodyFile = "PR_DRAFT.md"
    if ($draft) {
        gh pr create --base $baseBranch --head fix/prisma-downgrade --title $title --body-file $bodyFile --draft
    } else {
        gh pr create --base $baseBranch --head fix/prisma-downgrade --title $title --body-file $bodyFile
    }
} else {
    Write-Host "gh CLI not found. PR not created automatically. Use 'gh pr create' to make a PR with PR_DRAFT.md as the body."
}
