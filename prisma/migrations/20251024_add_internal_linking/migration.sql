-- CreateTable
CREATE TABLE IF NOT EXISTS "internal_link_suggestions" (
    "id" TEXT NOT NULL,
    "sourceRecipeId" TEXT NOT NULL,
    "targetRecipeId" TEXT NOT NULL,
    "anchorText" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "sentenceContext" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "relevanceScore" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "appliedAt" TIMESTAMP(3),
    "appliedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "internal_link_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "orphan_pages" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "incomingLinks" INTEGER NOT NULL DEFAULT 0,
    "outgoingLinks" INTEGER NOT NULL DEFAULT 0,
    "isOrphan" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "lastChecked" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "suggestions" JSONB,

    CONSTRAINT "orphan_pages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "internal_link_suggestions_sourceRecipeId_idx" ON "internal_link_suggestions"("sourceRecipeId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "internal_link_suggestions_targetRecipeId_idx" ON "internal_link_suggestions"("targetRecipeId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "internal_link_suggestions_status_idx" ON "internal_link_suggestions"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "internal_link_suggestions_relevanceScore_idx" ON "internal_link_suggestions"("relevanceScore");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "orphan_pages_recipeId_idx" ON "orphan_pages"("recipeId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "orphan_pages_recipeId_key" ON "orphan_pages"("recipeId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "orphan_pages_isOrphan_idx" ON "orphan_pages"("isOrphan");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "orphan_pages_priority_idx" ON "orphan_pages"("priority");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "orphan_pages_lastChecked_idx" ON "orphan_pages"("lastChecked");

-- AddForeignKey
ALTER TABLE "internal_link_suggestions" ADD CONSTRAINT IF NOT EXISTS "internal_link_suggestions_sourceRecipeId_fkey" FOREIGN KEY ("sourceRecipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internal_link_suggestions" ADD CONSTRAINT IF NOT EXISTS "internal_link_suggestions_targetRecipeId_fkey" FOREIGN KEY ("targetRecipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orphan_pages" ADD CONSTRAINT IF NOT EXISTS "orphan_pages_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
