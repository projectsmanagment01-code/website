/**
 * Recipe Author Migration Script
 * 
 * This script handles the migration from embedded author objects to authorId references
 * Run this after updating the JSON to migrate to the new system
 */

import { prisma } from '../lib/prisma';
import { processRecipeAuthor } from '../lib/author-integration';

async function migrateRecipeAuthors() {
  console.log('🚀 Starting recipe author migration...');

  try {
    // Step 1: Create or find the author from the recipe.json
    const authorData = {
      name: "Emily Smith",
      link: "/authors/emily-smith", 
      avatar: "https://ext.same-assets.com/3912301781/917733602.jpeg",
      bio: "Food enthusiast sharing approachable recipes for home cooks of all skill levels."
    };

    console.log('📝 Processing author:', authorData.name);
    const authorId = await processRecipeAuthor(authorData);
    console.log('✅ Author processed with ID:', authorId);

    // Step 2: Display the author ID for manual JSON update
    console.log('');
    console.log('🔧 UPDATE NEEDED:');
    console.log('Replace the author object in recipe.json with:');
    console.log(`"authorId": "${authorId}"`);
    console.log('');
    console.log('Remove these fields:');
    console.log('"author": {');
    console.log('  "name": "Emily Smith",');
    console.log('  "link": "/authors/emily-smith",');
    console.log('  "avatar": "https://ext.same-assets.com/3912301781/917733602.jpeg",');
    console.log('  "bio": "Food enthusiast sharing approachable recipes for home cooks of all skill levels."');
    console.log('},');

    return authorId;
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  migrateRecipeAuthors()
    .then((authorId) => {
      console.log('✅ Migration completed successfully!');
      console.log('Author ID:', authorId);
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

export { migrateRecipeAuthors };