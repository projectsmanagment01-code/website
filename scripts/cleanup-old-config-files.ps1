# Security Cleanup Script
# This script removes old configuration files from the public uploads directory
# after verifying the migration to the secure data/config directory

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Security Cleanup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "c:\Users\Administrator\Desktop\Blogging Project\Website_project\latest changes"
Set-Location $projectRoot

Write-Host "Project Root: $projectRoot" -ForegroundColor Yellow
Write-Host ""

# Check if new secure directory exists
Write-Host "1. Checking secure directory..." -ForegroundColor Green
if (Test-Path "data\config") {
    Write-Host "   ✓ data\config directory exists" -ForegroundColor Green
} else {
    Write-Host "   ✗ data\config directory NOT FOUND!" -ForegroundColor Red
    Write-Host "   Migration may not have completed. Do not proceed." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Check if new files exist
Write-Host "2. Verifying migrated files..." -ForegroundColor Green
$secureFiles = @(
    "data\config\ai-settings.json",
    "data\config\site.json",
    "data\config\home.json",
    "data\config\contact-content.json",
    "data\config\cookies-content.json"
)

$allFilesExist = $true
foreach ($file in $secureFiles) {
    if (Test-Path $file) {
        $size = (Get-Item $file).Length
        Write-Host "   ✓ $file ($size bytes)" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $file NOT FOUND" -ForegroundColor Yellow
        $allFilesExist = $false
    }
}

Write-Host ""

if (-not $allFilesExist) {
    Write-Host "⚠️  Some files are missing in data\config" -ForegroundColor Yellow
    Write-Host "   This may be normal if they haven't been created yet." -ForegroundColor Yellow
    Write-Host "   The system will create them on first use." -ForegroundColor Yellow
    Write-Host ""
}

# List old files to be deleted
Write-Host "3. Old files to be deleted:" -ForegroundColor Green
$oldFiles = @(
    "uploads\ai-settings.json",
    "uploads\custom-code-settings.json",
    "uploads\content\site.json",
    "uploads\content\home.json",
    "uploads\contact-content.json",
    "uploads\cookies-content.json"
)

$filesToDelete = @()
foreach ($file in $oldFiles) {
    if (Test-Path $file) {
        $size = (Get-Item $file).Length
        Write-Host "   📄 $file ($size bytes)" -ForegroundColor Yellow
        $filesToDelete += $file
    } else {
        Write-Host "   - $file (not found - already deleted or never existed)" -ForegroundColor Gray
    }
}

Write-Host ""

if ($filesToDelete.Count -eq 0) {
    Write-Host "✓ No old files found. Cleanup already completed!" -ForegroundColor Green
    exit 0
}

# Confirm deletion
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "⚠️  WARNING" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "You are about to delete $($filesToDelete.Count) configuration file(s)." -ForegroundColor Yellow
Write-Host "These files contain sensitive data and are currently publicly accessible." -ForegroundColor Yellow
Write-Host ""
Write-Host "Before proceeding, ensure:" -ForegroundColor Yellow
Write-Host "  1. Your admin panel works correctly" -ForegroundColor Yellow
Write-Host "  2. Site content displays properly" -ForegroundColor Yellow
Write-Host "  3. AI features still function" -ForegroundColor Yellow
Write-Host ""

$confirmation = Read-Host "Type 'DELETE' to proceed with cleanup (or anything else to cancel)"

if ($confirmation -ne "DELETE") {
    Write-Host ""
    Write-Host "Cleanup cancelled. No files were deleted." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "4. Deleting old files..." -ForegroundColor Green

$deletedCount = 0
$errorCount = 0

foreach ($file in $filesToDelete) {
    try {
        Remove-Item $file -Force -ErrorAction Stop
        Write-Host "   ✓ Deleted: $file" -ForegroundColor Green
        $deletedCount++
    } catch {
        Write-Host "   ✗ Error deleting: $file" -ForegroundColor Red
        Write-Host "     $_" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host ""

# Clean up empty directories
Write-Host "5. Cleaning up empty directories..." -ForegroundColor Green
if (Test-Path "uploads\content") {
    $contentFiles = Get-ChildItem "uploads\content" -File
    if ($contentFiles.Count -eq 0) {
        try {
            Remove-Item "uploads\content" -Force -ErrorAction Stop
            Write-Host "   ✓ Removed empty directory: uploads\content" -ForegroundColor Green
        } catch {
            Write-Host "   ✗ Could not remove uploads\content (may not be empty)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   - uploads\content not empty, keeping it" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Cleanup Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Files deleted: $deletedCount" -ForegroundColor Green
Write-Host "Errors: $errorCount" -ForegroundColor $(if ($errorCount -gt 0) { "Red" } else { "Green" })
Write-Host ""

if ($errorCount -eq 0 -and $deletedCount -gt 0) {
    Write-Host "✓ Cleanup completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Test your site thoroughly" -ForegroundColor Yellow
    Write-Host "  2. Add data/config/*.json to .gitignore" -ForegroundColor Yellow
    Write-Host "  3. Consider moving API keys to .env files" -ForegroundColor Yellow
} elseif ($deletedCount -eq 0) {
    Write-Host "No files were deleted." -ForegroundColor Yellow
} else {
    Write-Host "⚠️  Some errors occurred. Please check manually." -ForegroundColor Red
}

Write-Host ""
Write-Host "For more information, see: docs\SECURITY_MIGRATION_COMPLETE.md" -ForegroundColor Cyan
