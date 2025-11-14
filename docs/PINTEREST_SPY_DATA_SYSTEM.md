# Pinterest Spy Data System

A comprehensive system for managing Pinterest spy data and automating recipe generation with AI-powered SEO extraction.

## 🎯 Overview

This system replaces Google-based content fetching with a Pinterest spy data approach that allows you to:

1. **Import Pinterest spy data** from manual research
2. **Extract SEO metadata** using AI (SEO Keyword, SEO Title, SEO Description)
3. **Mark entries for generation** and queue them for processing
4. **Generate recipes automatically** from the processed spy data

## 📊 Database Schema

### PinterestSpyData Table

```sql
- id: string (Primary Key)
- spyTitle: string (Raw Pinterest title)
- spyDescription: string (Raw Pinterest description)
- spyImageUrl: string (Pinterest image URL)
- spyArticleUrl: string (Original article URL)
- spyPinImage: string (Pinterest pin image URL)
- annotation: string (Manual notes/annotations)

-- AI-Extracted SEO Metadata
- seoKeyword: string (Primary keyword for SEO)
- seoTitle: string (Optimized title for search engines)
- seoDescription: string (Meta description for search results)

-- Status Tracking
- status: PENDING | SEO_PROCESSING | SEO_COMPLETED | READY_FOR_GENERATION | GENERATING | COMPLETED | FAILED
- isMarkedForGeneration: boolean
- isProcessed: boolean
- priority: number

-- Relations
- generatedRecipeId: string (Link to created Recipe)
```

## 🔄 Workflow

### 1. Data Import
**Input Fields:**
- SPY Title
- SPY Description  
- SPY Image URL
- SPY Article URL
- SPY PIN Image
- Annotation

**Methods:**
- Single entry form
- Bulk CSV import
- API import

### 2. SEO Processing
The AI automatically extracts:
- **SEO Keyword**: Primary targeting keyword (2-4 words)
- **SEO Title**: Search-optimized title (50-60 chars)
- **SEO Description**: Meta description (150-160 chars)

**Status Flow:**
```
PENDING → SEO_PROCESSING → SEO_COMPLETED
```

### 3. Generation Queue
Mark processed entries for recipe generation:
```
SEO_COMPLETED → READY_FOR_GENERATION → GENERATING → COMPLETED
```

## 🛠️ API Endpoints

### Pinterest Spy Data Management
```
GET    /api/admin/pinterest-spy          # List spy data with filters
POST   /api/admin/pinterest-spy          # Create new entries (single/bulk)
PUT    /api/admin/pinterest-spy          # Update entries
DELETE /api/admin/pinterest-spy          # Delete entries
```

### SEO Processing
```
POST   /api/admin/pinterest-spy/process-seo    # Process SEO for entries
GET    /api/admin/pinterest-spy/process-seo    # Get processing status
```

### Recipe Generation
```
GET    /api/admin/pinterest-spy/generate-recipes    # Get queue status
POST   /api/admin/pinterest-spy/generate-recipes    # Queue for generation
PUT    /api/admin/pinterest-spy/generate-recipes    # Process generation queue
```

## 💻 Admin Interface

### Features
- **Dashboard**: Stats cards showing total entries, processed, ready for generation
- **Data Table**: List all spy data with status indicators
- **Bulk Import**: CSV upload with auto-processing
- **Filtering**: Search and filter by status
- **Batch Operations**: Select multiple entries for SEO processing or generation
- **Status Tracking**: Visual status badges and progress indicators

### Usage
1. Access `/admin/pinterest-spy` (component: `PinterestSpyDataManager`)
2. Import spy data via bulk CSV or single entry form
3. Select entries and click "Process SEO" to extract metadata
4. Mark entries for generation using checkboxes
5. Trigger recipe generation for marked entries

## 📝 CSV Import Format

```csv
SPY Title,SPY Description,SPY Image URL,SPY Article URL,SPY PIN Image,Annotation
"Easy Chocolate Cake","Delicious homemade chocolate cake recipe that's perfect for beginners","https://example.com/cake.jpg","https://example.com/article","https://example.com/pin.jpg","Family favorite dessert"
```

## 🤖 AI Integration

### SEO Extraction Service
**File**: `lib/pinterest-spy/seo-extraction-service.ts`

**Capabilities:**
- OpenAI and Gemini support
- Batch processing with rate limiting
- Error handling and retries
- Content validation and optimization

**Prompt Strategy:**
- Analyzes spy title, description, and URL
- Focuses on food/recipe keywords
- Optimizes for search intent
- Ensures proper SEO lengths

### Recipe Generation Queue
**File**: `lib/pinterest-spy/recipe-generation-queue.ts`

**Features:**
- Priority-based queue processing
- Automatic SEO completion
- Recipe structure generation
- Status tracking and error handling

## 🔧 Configuration

### Environment Variables
```env
# AI Provider Settings (already configured)
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key

# Database (already configured)
DATABASE_URL=your_postgresql_url
```

### AI Settings
The system uses your existing AI configuration:
- Provider selection (OpenAI/Gemini)
- API keys from admin settings
- Model selection and parameters

## 📈 Status Indicators

| Status | Description | Color |
|--------|-------------|-------|
| PENDING | Newly imported, awaiting SEO processing | Gray |
| SEO_PROCESSING | AI is extracting SEO metadata | Blue |
| SEO_COMPLETED | SEO processed, ready for generation marking | Green |
| READY_FOR_GENERATION | Marked for recipe generation | Purple |
| GENERATING | Recipe generation in progress | Orange |
| COMPLETED | Recipe successfully generated | Emerald |
| FAILED | Processing failed (check error logs) | Red |

## 🚀 Usage Examples

### Bulk Import Spy Data
```javascript
const spyData = [
  {
    spyTitle: "Easy Weeknight Pasta",
    spyDescription: "Quick 20-minute pasta recipe perfect for busy weeknights",
    spyImageUrl: "https://pinterest.com/image1.jpg",
    spyArticleUrl: "https://foodblog.com/pasta-recipe",
    spyPinImage: "https://pinterest.com/pin1.jpg",
    annotation: "Popular pin with 50K saves"
  }
];

const response = await fetch('/api/admin/pinterest-spy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: spyData,
    batchId: 'import_batch_1',
    autoProcessSEO: true
  })
});
```

### Process SEO for Entries
```javascript
const response = await fetch('/api/admin/pinterest-spy/process-seo', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    entryIds: ['entry_id_1', 'entry_id_2'],
    batchSize: 5
  })
});
```

### Generate Recipes
```javascript
// Queue for generation
await fetch('/api/admin/pinterest-spy/generate-recipes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    entryIds: ['entry_id_1', 'entry_id_2'],
    priority: 10
  })
});

// Process the queue
await fetch('/api/admin/pinterest-spy/generate-recipes', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    batchSize: 3
  })
});
```

## 🛡️ Security & Authentication

- All API endpoints require admin authentication
- Input validation and sanitization
- SQL injection protection via Prisma
- Rate limiting for AI API calls
- Error logging and monitoring

## 🔄 Integration with Existing System

This system integrates seamlessly with your existing recipe automation:
- Uses existing AI configuration
- Leverages current recipe schema
- Maintains existing author and category systems
- Compatible with current admin interface patterns

## 📚 Next Steps

1. **Run database migration** to add the PinterestSpyData table
2. **Test the admin interface** at `/admin/pinterest-spy`
3. **Import sample spy data** to test the workflow
4. **Configure AI processing** for your content style
5. **Set up automated queue processing** for continuous generation

## 🐛 Troubleshooting

### Common Issues
- **SEO Processing Fails**: Check AI API keys and rate limits
- **Import Errors**: Verify CSV format and required fields
- **Generation Stuck**: Check for entries in GENERATING status
- **Missing Recipes**: Verify recipe generation service integration

### Logs
Check console logs for detailed error messages:
- SEO processing: `🧠` prefix
- Recipe generation: `🔄` prefix
- Queue processing: `📦` prefix