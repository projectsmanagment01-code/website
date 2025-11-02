# Pinterest Spy Data System - Database Migration Script
# Run this script to set up the database table

Write-Host "🚀 Setting up Pinterest Spy Data System..." -ForegroundColor Green
Write-Host ""

# Check if we're in the correct directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Check if Prisma is available
Write-Host "📋 Checking Prisma installation..." -ForegroundColor Blue
if (-not (Get-Command "npx" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: npm/npx not found. Please install Node.js" -ForegroundColor Red
    exit 1
}

# Generate Prisma client with new schema
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Blue
npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: Failed to generate Prisma client" -ForegroundColor Red
    exit 1
}

# Create and run migration
Write-Host "📊 Creating database migration..." -ForegroundColor Blue
npx prisma db push --accept-data-loss

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: Failed to push database changes" -ForegroundColor Red
    Write-Host "💡 Try running: npx prisma migrate dev --name pinterest-spy-data" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "✅ Pinterest Spy Data System is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Start your development server: npm run dev" -ForegroundColor White
Write-Host "  2. Visit /admin/pinterest-spy to access the interface" -ForegroundColor White
Write-Host "  3. Import some test spy data to verify the system" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation available in: docs/PINTEREST_SPY_DATA_SYSTEM.md" -ForegroundColor Cyan
Write-Host ""