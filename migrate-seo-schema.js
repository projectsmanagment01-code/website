/**
 * Script to migrate SEO schema and regenerate Prisma client
 * Run this script with: node migrate-seo-schema.js
 */

const { execSync } = require('child_process');

console.log('🔄 Starting SEO schema migration...\n');

try {
  console.log('Step 1: Pushing schema to database...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  
  console.log('\n✅ Schema pushed successfully!\n');
  
  console.log('Step 2: Regenerating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('\n✅ Prisma client regenerated!\n');
  console.log('🎉 Migration complete! Restart your dev server if needed.');
  
} catch (error) {
  console.error('\n❌ Migration failed:', error.message);
  process.exit(1);
}
