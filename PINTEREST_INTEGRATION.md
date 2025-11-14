# Pinterest + Google Indexing Integration

Complete automation system for publishing recipes to Pinterest via Make.com and getting them indexed by Google instantly.

## 🎯 Overview

This integration adds two powerful features to the recipe automation pipeline:

1. **Google Indexing API**: Automatically submit new recipes to Google for instant indexing (minutes vs days/weeks)
2. **Pinterest Integration**: Process recipe images with AI and send to Make.com webhook for automated Pinterest posting

## 📋 Table of Contents

- [Architecture](#architecture)
- [Setup Guide](#setup-guide)
- [How It Works](#how-it-works)
- [Configuration](#configuration)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Services](#services)
- [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture

### Workflow

```
SpyPin Data → SEO Generation → Image Generation → Recipe Generation → Website Publishing
                                                                              ↓
                                                                    ┌─────────┴─────────┐
                                                                    ↓                   ↓
                                                           Google Indexing      Pinterest Workflow
                                                           (Submit URL)         (Edit Image + Webhook)
                                                                                         ↓
                                                                                   Make.com
                                                                                         ↓
                                                                                   Pinterest
```

### Components

1. **Admin UI** (`app/admin/automation/settings/page.tsx`)
   - Pinterest settings tab
   - Google Indexing settings tab
   - Board mapping page

2. **API Routes**
   - `/api/admin/automation/pinterest-boards` - Board management
   - `/api/admin/automation/settings` - Settings CRUD

3. **Services**
   - `automation/google-indexing/service.ts` - Google Indexing API
   - `automation/pinterest/image-editor.ts` - Gemini AI image processing
   - `automation/pinterest/webhook.ts` - Make.com webhook sender

4. **Pipeline Integration** (`automation/pipeline/recipe-pipeline.ts`)
   - STEP 6: Google Indexing
   - STEP 7: Pinterest Integration

---

## 🚀 Setup Guide

### Prerequisites

- Google Cloud Project with Indexing API enabled
- Google Service Account with credentials
- Make.com account
- Gemini API key (for image editing)

### 1. Google Indexing Setup

#### Create Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create or select a project
3. Navigate to **APIs & Services** → **Enable APIs**
4. Search for and enable **Indexing API**
5. Go to **IAM & Admin** → **Service Accounts**
6. Click **Create Service Account**:
   - Name: `recipe-indexing`
   - Description: Recipe website indexing service
7. Grant **Owner** role
8. Click **Done**
9. Click the service account → **Keys** tab
10. **Add Key** → **Create New Key** → **JSON**
11. Download the JSON file

#### Add to Google Search Console

1. Open your service account JSON file
2. Copy the `client_email` value (looks like `xxx@xxx.iam.gserviceaccount.com`)
3. Go to [Google Search Console](https://search.google.com/search-console)
4. Select your property
5. Go to **Settings** → **Users and permissions**
6. Click **Add user**
7. Paste the service account email
8. Grant **Owner** permission
9. Click **Add**

#### Configure in Admin UI

1. Go to Admin Dashboard → Automation → Settings
2. Click **Google Indexing** tab
3. Enable the toggle
4. Paste entire JSON content from service account file
5. Click **Save Settings**

### 2. Pinterest + Make.com Setup

#### Create Make.com Scenario

1. Log in to [Make.com](https://www.make.com)
2. Create new scenario
3. Add **Webhooks** → **Custom webhook** trigger
4. Copy the webhook URL
5. Add **Pinterest** → **Create a Pin** action
6. Configure mapping:
   - Board: `{{boardId}}`
   - Title: `{{title}}`
   - Description: `{{description}}`
   - Image URL: `{{imageUrl}}`
   - Link: `{{postLink}}`
   - Alt Text: `{{altText}}`
7. Activate scenario

#### Configure in Admin UI

1. Go to Admin Dashboard → Automation → Settings
2. Click **Pinterest** tab
3. Enable the toggle
4. Paste Make.com webhook URL
5. Customize image edit prompt (optional)
6. Click **Save Settings**

#### Map Pinterest Boards to Categories

1. Go to Admin Dashboard → Automation → Pinterest Boards
2. For each recipe category:
   - Click **Add Mapping**
   - Enter Board Name (e.g., "Desserts")
   - Enter Board ID (from Pinterest board URL)
   - Select Category
   - Click **Add**

**How to get Pinterest Board ID:**
- Go to Pinterest board
- URL format: `pinterest.com/username/board-name`
- Board ID is the last part: `board-name`

### 3. Environment Variables

Add to `.env` file:

```env
# Gemini API for image editing
GEMINI_API_KEY=your_gemini_api_key

# Site URL for indexing and Pinterest links
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

---

## ⚙️ How It Works

### Google Indexing (Step 6)

1. Recipe is published to website
2. Pipeline checks if Google Indexing is enabled
3. Builds full recipe URL
4. Submits to Google Indexing API with service account credentials
5. Google receives notification and indexes within minutes
6. Non-fatal: continues if indexing fails

### Pinterest Integration (Step 7)

1. Recipe is published (Step 5 complete)
2. Pipeline checks if Pinterest integration is enabled
3. **Image Editing**:
   - Downloads original SpyPin image
   - Sends to Gemini AI with custom prompt
   - Receives image analysis/description
   - Optimizes image to 1000x1500 (Pinterest recommended)
   - Saves to `/public/uploads/pinterest/`
4. **Board Mapping**:
   - Looks up category in `PinterestBoard` table
   - Gets Pinterest board ID
   - Falls back to default if no mapping
5. **Webhook Sending**:
   - Builds payload with recipe data
   - Sends to Make.com webhook URL
   - Make.com posts to Pinterest automatically
6. Non-fatal: continues if Pinterest fails

---

## 🔧 Configuration

### Automation Settings Table

| Field | Type | Description |
|-------|------|-------------|
| `enableGoogleIndexing` | Boolean | Enable/disable Google Indexing |
| `googleIndexingCredentials` | Text (encrypted) | Service account JSON |
| `enablePinterest` | Boolean | Enable/disable Pinterest |
| `pinterestWebhookUrl` | String | Make.com webhook URL |
| `pinterestImageEditPrompt` | Text | Gemini prompt template |

### Pinterest Board Mapping Table

| Field | Type | Description |
|-------|------|-------------|
| `boardName` | String | Display name (e.g., "Desserts") |
| `boardId` | String | Pinterest board identifier |
| `categoryId` | String | FK to Category table |
| `isActive` | Boolean | Enable/disable mapping |

### Default Image Edit Prompt

```
Analyze this food image for Pinterest optimization: {recipeTitle}

Provide a detailed description highlighting:
- Visual appeal and presentation
- Key ingredients visible
- Cooking technique shown
- Color palette and styling
- What makes it Pinterest-worthy

Image: {spyPinImage}
```

Variables:
- `{recipeTitle}` - Recipe title
- `{spyPinImage}` - Reference to uploaded image

---

## 📊 Database Schema

### AutomationSettings Extension

```prisma
model AutomationSettings {
  // ... existing fields
  
  // Google Indexing
  enableGoogleIndexing     Boolean  @default(false)
  googleIndexingCredentials String? @db.Text // Encrypted JSON
  
  // Pinterest
  enablePinterest          Boolean  @default(false)
  pinterestWebhookUrl      String?
  pinterestImageEditPrompt String?  @db.Text
}
```

### PinterestBoard (New)

```prisma
model PinterestBoard {
  id         String   @id @default(cuid())
  boardName  String   // Display name
  boardId    String   // Pinterest board identifier
  categoryId String   // FK to Category
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  
  @@unique([categoryId]) // One board per category
}
```

### Category Extension

```prisma
model Category {
  // ... existing fields
  pinterestBoards PinterestBoard[]
}
```

---

## 🌐 API Endpoints

### Pinterest Board Management

#### GET `/api/admin/automation/pinterest-boards`

Get all board mappings with category info.

**Response:**
```json
[
  {
    "id": "board_123",
    "boardName": "Desserts",
    "boardId": "dessert-recipes",
    "categoryId": "cat_456",
    "isActive": true,
    "category": {
      "id": "cat_456",
      "name": "Desserts",
      "slug": "desserts"
    }
  }
]
```

#### POST `/api/admin/automation/pinterest-boards`

Create new board mapping.

**Body:**
```json
{
  "boardName": "Desserts",
  "boardId": "dessert-recipes",
  "categoryId": "cat_456"
}
```

**Validation:**
- One board per category (enforced by unique constraint)
- All fields required

#### PUT `/api/admin/automation/pinterest-boards/[id]`

Update board mapping.

**Body:**
```json
{
  "boardName": "Updated Name",
  "isActive": false
}
```

#### DELETE `/api/admin/automation/pinterest-boards/[id]`

Remove board mapping.

---

## 🛠️ Services

### Google Indexing Service

**File:** `automation/google-indexing/service.ts`

#### Functions

##### `requestGoogleIndexing(url, credentials)`

Submit URL to Google Indexing API.

```typescript
const result = await requestGoogleIndexing(
  'https://yourdomain.com/recipes/chocolate-cake',
  JSON.stringify(serviceAccountCredentials)
);

// result: { success, url, status?, message?, error? }
```

##### `requestGoogleIndexingBatch(urls, credentials)`

Submit multiple URLs with rate limiting.

##### `checkIndexingStatus(url, credentials)`

Check if URL has been indexed.

##### `validateGoogleIndexingCredentials(credentials)`

Validate service account JSON format.

### Pinterest Image Editor

**File:** `automation/pinterest/image-editor.ts`

#### Functions

##### `editImageWithGemini(imageUrl, recipeTitle, prompt, apiKey)`

Process image with Gemini AI.

```typescript
const result = await editImageWithGemini(
  'https://example.com/food.jpg',
  'Chocolate Cake',
  customPrompt,
  process.env.GEMINI_API_KEY!
);

// result: { success, originalImagePath?, editedImageUrl?, error? }
```

**Process:**
1. Downloads image from URL
2. Sends to Gemini with prompt
3. Gets AI analysis
4. Optimizes image (1000x1500, 90% quality)
5. Saves to `/public/uploads/pinterest/`
6. Returns public URL

##### `editImagesBatch(images, prompt, apiKey)`

Process multiple images with 2s delay.

##### `validateGeminiApiKey(apiKey)`

Test API key with simple request.

### Pinterest Webhook Service

**File:** `automation/pinterest/webhook.ts`

#### Functions

##### `sendPinterestWebhook(webhookUrl, payload)`

Send recipe data to Make.com.

```typescript
const payload: PinterestWebhookPayload = {
  recipeId: 'rec_123',
  title: 'Chocolate Cake',
  description: 'Rich and moist...',
  imageUrl: 'https://yourdomain.com/uploads/pinterest/image.jpg',
  postLink: 'https://yourdomain.com/recipes/chocolate-cake',
  boardId: 'dessert-recipes',
  category: 'Desserts',
  tags: ['cake', 'chocolate'],
  altText: 'Chocolate Cake'
};

const result = await sendPinterestWebhook(webhookUrl, payload);
```

##### `sendPinterestWebhookBatch(webhookUrl, payloads)`

Send multiple webhooks with 1s delay.

##### `testPinterestWebhook(webhookUrl)`

Test webhook connection.

##### `buildPinterestPayload(...)`

Helper to construct payload from recipe data.

---

## 🐛 Troubleshooting

### Google Indexing Issues

#### "Invalid credentials"

- Verify JSON format is correct
- Check service account has Indexing API enabled
- Ensure service account email is added to Search Console

#### "Permission denied"

- Add service account email to Search Console as Owner
- Wait 10-15 minutes for permissions to propagate

#### "Quota exceeded"

- Google Indexing API has limits:
  - 200 URLs per day (free tier)
  - Check [Google Cloud Console quotas](https://console.cloud.google.com/apis/api/indexing.googleapis.com/quotas)

### Pinterest Issues

#### "Webhook failed"

- Test webhook URL in Make.com
- Check Make.com scenario is activated
- Verify webhook URL is correct (no trailing slash)

#### "Image editing failed"

- Check Gemini API key is valid
- Verify `GEMINI_API_KEY` in `.env`
- Test with simple prompt first

#### "Board mapping not found"

- Go to Pinterest Boards page
- Add mapping for recipe category
- Ensure `isActive` is true

#### "Image upload failed in Make.com"

- Image URL must be publicly accessible
- Check `NEXT_PUBLIC_SITE_URL` is correct
- Verify `/uploads/pinterest/` directory exists

### Pipeline Issues

#### "Step 6/7 skipped"

- Check settings are enabled in admin UI
- Verify credentials are saved
- Look for "disabled or not configured" in logs

#### "Non-fatal error"

- Google Indexing and Pinterest are non-fatal
- Recipe still saves even if these steps fail
- Check execution logs for details

---

## 📝 Example Workflow

### Complete Recipe Generation

1. **SpyPin Data**: User saves Pinterest pin data
2. **SEO Generation**: AI generates SEO metadata
3. **Image Generation**: Creates 4 optimized images
4. **Category Matching**: Finds best category fit
5. **Recipe Generation**: AI writes full recipe content
6. **Publishing**: Saves to database, visible on website
7. **Google Indexing** ⭐:
   - Submits `https://yourdomain.com/recipes/chocolate-cake`
   - Google indexes within 5-10 minutes
8. **Pinterest** ⭐:
   - Downloads SpyPin image
   - Gemini analyzes and optimizes
   - Gets board ID from category mapping
   - Sends webhook to Make.com
   - Make.com posts to Pinterest automatically

### Make.com Webhook Payload

```json
{
  "recipeId": "rec_abc123",
  "title": "Ultimate Chocolate Cake",
  "description": "Rich, moist chocolate cake with creamy frosting. Perfect for celebrations!",
  "imageUrl": "https://yourdomain.com/uploads/pinterest/pinterest-1699564832.jpg",
  "postLink": "https://yourdomain.com/recipes/ultimate-chocolate-cake",
  "boardId": "dessert-recipes",
  "category": "Desserts",
  "tags": ["chocolate cake", "desserts"],
  "altText": "Ultimate Chocolate Cake"
}
```

---

## 🎓 Best Practices

### Google Indexing

1. **Submit immediately**: Run after publishing for fastest indexing
2. **Monitor quota**: Track daily submissions in Google Cloud Console
3. **Handle errors gracefully**: Pipeline continues even if indexing fails
4. **Resubmit on updates**: Submit again when recipe is edited

### Pinterest

1. **Optimize images**: 1000x1500 performs best on Pinterest
2. **Compelling descriptions**: First 100 chars show in feed
3. **Use keywords**: Include recipe keywords in title/description
4. **Map all categories**: Create board for each recipe category
5. **Test webhooks**: Use Make.com's test feature before production

### Image Editing

1. **Custom prompts**: Tailor to your brand style
2. **Quality over speed**: 2s delay prevents rate limits
3. **Test with samples**: Try different prompts before automation
4. **Monitor Gemini usage**: Check API quotas regularly

---

## 📚 Related Documentation

- [Google Indexing API Docs](https://developers.google.com/search/apis/indexing-api/v3/quickstart)
- [Make.com Webhooks](https://www.make.com/en/help/tools/webhooks)
- [Pinterest API](https://developers.pinterest.com/docs/getting-started/introduction/)
- [Gemini API](https://ai.google.dev/docs)

---

## 🚦 Status Indicators

In the admin UI, you'll see:

- 🟢 **Enabled & Configured**: Service is active and ready
- 🟡 **Enabled but Missing Config**: Toggle on but credentials missing
- 🔴 **Disabled**: Service not active
- ⚠️ **Error in Pipeline**: Check execution logs

---

## 💡 Tips

1. **Start with Google Indexing**: Easier setup, immediate SEO benefit
2. **Test Make.com first**: Send test webhook before enabling automation
3. **Monitor initially**: Watch first 5-10 recipes to verify workflow
4. **Adjust prompts**: Fine-tune image edit prompt based on results
5. **Check quotas**: Both Google and Gemini have free tier limits

---

**Last Updated**: November 2025
**Version**: 1.0.0
