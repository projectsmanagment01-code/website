/**
 * COMPREHENSIVE Migration Script: Move ALL Content to Database
 * 
 * This script migrates ALL content management data to the database:
 * - Home content (hero, social links) ✅ Already migrated
 * - Site settings (logo, footer, etc.) ✅ Already migrated
 * - Privacy Policy
 * - Terms of Service
 * - About Page
 * - Contact Page
 * - FAQ Page
 * - Disclaimer Page
 * - Cookies Policy
 * 
 * Run with: npx tsx scripts/migrate-all-content-to-db.ts
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const CONFIG_DIR = path.join(process.cwd(), 'data', 'config');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'content');

interface PageMigration {
  page: string;
  configFile?: string; // File in data/config/
  uploadsFile?: string; // File in uploads/content/
  description: string;
}

const PAGES_TO_MIGRATE: PageMigration[] = [
  {
    page: 'privacy',
    uploadsFile: 'privacy.json',
    description: 'Privacy Policy',
  },
  {
    page: 'terms',
    uploadsFile: 'terms.json',
    description: 'Terms of Service',
  },
  {
    page: 'about',
    uploadsFile: 'about.json',
    description: 'About Page',
  },
  {
    page: 'contact',
    configFile: 'contact-content.json',
    uploadsFile: 'contact.json',
    description: 'Contact Page',
  },
  {
    page: 'faq',
    uploadsFile: 'faq.json',
    description: 'FAQ Page',
  },
  {
    page: 'disclaimer',
    uploadsFile: 'disclaimer.json',
    description: 'Disclaimer Page',
  },
  {
    page: 'cookies',
    configFile: 'cookies-content.json',
    uploadsFile: 'cookies.json',
    description: 'Cookie Policy',
  },
];

async function migratePageContent(migration: PageMigration): Promise<boolean> {
  console.log(`\n📄 Migrating ${migration.description}...`);

  let data: any = null;

  // Try config directory first
  if (migration.configFile) {
    const configPath = path.join(CONFIG_DIR, migration.configFile);
    if (fs.existsSync(configPath)) {
      console.log(`   Found in config: ${migration.configFile}`);
      try {
        data = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      } catch (error) {
        console.error(`   ❌ Error reading config file:`, error);
      }
    }
  }

  // Try uploads directory if not found in config
  if (!data && migration.uploadsFile) {
    const uploadsPath = path.join(UPLOADS_DIR, migration.uploadsFile);
    if (fs.existsSync(uploadsPath)) {
      console.log(`   Found in uploads: ${migration.uploadsFile}`);
      try {
        data = JSON.parse(fs.readFileSync(uploadsPath, 'utf-8'));
      } catch (error) {
        console.error(`   ❌ Error reading uploads file:`, error);
      }
    }
  }

  if (!data) {
    console.log(`   ⚠️  No JSON file found, skipping...`);
    return false;
  }

  // Prepare data for database
  const pageContentData: any = {
    page: migration.page,
    title: data.title || null,
    heroTitle: data.heroTitle || null,
    heroDescription: data.heroDescription || null,
    heroIntro: data.heroIntro || null,
    content: data.content || data.mainContent || null,
    metaTitle: data.metaTitle || null,
    metaDescription: data.metaDescription || null,
    data: null,
  };

  // Handle special data structures
  if (migration.page === 'contact' && data.cards) {
    pageContentData.data = { cards: data.cards };
  } else if (migration.page === 'faq' && data.categories) {
    pageContentData.data = { categories: data.categories };
  } else if (data.data) {
    pageContentData.data = data.data;
  }

  // Save to database
  try {
    await prisma.pageContent.upsert({
      where: { page: migration.page },
      update: {
        ...pageContentData,
        updatedAt: new Date(),
      },
      create: pageContentData,
    });
    console.log(`   ✅ ${migration.description} migrated successfully`);
    return true;
  } catch (error) {
    console.error(`   ❌ Error saving to database:`, error);
    return false;
  }
}

async function migrateAllContent() {
  console.log('🚀 Starting COMPREHENSIVE content migration to database...\n');
  console.log('📋 This will migrate ALL page content to prevent deployment overwrites\n');

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  // Migrate all pages
  for (const migration of PAGES_TO_MIGRATE) {
    const success = await migratePageContent(migration);
    if (success) {
      successCount++;
    } else {
      skipCount++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('✨ Migration Summary');
  console.log('='.repeat(60));
  console.log(`✅ Successfully migrated: ${successCount} pages`);
  console.log(`⚠️  Skipped (no data found): ${skipCount} pages`);
  console.log(`❌ Errors: ${errorCount} pages`);
  console.log('='.repeat(60));

  if (successCount > 0) {
    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. ✅ Data is now in database');
    console.log('2. Add JSON files to .gitignore');
    console.log('3. Update API endpoints to use database');
    console.log('4. Test locally');
    console.log('5. Deploy to production');
    console.log('6. Run this script on production server\n');
  }
}

// Run migration
migrateAllContent()
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
