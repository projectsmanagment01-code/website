/**
 * Get Category IDs from Database
 * 
 * Simple script to list all categories with their IDs
 * Usage: node get-categories.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getCategories() {
  try {
    console.log('📂 Fetching all categories...\n');

    const categories = await prisma.category.findMany({
      orderBy: {
        title: 'asc'
      }
    });

    if (categories.length === 0) {
      console.log('⚠️  No categories found in database.');
      console.log('   Please create categories first.');
      return;
    }

    console.log(`✅ Found ${categories.length} categories:\n`);
    console.log('┌─────────────────────────────────┬──────────────────┬─────────────────────────┐');
    console.log('│ ID                              │ Slug             │ Title                   │');
    console.log('├─────────────────────────────────┼──────────────────┼─────────────────────────┤');

    categories.forEach(category => {
      const id = category.id.padEnd(33);
      const slug = category.slug.padEnd(16);
      const title = category.title.padEnd(23);
      console.log(`│ ${id}│ ${slug}│ ${title}│`);
    });

    console.log('└─────────────────────────────────┴──────────────────┴─────────────────────────┘');

    console.log('\n📝 Example usage:');
    console.log('\nCreate author with categories:');
    console.log('```json');
    console.log('{');
    console.log('  "name": "Chef Name",');
    console.log('  "bio": "Chef bio",');
    console.log('  "categoryIds": [');
    
    if (categories.length >= 2) {
      console.log(`    "${categories[0].id}",  // ${categories[0].title}`);
      console.log(`    "${categories[1].id}"   // ${categories[1].title}`);
    } else if (categories.length === 1) {
      console.log(`    "${categories[0].id}"   // ${categories[0].title}`);
    }
    
    console.log('  ]');
    console.log('}');
    console.log('```');

    console.log('\n✨ Copy the IDs you need for creating/updating authors');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

getCategories();
