/*
  Warnings:

  - The values [RECIPE_SIDEBAR,RECIPE_BELOW_IMAGE,RECIPE_IN_CONTENT,RECIPE_CARD,HERO_BELOW,ARTICLE_SIDEBAR,ARTICLE_IN_CONTENT] on the enum `AdPlacement` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `data` on table `site_config` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."AdPlacement_new" AS ENUM ('recipe_sidebar_top', 'recipe_sidebar_middle', 'recipe_sidebar_bottom', 'recipe_below_image', 'recipe_in_content_1', 'recipe_in_content_2', 'recipe_in_content_3', 'recipe_card_top', 'recipe_card_bottom', 'home_hero_below', 'category_top', 'search_top', 'article_sidebar', 'article_in_content');
ALTER TABLE "public"."Ad" ALTER COLUMN "placement" TYPE "public"."AdPlacement_new" USING ("placement"::text::"public"."AdPlacement_new");
ALTER TYPE "public"."AdPlacement" RENAME TO "AdPlacement_old";
ALTER TYPE "public"."AdPlacement_new" RENAME TO "AdPlacement";
DROP TYPE "public"."AdPlacement_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."Recipe" DROP CONSTRAINT "Recipe_categoryId_fkey";

-- DropIndex
DROP INDEX "public"."orphan_pages_recipeId_idx";

-- AlterTable
ALTER TABLE "public"."site_config" ALTER COLUMN "data" SET NOT NULL;

-- DropTable
DROP TABLE "public"."Category";

-- CreateTable
CREATE TABLE "public"."categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT NOT NULL,
    "alt" TEXT,
    "sizes" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "type" TEXT,
    "parentId" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."page_content" (
    "id" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "title" TEXT,
    "heroTitle" TEXT,
    "heroDescription" TEXT,
    "heroIntro" TEXT,
    "content" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "page_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."media" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "thumbnailUrl" TEXT,
    "alt" TEXT,
    "caption" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "recipeId" TEXT,
    "authorId" TEXT,
    "categoryId" TEXT,
    "uploadedBy" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "public"."categories"("slug");

-- CreateIndex
CREATE INDEX "categories_slug_idx" ON "public"."categories"("slug");

-- CreateIndex
CREATE INDEX "categories_isActive_idx" ON "public"."categories"("isActive");

-- CreateIndex
CREATE INDEX "categories_order_idx" ON "public"."categories"("order");

-- CreateIndex
CREATE INDEX "categories_type_idx" ON "public"."categories"("type");

-- CreateIndex
CREATE INDEX "categories_parentId_idx" ON "public"."categories"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "page_content_page_key" ON "public"."page_content"("page");

-- CreateIndex
CREATE INDEX "media_category_idx" ON "public"."media"("category");

-- CreateIndex
CREATE INDEX "media_filename_idx" ON "public"."media"("filename");

-- CreateIndex
CREATE INDEX "media_uploadedAt_idx" ON "public"."media"("uploadedAt");

-- CreateIndex
CREATE INDEX "media_recipeId_idx" ON "public"."media"("recipeId");

-- CreateIndex
CREATE INDEX "media_authorId_idx" ON "public"."media"("authorId");

-- CreateIndex
CREATE INDEX "media_categoryId_idx" ON "public"."media"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "media_category_filename_key" ON "public"."media"("category", "filename");

-- CreateIndex
CREATE INDEX "Recipe_categoryId_idx" ON "public"."Recipe"("categoryId");

-- CreateIndex
CREATE INDEX "Recipe_status_idx" ON "public"."Recipe"("status");

-- CreateIndex
CREATE INDEX "Recipe_createdAt_idx" ON "public"."Recipe"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."Recipe" ADD CONSTRAINT "Recipe_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."categories" ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
