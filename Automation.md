# 🧩 Feast Forge Automation System — "Flavor Gemini" Replacement  
**Purpose:**  
A fully autonomous automation backend built with **Node.js (NestJS)** that replaces the n8n workflow *“Flavor Gemini”*.  
The system automates:
- Recipe image generation using AI  
- Recipe article creation using AI  
- Uploading and publishing to website  
- Updating Google Sheets records  
- Generating Pinterest descriptions  
- Triggering Google indexing  
- Sending data to Make.com webhooks  

This application performs one specific, complete workflow — no workflow builder or dynamic flows.

---

## 🏗️ Architecture Overview (MVT / MVC)

### **Model (Data Layer)**

**Tech Stack:**
- Database: **PostgreSQL**
- ORM: **Prisma ORM**
- Job Queue: **BullMQ (Redis)**

**Entities:**

#### `Config`
| Field | Type | Description |
|--------|------|-------------|
| id | UUID | Config ID |
| googleSheetId | string | Main Google Sheet ID |
| websiteApiToken | string | API token for posting |
| aiGenerator | string | "Gemini" or "Midjourney" |
| nakedDomain | string | Example: `chocofeverdream.com` |

#### `RecipeData`
| Field | Type | Description |
|--------|------|-------------|
| id | UUID | Recipe record ID |
| title | string | Recipe title |
| description | text | SEO description |
| keyword | string | SEO keyword |
| category | string | Category name |
| categoryId | string | Category ID from website |
| authorId | string | Website author ID |
| spyImageUrl | string | Reference Pinterest image |
| status | enum(pending, processing, posted, indexed) | Workflow status |
| rowNumber | int | Row number in Google Sheet |
| sheetUrl | string | Google Sheet URL |
| createdAt | datetime | Creation timestamp |

#### `ImageSet`
| Field | Type | Description |
|--------|------|-------------|
| id | UUID | Image set ID |
| recipeId | UUID | Linked recipe |
| imageFeature | string | URL |
| imageIngredients | string | URL |
| imageCooking | string | URL |
| imageFinal | string | URL |
| pinterestImage | string | URL |
| createdAt | datetime | Timestamp |

#### `AutomationLog`
| Field | Type | Description |
|--------|------|-------------|
| id | UUID | Log ID |
| recipeId | UUID | Related recipe |
| timestamp | datetime | When logged |
| event | string | What happened |
| level | enum(info, warning, error) | Log type |
| details | text | Message or payload |

---

### **View (Dashboard / Monitoring Layer)**

**Goal:** Provide a web UI to monitor the automation runs.

**Tech stack:**
- **Next.js + TailwindCSS + shadcn/ui**
- Communicates with backend via REST APIs

**Features:**
- Dashboard with queue overview (pending / processing / completed)
- Logs viewer with filters
- Trigger button for manual run
- Retry failed tasks
- Statistics summary (e.g. success rate, avg runtime)

---

### **Template (Controller / Logic Layer)**

**Tech stack:**
- **NestJS** (Node.js + TypeScript)
- **Axios** for API calls
- **BullMQ + Redis** for task orchestration
- **Google Sheets API v4**
- **Google Indexing API**
- **Gemini API (via REST)**

---

## 🔁 Core Workflow Pipeline

Each run follows this exact flow:

1. **Trigger (Scheduler)**
   - Runs every 2 hours (configurable via CRON).
   - Starts one job: fetch a single pending recipe from Google Sheets.

2. **Data Retrieval**
   - Reads config from the `Config` table.
   - Reads from Google Sheet:
     - Selects first row where `is Published = Go` and `Skip = false`.
   - Extracts title, keyword, description, and category.

3. **AI Generator Selection**
   - Based on config field `aiGenerator`.
   - For now: always “Gemini”.

4. **AI Image Prompt Generation**
   - Calls **Gemini 2.5 Flash** model.
   - System instruction:
     > Generate 4 JSON image prompts representing:  
     > 1. Feature image  
     > 2. Ingredients  
     > 3. Cooking stage  
     > 4. Final presentation  
     > Maintain cohesive lighting, perspective, and theme.

   - Outputs clean JSON:
     ```json
     {
       "image_1_feature": "...",
       "image_2_ingredients": "...",
       "image_3_cooking": "...",
       "image_4_final_presentation": "..."
     }
     ```

5. **Reference Image Download**
   - Downloads `spyImageUrl` from Google Sheets (HTTP GET).
   - Saves locally as style reference.

6. **AI Image Generation**
   - Uses Gemini or another model API to generate 4 distinct 16:9 images.
   - Uses `spyImageUrl` as a reference.
   - Uploads each generated image to the website via:
     ```
     POST https://<domain>/api/upload
     Headers: Authorization: Bearer <token>
     Body: { category: "recipes", file: <binary> }
     ```
   - Saves URLs in `ImageSet`.

7. **Update Google Sheet (Images)**
   - Writes back generated image URLs into the proper columns (Image 01–04).

8. **AI Article Generation**
   - Uses **Gemini 2.5 Pro**.
   - System instruction:
     > Act as Isabella Martin — a 40-year-old graceful home cook.  
     > Write a complete recipe JSON using given images, SEO data, and schema.  
     > Replace pork with lamb/turkey/beef.  
     > No alcohol.  
     > Use internal links if sitemap provided.  
     > Output strict JSON only.

   - Output sent to `/api/recipe` endpoint:
     ```
     POST https://<domain>/api/recipe
     Headers: Authorization: Bearer <token>
     Body: JSON output from Gemini
     ```

9. **Google Sheet Update (Publication)**
   - Updates `is Published = true`, adds `Post link` and `Recipe ID`.

10. **Pinterest Image Upload**
    - Uploads the Pinterest image via same upload API.
    - Stores the new URL.

11. **Pinterest Description Generation**
    - Calls **Gemini 2.5 Flash** to create 2–3 line Pinterest description:
      - Rewrites title.
      - Uses sensory, concise language.
      - No hashtags or emojis.

12. **Google Indexing API Request**
    - POST to `https://indexing.googleapis.com/v3/urlNotifications:publish`
    - Body:
      ```json
      {
        "url": "<published URL>",
        "type": "URL_UPDATED"
      }
      ```

13. **Google Sheet Update (Indexing + Pinterest)**
    - Writes:
      - `Is Indexed = sent`
      - `Pin Image = <url>`
      - `PIN Description = ...`
      - `PIN Title = ...`
      - `PIN Category = ...`
      - `Published = Go`
      - `Post Link = <url>`

14. **Pinterest Hook (Make.com)**
    - POST to Make.com webhook:
      ```
      POST https://hook.eu2.make.com/<token>
      Body: {
        "image": <pinterest image>,
        "description": <pin description>,
        "title": <title>,
        "category": <category>,
        "link": <post link>
      }
      ```

15. **Logging & Alerts**
    - Every step logs success/failure.
    - Retries (3 attempts max) on network or API errors.
    - Email or Telegram alert on repeated errors.

---

## ⚙️ Environment Variables

DATABASE_URL=postgresql://user:password@localhost:5432/flavor_gemini
REDIS_URL=redis://localhost:6379
WEBSITE_API_URL=https://chocofeverdream.com/api

WEBSITE_TOKEN=YOUR_API_TOKEN
GOOGLE_SHEET_ID=YOUR_SHEET_ID
GOOGLE_SERVICE_ACCOUNT=base64_encoded_credentials.json
GEMINI_API_KEY=YOUR_KEY
MAKE_WEBHOOK_URL=https://hook.eu2.make.com/xxxx

CRON_SCHEDULE=*/120 * * * * # every 2 hours


---

## 🧰 Developer Task Breakdown

| # | Task | Description |
|---|------|-------------|
| 1 | Setup NestJS project with Prisma, Redis (BullMQ), Axios |
| 2 | Create Prisma schema (Config, RecipeData, ImageSet, AutomationLog) |
| 3 | Integrate Google Sheets API + Google Indexing API |
| 4 | Build AI services for Gemini Flash and Gemini Pro requests |
| 5 | Implement image generation + upload logic |
| 6 | Build main `AutomationService` orchestrating workflow |
| 7 | Build scheduler to trigger every 2 hours |
| 8 | Build REST API for monitoring/logs |
| 9 | Optional: Add Next.js dashboard for logs/queue |
| 10 | Implement Docker Compose for app + Redis + Postgres |
| 11 | Add retry logic, error handling, and logging system |

---

## 🧱 Deliverables

1. **NestJS backend** source code (main automation engine).  
2. **Prisma schema** with migrations.  
3. **Docker Compose** setup (`app`, `redis`, `postgres`).  
4. **Next.js monitoring dashboard** (optional).  
5. **README.md** and `.env.example`.  
6. **Seed script** for adding initial config data.

---

## 💡 Developer Notes

- Use **TypeScript everywhere**.  
- Use **async/await** with robust error handling.  
- Keep external API calls modular and testable.  
- Ensure strict JSON schema validation for Gemini responses.  
- Must survive restarts without losing progress.  
- Use BullMQ job persistence for retry queue.  
- Log all API payloads (masked for credentials).  
- Implement exponential backoff for failed calls.  

---

## ✅ Summary

This system is a **self-hosted automation engine** that replaces the n8n “Flavor Gemini” workflow.  
It manages AI content generation, media uploads, web publishing, Google Sheets updates, indexing, and Pinterest distribution — all from one clean, specialized backend service.

**Core stack:**  
NestJS · TypeScript · BullMQ · Redis · PostgreSQL · Prisma · Google APIs · Gemini API
