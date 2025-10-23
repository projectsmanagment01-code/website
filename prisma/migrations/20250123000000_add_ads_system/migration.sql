-- CreateEnum
CREATE TYPE "AdType" AS ENUM ('GOOGLE_ADSENSE', 'CUSTOM_HTML', 'IMAGE', 'SCRIPT');

-- CreateEnum
CREATE TYPE "AdPlacement" AS ENUM ('RECIPE_SIDEBAR', 'RECIPE_BELOW_IMAGE', 'RECIPE_IN_CONTENT', 'RECIPE_CARD', 'HERO_BELOW', 'ARTICLE_SIDEBAR', 'ARTICLE_IN_CONTENT');

-- CreateTable
CREATE TABLE "Ad" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AdType" NOT NULL,
    "placement" "AdPlacement" NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "linkUrl" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "impressionCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "Ad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Ad_placement_isActive_priority_idx" ON "Ad"("placement", "isActive", "priority");
