# VPS Error Handling Test Script (PowerShell Version)
# Usage: .\test-vps.ps1 -Domain "https://yourdomain.com"

param(
    [Parameter(Mandatory=$true)]
    [string]$Domain
)

$Green = "`e[32m"
$Red = "`e[31m"
$Yellow = "`e[33m"
$Cyan = "`e[36m"
$Reset = "`e[0m"

Write-Host "${Cyan}🧪 Testing Error Handling on VPS${Reset}"
Write-Host "Target: $Domain"
Write-Host "================================"

$Passed = 0
$Failed = 0
$Warnings = 0

# Test 1: Health Check
Write-Host "`n${Yellow}Test 1: Health Check${Reset}"
try {
    $response = Invoke-WebRequest -Uri "$Domain/api/health" -Method Get -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "${Green}✅ PASS${Reset} - Health endpoint returned 200"
        $Passed++
    }
} catch {
    Write-Host "${Red}❌ FAIL${Reset} - Health endpoint error: $($_.Exception.Message)"
    $Failed++
}

# Test 2: Database Health
Write-Host "`n${Yellow}Test 2: Database Health Check${Reset}"
try {
    $response = Invoke-WebRequest -Uri "$Domain/api/health/db" -Method Get -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "${Green}✅ PASS${Reset} - Database health returned 200"
        $content = $response.Content | ConvertFrom-Json
        Write-Host "  Response Time: $($content.responseTime)"
        $Passed++
    }
} catch {
    Write-Host "${Red}❌ FAIL${Reset} - Database health error: $($_.Exception.Message)"
    $Failed++
}

# Test 3: Recipe API
Write-Host "`n${Yellow}Test 3: Recipe API${Reset}"
try {
    $response = Invoke-WebRequest -Uri "$Domain/api/recipe?limit=5" -Method Get -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "${Green}✅ PASS${Reset} - Recipe API returned 200"
        $Passed++
    }
} catch {
    Write-Host "${Red}❌ FAIL${Reset} - Recipe API error: $($_.Exception.Message)"
    $Failed++
}

# Test 4: Categories
Write-Host "`n${Yellow}Test 4: Categories API${Reset}"
try {
    $response = Invoke-WebRequest -Uri "$Domain/api/categories" -Method Get -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "${Green}✅ PASS${Reset} - Categories API returned 200"
        $Passed++
    }
} catch {
    Write-Host "${Red}❌ FAIL${Reset} - Categories API error: $($_.Exception.Message)"
    $Failed++
}

# Test 5: Trending Recipes
Write-Host "`n${Yellow}Test 5: Trending Recipes${Reset}"
try {
    $response = Invoke-WebRequest -Uri "$Domain/api/recipe/trending?limit=5" -Method Get -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "${Green}✅ PASS${Reset} - Trending API returned 200"
        $Passed++
    }
} catch {
    Write-Host "${Red}❌ FAIL${Reset} - Trending API error: $($_.Exception.Message)"
    $Failed++
}

# Test 6: Latest Recipes
Write-Host "`n${Yellow}Test 6: Latest Recipes${Reset}"
try {
    $response = Invoke-WebRequest -Uri "$Domain/api/recipe/latest?limit=5" -Method Get -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "${Green}✅ PASS${Reset} - Latest API returned 200"
        $Passed++
    }
} catch {
    Write-Host "${Red}❌ FAIL${Reset} - Latest API error: $($_.Exception.Message)"
    $Failed++
}

# Test 7: 404 Handling
Write-Host "`n${Yellow}Test 7: 404 Error Handling${Reset}"
try {
    $response = Invoke-WebRequest -Uri "$Domain/api/recipe/non-existent-12345" -Method Get -ErrorAction Stop
    Write-Host "${Yellow}⚠️  WARN${Reset} - Expected 404, got $($response.StatusCode)"
    $Warnings++
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 404) {
        Write-Host "${Green}✅ PASS${Reset} - Properly returns 404 for missing resources"
        $Passed++
    } else {
        Write-Host "${Yellow}⚠️  WARN${Reset} - Got $($_.Exception.Response.StatusCode.value__)"
        $Warnings++
    }
}

# Test 8: Unauthorized Access
Write-Host "`n${Yellow}Test 8: Authentication${Reset}"
try {
    $response = Invoke-WebRequest -Uri "$Domain/api/upload" -Method Get -ErrorAction Stop
    Write-Host "${Yellow}⚠️  WARN${Reset} - Upload endpoint returned $($response.StatusCode)"
    $Warnings++
} catch {
    $status = $_.Exception.Response.StatusCode.value__
    if ($status -eq 401 -or $status -eq 403) {
        Write-Host "${Green}✅ PASS${Reset} - Upload endpoint requires authentication ($status)"
        $Passed++
    } else {
        Write-Host "${Yellow}⚠️  WARN${Reset} - Upload endpoint returned $status"
        $Warnings++
    }
}

# Test 9: Invalid JSON
Write-Host "`n${Yellow}Test 9: Invalid JSON Handling${Reset}"
try {
    $headers = @{ "Content-Type" = "application/json" }
    $response = Invoke-WebRequest -Uri "$Domain/api/recipe" -Method Post -Headers $headers -Body "invalid json" -ErrorAction Stop
    Write-Host "${Yellow}⚠️  WARN${Reset} - Invalid JSON returned $($response.StatusCode)"
    $Warnings++
} catch {
    $status = $_.Exception.Response.StatusCode.value__
    if ($status -ge 400 -and $status -lt 500) {
        Write-Host "${Green}✅ PASS${Reset} - Invalid JSON properly rejected ($status)"
        $Passed++
    } else {
        Write-Host "${Yellow}⚠️  WARN${Reset} - Invalid JSON returned $status"
        $Warnings++
    }
}

# Test 10: Response Time
Write-Host "`n${Yellow}Test 10: Response Time${Reset}"
$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
try {
    $response = Invoke-WebRequest -Uri "$Domain/api/health" -Method Get -ErrorAction Stop
    $stopwatch.Stop()
    $elapsed = $stopwatch.Elapsed.TotalSeconds
    Write-Host "  Response time: $([math]::Round($elapsed, 3))s"
    if ($elapsed -lt 1.0) {
        Write-Host "${Green}✅ PASS${Reset} - Response time under 1 second"
        $Passed++
    } else {
        Write-Host "${Yellow}⚠️  WARN${Reset} - Response time over 1 second"
        $Warnings++
    }
} catch {
    $stopwatch.Stop()
    Write-Host "${Red}❌ FAIL${Reset} - Request failed"
    $Failed++
}

# Summary
Write-Host "`n${Cyan}================================${Reset}"
Write-Host "${Cyan}Test Summary${Reset}"
Write-Host "${Cyan}================================${Reset}"
Write-Host "${Green}Passed:   $Passed${Reset}"
Write-Host "${Red}Failed:   $Failed${Reset}"
Write-Host "${Yellow}Warnings: $Warnings${Reset}"

$Total = $Passed + $Failed + $Warnings
if ($Total -gt 0) {
    $Percentage = [math]::Round(($Passed / $Total) * 100, 1)
    Write-Host "`n${Cyan}Success Rate: $Percentage%${Reset}"
}

if ($Failed -eq 0) {
    Write-Host "`n${Green}✅ All critical tests passed!${Reset}"
    Write-Host "${Green}🚀 VPS is ready for production${Reset}"
    exit 0
} else {
    Write-Host "`n${Red}❌ Some tests failed${Reset}"
    Write-Host "${Red}Please check the errors above${Reset}"
    exit 1
}
