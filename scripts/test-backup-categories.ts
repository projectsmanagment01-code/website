/**
 * Test script to verify that the backup system now includes categories
 */

import { prisma } from '../lib/prisma';
import { DatabaseBackupService } from '../lib/backup/database';

async function testBackupIncludesCategories() {
  try {
    console.log('🧪 Testing backup system with categories...');
    
    // Check if we have any categories in the database
    const categoryCount = await prisma.category.count();
    console.log(`📂 Found ${categoryCount} categories in database`);
    
    if (categoryCount === 0) {
      console.log('📝 Creating test category...');
      await prisma.category.create({
        data: {
          name: 'Test Category',
          slug: 'test-category',
          description: 'A test category for backup verification',
          image: '/test-image.jpg',
          order: 0,
          isActive: true
        }
      });
      console.log('✅ Test category created');
    }
    
    // Import and test the database backup service
    const databaseService = new DatabaseBackupService();
    
    console.log('🔄 Testing database export...');
    const exportData = await databaseService.exportDatabase();
    
    console.log('📊 Export summary:', {
      recipes: exportData.summary.recipes,
      authors: exportData.summary.authors,
      categories: exportData.summary.categories,
      adminSettings: exportData.summary.adminSettings,
      siteConfig: exportData.summary.siteConfig,
      pageContent: exportData.summary.pageContent,
      apiTokens: exportData.summary.apiTokens,
      media: exportData.summary.media
    });
    
    if (exportData.categories && exportData.categories.length > 0) {
      console.log('✅ Categories are now included in backup!');
      console.log('📂 Category data sample:', exportData.categories[0]);
    } else {
      console.log('❌ Categories are not included in backup');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Singleton handles disconnection
  }
}

testBackupIncludesCategories();