#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Check image upload configuration across multiple websites

.DESCRIPTION
    Scans multiple website directories to identify image upload issues

.PARAMETER SitesRootDir
    Root directory containing all website folders
#>

param(
    [string]$SitesRootDir = "."
)

Write-Host "🔍 Image Upload Configuration Checker" -ForegroundColor Cyan
Write-Host "=" * 70

$results = @()

# Find all website directories (looking for next.config.mjs)
$sites = Get-ChildItem -Path $SitesRootDir -Directory | Where-Object {
    Test-Path (Join-Path $_.FullName "next.config.mjs")
}

Write-Host "`nFound $($sites.Count) Next.js websites`n" -ForegroundColor Yellow

foreach ($site in $sites) {
    Write-Host "Checking: $($site.Name)..." -ForegroundColor Cyan
    
    $siteResult = [PSCustomObject]@{
        Name = $site.Name
        Path = $site.FullName
        UploadsExists = $false
        PublicUploadsExists = $false
        IsSymlink = $false
        FileCount = 0
        PublicFileCount = 0
        Status = "Unknown"
        Issue = ""
    }

    $uploadsDir = Join-Path $site.FullName "uploads"
    $publicUploadsDir = Join-Path $site.FullName "public\uploads"

    # Check uploads directory
    if (Test-Path $uploadsDir) {
        $siteResult.UploadsExists = $true
        $siteResult.FileCount = (Get-ChildItem $uploadsDir -Recurse -File -ErrorAction SilentlyContinue).Count
    }

    # Check public/uploads directory
    if (Test-Path $publicUploadsDir) {
        $siteResult.PublicUploadsExists = $true
        $siteResult.PublicFileCount = (Get-ChildItem $publicUploadsDir -Recurse -File -ErrorAction SilentlyContinue).Count
        
        $item = Get-Item $publicUploadsDir
        if ($item.LinkType) {
            $siteResult.IsSymlink = $true
        }
    }

    # Determine status
    if ($siteResult.UploadsExists -and $siteResult.PublicUploadsExists) {
        if ($siteResult.IsSymlink) {
            $siteResult.Status = "✅ OK (Symlink)"
        } elseif ($siteResult.FileCount -eq $siteResult.PublicFileCount) {
            $siteResult.Status = "✅ OK (Synced)"
        } else {
            $siteResult.Status = "⚠️ WARNING"
            $siteResult.Issue = "File count mismatch ($($siteResult.FileCount) vs $($siteResult.PublicFileCount))"
        }
    } elseif ($siteResult.UploadsExists -and -not $siteResult.PublicUploadsExists) {
        $siteResult.Status = "❌ BROKEN"
        $siteResult.Issue = "public/uploads missing"
    } elseif (-not $siteResult.UploadsExists) {
        $siteResult.Status = "⚠️ NEW"
        $siteResult.Issue = "No uploads yet"
    } else {
        $siteResult.Status = "❓ UNKNOWN"
    }

    $results += $siteResult
}

# Display results
Write-Host "`n" + ("=" * 70) + "`n"
Write-Host "SUMMARY:" -ForegroundColor Yellow
Write-Host "=" * 70 + "`n"

$results | ForEach-Object {
    $color = switch -Wildcard ($_.Status) {
        "✅*" { "Green" }
        "⚠️*" { "Yellow" }
        "❌*" { "Red" }
        default { "Gray" }
    }
    
    Write-Host "$($_.Status) $($_.Name)" -ForegroundColor $color
    if ($_.Issue) {
        Write-Host "   Issue: $($_.Issue)" -ForegroundColor Gray
    }
    if ($_.UploadsExists) {
        Write-Host "   Files: $($_.FileCount) in uploads/, $($_.PublicFileCount) in public/uploads/" -ForegroundColor Gray
    }
    Write-Host ""
}

# Statistics
$broken = ($results | Where-Object { $_.Status -like "❌*" }).Count
$warning = ($results | Where-Object { $_.Status -like "⚠️*" }).Count
$ok = ($results | Where-Object { $_.Status -like "✅*" }).Count

Write-Host "`n" + ("=" * 70)
Write-Host "STATISTICS:" -ForegroundColor Yellow
Write-Host "  ✅ OK: $ok sites" -ForegroundColor Green
Write-Host "  ⚠️ WARNING: $warning sites" -ForegroundColor Yellow
Write-Host "  ❌ BROKEN: $broken sites" -ForegroundColor Red

if ($broken -gt 0) {
    Write-Host "`n💡 To fix broken sites, run:" -ForegroundColor Cyan
    Write-Host "   .\fix-images.ps1 -SiteDir `"path/to/broken/site`"" -ForegroundColor Gray
}

# Save detailed report
$reportPath = Join-Path $SitesRootDir "image-upload-report.json"
$results | ConvertTo-Json -Depth 3 | Set-Content $reportPath
Write-Host "`n📄 Detailed report saved to: $reportPath" -ForegroundColor Cyan
