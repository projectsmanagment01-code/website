/*
  Warnings:

  - The primary key for the `Recipe` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `authorId` on the `Recipe` table. All the data in the column will be lost.
  - You are about to drop the column `cookTime` on the `Recipe` table. All the data in the column will be lost.
  - You are about to drop the column `difficulty` on the `Recipe` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Recipe` table. All the data in the column will be lost.
  - You are about to drop the column `prepTime` on the `Recipe` table. All the data in the column will be lost.
  - You are about to drop the column `publishDate` on the `Recipe` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `Recipe` table. All the data in the column will be lost.
  - You are about to drop the column `servings` on the `Recipe` table. All the data in the column will be lost.
  - You are about to drop the column `whyYoullLoveThis` on the `Recipe` table. All the data in the column will be lost.
  - The `ingredients` column on the `Recipe` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `instructions` column on the `Recipe` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `CookingProcess` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IngredientGuide` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Recipe` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `allergyInfo` to the `Recipe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `author` to the `Recipe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryLink` to the `Recipe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `featuredText` to the `Recipe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `heroImage` to the `Recipe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `img` to the `Recipe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `intro` to the `Recipe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nutritionDisclaimer` to the `Recipe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serving` to the `Recipe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shortDescription` to the `Recipe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Recipe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storage` to the `Recipe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `story` to the `Recipe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `testimonial` to the `Recipe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedDate` to the `Recipe` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."CookingProcess" DROP CONSTRAINT "CookingProcess_recipeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."IngredientGuide" DROP CONSTRAINT "IngredientGuide_recipeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Recipe" DROP CONSTRAINT "Recipe_authorId_fkey";

-- AlterTable
ALTER TABLE "public"."Recipe" DROP CONSTRAINT "Recipe_pkey",
DROP COLUMN "authorId",
DROP COLUMN "cookTime",
DROP COLUMN "difficulty",
DROP COLUMN "image",
DROP COLUMN "prepTime",
DROP COLUMN "publishDate",
DROP COLUMN "rating",
DROP COLUMN "servings",
DROP COLUMN "whyYoullLoveThis",
ADD COLUMN     "allergyInfo" TEXT NOT NULL,
ADD COLUMN     "author" JSONB NOT NULL,
ADD COLUMN     "categoryHref" TEXT,
ADD COLUMN     "categoryLink" TEXT NOT NULL,
ADD COLUMN     "completeProcess" JSONB,
ADD COLUMN     "essIngredientGuide" JSONB,
ADD COLUMN     "faq" JSONB,
ADD COLUMN     "featuredText" TEXT NOT NULL,
ADD COLUMN     "heroImage" TEXT NOT NULL,
ADD COLUMN     "href" TEXT,
ADD COLUMN     "imageAlt" TEXT,
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "img" TEXT NOT NULL,
ADD COLUMN     "ingredientGuide" JSONB,
ADD COLUMN     "intro" TEXT NOT NULL,
ADD COLUMN     "mustKnowTips" TEXT[],
ADD COLUMN     "notes" TEXT[],
ADD COLUMN     "nutritionDisclaimer" TEXT NOT NULL,
ADD COLUMN     "professionalSecrets" TEXT[],
ADD COLUMN     "questions" JSONB,
ADD COLUMN     "recipeInfo" JSONB,
ADD COLUMN     "relatedRecipes" JSONB,
ADD COLUMN     "sections" JSONB,
ADD COLUMN     "serving" TEXT NOT NULL,
ADD COLUMN     "shortDescription" TEXT NOT NULL,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "storage" TEXT NOT NULL,
ADD COLUMN     "story" TEXT NOT NULL,
ADD COLUMN     "testimonial" TEXT NOT NULL,
ADD COLUMN     "timing" JSONB,
ADD COLUMN     "tools" TEXT[],
ADD COLUMN     "updatedDate" TEXT NOT NULL,
ADD COLUMN     "whyYouLove" JSONB,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
DROP COLUMN "ingredients",
ADD COLUMN     "ingredients" JSONB,
DROP COLUMN "instructions",
ADD COLUMN     "instructions" JSONB,
ADD CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Recipe_id_seq";

-- DropTable
DROP TABLE "public"."CookingProcess";

-- DropTable
DROP TABLE "public"."IngredientGuide";

-- DropTable
DROP TABLE "public"."User";

-- CreateTable
CREATE TABLE "public"."Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "sizes" TEXT,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NavigationItem" (
    "id" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "iconSrc" TEXT NOT NULL,
    "iconClassName" TEXT NOT NULL,
    "label" TEXT,

    CONSTRAINT "NavigationItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "public"."Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Recipe_slug_key" ON "public"."Recipe"("slug");
