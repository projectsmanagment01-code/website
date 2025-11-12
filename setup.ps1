# ========================================
# Recipe Automation Setup Script (PowerShell)
# ========================================

Write-Host "🚀 Recipe Automation System - Setup Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "📋 Copying .env.example to .env..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "⚠️  Please edit .env file with your actual credentials" -ForegroundColor Yellow
    Write-Host "   Required: DATABASE_URL, JWT_SECRET, GOOGLE_CREDENTIALS_BASE64, GEMINI_API_KEY" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter after configuring .env to continue"
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
yarn install

# Generate Prisma client
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Cyan
npx prisma generate

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}

# Start Docker services
Write-Host "🐳 Starting Docker services (PostgreSQL + Redis)..." -ForegroundColor Cyan
docker-compose up -d db redis

# Wait for database
Write-Host "⏳ Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
while ($attempt -lt $maxAttempts) {
    try {
        docker-compose exec -T db pg_isready -U postgres | Out-Null
        if ($LASTEXITCODE -eq 0) {
            break
        }
    } catch {
        # Continue waiting
    }
    Start-Sleep -Seconds 2
    $attempt++
}
Write-Host "✅ PostgreSQL is ready" -ForegroundColor Green

# Wait for Redis
Write-Host "⏳ Waiting for Redis to be ready..." -ForegroundColor Yellow
$attempt = 0
while ($attempt -lt $maxAttempts) {
    try {
        docker-compose exec -T redis redis-cli ping | Out-Null
        if ($LASTEXITCODE -eq 0) {
            break
        }
    } catch {
        # Continue waiting
    }
    Start-Sleep -Seconds 2
    $attempt++
}
Write-Host "✅ Redis is ready" -ForegroundColor Green

# Run database migrations
Write-Host "🔧 Running database migrations..." -ForegroundColor Cyan
npx prisma db push --accept-data-loss

# Build the application
Write-Host "🏗️  Building Next.js application..." -ForegroundColor Cyan
yarn build

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Configure Google Service Account:" -ForegroundColor White
Write-Host "      - Create service account in Google Cloud Console" -ForegroundColor Gray
Write-Host "      - Enable Google Sheets API and Indexing API" -ForegroundColor Gray
Write-Host "      - Download JSON key and base64 encode it" -ForegroundColor Gray
Write-Host "      - Add to .env as GOOGLE_CREDENTIALS_BASE64" -ForegroundColor Gray
Write-Host ""
Write-Host "   2. Get Gemini API Key:" -ForegroundColor White
Write-Host "      - Visit https://makersuite.google.com/app/apikey" -ForegroundColor Gray
Write-Host "      - Create API key" -ForegroundColor Gray
Write-Host "      - Add to .env as GEMINI_API_KEY" -ForegroundColor Gray
Write-Host ""
Write-Host "   3. Start the application:" -ForegroundColor White
Write-Host "      - Development: yarn dev" -ForegroundColor Gray
Write-Host "      - Production: docker-compose up" -ForegroundColor Gray
Write-Host ""
Write-Host "   4. Access automation dashboard:" -ForegroundColor White
Write-Host "      - URL: http://localhost:3000/admin/automation" -ForegroundColor Gray
Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
