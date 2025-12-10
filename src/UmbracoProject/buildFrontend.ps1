# Frontend build script for Release builds
# Mirrors the GitHub Actions steps: npm ci + npm run build in ./src/frontend

[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

function Write-Info($message) {
    Write-Output "[buildFrontend] $message"
}

function Write-Warn($message) {
    Write-Output "[buildFrontend] warn : $message"
}

function Write-Err($message) {
    Write-Output "[buildFrontend] error : $message"
}

# Resolve repo root and frontend path based on script location
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
# Project path is src/UmbracoProject, frontend is at src/frontend relative to repo root
$repoRoot = Split-Path -Parent (Split-Path -Parent $scriptDir) # go up from src/UmbracoProject -> src -> repo root
$frontendPath = Join-Path $repoRoot 'src' | Join-Path -ChildPath 'frontend'

if (-not (Test-Path $frontendPath)) {
    Write-Err "Frontend directory not found at '$frontendPath'."
    exit 1
}

Write-Info "Using frontend path: $frontendPath"

# Optional: check Node.js availability
try {
    $nodeVersionOutput = & node --version 2>$null
} catch {
    $nodeVersionOutput = $null
}

if (-not $nodeVersionOutput) {
    Write-Err 'Node.js is not installed or not available on PATH. Please install Node.js and retry.'
    exit 1
}

$nodeVersion = $nodeVersionOutput.Trim()
Write-Info "Detected Node.js version: $nodeVersion"

# Ensure npm is available
try {
    $npmVersionOutput = & npm --version 2>$null
} catch {
    $npmVersionOutput = $null
}

if (-not $npmVersionOutput) {
    Write-Err 'npm is not installed or not available on PATH. Please ensure Node.js/npm are installed.'
    exit 1
}

$npmVersion = $npmVersionOutput.Trim()
Write-Info "Detected npm version: $npmVersion"

# Parse major versions and skip build on very old runtimes in Cloud (e.g., Node v0.10, npm 1.x)
function Get-Major($ver) {
    ($ver.TrimStart('v').Split('.'))[0] -as [int]
}
$nodeMajor = Get-Major $nodeVersion
$npmMajor = Get-Major $npmVersion
if ($nodeMajor -lt 12 -or $npmMajor -lt 5) {
    Write-Warn "Detected very old Node/npm in environment (Node=$nodeVersion, npm=$npmVersion). Skipping frontend build to avoid deployment failure."
    exit 0
}

# If NODE_VERSION environment variable is set, warn if mismatch (non-blocking)
$expectedNode = $env:NODE_VERSION
if ($expectedNode) {
    # Normalize versions by stripping leading 'v'
    $normExpected = $expectedNode.TrimStart('v')
    $normDetected = $nodeVersion.TrimStart('v')
    if ($normDetected -ne $normExpected) {
        Write-Warn "NODE_VERSION=$expectedNode differs from detected $nodeVersion. Proceeding anyway."
    }
}

Push-Location $frontendPath
try {
    # Prefer npm ci when available; fall back to npm install
    Write-Info 'Running npm ci...'
    $ciSucceeded = $true
    try {
        & cmd /c "npm ci --no-audit --no-fund --no-progress --loglevel=error"
    } catch {
        $ciSucceeded = $false
    }
    if (-not $ciSucceeded) {
        Write-Warn 'npm ci not supported or failed. Falling back to npm install.'
        & cmd /c "npm install --no-audit --no-fund --no-optional --no-progress --loglevel=error"
    }

    # Run build
    Write-Info 'Running npm run build...'
    & cmd /c "npm run build --loglevel=error"

    Write-Info 'Frontend build completed successfully.'
}
catch {
    Write-Err "Frontend build failed: $($_.Exception.Message)"
    exit 1
}
finally {
    Pop-Location
}
