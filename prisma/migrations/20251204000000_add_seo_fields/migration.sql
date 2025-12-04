-- Add SEO Enhancement Fields to Recipe table
-- These fields are optional (nullable) to maintain backward compatibility

-- Video URL for YouTube embeds
ALTER TABLE "Recipe" ADD COLUMN IF NOT EXISTS "videoUrl" TEXT;

-- Video duration in ISO 8601 format (e.g., "PT5M30S")
ALTER TABLE "Recipe" ADD COLUMN IF NOT EXISTS "videoDuration" TEXT;

-- Nutrition data stored as JSON
ALTER TABLE "Recipe" ADD COLUMN IF NOT EXISTS "nutrition" JSONB;

-- Aggregate rating (1-5 scale)
ALTER TABLE "Recipe" ADD COLUMN IF NOT EXISTS "aggregateRating" DOUBLE PRECISION;

-- Number of reviews
ALTER TABLE "Recipe" ADD COLUMN IF NOT EXISTS "reviewCount" INTEGER;

-- SEO keywords array
ALTER TABLE "Recipe" ADD COLUMN IF NOT EXISTS "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[];
