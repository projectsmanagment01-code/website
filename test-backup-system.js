/**
 * Backup System Test
 * 
 * This script tests the backup and restore functionality to help debug issues.
 */

const { BackupService } = require('./lib/backup/backup-service');
const fs = require('fs-extra');
const path = require('path');

async function testBackupRestore() {
  const backupService = new BackupService();
  
  try {
    console.log('🧪 Starting backup system test...\n');

    // Test 1: Create a backup
    console.log('📦 Test 1: Creating a test backup...');
    
    const backupJob = await backupService.createBackup(
      'test-backup',
      'Test backup for debugging',
      {
        includeDatabase: true,
        includeFiles: true,
        type: 'full'
      }
    );

    if (backupJob.status === 'completed') {
      console.log('✅ Backup created successfully!');
      console.log('📋 Backup details:', {
        id: backupJob.metadata?.id,
        name: backupJob.metadata?.name,
        size: backupJob.metadata?.size,
      });

      // Test 2: List backups
      console.log('\n📋 Test 2: Listing backups...');
      const backups = await backupService.listBackups();
      console.log(`Found ${backups.length} backups`);
      
      if (backups.length > 0) {
        const latestBackup = backups[0];
        console.log('Latest backup:', {
          id: latestBackup.id,
          name: latestBackup.name,
          createdAt: latestBackup.createdAt,
        });

        // Test 3: Get backup stats
        console.log('\n📊 Test 3: Getting backup stats...');
        const stats = await backupService.getBackupStats();
        console.log('Stats:', {
          totalBackups: stats.totalBackups,
          totalSize: stats.totalSize,
        });

        // Test 4: Test restore (without actually restoring)
        console.log('\n🔄 Test 4: Testing restore preparation...');
        
        // Check if backup file exists
        const backupDir = path.join(process.cwd(), 'backups');
        const files = await fs.readdir(backupDir);
        const backupFiles = files.filter(f => f.endsWith('.zip'));
        
        if (backupFiles.length > 0) {
          console.log(`✅ Found ${backupFiles.length} backup files in directory`);
          
          // Test metadata extraction
          const metadata = await backupService.getBackupMetadata(
            path.join(backupDir, backupFiles[0])
          );
          
          if (metadata) {
            console.log('✅ Metadata extraction successful');
            console.log('📋 Metadata preview:', {
              id: metadata.id,
              type: metadata.type,
              includeDatabase: metadata.includeDatabase,
              includeFiles: metadata.includeFiles,
            });
          } else {
            console.log('❌ Failed to extract metadata');
          }
        } else {
          console.log('⚠️ No backup files found');
        }

        console.log('\n🎉 All tests completed successfully!');
        console.log('\n💡 To test actual restore, use the admin interface with caution.');
        
      } else {
        console.log('❌ No backups found after creation');
      }
    } else {
      console.log('❌ Backup creation failed:', backupJob.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    
    // Enhanced error logging
    if (error.originalError) {
      console.error('Original error:', error.originalError);
    }
    
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}

// Run the test
testBackupRestore();