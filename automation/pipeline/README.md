# Recipe Automation Pipeline System

## Overview

Complete automated system for transforming Pinterest spy data into published recipes with zero manual intervention.

## Pipeline Flow

```
Pinterest Spy Data 
  → SEO Generation 
  → Image Generation (4 images) 
  → Category Matching 
  → Author Selection 
  → Recipe Generation 
  → Published Recipe 
  → Archive & Cleanup
```

## Features

### ✅ Fully Automated Pipeline
- **End-to-end automation**: From raw spy data to published recipe
- **Intelligent matching**: Auto-selects categories and authors
- **Error recovery**: Automatic retries with exponential backoff
- **Progress tracking**: Real-time status updates

### ✅ Flexible Scheduling
- **Manual trigger**: Process entries on demand
- **Batch processing**: Handle multiple entries at once
- **Cron schedules**: Run automatically at set times
- **BullMQ integration**: Leverages existing queue system

### ✅ Archive System
- **Automatic archiving**: Completed entries moved to archive table
- **Source tracking**: Keeps reference to original spy data
- **Clean database**: Active table stays lean

## API Endpoints

### 1. Run Single Pipeline
```
POST /api/admin/automation/pipeline/run
```

**Request:**
```json
{
  "spyDataId": "xxx",       // Optional: specific entry
  "autoSelect": true,       // Or get next pending entry
  "authorId": "author_123"  // Optional: auto-select if not provided
}
```

**Response:**
```json
{
  "success": true,
  "recipeId": "recipe_456",
  "recipeUrl": "/recipes/peach-cake-recipe",
  "logs": [
    "[2025-01-04T...] Starting pipeline...",
    "[2025-01-04T...] SEO generated...",
    "[2025-01-04T...] Images created...",
    "[2025-01-04T...] Recipe published..."
  ]
}
```

### 2. Batch Processing
```
POST /api/admin/automation/pipeline/batch
```

**Request:**
```json
{
  "spyDataIds": ["id1", "id2"],  // Optional: specific IDs
  "batchSize": 5,                 // Or process next 5 entries
  "authorId": "author_123"        // Optional
}
```

**Response:**
```json
{
  "success": true,
  "processed": 4,
  "failed": 1,
  "recipes": [
    {
      "spyDataId": "id1",
      "success": true,
      "recipeId": "recipe_1",
      "recipeUrl": "/recipes/..."
    },
    {
      "spyDataId": "id2",
      "success": false,
      "error": "Image generation failed"
    }
  ]
}
```

### 3. Schedule Management

#### List Schedules
```
GET /api/admin/automation/pipeline/schedule
```

**Response:**
```json
{
  "success": true,
  "schedules": [
    {
      "id": "schedule_1",
      "enabled": true,
      "cronExpression": "0 */2 * * *",
      "lastRun": "2025-01-04T10:00:00Z",
      "runCount": 42
    }
  ],
  "activeJobs": [
    {
      "id": "schedule-schedule_1",
      "pattern": "0 */2 * * *",
      "next": 1704369600000
    }
  ]
}
```

#### Create Schedule
```
POST /api/admin/automation/pipeline/schedule
```

**Request:**
```json
{
  "name": "Every 2 Hours",
  "cronExpression": "0 */2 * * *",
  "batchSize": 3,
  "enabled": true,
  "authorId": "author_123",
  "filters": {
    "priority": { "gte": 5 }
  }
}
```

#### Update Schedule
```
PUT /api/admin/automation/pipeline/schedule
```

**Request:**
```json
{
  "id": "schedule_1",
  "enabled": false,
  "cronExpression": "0 */4 * * *",
  "batchSize": 5
}
```

#### Delete Schedule
```
DELETE /api/admin/automation/pipeline/schedule?id=schedule_1
```

## Cron Expression Examples

| Expression | Description |
|------------|-------------|
| `0 */2 * * *` | Every 2 hours |
| `0 0 * * *` | Every day at midnight |
| `0 9 * * *` | Every day at 9 AM |
| `0 9,17 * * *` | Every day at 9 AM and 5 PM |
| `0 0 * * 1` | Every Monday at midnight |
| `*/30 * * * *` | Every 30 minutes |
| `0 0 1 * *` | First day of every month |

## Database Schema

### AutomationSchedule
```prisma
model AutomationSchedule {
  id              String    @id
  enabled         Boolean
  scheduleType    String    // manual, hourly, daily, weekly, custom
  cronExpression  String?
  timeOfDay       String?
  dayOfWeek       Int?
  lastRun         DateTime?
  nextRun         DateTime?
  runCount        Int
  createdAt       DateTime
  updatedAt       DateTime
}
```

### GeneratedRecipeArchive
```prisma
model GeneratedRecipeArchive {
  id                    String
  recipeId              String   @unique
  originalSpyData       Json
  spyDataId             String
  generationJobId       String?
  generatedAt           DateTime
  generationDuration    Int?
  title                 String
  slug                  String
  category              String?
  authorId              String?
  images                String[]
  seoKeyword            String?
  seoTitle              String?
  seoDescription        String?
  publishedAt           DateTime?
  status                String   // ACTIVE, ARCHIVED, DELETED
}
```

## Usage Examples

### Example 1: Manual Single Recipe
```javascript
// Generate one recipe from next pending spy data
const response = await fetch('/api/admin/automation/pipeline/run', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    autoSelect: true
  })
});

const result = await response.json();
console.log(`Recipe created: ${result.recipeUrl}`);
```

### Example 2: Batch Process 10 Recipes
```javascript
// Process 10 pending entries
const response = await fetch('/api/admin/automation/pipeline/batch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    batchSize: 10,
    authorId: 'author_123'
  })
});

const result = await response.json();
console.log(`Processed: ${result.processed}, Failed: ${result.failed}`);
```

### Example 3: Schedule Every 2 Hours
```javascript
// Create automatic schedule
const response = await fetch('/api/admin/automation/pipeline/schedule', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Auto Recipe Generation',
    cronExpression: '0 */2 * * *',
    batchSize: 3,
    enabled: true,
    filters: {
      priority: { gte: 5 }
    }
  })
});
```

### Example 4: Pause All Schedules
```javascript
// Get all schedules
const { schedules } = await fetch('/api/admin/automation/pipeline/schedule')
  .then(r => r.json());

// Disable each one
for (const schedule of schedules) {
  await fetch('/api/admin/automation/pipeline/schedule', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: schedule.id,
      enabled: false
    })
  });
}
```

## Pipeline Stages

### Stage 1: Validate Spy Data
- Checks if entry exists
- Verifies not already processed
- Validates required fields

### Stage 2: Generate SEO (if missing)
- Calls existing SEO generation API
- Extracts keyword, title, description
- Updates spy data record

### Stage 3: Generate Images (if missing)
- Calls existing image generation API
- Creates 4 contextual images
- Stores URLs in spy data

### Stage 4: Match Category & Author
- Analyzes recipe content
- Matches to database categories
- Auto-selects author based on tags
- Falls back to first author if no match

### Stage 5: Generate Recipe
- Calls Gemini AI with full context
- Validates content completeness
- Saves to Recipe table
- Updates spy data status

### Stage 6: Cleanup
- Marks spy data as COMPLETED
- Links recipe to spy data
- Ready for archival

## Monitoring & Logs

### View Pipeline Logs
```javascript
// Each pipeline execution returns detailed logs
const result = await executePipeline({...});
console.log(result.logs);

// Output:
// [2025-01-04T10:15:23Z] 🚀 Starting recipe pipeline...
// [2025-01-04T10:15:24Z] 📊 Spy data loaded: Peach Cake Recipe
// [2025-01-04T10:15:25Z] ✅ SEO data already exists
// [2025-01-04T10:15:26Z] ✅ Images already exist
// [2025-01-04T10:15:27Z] 🎯 Category matched: Dessert (85%)
// [2025-01-04T10:15:28Z] ✅ Author auto-matched
// [2025-01-04T10:15:45Z] ✅ Recipe content generated
// [2025-01-04T10:15:46Z] ✅ Recipe saved: recipe_789
// [2025-01-04T10:15:47Z] 🎉 Pipeline completed!
```

### Database Monitoring
```sql
-- Check pipeline status
SELECT status, COUNT(*) 
FROM pinterest_spy_data 
GROUP BY status;

-- Recent successful recipes
SELECT * FROM generated_recipe_archive
WHERE generatedAt > NOW() - INTERVAL '7 days'
ORDER BY generatedAt DESC;

-- Failed entries
SELECT id, spyTitle, generationError, generationAttempts
FROM pinterest_spy_data
WHERE status = 'FAILED'
ORDER BY updatedAt DESC;
```

## Error Handling

### Automatic Retries
- Failed pipelines increment `generationAttempts`
- Max 3 automatic retries with exponential backoff
- After 3 failures, marked as FAILED

### Error Recovery
```javascript
// Retry a failed entry
await fetch('/api/admin/automation/pipeline/run', {
  method: 'POST',
  body: JSON.stringify({
    spyDataId: 'failed_entry_id'
  })
});
```

### Reset Failed Entry
```sql
-- Reset for manual retry
UPDATE pinterest_spy_data
SET status = 'PENDING',
    generationError = NULL,
    generationAttempts = 0
WHERE id = 'failed_entry_id';
```

## Best Practices

1. **Start Small**: Test with 1-2 entries manually before scheduling
2. **Monitor First Run**: Watch logs for first scheduled batch
3. **Set Batch Limits**: Don't process more than 10 at once to avoid rate limits
4. **Use Filters**: Prioritize high-quality spy data entries
5. **Regular Archives**: Clean up completed entries monthly
6. **Author Tags**: Keep author tags updated for better matching
7. **Error Alerts**: Set up notifications for failed pipelines

## Troubleshooting

### Issue: "No pending entries found"
**Solution**: Check spy data table for entries with status='PENDING'

### Issue: "SEO generation failed"
**Solution**: Verify Gemini API key is configured in admin settings

### Issue: "No matching category"
**Solution**: Add more keyword mappings in `category-matcher.ts`

### Issue: "No authors available"
**Solution**: Create at least one author in the database

### Issue: Schedule not running
**Solution**: Check BullMQ worker is running and schedule is enabled

## Performance

- **Single pipeline**: ~30-60 seconds per recipe
- **Batch processing**: ~5-10 minutes for 10 recipes
- **Queue capacity**: Can handle hundreds of scheduled jobs
- **Rate limiting**: Built-in delays between entries

## Next Steps

1. Configure author tags for category matching
2. Create your first manual pipeline test
3. Review and adjust category keywords
4. Set up your first schedule
5. Monitor and iterate
