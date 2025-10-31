# Recipe Automation System - Installation Guide

## 🚀 Automated Installation (Recommended)

### For Windows (PowerShell)

```powershell
# 1. Verify system requirements
.\verify-setup.ps1

# 2. Run automated setup
.\setup.ps1

# 3. Start development server
yarn dev
```

### For Linux/Mac (Bash)

```bash
# 1. Make scripts executable
chmod +x setup.sh verify-setup.sh

# 2. Run automated setup
./setup.sh

# 3. Start development server
yarn dev
```

## 📋 Manual Installation

### Prerequisites

- Node.js 20+
- Yarn package manager
- Docker & Docker Compose
- Git

### Step 1: Clone & Install

```bash
# Clone repository (if not already)
git clone <your-repo-url>
cd website

# Install dependencies
yarn install
```

### Step 2: Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your actual credentials
nano .env  # or use your preferred editor
```

**Required Environment Variables:**

```env
# Database
DATABASE_URL=postgresql://postgres:admin@db:5432/recipes

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Google APIs
GOOGLE_CREDENTIALS_BASE64=<your-base64-service-account>

# Gemini AI
GEMINI_API_KEY=<your-gemini-api-key>

# Website API
WEBSITE_API_URL=https://yourwebsite.com
WEBSITE_API_TOKEN=<your-api-token>
```

### Step 3: Start Docker Services

```bash
# Start PostgreSQL and Redis
docker-compose up -d db redis

# Verify services are running
docker-compose ps
```

### Step 4: Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push --accept-data-loss

# (Optional) Seed initial data
npx prisma db seed
```

### Step 5: Build Application

```bash
# Build Next.js app
yarn build
```

### Step 6: Start Application

**Development Mode:**
```bash
yarn dev
```

**Production Mode:**
```bash
# Using docker-compose (includes automation worker)
docker-compose up

# Or manually
yarn start
```

## 🔧 Configuration Details

### Google Service Account Setup

1. **Create Service Account:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create new project or select existing
   - Navigate to "IAM & Admin" → "Service Accounts"
   - Click "Create Service Account"
   - Name: `recipe-automation`
   - Grant roles: "Editor"

2. **Enable APIs:**
   - Google Sheets API
   - Google Indexing API

3. **Download Credentials:**
   - Click on service account
   - Go to "Keys" tab
   - "Add Key" → "Create new key" → JSON
   - Download the JSON file

4. **Base64 Encode:**
   ```bash
   # Linux/Mac
   cat service-account-key.json | base64 -w 0

   # Windows PowerShell
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("service-account-key.json"))
   ```

5. **Add to .env:**
   ```env
   GOOGLE_CREDENTIALS_BASE64=eyJ0eXBlIjoic2VydmljZV9hY2NvdW50...
   ```

6. **Share Google Sheet:**
   - Open your Google Sheet
   - Click "Share"
   - Add service account email (from JSON: `client_email`)
   - Grant "Editor" access

### Gemini API Key Setup

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key
4. Add to .env:
   ```env
   GEMINI_API_KEY=AIzaSyC...
   ```

### Make.com Webhook (Pinterest - Optional)

1. Create scenario in [Make.com](https://make.com)
2. Add Webhook trigger
3. Add Pinterest module
4. Copy webhook URL
5. Add to .env:
   ```env
   MAKE_WEBHOOK_URL=https://hook.eu1.make.com/...
   ```

## 🐳 Docker Deployment

### Full Stack Deployment

```bash
# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Services Included

- **app** - Next.js application with automation worker
- **db** - PostgreSQL 15 database
- **redis** - Redis 7 for job queue

### Ports

- `3000` - Next.js application
- `5432` - PostgreSQL (internal)
- `6379` - Redis (internal)

## 🔍 Verification

### Check Services Status

```bash
# Docker services
docker-compose ps

# Should show:
# - app (running)
# - db (healthy)
# - redis (healthy)
```

### Check Automation Worker

```bash
# View worker logs
docker-compose logs -f app | grep "Worker"

# Should see:
# ✅ "Worker is ready and waiting for jobs"
```

### Test Database Connection

```bash
# Connect to database
docker-compose exec db psql -U postgres -d recipes

# Check automation tables exist
\dt

# Should see:
# - RecipeAutomation
# - AutomationConfig
# - ImageSet
# - AutomationLog
```

### Test Redis Connection

```bash
# Connect to Redis
docker-compose exec redis redis-cli

# Test ping
PING
# Should return: PONG
```

### Access Admin Dashboard

1. Open browser: `http://localhost:3000`
2. Login to admin panel
3. Navigate to: `http://localhost:3000/admin/automation`
4. You should see automation dashboard

## 🐛 Troubleshooting

### Issue: "Cannot connect to Redis"

**Solution:**
```bash
# Check Redis is running
docker-compose ps redis

# Restart Redis
docker-compose restart redis

# Check Redis logs
docker-compose logs redis
```

### Issue: "Google API authentication failed"

**Solution:**
1. Verify `GOOGLE_CREDENTIALS_BASE64` is correctly base64 encoded
2. Ensure service account has required API access
3. Check Google Sheet is shared with service account email
4. Test decoding:
   ```bash
   echo $GOOGLE_CREDENTIALS_BASE64 | base64 -d
   ```

### Issue: "Prisma client not generated"

**Solution:**
```bash
# Regenerate Prisma client
npx prisma generate

# Rebuild application
yarn build
```

### Issue: "Automation worker not starting"

**Solution:**
```bash
# Check package.json scripts
cat package.json | grep automation-worker

# Manually start worker
yarn automation-worker

# Check for errors in logs
```

### Issue: "Images not generating"

**Solution:**
The image generator is a **placeholder**. You must implement actual AI image generation:

1. Choose service: DALL-E, Midjourney, Stable Diffusion, Gemini Imagen
2. Edit `automation/services/image/generator.service.ts`
3. Implement `generateImage()` method
4. Add API credentials to .env

### Issue: "TypeScript errors"

**Solution:**
```bash
# Install missing dependencies
yarn install

# Regenerate types
npx prisma generate

# Clean and rebuild
rm -rf .next
yarn build
```

## 📊 Health Checks

### Application Health

```bash
curl http://localhost:3000/api/health
```

### Queue Health

```bash
# Check queue stats via API
curl http://localhost:3000/api/admin/automation/status
```

### Database Health

```bash
# Check connection
docker-compose exec db pg_isready -U postgres
```

## 🔐 Security Checklist

- [ ] Change default `JWT_SECRET` in .env
- [ ] Change default `ADMIN_SECRET` in .env
- [ ] Use strong database password
- [ ] Set Redis password for production
- [ ] Keep API keys secret (never commit .env)
- [ ] Use HTTPS in production
- [ ] Enable firewall rules
- [ ] Limit admin dashboard access
- [ ] Regular security updates

## 📈 Performance Optimization

### Production Settings

```env
NODE_ENV=production
LOG_LEVEL=INFO
AUTOMATION_MAX_RETRIES=3
AUTOMATION_RETRY_DELAY=5000
```

### Redis Persistence

Edit `docker-compose.yaml`:
```yaml
redis:
  command: redis-server --appendonly yes --save 60 1
```

### Worker Concurrency

Edit `automation/config/queue.config.ts`:
```typescript
export const workerOptions = {
  concurrency: 2, // Process 2 recipes simultaneously
};
```

## 🚀 Next Steps

1. **Configure Google Service Account** ✓
2. **Get Gemini API Key** ✓
3. **Implement Image Generation** (if needed)
4. **Create Admin UI Pages** (optional)
5. **Test Full Workflow:**
   ```bash
   # Trigger automation via API
   curl -X POST http://localhost:3000/api/admin/automation/run \
     -H "Content-Type: application/json" \
     -d '{"rowNumber": 5, "title": "Test Recipe"}'
   ```

6. **Monitor Logs:**
   ```bash
   # Real-time logs
   docker-compose logs -f app

   # Or in dashboard
   http://localhost:3000/admin/automation/logs
   ```

## 📞 Support

For issues or questions:

1. Check troubleshooting section above
2. Review automation/README.md
3. Check automation/STATUS.md for implementation details
4. Open GitHub issue with logs and error details

---

**Installation Time:** ~15-30 minutes (automated)
**Manual Setup Time:** ~45-60 minutes

**Version:** 1.0.0
**Last Updated:** October 31, 2025
