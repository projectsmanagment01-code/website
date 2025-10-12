# SEO Enhancement System - Database Schema

Add these models to your `prisma/schema.prisma` file:

```prisma
// ============================================
// SEO Enhancement System Tables
// ============================================

// Main enhancement tracking table
model SEOEnhancement {
  id                String   @id @default(cuid())
  type              String   // 'metadata' | 'image' | 'internal-link' | 'schema' | 'content'
  status            String   @default("pending") // 'pending' | 'approved' | 'rejected' | 'applied'
  confidence        Float    // 0-1 confidence score from AI
  originalContent   String?  @db.Text
  suggestedContent  String   @db.Text
  reasoning         String   @db.Text
  keywords          String[]
  estimatedImpact   String   // 'low' | 'medium' | 'high'
  
  // Relations
  recipeId          String?
  recipe            Recipe?  @relation(fields: [recipeId], references: [id], onDelete: Cascade)
  
  // Admin management
  reviewedBy        String?
  reviewedAt        DateTime?
  appliedBy         String?
  appliedAt         DateTime?
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([recipeId])
  @@index([status])
  @@index([type])
  @@index([createdAt])
  @@map("seo_enhancements")
}

// AI-generated metadata storage
model SEOMetadata {
  id                String   @id @default(cuid())
  
  // Page identification
  pageType          String   // 'recipe' | 'category' | 'author' | 'static'
  pageId            String   @unique
  slug              String   @unique
  
  // AI-generated metadata
  aiTitle           String?
  aiDescription     String?  @db.Text
  aiKeywords        String[]
  aiOgTitle         String?
  aiOgDescription   String?  @db.Text
  aiTwitterTitle    String?
  aiTwitterDescription String?  @db.Text
  
  // Current live metadata
  currentTitle      String?
  currentDescription String?  @db.Text
  currentKeywords   String[]
  
  // Performance tracking
  generatedAt       DateTime @default(now())
  lastApplied       DateTime?
  performanceScore  Float?
  
  // Relations
  recipeId          String?
  recipe            Recipe?  @relation(fields: [recipeId], references: [id], onDelete: Cascade)
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([recipeId])
  @@index([pageType])
  @@map("seo_metadata")
}

// Image SEO data
model SEOImageData {
  id                String   @id @default(cuid())
  
  // Image identification
  imageUrl          String   @unique
  imageHash         String?
  
  // AI-generated content
  aiAltText         String?
  aiCaption         String?  @db.Text
  aiTitle           String?
  aiStructuredData  Json?
  
  // Current content
  currentAltText    String?
  currentCaption    String?  @db.Text
  currentTitle      String?
  
  // Context
  pageType          String
  pageId            String
  imageContext      String   // 'hero' | 'ingredient' | 'step' | 'final-result' | 'gallery'
  
  // Performance
  generatedAt       DateTime @default(now())
  lastApplied       DateTime?
  
  // Relations
  recipeId          String?
  recipe            Recipe?  @relation(fields: [recipeId], references: [id], onDelete: Cascade)
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([recipeId])
  @@index([imageUrl])
  @@map("seo_image_data")
}

// Internal linking system
model SEOInternalLink {
  id                String   @id @default(cuid())
  
  // Source page
  sourcePage        String
  sourcePageType    String
  sourcePageId      String
  
  // Target page
  targetPage        String
  targetPageType    String
  targetPageId      String
  targetPageTitle   String
  
  // Link details
  anchorText        String
  contextBefore     String   @db.Text
  contextAfter      String   @db.Text
  linkType          String   // 'related-recipe' | 'category' | 'ingredient' | 'technique'
  relevanceScore    Float
  
  // Status
  status            String   @default("pending")
  appliedAt         DateTime?
  
  // Performance tracking
  clickThrough      Int      @default(0)
  impressions       Int      @default(0)
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([sourcePageId])
  @@index([targetPageId])
  @@index([status])
  @@map("seo_internal_links")
}

// Enhancement reports for admin dashboard
model SEOEnhancementReport {
  id                String   @id @default(cuid())
  
  // Recipe info
  recipeId          String
  recipeTitle       String
  
  // Processing results
  status            String   // 'success' | 'partial' | 'failed'
  enhancementsCount Int      @default(0)
  seoScore          Float    @default(0)
  
  // Details JSON
  metadataStatus    String?
  metadataConfidence Float?
  imagesStatus      String?
  imagesCount       Int      @default(0)
  linksStatus       String?
  linksCount        Int      @default(0)
  schemaStatus      String?
  schemaConfidence  Float?
  
  // Error tracking
  errors            Json?
  
  // Performance
  processingTime    Int      // milliseconds
  
  // Relations
  recipe            Recipe   @relation(fields: [recipeId], references: [id], onDelete: Cascade)
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([recipeId])
  @@index([status])
  @@index([createdAt])
  @@map("seo_enhancement_reports")
}

// SEO performance tracking
model SEOPerformance {
  id                String   @id @default(cuid())
  
  // Page identification
  pageUrl           String
  pageType          String
  pageId            String
  
  // SEO metrics
  organicImpressions Int     @default(0)
  organicClicks     Int     @default(0)
  organicCTR        Float   @default(0)
  averagePosition   Float   @default(0)
  
  // AI enhancement impact
  beforeEnhancement Json?
  afterEnhancement  Json?
  improvementScore  Float?
  
  // Time period
  dateFrom          DateTime
  dateTo            DateTime
  
  // Relations
  recipeId          String?
  recipe            Recipe?  @relation(fields: [recipeId], references: [id], onDelete: Cascade)
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@unique([pageUrl, dateFrom, dateTo])
  @@index([recipeId])
  @@map("seo_performance")
}

// Admin notifications for SEO updates
model SEONotification {
  id                String   @id @default(cuid())
  
  type              String   // 'enhancement_complete' | 'error' | 'milestone'
  title             String
  message           String   @db.Text
  data              Json?
  
  // Status
  read              Boolean  @default(false)
  readAt            DateTime?
  
  // Optional user assignment
  userId            String?
  
  createdAt         DateTime @default(now())

  @@index([userId])
  @@index([read])
  @@index([createdAt])
  @@map("seo_notifications")
}

// ============================================
// Add these fields to your existing Recipe model
// ============================================

model Recipe {
  // ... your existing fields ...
  
  // SEO Enhancement Relations
  seoEnhancements   SEOEnhancement[]
  seoMetadata       SEOMetadata[]
  seoImageData      SEOImageData[]
  seoPerformance    SEOPerformance[]
  seoReports        SEOEnhancementReport[]
  
  // AI Processing Status
  lastSEOAnalysis   DateTime?
  seoScore          Float?   // Overall SEO score 0-100
  aiEnhancementsCount Int   @default(0)
  
  // ... rest of your existing fields ...
}
```

## Migration Instructions

1. **Add the schema to your Prisma file**:
   ```bash
   # Copy the models above to prisma/schema.prisma
   ```

2. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

3. **Create and run migration**:
   ```bash
   npx prisma migrate dev --name add_seo_enhancement_system
   ```

4. **Alternative: Push schema directly** (for development):
   ```bash
   npx prisma db push
   ```

## Database Tables Created

1. **seo_enhancements** - Stores all AI-generated enhancements
2. **seo_metadata** - Stores metadata suggestions
3. **seo_image_data** - Stores image alt text and captions
4. **seo_internal_links** - Stores internal link suggestions
5. **seo_enhancement_reports** - Summary reports for admin dashboard
6. **seo_performance** - Tracks SEO performance metrics
7. **seo_notifications** - Admin notifications

## Indexes

All tables include proper indexes for:
- Fast lookups by recipe ID
- Filtering by status
- Sorting by creation date
- Performance optimization

## Features

✅ Automatic AI enhancement tracking
✅ Admin review workflow
✅ Performance monitoring
✅ Error logging
✅ Notification system
✅ Comprehensive reporting