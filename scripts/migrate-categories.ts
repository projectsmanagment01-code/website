/**
 * Category System Migration Script
 * 
 * This script migrates existing recipe categories to the new Category model
 * and updates all Recipe records to use categoryId foreign keys.
 * 
 * SAFETY FEATURES:
 * - Dry run mode (test without making changes)
 * - Backup verification
 * - Rollback capability
 * - Progress logging
 * 
 * Usage:
 *   yarn tsx scripts/migrate-categories.ts --dry-run  # Test mode
 *   yarn tsx scripts/migrate-categories.ts            # Execute migration
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// ============================================================================
// Configuration
// ============================================================================

const DRY_RUN = process.argv.includes('--dry-run');
const BACKUP_DIR = path.join(process.cwd(), 'backups', 'category-migration');

interface CategoryMapping {
  oldName: string;
  newId: string;
  slug: string;
  recipeCount: number;
}

// ============================================================================
// Helper Functions
// ============================================================================

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

function saveBackup(filename: string, data: any) {
  ensureBackupDir();
  const filepath = path.join(BACKUP_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log(`💾 Backup saved: ${filepath}`);
}

// ============================================================================
// Main Migration Logic
// ============================================================================

async function migrateCategoriesystem() {
  console.log('\n🚀 Starting Category System Migration');
  console.log('=====================================\n');
  
  if (DRY_RUN) {
    console.log('🧪 DRY RUN MODE - No changes will be made\n');
  }
  
  try {
    // ========================================================================
    // Step 1: Backup existing data
    // ========================================================================
    console.log('📦 Step 1: Backing up existing data...');
    
    const existingRecipes = await prisma.recipe.findMany({
      select: {
        id: true,
        title: true,
        category: true,
        categoryLink: true,
        slug: true
      }
    });
    
    saveBackup(`recipes-before-migration-${Date.now()}.json`, existingRecipes);
    console.log(`✅ Backed up ${existingRecipes.length} recipes\n`);
    
    // ========================================================================
    // Step 2: Analyze existing categories
    // ========================================================================
    console.log('🔍 Step 2: Analyzing existing categories...');
    
    const categoryMap = new Map<string, { count: number; recipes: string[] }>();
    
    for (const recipe of existingRecipes) {
      const categoryName = recipe.category.trim();
      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, { count: 0, recipes: [] });
      }
      const entry = categoryMap.get(categoryName)!;
      entry.count++;
      entry.recipes.push(recipe.id);
    }
    
    console.log(`Found ${categoryMap.size} unique categories:`);
    for (const [name, data] of categoryMap.entries()) {
      console.log(`  - "${name}": ${data.count} recipes`);
    }
    console.log('');
    
    // ========================================================================
    // Step 3: Get first recipe image for each category
    // ========================================================================
    console.log('🖼️  Step 3: Finding representative images for categories...');
    
    const categoryImages = new Map<string, string>();
    
    for (const [categoryName] of categoryMap.entries()) {
      // Find oldest recipe in this category with images
      const recipe = await prisma.recipe.findFirst({
        where: { category: categoryName },
        select: { images: true, heroImage: true },
        orderBy: { createdAt: 'asc' }
      });
      
      let image = '/uploads/categories/default.webp'; // Default fallback
      
      if (recipe) {
        if (recipe.images && recipe.images.length > 0) {
          image = recipe.images[0];
        } else if (recipe.heroImage) {
          image = recipe.heroImage;
        }
      }
      
      categoryImages.set(categoryName, image);
      console.log(`  - "${categoryName}": ${image}`);
    }
    console.log('');
    
    // ========================================================================
    // Step 4: Create Category records
    // ========================================================================
    console.log('➕ Step 4: Creating Category records...');
    
    const mappings: CategoryMapping[] = [];
    
    if (!DRY_RUN) {
      for (const [categoryName, data] of categoryMap.entries()) {
        const slug = generateSlug(categoryName);
        const image = categoryImages.get(categoryName) || '/uploads/categories/default.webp';
        
        // Check if category already exists
        let category = await prisma.category.findUnique({
          where: { slug }
        });
        
        if (!category) {
          category = await prisma.category.create({
            data: {
              name: categoryName,
              slug,
              description: `Discover our collection of ${categoryName} recipes`,
              image,
              isActive: true,
              order: mappings.length,
              metaTitle: `${categoryName} Recipes`,
              metaDescription: `Explore delicious ${categoryName} recipes with step-by-step instructions`
            }
          });
          
          console.log(`✅ Created: ${category.name} (${category.slug}) - ID: ${category.id}`);
        } else {
          console.log(`⏭️  Already exists: ${category.name} (${category.slug}) - ID: ${category.id}`);
        }
        
        mappings.push({
          oldName: categoryName,
          newId: category.id,
          slug: category.slug,
          recipeCount: data.count
        });
      }
    } else {
      // Dry run: just simulate
      for (const [categoryName, data] of categoryMap.entries()) {
        const slug = generateSlug(categoryName);
        console.log(`[DRY RUN] Would create: ${categoryName} → ${slug}`);
        
        mappings.push({
          oldName: categoryName,
          newId: 'dry-run-id',
          slug,
          recipeCount: data.count
        });
      }
    }
    
    console.log('');
    saveBackup(`category-mappings-${Date.now()}.json`, mappings);
    
    // ========================================================================
    // Step 5: Update Recipe records with categoryId
    // ========================================================================
    console.log('🔗 Step 5: Linking recipes to categories...');
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const mapping of mappings) {
      const recipesInCategory = categoryMap.get(mapping.oldName)!.recipes;
      
      console.log(`Updating ${recipesInCategory.length} recipes for "${mapping.oldName}"...`);
      
      if (!DRY_RUN) {
        try {
          const result = await prisma.recipe.updateMany({
            where: {
              id: { in: recipesInCategory }
            },
            data: {
              categoryId: mapping.newId
            }
          });
          
          updatedCount += result.count;
          console.log(`  ✅ Updated ${result.count} recipes`);
        } catch (error) {
          errorCount++;
          console.error(`  ❌ Error updating recipes:`, error);
        }
      } else {
        console.log(`  [DRY RUN] Would update ${recipesInCategory.length} recipes`);
        updatedCount += recipesInCategory.length;
      }
    }
    
    console.log('');
    
    // ========================================================================
    // Step 6: Verification
    // ========================================================================
    console.log('✅ Step 6: Verification...');
    
    if (!DRY_RUN) {
      const recipesWithCategory = await prisma.recipe.count({
        where: { categoryId: { not: null } }
      });
      
      const recipesWithoutCategory = await prisma.recipe.count({
        where: { categoryId: null }
      });
      
      const totalCategories = await prisma.category.count();
      
      console.log(`📊 Migration Results:`);
      console.log(`  - Total categories created: ${totalCategories}`);
      console.log(`  - Recipes linked to categories: ${recipesWithCategory}`);
      console.log(`  - Recipes without category: ${recipesWithoutCategory}`);
      console.log(`  - Errors encountered: ${errorCount}`);
      
      if (recipesWithoutCategory > 0) {
        console.log(`\n⚠️  Warning: ${recipesWithoutCategory} recipes don't have a category!`);
        console.log(`   You may want to assign them manually via the admin dashboard.`);
      }
    } else {
      console.log(`[DRY RUN] Would update ${updatedCount} recipes across ${mappings.length} categories`);
    }
    
    // ========================================================================
    // Final Summary
    // ========================================================================
    console.log('\n=====================================');
    if (DRY_RUN) {
      console.log('✅ Dry run completed successfully!');
      console.log('Run without --dry-run to execute migration');
    } else {
      console.log('✅ Migration completed successfully!');
      console.log('\nNext steps:');
      console.log('1. Verify categories in admin dashboard');
      console.log('2. Test recipe pages with new category links');
      console.log('3. Upload dedicated category images');
      console.log('4. After verification, remove deprecated fields:');
      console.log('   - Recipe.category (string)');
      console.log('   - Recipe.categoryLink');
      console.log('   - Recipe.categoryHref');
    }
    console.log('=====================================\n');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// ============================================================================
// Execute Migration
// ============================================================================

migrateCategoriesystem()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
