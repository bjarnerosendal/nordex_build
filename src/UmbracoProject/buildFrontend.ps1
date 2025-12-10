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

Write-Info "Detected npm version: $($npmVersionOutput.Trim())"

Push-Location $frontendPath
try {
    # Equivalent to `npm ci` in ./src/frontend
    Write-Info 'Running npm ci...'
    & npm ci

    # Equivalent to `npm run build` in ./src/frontend
    Write-Info 'Running npm run build...'
    & npm run build

    Write-Info 'Frontend build completed successfully.'
}
catch {
    Write-Err "Frontend build failed: $($_.Exception.Message)"
    exit 1
}
finally {
    Pop-Location
}
