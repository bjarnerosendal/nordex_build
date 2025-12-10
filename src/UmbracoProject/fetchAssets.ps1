$PAT = "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"
$params = @{
  'Uri'     = 'https://api.github.com/repos/Kruso/NordexFood/actions/workflows/build-frontend.yml/runs?status=success'
  'Headers' = @{
    'Authorization' = 'Bearer ' + $PAT
    'Accept'        = 'application/vnd.github.v3+json'
    'User-Agent'    = 'My-Website-Asset-Fetcher'
  }                
  'Method'  = 'GET'
} 
$tempFile = "./fe-artifact.zip"

$global:ProgressPreference="SilentlyContinue"

Write-Output "Fetching latest frontend build from Github"

Write-Output "Fetching latest workflow run"

$runs = Invoke-RestMethod @params

if ($null -eq $runs.workflow_runs) {
  Write-Output "No workflow runs found"
  return;
}

$artifactsUrl = $runs.workflow_runs[0].artifacts_url

Write-Output "Fetching artifact location"

$params.Uri = $artifactsUrl

$artifacts = Invoke-RestMethod @params

$latestArtifactUrl = $artifacts.artifacts[0].archive_download_url;

$params.Uri = $latestArtifactUrl

Write-Output "Downloading atifact to temp file: $tempFile"

Invoke-RestMethod @params -OutFile $tempFile

Write-Output "Extracting artifact to ./wwwroot/frontend"

Expand-Archive -path $tempFile  -DestinationPath ./wwwroot/frontend -Force

Write-Output "Cleaning up temp file"

Remove-Item -Path $tempFile

Write-Output "Frontend assets downloaded"