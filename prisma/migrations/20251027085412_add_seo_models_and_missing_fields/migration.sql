-- AlterTable
ALTER TABLE "public"."Recipe" ADD COLUMN     "aiEnhancementsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "cookingImage" TEXT,
ADD COLUMN     "featureImage" TEXT,
ADD COLUMN     "finalPresentationImage" TEXT,
ADD COLUMN     "lastSEOAnalysis" TIMESTAMP(3),
ADD COLUMN     "preparationImage" TEXT,
ADD COLUMN     "seoScore" DOUBLE PRECISION,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'published';

-- AlterTable
ALTER TABLE "public"."authors" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "public"."seo_enhancement_reports" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "recipeTitle" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "seoScore" INTEGER,
    "enhancementsCount" INTEGER NOT NULL DEFAULT 0,
    "processingTime" INTEGER,
    "metadataGenerated" BOOLEAN NOT NULL DEFAULT false,
    "imagesProcessed" INTEGER NOT NULL DEFAULT 0,
    "linksGenerated" INTEGER NOT NULL DEFAULT 0,
    "schemaEnhanced" BOOLEAN NOT NULL DEFAULT false,
    "errorMessage" TEXT,
    "aiResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_enhancement_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."seo_enhancements" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "confidence" DOUBLE PRECISION NOT NULL,
    "originalContent" TEXT,
    "suggestedContent" TEXT NOT NULL,
    "reasoning" TEXT NOT NULL,
    "keywords" TEXT[],
    "estimatedImpact" TEXT NOT NULL,
    "recipeId" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "appliedBy" TEXT,
    "appliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_enhancements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."seo_metadata" (
    "id" TEXT NOT NULL,
    "pageType" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "aiTitle" TEXT,
    "aiDescription" TEXT,
    "aiKeywords" TEXT[],
    "aiOgTitle" TEXT,
    "aiOgDescription" TEXT,
    "aiTwitterTitle" TEXT,
    "aiTwitterDescription" TEXT,
    "currentTitle" TEXT,
    "currentDescription" TEXT,
    "currentKeywords" TEXT[],
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastApplied" TIMESTAMP(3),
    "performanceScore" DOUBLE PRECISION,
    "recipeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."seo_image_data" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageHash" TEXT,
    "aiAltText" TEXT,
    "aiCaption" TEXT,
    "aiTitle" TEXT,
    "aiStructuredData" JSONB,
    "currentAltText" TEXT,
    "currentCaption" TEXT,
    "currentTitle" TEXT,
    "pageType" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "imageContext" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastApplied" TIMESTAMP(3),
    "recipeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_image_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."seo_internal_links" (
    "id" TEXT NOT NULL,
    "sourcePage" TEXT NOT NULL,
    "sourcePageType" TEXT NOT NULL,
    "sourcePageId" TEXT NOT NULL,
    "targetPage" TEXT NOT NULL,
    "targetPageType" TEXT NOT NULL,
    "targetPageId" TEXT NOT NULL,
    "targetPageTitle" TEXT NOT NULL,
    "anchorText" TEXT NOT NULL,
    "contextBefore" TEXT NOT NULL,
    "contextAfter" TEXT NOT NULL,
    "linkType" TEXT NOT NULL,
    "relevanceScore" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "appliedAt" TIMESTAMP(3),
    "clickThrough" INTEGER NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_internal_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."seo_performance" (
    "id" TEXT NOT NULL,
    "pageUrl" TEXT NOT NULL,
    "pageType" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "organicImpressions" INTEGER NOT NULL DEFAULT 0,
    "organicClicks" INTEGER NOT NULL DEFAULT 0,
    "organicCTR" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averagePosition" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "beforeEnhancement" JSONB,
    "afterEnhancement" JSONB,
    "improvementScore" DOUBLE PRECISION,
    "dateFrom" TIMESTAMP(3) NOT NULL,
    "dateTo" TIMESTAMP(3) NOT NULL,
    "recipeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_performance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."site_config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "data" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "site_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "seo_enhancement_reports_recipeId_idx" ON "public"."seo_enhancement_reports"("recipeId");

-- CreateIndex
CREATE INDEX "seo_enhancement_reports_status_idx" ON "public"."seo_enhancement_reports"("status");

-- CreateIndex
CREATE INDEX "seo_enhancement_reports_createdAt_idx" ON "public"."seo_enhancement_reports"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "seo_metadata_slug_key" ON "public"."seo_metadata"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "seo_image_data_imageUrl_key" ON "public"."seo_image_data"("imageUrl");

-- CreateIndex
CREATE UNIQUE INDEX "seo_performance_pageUrl_dateFrom_dateTo_key" ON "public"."seo_performance"("pageUrl", "dateFrom", "dateTo");

-- CreateIndex
CREATE UNIQUE INDEX "site_config_key_key" ON "public"."site_config"("key");

-- AddForeignKey
ALTER TABLE "public"."Recipe" ADD CONSTRAINT "Recipe_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."seo_enhancements" ADD CONSTRAINT "seo_enhancements_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "public"."Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."seo_metadata" ADD CONSTRAINT "seo_metadata_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "public"."Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."seo_image_data" ADD CONSTRAINT "seo_image_data_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "public"."Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."seo_performance" ADD CONSTRAINT "seo_performance_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "public"."Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
