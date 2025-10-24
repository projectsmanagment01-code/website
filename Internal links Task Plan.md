TASK PLAN - INTERNAL LINKING SYSTEM
IMPLEMENTATION ROADMAP
PHASE 1: DATABASE & SCHEMA (Day 1)
Goal: Set up data structure

Tasks:

Add InternalLinkSuggestion model to schema.prisma
Add OrphanPage model to schema.prisma
Add LinkKeyword model to schema.prisma (optional for custom keywords)
Update Recipe model relations
Run: npx prisma migrate dev --name add_internal_linking
Generate Prisma client: npx prisma generate
Files to modify:

schema.prisma
PHASE 2: CORE UTILITIES (Day 1-2)
Goal: Build helper functions

Tasks:

Create lib/internal-linking/keyword-extractor.ts

extractKeywordsFromRecipe()
buildKeywordIndex()
Create lib/internal-linking/link-matcher.ts

findLinkOpportunities()
calculateRelevanceScore()
filterByQuality()
Create lib/internal-linking/link-inserter.ts

insertLinksInContent()
preserveHTMLStructure()
avoidDuplicates()
Create lib/internal-linking/orphan-detector.ts

findOrphanPages()
calculateLinkCounts()
Create lib/internal-linking/config.ts

Default settings
Blacklist keywords
Files to create:

lib/internal-linking/keyword-extractor.ts
lib/internal-linking/link-matcher.ts
lib/internal-linking/link-inserter.ts
lib/internal-linking/orphan-detector.ts
lib/internal-linking/config.ts
lib/internal-linking/index.ts (exports)
PHASE 3: API ENDPOINTS (Day 2-3)
Goal: Create backend APIs

Tasks:

POST /api/admin/internal-links/scan

Trigger scan job
Return job ID
GET /api/admin/internal-links/scan/status/:jobId

Check scan progress
GET /api/admin/internal-links/suggestions

List all suggestions
Support filters (recipe, field, score, status)
POST /api/admin/internal-links/apply

Apply selected suggestions
Update recipes
Mark as applied
DELETE /api/admin/internal-links/suggestions

Reject suggestions
GET /api/admin/internal-links/orphans

List orphan pages
POST /api/admin/internal-links/remove

Remove applied links
GET /api/admin/internal-links/stats

Get summary statistics
Files to create:

route.ts
route.ts
route.ts
route.ts
route.ts
route.ts
route.ts
PHASE 4: ADMIN UI COMPONENTS (Day 3-4)
Goal: Build UI elements

Tasks:

Create InternalLinksManager.tsx (main container)

Tabs navigation
Scan trigger button
Create SuggestionsTable.tsx

Display suggestions
Checkboxes for selection
Preview modal
Filters
Create OrphanPagesView.tsx

List orphan recipes
Show link opportunities
Create AppliedLinksView.tsx

Show applied links
Remove functionality
Analytics display
Create LinkPreview.tsx (modal)

Show context
Edit anchor text option
Create ScanProgress.tsx

Progress bar
Status messages
Files to create:

components/admin/internal-links/InternalLinksManager.tsx
components/admin/internal-links/SuggestionsTable.tsx
components/admin/internal-links/OrphanPagesView.tsx
components/admin/internal-links/AppliedLinksView.tsx
components/admin/internal-links/LinkPreview.tsx
components/admin/internal-links/ScanProgress.tsx
components/admin/internal-links/types.ts
PHASE 5: ADMIN DASHBOARD INTEGRATION (Day 4)
Goal: Add to main admin

Tasks:

Add "Internal Links" to admin sidebar navigation
Add route to admin dashboard switch statement
Add icon (Link2 from lucide-react)
Update AdminContext if needed
Files to modify:

Sidebar.tsx
Dashboard.tsx
PHASE 6: BACKGROUND JOB PROCESSING (Day 5)
Goal: Handle long-running scans

Tasks:

Create job queue system (simple in-memory or Redis)
Add job status tracking
Implement progress updates
Add error handling and retry logic
Files to create:

lib/internal-linking/job-queue.ts
lib/internal-linking/scan-worker.ts
PHASE 7: SETTINGS & CONFIGURATION (Day 5)
Goal: Admin-configurable settings

Tasks:

Add settings to AdminSettings table
Create settings UI panel
Add form for:
Max suggestions per recipe
Min relevance score
Link color
Blacklist keywords
Processed fields
Files to create:

components/admin/internal-links/LinkSettings.tsx
Files to modify:

admin-settings.ts (add getters/setters)
PHASE 8: TESTING & REFINEMENT (Day 6-7)
Goal: Ensure quality

Tasks:

Test scan with 10 recipes
Verify link quality and relevance
Test bulk apply/reject
Test orphan detection
Verify no self-links
Check performance with 100+ recipes
Test link removal
Verify HTML structure preservation
DETAILED TASK BREAKDOWN
START HERE - TASK 1: DATABASE SCHEMA
Priority: Critical
Estimated Time: 30 min

Add models to prisma/schema.prisma:

InternalLinkSuggestion
OrphanPage
Update Recipe relations
Then run migrations.

TASK 2: KEYWORD EXTRACTOR
Priority: Critical
Estimated Time: 2 hours

Create lib/internal-linking/keyword-extractor.ts

Functions needed:

extractKeywordsFromRecipe(recipe)
buildKeywordIndex(recipes[])
normalizeKeyword(text)
TASK 3: LINK MATCHER
Priority: Critical
Estimated Time: 3 hours

Create lib/internal-linking/link-matcher.ts

Functions needed:

findLinkOpportunities(content, keywordIndex, sourceRecipeId, fieldName)
calculateRelevanceScore(keyword, context)
filterLowQuality(suggestions)
deduplicateSuggestions(suggestions)
TASK 4: SCAN API
Priority: Critical
Estimated Time: 2 hours

Create route.ts

Endpoint: POST /api/admin/internal-links/scan

Fetch all published recipes
Build keyword index
Generate suggestions for each recipe
Store in database
Return scan summary
TASK 5: SUGGESTIONS API
Priority: Critical
Estimated Time: 1 hour

Create route.ts

Endpoint: GET /api/admin/internal-links/suggestions

Fetch from database
Apply filters
Return paginated results
TASK 6: APPLY API
Priority: Critical
Estimated Time: 2 hours

Create route.ts

Endpoint: POST /api/admin/internal-links/apply

Receive suggestion IDs
Fetch recipes
Insert links in content
Update recipes
Mark suggestions as applied
TASK 7: SUGGESTIONS TABLE UI
Priority: High
Estimated Time: 3 hours

Create components/admin/internal-links/SuggestionsTable.tsx

Features:

Table with checkboxes
Preview button
Filters (score, recipe, field)
Select all/none
Apply selected button
Pagination
TASK 8: ORPHAN DETECTION
Priority: Medium
Estimated Time: 2 hours

Create lib/internal-linking/orphan-detector.ts + API

Functions:

analyzeIncomingLinks(recipes)
findOrphanPages(threshold)
suggestLinksForOrphan(orphanRecipe)
TASK 9: ADMIN INTEGRATION
Priority: High
Estimated Time: 1 hour

Add to admin dashboard:

Sidebar menu item
Route handler
Icon and navigation
TASK 10: SETTINGS UI
Priority: Medium
Estimated Time: 2 hours

Create settings panel for configuration options

DEPENDENCIES
WORK ORDER
Week 1:

Day 1: Tasks 1, 2, 3
Day 2: Tasks 4, 5
Day 3: Tasks 6, 7
Day 4: Tasks 8, 9
Day 5: Task 10, Testing
QUICK START CHECKLIST
□ Task 1: Add database models
□ Task 2: Create keyword extractor
□ Task 3: Create link matcher
□ Task 4: Create scan API
□ Task 5: Create suggestions API
□ Task 6: Create apply API
□ Task 7: Create suggestions UI
□ Task 8: Create orphan detector
□ Task 9: Integrate with admin
□ Task 10: Add settings panel

