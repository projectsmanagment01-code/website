/**
 * Migration Script: Move Configuration from JSON files to Database
 * 
 * This script migrates configuration data from JSON files to the database
 * to prevent deployments from overwriting production customizations.
 * 
 * Run with: npx tsx scripts/migrate-config-to-db.ts
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface HeroConfig {
  heroTitle: string;
  heroDescription: string;
  heroButtonText: string;
  heroButtonLink: string;
  heroBackgroundImage: string;
  metaTitle: string;
  metaDescription: string;
  socialMediaLinks: Array<{
    platform: string;
    url: string;
    enabled: boolean;
    icon: string;
  }>;
  lastUpdated: string;
}

interface SiteConfig {
  logoType: string;
  logoText: string;
  logoTagline: string;
  logoImage: string;
  favicon: string;
  footerCopyright: string;
  footerVersion: string;
  siteTitle: string;
  siteDescription: string;
  siteDomain: string;
  siteUrl: string;
  siteEmail: string;
  lastUpdated: string;
}

async function migrateConfigs() {
  console.log('🚀 Starting configuration migration to database...\n');

  const CONFIG_DIR = path.join(process.cwd(), 'data', 'config');
  
  try {
    // 1. Migrate home.json (hero content + social links)
    const homeJsonPath = path.join(CONFIG_DIR, 'home.json');
    if (fs.existsSync(homeJsonPath)) {
      console.log('📄 Reading home.json...');
      const homeData: HeroConfig = JSON.parse(fs.readFileSync(homeJsonPath, 'utf-8'));
      
      // Store hero content
      await prisma.siteConfig.upsert({
        where: { key: 'hero' },
        update: {
          data: {
            title: homeData.heroTitle,
            description: homeData.heroDescription,
            buttonText: homeData.heroButtonText,
            buttonLink: homeData.heroButtonLink,
            backgroundImage: homeData.heroBackgroundImage,
            metaTitle: homeData.metaTitle,
            metaDescription: homeData.metaDescription,
          },
          updatedAt: new Date(),
        },
        create: {
          key: 'hero',
          data: {
            title: homeData.heroTitle,
            description: homeData.heroDescription,
            buttonText: homeData.heroButtonText,
            buttonLink: homeData.heroButtonLink,
            backgroundImage: homeData.heroBackgroundImage,
            metaTitle: homeData.metaTitle,
            metaDescription: homeData.metaDescription,
          },
        },
      });
      console.log('✅ Hero content migrated');

      // Store social links
      await prisma.siteConfig.upsert({
        where: { key: 'social_links' },
        update: {
          data: homeData.socialMediaLinks,
          updatedAt: new Date(),
        },
        create: {
          key: 'social_links',
          data: homeData.socialMediaLinks,
        },
      });
      console.log('✅ Social links migrated');
    } else {
      console.log('⚠️  home.json not found, skipping...');
    }

    // 2. Migrate site.json
    const siteJsonPath = path.join(CONFIG_DIR, 'site.json');
    if (fs.existsSync(siteJsonPath)) {
      console.log('\n📄 Reading site.json...');
      const siteData: SiteConfig = JSON.parse(fs.readFileSync(siteJsonPath, 'utf-8'));
      
      await prisma.siteConfig.upsert({
        where: { key: 'site' },
        update: {
          data: siteData,
          updatedAt: new Date(),
        },
        create: {
          key: 'site',
          data: siteData,
        },
      });
      console.log('✅ Site config migrated');
    } else {
      console.log('⚠️  site.json not found, skipping...');
    }

    console.log('\n✨ Migration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Run: npm run prisma:migrate -- --name add_site_config');
    console.log('2. Add to .gitignore: data/config/*.json');
    console.log('3. Update API endpoints to read from database');
    console.log('4. Test the changes locally');
    console.log('5. Deploy to production\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateConfigs()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
