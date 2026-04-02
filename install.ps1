# VelvetMD Installer for Windows (PowerShell)
# Run: irm https://raw.githubusercontent.com/phenomenon0/VelvetMD/main/install.ps1 | iex
$ErrorActionPreference = 'Stop'

$repo = 'https://github.com/phenomenon0/VelvetMD.git'
$skillName = 'velvetmd'
$dataDir = Join-Path $env:LOCALAPPDATA $skillName
$claudeSkills = Join-Path $env:USERPROFILE '.claude' 'skills'
$skillLink = Join-Path $claudeSkills $skillName

Write-Host ''
Write-Host 'VelvetMD' -ForegroundColor Blue -NoNewline
Write-Host ' — Markdown that feels like silk'
Write-Host ''

# Require git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host 'Error: git is required. Install it and try again.' -ForegroundColor Yellow
    exit 1
}

# Clone or update
if (Test-Path (Join-Path $dataDir '.git')) {
    Write-Host 'Updating existing install...' -ForegroundColor DarkGray
    git -C $dataDir pull --quiet
} else {
    Write-Host 'Cloning VelvetMD...' -ForegroundColor DarkGray
    git clone --depth 1 $repo $dataDir
}

# Ensure ~/.claude/skills exists
if (-not (Test-Path $claudeSkills)) {
    New-Item -ItemType Directory -Path $claudeSkills -Force | Out-Null
}

# Create junction (Windows symlink equivalent, no admin needed)
if (Test-Path $skillLink) {
    $item = Get-Item $skillLink -Force
    if ($item.LinkType) {
        $item.Delete()
    } else {
        $backup = "${skillLink}.backup.$(Get-Date -Format 'yyyyMMddHHmmss')"
        Write-Host "Backing up existing $skillLink to $backup" -ForegroundColor Yellow
        Move-Item $skillLink $backup
    }
}
New-Item -ItemType Junction -Path $skillLink -Target $dataDir | Out-Null

# Optional: install Electron deps
if ((Get-Command npm -ErrorAction SilentlyContinue) -and (Test-Path (Join-Path $dataDir 'electron' 'package.json'))) {
    Write-Host 'Installing Electron dependencies (native mode)...' -ForegroundColor DarkGray
    Push-Location (Join-Path $dataDir 'electron')
    try { npm install --silent 2>$null } catch {}
    Pop-Location
}

Write-Host ''
Write-Host 'Installed!' -ForegroundColor Green -NoNewline
Write-Host " Restart Claude Code to load " -NoNewline
Write-Host '/velvetmd' -ForegroundColor Blue
Write-Host ''
Write-Host '  Usage:'
Write-Host '    /velvetmd ./docs              # Browse a folder'
Write-Host '    /velvetmd README.md           # Preview a file'
Write-Host '    /velvetmd --session a.md b.md  # Session files'
Write-Host ''
Write-Host "Installed to: $dataDir" -ForegroundColor DarkGray
Write-Host "Linked from:  $skillLink" -ForegroundColor DarkGray
Write-Host ''
