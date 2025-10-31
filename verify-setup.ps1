# ========================================
# Build Verification Script
# Checks if automation system is ready
# ========================================

Write-Host "🔍 Verifying Automation System Setup..." -ForegroundColor Cyan
Write-Host ""

$errors = @()
$warnings = @()

# Check Node.js
Write-Host "Checking Node.js..." -NoNewline
try {
    $nodeVersion = node --version
    Write-Host " ✅ $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host " ❌ Not installed" -ForegroundColor Red
    $errors += "Node.js is not installed"
}

# Check Yarn
Write-Host "Checking Yarn..." -NoNewline
try {
    $yarnVersion = yarn --version
    Write-Host " ✅ $yarnVersion" -ForegroundColor Green
} catch {
    Write-Host " ❌ Not installed" -ForegroundColor Red
    $errors += "Yarn is not installed"
}

# Check Docker
Write-Host "Checking Docker..." -NoNewline
try {
    docker --version | Out-Null
    Write-Host " ✅ Installed" -ForegroundColor Green
} catch {
    Write-Host " ❌ Not installed" -ForegroundColor Red
    $errors += "Docker is not installed"
}

# Check .env file
Write-Host "Checking .env file..." -NoNewline
if (Test-Path .env) {
    Write-Host " ✅ Found" -ForegroundColor Green
    
    # Check required variables
    $envContent = Get-Content .env -Raw
    
    $requiredVars = @(
        "DATABASE_URL",
        "JWT_SECRET",
        "REDIS_HOST",
        "REDIS_PORT",
        "GOOGLE_CREDENTIALS_BASE64",
        "GEMINI_API_KEY",
        "WEBSITE_API_URL",
        "WEBSITE_API_TOKEN"
    )
    
    foreach ($var in $requiredVars) {
        Write-Host "  - $var..." -NoNewline
        if ($envContent -match "$var=.+") {
            Write-Host " ✅" -ForegroundColor Green
        } else {
            Write-Host " ❌ Missing or empty" -ForegroundColor Red
            $errors += "$var is missing or empty in .env"
        }
    }
} else {
    Write-Host " ❌ Not found" -ForegroundColor Red
    $errors += ".env file not found - copy .env.example to .env"
}

# Check package.json dependencies
Write-Host "Checking automation dependencies..." -NoNewline
if (Test-Path node_modules) {
    $requiredPackages = @("bullmq", "ioredis", "googleapis", "formdata-node", "winston")
    $allInstalled = $true
    
    foreach ($pkg in $requiredPackages) {
        if (-not (Test-Path "node_modules/$pkg")) {
            $allInstalled = $false
            $warnings += "$pkg is not installed"
        }
    }
    
    if ($allInstalled) {
        Write-Host " ✅ All installed" -ForegroundColor Green
    } else {
        Write-Host " ⚠️  Some packages missing" -ForegroundColor Yellow
        $warnings += "Run 'yarn install' to install missing packages"
    }
} else {
    Write-Host " ❌ node_modules not found" -ForegroundColor Red
    $errors += "Dependencies not installed - run 'yarn install'"
}

# Check automation folder structure
Write-Host "Checking automation folder structure..." -NoNewline
$requiredFolders = @(
    "automation",
    "automation/config",
    "automation/services",
    "automation/queue",
    "automation/workflows",
    "automation/types",
    "automation/utils"
)

$allFoldersExist = $true
foreach ($folder in $requiredFolders) {
    if (-not (Test-Path $folder)) {
        $allFoldersExist = $false
        $errors += "Folder missing: $folder"
    }
}

if ($allFoldersExist) {
    Write-Host " ✅ Complete" -ForegroundColor Green
} else {
    Write-Host " ❌ Incomplete" -ForegroundColor Red
}

# Check Prisma schema
Write-Host "Checking Prisma schema..." -NoNewline
if (Test-Path "prisma/schema.prisma") {
    $schemaContent = Get-Content "prisma/schema.prisma" -Raw
    if ($schemaContent -match "model RecipeAutomation" -and $schemaContent -match "model AutomationConfig") {
        Write-Host " ✅ Automation models found" -ForegroundColor Green
    } else {
        Write-Host " ⚠️  Automation models not found" -ForegroundColor Yellow
        $warnings += "Automation Prisma models may not be integrated"
    }
} else {
    Write-Host " ❌ schema.prisma not found" -ForegroundColor Red
    $errors += "Prisma schema file not found"
}

# Check Docker services
Write-Host "Checking Docker services..." -NoNewline
try {
    $services = docker-compose ps --services 2>$null
    if ($services -match "redis" -and $services -match "db") {
        Write-Host " ✅ Configured" -ForegroundColor Green
    } else {
        Write-Host " ⚠️  Services may not be configured" -ForegroundColor Yellow
        $warnings += "Redis or DB may not be in docker-compose.yml"
    }
} catch {
    Write-Host " ⚠️  Unable to check" -ForegroundColor Yellow
    $warnings += "Could not verify Docker Compose configuration"
}

# Summary
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Verification Summary" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

if ($errors.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "✅ All checks passed! System is ready." -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Start services: docker-compose up -d" -ForegroundColor White
    Write-Host "   2. Start development: yarn dev" -ForegroundColor White
    Write-Host "   3. Access dashboard: http://localhost:3000/admin/automation" -ForegroundColor White
} else {
    if ($errors.Count -gt 0) {
        Write-Host ""
        Write-Host "❌ ERRORS ($($errors.Count)):" -ForegroundColor Red
        foreach ($err in $errors) {
            Write-Host "   - $err" -ForegroundColor Red
        }
    }
    
    if ($warnings.Count -gt 0) {
        Write-Host ""
        Write-Host "⚠️  WARNINGS ($($warnings.Count)):" -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host "   - $warning" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    Write-Host "🔧 Fix the errors above, then run setup:" -ForegroundColor Cyan
    Write-Host "   .\setup.ps1" -ForegroundColor White
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
