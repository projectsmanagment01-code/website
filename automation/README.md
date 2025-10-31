# Recipe Automation System

Complete automation system for generating and publishing recipe articles from Google Sheets to your Next.js website.

## 🎯 Overview

This system automates the entire recipe creation workflow:

1. **Fetch Recipe** from Google Sheets
2. **Generate Image Prompts** using Gemini Flash
3. **Download Reference Image** (optional)
4. **Generate AI Images** (4 images per recipe)
5. **Upload Images** to website
6. **Update Sheet** with image URLs
7. **Generate Recipe Article** using Gemini Pro
8. **Publish Recipe** to website
9. **Update Sheet** with post data
10. **Send to Pinterest** (optional, via Make.com)
11. **Request Google Indexing** (optional)

## 📁 Structure

```
automation/
├── config/           # Configuration & environment
│   ├── env.ts
│   ├── constants.ts
│   └── queue.config.ts
├── services/         # Service implementations
│   ├── ai/          # Gemini Flash & Pro
│   ├── google/      # Sheets & Indexing APIs
│   ├── image/       # Generation, upload, download
│   ├── recipe/      # Article builder & publisher
│   └── external/    # Pinterest & website API
├── queue/           # BullMQ job queue
│   ├── automation.queue.ts
│   ├── automation.processor.ts
│   └── automation.worker.ts
├── workflows/       # Workflow orchestration
│   ├── main-workflow.ts
│   └── steps/       # 11 individual steps
├── types/           # TypeScript interfaces
├── utils/           # Logging, retry, errors, validators
├── prisma/          # Database schema
└── index.ts         # Public API
```

## 🚀 Quick Start

> **For full installation instructions, see [INSTALLATION.md](../INSTALLATION.md) in the project root.**

### Automated Setup (Windows)

```powershell
# Run from project root
.\setup.ps1
```

### Automated Setup (Linux/Mac)

```bash
# Run from project root
./setup.sh
```

### Manual Setup

### 1. Install Dependencies

Dependencies are automatically installed via `package.json`:
```bash
yarn install
```

Automation dependencies included:
- `bullmq` - Job queue
- `ioredis` - Redis client
- `googleapis` - Google APIs
- `formdata-node` - File uploads
- `winston` - Logging

### 2. Setup Environment Variables

All variables are in `.env` file (copy from `.env.example`):

```env
# Redis (BullMQ Queue)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Google APIs
GOOGLE_CREDENTIALS_BASE64=<your-base64-encoded-service-account-json>

# Gemini AI
GEMINI_API_KEY=<your-gemini-api-key>

# Website
WEBSITE_API_URL=https://yourwebsite.com
WEBSITE_API_TOKEN=<your-api-token>

# Make.com (Pinterest)
MAKE_WEBHOOK_URL=<your-make-com-webhook-url>

# Automation Settings
AUTOMATION_MAX_RETRIES=3
AUTOMATION_RETRY_DELAY=5000
```

### 3. Setup Database

Add automation schema to your `schema.prisma`:

```prisma
// Copy contents from automation/prisma/schema.automation.prisma
```

Run migration:

```bash
npx prisma migrate dev --name add-automation
```

### 4. Setup Redis

Using Docker:

```bash
docker run -d -p 6379:6379 --name redis redis:alpine
```

Or add to your `docker-compose.yml`:

```yaml
services:
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

volumes:
  redis-data:
```

### 5. Start Worker

Create `automation-worker.js` in your project root:

```javascript
require('ts-node/register');
const { createAutomationWorker } = require('./automation/queue/automation.worker');

createAutomationWorker();
```

Run worker:

```bash
node automation-worker.js
```

Or use PM2:

```bash
pm2 start automation-worker.js --name "recipe-automation-worker"
```

## 💻 Usage

### Start Automation

```typescript
import { startAutomation } from '@/automation';

// Start automation for recipe at row 5 in Google Sheets
const jobId = await startAutomation(5, 'Optional Recipe Title');
console.log(`Automation started with job ID: ${jobId}`);
```

### Check Status

```typescript
import { getAutomationStatus } from '@/automation';

const { automation, job } = await getAutomationStatus(jobId);
console.log(`Status: ${automation.status}`);
console.log(`Progress: ${job.progress}%`);
```

### Get Queue Stats

```typescript
import { getQueueStats } from '@/automation';

const stats = await getQueueStats();
console.log(stats);
// {
//   waiting: 2,
//   active: 1,
//   completed: 45,
//   failed: 3,
//   delayed: 0,
//   total: 51
// }
```

### Get Logs

```typescript
import { getAutomationLogs } from '@/automation';

const logs = await getAutomationLogs(automationId);
logs.forEach(log => {
  console.log(`[${log.level}] ${log.message}`);
});
```

### Retry Failed Job

```typescript
import { retryJob } from '@/automation';

await retryJob(jobId);
```

## 🎨 Admin Dashboard Integration

### API Routes

Create these API routes in `app/api/admin/automation/`:

**`run/route.ts`** - Start automation

```typescript
import { startAutomation } from '@/automation';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { rowNumber, title } = await request.json();
  const jobId = await startAutomation(rowNumber, title);
  return NextResponse.json({ jobId });
}
```

**`status/route.ts`** - Get queue stats

```typescript
import { getQueueStats, getRecentJobs } from '@/automation';
import { NextResponse } from 'next/server';

export async function GET() {
  const [stats, recentJobs] = await Promise.all([
    getQueueStats(),
    getRecentJobs(),
  ]);
  return NextResponse.json({ stats, recentJobs });
}
```

**`logs/route.ts`** - Get logs

```typescript
import { getAutomationLogs } from '@/automation';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const automationId = searchParams.get('id');
  const logs = await getAutomationLogs(automationId!);
  return NextResponse.json({ logs });
}
```

### UI Components

Create dashboard pages in `app/admin/automation/`:

- `page.tsx` - Main dashboard (trigger, stats, recent jobs)
- `logs/page.tsx` - Detailed log viewer
- `queue/page.tsx` - Queue monitor
- `config/page.tsx` - Settings

## 📊 Google Sheets Setup

### Required Columns

Your Google Sheet should have these columns:

| Column | Name | Description |
|--------|------|-------------|
| A | Status | "Go" to trigger, "Done" when complete |
| B | Feature Image URL | Generated image URL |
| C | Ingredients Image URL | Generated image URL |
| D | Cooking Image URL | Generated image URL |
| E | Final Dish Image URL | Generated image URL |
| F | Post Link | Published recipe URL |
| G | Recipe ID | Database recipe ID |
| H | Pinterest Data | Pinterest API response |
| I | Indexing Status | Google indexing status |
| ... | Recipe Data | Title, ingredients, instructions, etc. |

### Required Fields

Your sheet must include these recipe fields:

- Title
- Category
- Cuisine
- Ingredients (list)
- Instructions (list)
- Prep Time
- Cook Time
- Servings
- Author Name
- Author Slug
- Meta Description
- Reference Image URL (optional)

## 🔧 Configuration

### Queue Settings

Modify `automation/config/queue.config.ts`:

```typescript
export const workerOptions = {
  concurrency: 1, // Process 1 recipe at a time
  lockDuration: 30 * 60 * 1000, // 30 minutes
  stalledInterval: 5 * 60 * 1000, // Check every 5 min
};
```

### Retry Settings

Modify `automation/config/constants.ts`:

```typescript
export const RETRY = {
  MAX_ATTEMPTS: 3,
  INITIAL_DELAY: 5000, // 5 seconds
  MAX_DELAY: 60000, // 1 minute
  TIMEOUT: 120000, // 2 minutes
};
```

### Gemini Models

Modify in `.env.local`:

```env
GEMINI_FLASH_MODEL=gemini-2.0-flash-exp  # For prompts
GEMINI_PRO_MODEL=gemini-1.5-pro           # For articles
```

## 🐛 Troubleshooting

### Worker Not Processing Jobs

1. Check Redis connection:
   ```bash
   redis-cli ping
   ```

2. Check worker logs:
   ```bash
   pm2 logs recipe-automation-worker
   ```

3. Restart worker:
   ```bash
   pm2 restart recipe-automation-worker
   ```

### Images Not Generating

The image generator service is a placeholder. Implement your preferred AI image generation service:

```typescript
// automation/services/image/generator.service.ts
async generateImage(prompt: string): Promise<string> {
  // TODO: Implement your image generation API
  // Options: DALL-E, Midjourney, Stable Diffusion, etc.
}
```

### Google Sheets Not Updating

1. Check service account permissions:
   - Share sheet with service account email
   - Grant "Editor" access

2. Verify credentials:
   ```typescript
   const decoded = Buffer.from(
     process.env.GOOGLE_CREDENTIALS_BASE64!,
     'base64'
   ).toString('utf-8');
   console.log(JSON.parse(decoded));
   ```

### Articles Not Publishing

1. Check website API token:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://yourwebsite.com/api/recipe
   ```

2. Verify article schema matches API expectations

## 📝 Development

### Run Tests

```bash
npm test automation/
```

### Debug Mode

Set environment variable:

```env
LOG_LEVEL=DEBUG
```

### Monitor Queue

Use BullMQ Board:

```bash
npm install -g bull-board
bull-board
```

Visit http://localhost:3000

## 🔐 Security

- Store API keys in environment variables
- Use strong Redis password in production
- Limit worker access to trusted servers
- Validate all external inputs
- Use rate limiting on API routes
- Enable authentication on admin routes

## 📈 Performance

- **Throughput**: ~1 recipe per 5-10 minutes
- **Concurrency**: 1 recipe at a time (configurable)
- **Retry Logic**: 3 attempts with exponential backoff
- **Queue Size**: Unlimited (Redis-backed)
- **Log Retention**: 7 days completed, 30 days failed

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Run tests
5. Submit pull request

## 📄 License

MIT License - see LICENSE file

## 🆘 Support

For issues or questions:

1. Check troubleshooting section
2. Review logs (`getAutomationLogs()`)
3. Open GitHub issue
4. Contact support

---

**Version**: 1.0.0
**Last Updated**: 2024
