/**
 * Migration Script: Move Content from AdminSettings to PageContent table
 * 
 * This migrates all static page content from the old AdminSettings system
 * to the new dedicated PageContent table.
 * 
 * Run with: npx tsx scripts/migrate-admin-settings-to-pages.ts
 */

import { prisma } from '../lib/prisma';

async function migrateFromAdminSettings() {
  console.log('🚀 Migrating page content from AdminSettings to PageContent table...\n');

  try {
    // Get all admin settings
    const settings = await prisma.adminSettings.findMany();
    const settingsMap = new Map(settings.map(s => [s.key, s.value]));

    const staticPages = {
      about: settingsMap.get('static_pages_about') || '',
      contact: settingsMap.get('static_pages_contact') || '',
      privacy: settingsMap.get('static_pages_privacy') || '',
      terms: settingsMap.get('static_pages_terms') || '',
      faq: settingsMap.get('static_pages_faq') || '',
      disclaimer: settingsMap.get('static_pages_disclaimer') || '',
      cookies: settingsMap.get('static_pages_cookies') || '',
    };

    const aboutPageContent = settingsMap.get('aboutPageContent');
    let successCount = 0;

    // Migrate each page
    for (const [pageName, content] of Object.entries(staticPages)) {
      if (content && content.trim()) {
        console.log(`📄 Migrating ${pageName} page...`);
        
        const pageData: any = {
          page: pageName,
          content: content,
          title: pageName.charAt(0).toUpperCase() + pageName.slice(1),
          metaTitle: `${pageName.charAt(0).toUpperCase() + pageName.slice(1)} - Recipe Website`,
          metaDescription: `${pageName.charAt(0).toUpperCase() + pageName.slice(1)} page content`,
        };

        // Add disclaimer hero fields if available
        if (pageName === 'disclaimer') {
          pageData.heroTitle = settingsMap.get('static_pages_disclaimerHeroTitle') || null;
          pageData.heroIntro = settingsMap.get('static_pages_disclaimerHeroIntro') || null;
        }

        // Add about page structured data if available
        if (pageName === 'about' && aboutPageContent) {
          try {
            const aboutData = JSON.parse(aboutPageContent);
            pageData.heroTitle = aboutData.heroTitle || null;
            pageData.heroDescription = aboutData.heroSubtitle || null;
            pageData.metaTitle = aboutData.metaTitle || null;
            pageData.metaDescription = aboutData.metaDescription || null;
            pageData.data = aboutData;
          } catch (error) {
            console.log(`   ⚠️  Could not parse about page JSON, using content only`);
          }
        }

        await prisma.pageContent.upsert({
          where: { page: pageName },
          update: {
            ...pageData,
            updatedAt: new Date(),
          },
          create: pageData,
        });

        console.log(`   ✅ ${pageName} migrated successfully`);
        successCount++;
      } else {
        console.log(`   ⚠️  ${pageName} has no content, skipping...`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✨ Migration Summary');
    console.log('='.repeat(60));
    console.log(`✅ Successfully migrated: ${successCount} pages`);
    console.log(`⚠️  Skipped (no content): ${7 - successCount} pages`);
    console.log('='.repeat(60));

    if (successCount > 0) {
      console.log('\n🎉 Migration completed successfully!');
      console.log('\n📋 Next steps:');
      console.log('1. ✅ Page content is now in database');
      console.log('2. Test each page to ensure content displays correctly');
      console.log('3. Update content via admin panel');
      console.log('4. Content will now persist across deployments\n');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateFromAdminSettings()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
