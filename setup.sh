#!/bin/bash

# ========================================
# Recipe Automation Setup Script
# ========================================

set -e

echo "🚀 Recipe Automation System - Setup Script"
echo "=========================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "📋 Copying .env.example to .env..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your actual credentials"
    echo "   Required: DATABASE_URL, JWT_SECRET, GOOGLE_CREDENTIALS_BASE64, GEMINI_API_KEY"
    echo ""
    read -p "Press Enter after configuring .env to continue..."
fi

# Install dependencies
echo "📦 Installing dependencies..."
yarn install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start Docker services
echo "🐳 Starting Docker services (PostgreSQL + Redis)..."
docker-compose up -d db redis

# Wait for database
echo "⏳ Waiting for PostgreSQL to be ready..."
until docker-compose exec -T db pg_isready -U postgres > /dev/null 2>&1; do
    sleep 2
done
echo "✅ PostgreSQL is ready"

# Wait for Redis
echo "⏳ Waiting for Redis to be ready..."
until docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; do
    sleep 2
done
echo "✅ Redis is ready"

# Run database migrations
echo "🔧 Running database migrations..."
echo "   This will update the database schema to include new fields like AI system prompts"
echo "   and fix any foreign key constraint issues..."
npx prisma db push --accept-data-loss

# Verify database schema is up to date
echo "🔍 Verifying database schema..."
npx prisma db push --accept-data-loss

# Build the application
echo "🏗️  Building Next.js application..."
yarn build

echo ""
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "📝 Next Steps:"
echo "   1. Configure Google Service Account:"
echo "      - Create service account in Google Cloud Console"
echo "      - Enable Google Sheets API and Indexing API"
echo "      - Download JSON key and base64 encode it"
echo "      - Add to .env as GOOGLE_CREDENTIALS_BASE64"
echo ""
echo "   2. Get Gemini API Key:"
echo "      - Visit https://makersuite.google.com/app/apikey"
echo "      - Create API key"
echo "      - Add to .env as GEMINI_API_KEY"
echo ""
echo "   3. Start the application:"
echo "      - Development: yarn dev"
echo "      - Production: docker-compose up"
echo ""
echo "   4. Access automation dashboard:"
echo "      - URL: http://localhost:3000/admin/automation"
echo ""
echo "=========================================="
