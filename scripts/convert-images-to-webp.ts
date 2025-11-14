/**
 * Convert existing recipe images to WebP format
 * Run with: npx tsx scripts/convert-images-to-webp.ts
 */

import { PrismaClient } from '@prisma/client';
import sharp from 'sharp';
import * as fs from 'fs/promises';
import * as path from 'path';

const prisma = new PrismaClient();

async function convertImagesToWebP() {
  console.log('🔄 Starting image conversion to WebP...\n');

  try {
    // Get all recipes
    const recipes = await prisma.recipe.findMany({
      select: {
        id: true,
        title: true,
        featureImage: true,
        preparationImage: true,
        cookingImage: true,
        finalPresentationImage: true,
        heroImage: true,
        img: true,
        images: true
      }
    });

    console.log(`📊 Found ${recipes.length} recipes to process\n`);

    let converted = 0;
    let skipped = 0;
    let errors = 0;

    for (const recipe of recipes) {
      console.log(`\n📝 Processing: ${recipe.title}`);

      const imageFields = [
        { field: 'featureImage', value: recipe.featureImage },
        { field: 'preparationImage', value: recipe.preparationImage },
        { field: 'cookingImage', value: recipe.cookingImage },
        { field: 'finalPresentationImage', value: recipe.finalPresentationImage },
        { field: 'heroImage', value: recipe.heroImage },
        { field: 'img', value: recipe.img }
      ];

      const updatedFields: any = {};

      for (const { field, value } of imageFields) {
        if (!value || typeof value !== 'string') continue;

        // Skip if already WebP
        if (value.endsWith('.webp')) {
          console.log(`  ✓ ${field}: Already WebP`);
          skipped++;
          continue;
        }

        // Skip external URLs
        if (value.startsWith('http://') || value.startsWith('https://')) {
          console.log(`  ⊘ ${field}: External URL, skipping`);
          skipped++;
          continue;
        }

        try {
          // Construct file paths
          const oldPath = path.join(process.cwd(), 'public', value.replace(/^\//, ''));
          const webpFilename = path.basename(value).replace(/\.(jpg|jpeg|png)$/i, '.webp');
          const webpPath = path.join(path.dirname(oldPath), webpFilename);
          const webpUrl = value.replace(/\.(jpg|jpeg|png)$/i, '.webp');

          // Check if source file exists
          try {
            await fs.access(oldPath);
          } catch {
            console.log(`  ⚠️ ${field}: Source file not found: ${oldPath}`);
            errors++;
            continue;
          }

          // Check if WebP file already exists
          try {
            await fs.access(webpPath);
            console.log(`  ⊘ ${field}: WebP already exists, skipping conversion`);
            // Still update the database path
            updatedFields[field] = webpUrl;
            skipped++;
            continue;
          } catch {
            // WebP doesn't exist, proceed with conversion
          }

          // Convert to WebP
          await sharp(oldPath)
            .webp({ quality: 85 })
            .toFile(webpPath);

          updatedFields[field] = webpUrl;
          console.log(`  ✅ ${field}: Converted to WebP`);
          converted++;

          // Optionally delete old file
          // await fs.unlink(oldPath);

        } catch (error) {
          console.error(`  ❌ ${field}: Error converting - ${error instanceof Error ? error.message : 'Unknown error'}`);
          errors++;
        }
      }

      // Update images array
      if (recipe.images && Array.isArray(recipe.images)) {
        const updatedImages = recipe.images.map(img => {
          if (typeof img !== 'string') return img;
          if (img.endsWith('.webp')) return img;
          if (img.startsWith('http://') || img.startsWith('https://')) return img;
          return img.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        });
        updatedFields.images = updatedImages;
      }

      // Update database if any fields were converted
      if (Object.keys(updatedFields).length > 0) {
        await prisma.recipe.update({
          where: { id: recipe.id },
          data: updatedFields
        });
        console.log(`  💾 Database updated`);
      }
    }

    console.log('\n\n✅ Conversion complete!');
    console.log(`📊 Statistics:`);
    console.log(`   Converted: ${converted}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Errors: ${errors}`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the conversion
convertImagesToWebP()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error);
    process.exit(1);
  });
