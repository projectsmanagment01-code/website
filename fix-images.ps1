#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Fixes image upload issues by ensuring correct directory structure

.DESCRIPTION
    This script diagnoses and fixes common image upload/serving issues:
    1. Creates missing directories
    2. Syncs uploads/ to public/uploads/
    3. Verifies permissions
    4. Tests image serving

.PARAMETER SiteDir
    Path to the website directory (default: current directory)

.PARAMETER Mode
    Fix mode: 'symlink' (create symlink), 'copy' (copy files), 'move' (move files)
#>

param(
    [string]$SiteDir = ".",
    [string]$Mode = "symlink"
)

$ErrorActionPreference = "Stop"

Write-Host "🔧 Image Upload Fix Tool" -ForegroundColor Cyan
Write-Host "=" * 50

# Change to site directory
Push-Location $SiteDir

try {
    $uploadsDir = Join-Path (Get-Location) "uploads"
    $publicUploadsDir = Join-Path (Get-Location) "public/uploads"

    Write-Host "`n📊 Current Status:" -ForegroundColor Yellow

    # Check uploads directory
    if (Test-Path $uploadsDir) {
        $fileCount = (Get-ChildItem $uploadsDir -Recurse -File).Count
        Write-Host "✅ uploads/ exists ($fileCount files)" -ForegroundColor Green
        
        # List categories
        $categories = Get-ChildItem $uploadsDir -Directory | Select-Object -ExpandProperty Name
        Write-Host "   Categories: $($categories -join ', ')" -ForegroundColor Gray
    } else {
        Write-Host "❌ uploads/ does NOT exist" -ForegroundColor Red
        New-Item -Path $uploadsDir -ItemType Directory -Force | Out-Null
        Write-Host "✅ Created uploads/ directory" -ForegroundColor Green
    }

    # Check public/uploads directory
    if (Test-Path $publicUploadsDir) {
        $publicFileCount = (Get-ChildItem $publicUploadsDir -Recurse -File).Count
        Write-Host "✅ public/uploads/ exists ($publicFileCount files)" -ForegroundColor Green
    } else {
        Write-Host "❌ public/uploads/ does NOT exist" -ForegroundColor Red
    }

    # Apply fix based on mode
    Write-Host "`n🔧 Applying fix ($Mode mode)..." -ForegroundColor Yellow

    switch ($Mode) {
        "symlink" {
            # Remove existing public/uploads if it's not a symlink
            if ((Test-Path $publicUploadsDir) -and -not (Get-Item $publicUploadsDir).LinkType) {
                Write-Host "⚠️  Removing existing public/uploads directory..." -ForegroundColor Yellow
                Remove-Item $publicUploadsDir -Recurse -Force
            }

            # Create symlink
            if (-not (Test-Path $publicUploadsDir)) {
                try {
                    # For Windows, use mklink /D
                    $publicDir = Join-Path (Get-Location) "public"
                    if (-not (Test-Path $publicDir)) {
                        New-Item -Path $publicDir -ItemType Directory -Force | Out-Null
                    }
                    
                    cmd /c "mklink /D `"$publicUploadsDir`" `"$uploadsDir`""
                    
                    if (Test-Path $publicUploadsDir) {
                        Write-Host "✅ Created symlink: public/uploads -> uploads/" -ForegroundColor Green
                    } else {
                        throw "Symlink creation failed"
                    }
                } catch {
                    Write-Host "❌ Symlink creation failed: $_" -ForegroundColor Red
                    Write-Host "💡 Try running as Administrator or use 'copy' mode" -ForegroundColor Yellow
                    $Mode = "copy"
                }
            }
        }

        "copy" {
            # Copy files from uploads/ to public/uploads/
            if (Test-Path $uploadsDir) {
                if (-not (Test-Path $publicUploadsDir)) {
                    New-Item -Path $publicUploadsDir -ItemType Directory -Force | Out-Null
                }

                Write-Host "📁 Copying files from uploads/ to public/uploads/..." -ForegroundColor Cyan
                Copy-Item -Path "$uploadsDir\*" -Destination $publicUploadsDir -Recurse -Force
                
                $copiedCount = (Get-ChildItem $publicUploadsDir -Recurse -File).Count
                Write-Host "✅ Copied $copiedCount files to public/uploads/" -ForegroundColor Green
            }
        }

        "move" {
            # Move files from uploads/ to public/uploads/
            if (Test-Path $uploadsDir) {
                if (-not (Test-Path $publicUploadsDir)) {
                    New-Item -Path $publicUploadsDir -ItemType Directory -Force | Out-Null
                }

                Write-Host "📁 Moving files from uploads/ to public/uploads/..." -ForegroundColor Cyan
                Move-Item -Path "$uploadsDir\*" -Destination $publicUploadsDir -Force
                
                Write-Host "✅ Moved files to public/uploads/" -ForegroundColor Green
                Write-Host "⚠️  Old uploads/ directory is now empty" -ForegroundColor Yellow
            }
        }
    }

    # Verify fix
    Write-Host "`n✅ Fix Applied!" -ForegroundColor Green
    Write-Host "`n📊 Final Status:" -ForegroundColor Yellow

    if (Test-Path $uploadsDir) {
        $fileCount = (Get-ChildItem $uploadsDir -Recurse -File).Count
        Write-Host "✅ uploads/: $fileCount files" -ForegroundColor Green
    }

    if (Test-Path $publicUploadsDir) {
        $publicFileCount = (Get-ChildItem $publicUploadsDir -Recurse -File).Count
        Write-Host "✅ public/uploads/: $publicFileCount files" -ForegroundColor Green
        
        $linkType = (Get-Item $publicUploadsDir).LinkType
        if ($linkType) {
            Write-Host "   Type: Symlink" -ForegroundColor Gray
        } else {
            Write-Host "   Type: Directory" -ForegroundColor Gray
        }
    }

    # Test image serving
    Write-Host "`n🧪 Testing image serving..." -ForegroundColor Yellow
    Write-Host "To test, try accessing: http://your-domain/uploads/category/image.webp" -ForegroundColor Gray

    Write-Host "`n✅ Fix complete! Please test image upload and display." -ForegroundColor Green
    Write-Host "💡 If issues persist, run diagnostics: curl http://your-domain/api/admin/diagnostics/images" -ForegroundColor Cyan

} catch {
    Write-Host "`n❌ Error: $_" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}
