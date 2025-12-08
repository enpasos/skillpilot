<#
.SYNOPSIS
  Copies the skillpilot sources (excluding build artifacts) into a temp directory
  and emits a distributable ZIP that only contains the code.

.NOTES
  Update the defaults below or override them via parameters when invoking the script.
#>

param(
  [string]$SourceDir = "U:\home\enpasos\projects\skillpilot",
  [string]$TempDir = "C:\tmp",
  [string[]]$ExcludedDirs = @("node_modules", "dist", ".tmp", ".git", ".vercel"),
  [string[]]$ExcludedFiles = @("tailwind.output.css")
)

Write-Host "Starting project packaging..."
Write-Host "Source Directory: $SourceDir"
Write-Host "Temporary Directory: $TempDir"
Write-Host "Excluded Dirs: $($ExcludedDirs -join ', ')"
Write-Host "Excluded Files: $($ExcludedFiles -join ', ')"
Write-Host "-------------------------------------------"

if (-not (Test-Path -Path $SourceDir -PathType Container)) {
  Write-Error "Source directory '$SourceDir' not found. Aborting script."
  exit 1
}

if (-not (Test-Path -Path $TempDir -PathType Container)) {
  Write-Host "Creating temporary directory: $TempDir"
  New-Item -Path $TempDir -ItemType Directory -Force | Out-Null
}

$projectName = Split-Path -Path (Resolve-Path -Path $SourceDir) -Leaf
$destDir = Join-Path -Path $TempDir -ChildPath $projectName
$zipFilePath = Join-Path -Path $TempDir -ChildPath "$projectName.zip"

Write-Host "Destination Directory: $destDir"
Write-Host "Output Zip File: $zipFilePath"
Write-Host "-------------------------------------------"

Write-Host "Step 1: Removing previous destination directory (if present)..."
if (Test-Path -Path $destDir) {
  try {
    Remove-Item -Path $destDir -Recurse -Force -ErrorAction Stop
    Write-Host "Removed '$destDir'."
  } catch {
    Write-Error "Failed to remove '$destDir'. Error: $($_.Exception.Message)"
    exit 1
  }
} else {
  Write-Host "No previous destination directory found."
}
Write-Host "-------------------------------------------"

Write-Host "Step 2: Copying project files..."
$robocopyArgs = @(
  $SourceDir,
  $destDir,
  "/E"
)

if ($ExcludedDirs.Count -gt 0) {
  $robocopyArgs += "/XD"
  $robocopyArgs += $ExcludedDirs
}

if ($ExcludedFiles.Count -gt 0) {
  $robocopyArgs += "/XF"
  $robocopyArgs += $ExcludedFiles
}

$robocopyArgs += @("/NFL", "/NDL", "/NJH", "/NJS", "/NC", "/NS", "/NP")

Write-Host "Executing: robocopy $($robocopyArgs -join ' ')"
& robocopy @robocopyArgs

if ($LASTEXITCODE -ge 8) {
  Write-Error "Robocopy failed with exit code $LASTEXITCODE. Aborting."
  exit 1
} else {
  Write-Host "Robocopy completed successfully (exit code: $LASTEXITCODE)."
}
Write-Host "-------------------------------------------"

Write-Host "Step 3: Creating ZIP archive..."
if (Test-Path -Path $zipFilePath) {
  Write-Host "Removing existing archive '$zipFilePath'..."
  try {
    Remove-Item -Path $zipFilePath -Force -ErrorAction Stop
    Write-Host "Old archive removed."
  } catch {
    Write-Warning "Could not remove '$zipFilePath'. Compress-Archive will attempt to overwrite."
  }
}

try {
  Compress-Archive -Path $destDir -DestinationPath $zipFilePath -Force -ErrorAction Stop
  Write-Host "Successfully created zip file: $zipFilePath"
} catch {
  Write-Error "Failed to create zip file '$zipFilePath'. Error: $($_.Exception.Message)"
  exit 1
}
Write-Host "-------------------------------------------"
Write-Host "Packaging completed."
