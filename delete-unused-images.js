/**
 * Delete Unused Images Script
 * 
 * This script deletes the unused images identified by the analysis.
 * Run this after you've confirmed the list is correct.
 */

const fs = require('fs-extra');
const path = require('path');

const unusedImagePaths = [
  'C:\\Users\\Administrator\\Desktop\\Blogging Project\\Website_project\\Walid-Version\\uploads\\favicon\\1759778702801-uw53dqwtla-android-chrome-512x512.webp',
  'C:\\Users\\Administrator\\Desktop\\Blogging Project\\Website_project\\Walid-Version\\uploads\\general\\1759185637503-3h1hpgxkw9x-a (2).webp',
  'C:\\Users\\Administrator\\Desktop\\Blogging Project\\Website_project\\Walid-Version\\uploads\\general\\1759185684697-uctquox2hz-a (2).webp',
  'C:\\Users\\Administrator\\Desktop\\Blogging Project\\Website_project\\Walid-Version\\uploads\\general\\1759255938822-79rgdenh6nl-a (15).webp',
  'C:\\Users\\Administrator\\Desktop\\Blogging Project\\Website_project\\Walid-Version\\uploads\\general\\1760038632616-c5jygie592-a (1).webp',
  'C:\\Users\\Administrator\\Desktop\\Blogging Project\\Website_project\\Walid-Version\\uploads\\general\\a (5).webp',
  'C:\\Users\\Administrator\\Desktop\\Blogging Project\\Website_project\\Walid-Version\\uploads\\logos\\1759780045914-jcpjve3otp-android-chrome-512x512 (2).webp'
];

async function deleteUnusedImages() {
  console.log('🗑️ Starting deletion of unused images...\n');
  
  let deletedCount = 0;
  let totalSize = 0;
  const errors = [];

  for (const imagePath of unusedImagePaths) {
    try {
      if (await fs.pathExists(imagePath)) {
        const stats = await fs.stat(imagePath);
        const sizeKB = Math.round(stats.size / 1024);
        totalSize += stats.size;
        
        await fs.remove(imagePath);
        deletedCount++;
        
        console.log(`✅ Deleted: ${path.basename(imagePath)} (${sizeKB} KB)`);
      } else {
        console.log(`⚠️ File not found: ${path.basename(imagePath)}`);
      }
    } catch (error) {
      errors.push(`❌ Failed to delete ${path.basename(imagePath)}: ${error.message}`);
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('📊 DELETION SUMMARY');
  console.log('═'.repeat(60));
  console.log(`Total files processed: ${unusedImagePaths.length}`);
  console.log(`Successfully deleted: ${deletedCount}`);
  console.log(`Space freed: ${Math.round(totalSize / (1024 * 1024))} MB`);
  
  if (errors.length > 0) {
    console.log(`\n❌ Errors encountered:`);
    errors.forEach(error => console.log(`   ${error}`));
  }
  
  if (deletedCount > 0) {
    console.log('\n🎉 Cleanup complete! Your uploads directory is now optimized.');
  }
}

// Ask for confirmation before deleting
console.log('⚠️ WARNING: This will permanently delete the following unused images:');
console.log('─'.repeat(60));
unusedImagePaths.forEach((path, index) => {
  console.log(`${index + 1}. ${path}`);
});
console.log('─'.repeat(60));
console.log('\nPress Ctrl+C to cancel, or run the script with --confirm to proceed.');

// Check for --confirm flag
if (process.argv.includes('--confirm')) {
  deleteUnusedImages();
} else {
  console.log('\nTo proceed with deletion, run:');
  console.log('node delete-unused-images.js --confirm');
}