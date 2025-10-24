const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testFullFlow() {
  try {
    console.log('\n🔍 Testing Internal Linking System...\n');
    
    // 1. Get recipes
    const recipes = await prisma.recipe.findMany({ take: 3 });
    console.log(`✅ Found ${recipes.length} recipes`);
    recipes.forEach(r => console.log(`   - ${r.title}`));
    
    // 2. Check for existing suggestions
    const existingSuggestions = await prisma.internalLinkSuggestion.findMany();
    console.log(`\n📊 Existing suggestions: ${existingSuggestions.length}`);
    
    // 3. Check orphan pages
    const orphans = await prisma.orphanPage.findMany();
    console.log(`📊 Orphan pages in DB: ${orphans.length}`);
    
    // 4. Check recipe content
    console.log('\n📝 Sample recipe content:');
    if (recipes[0]) {
      const r = recipes[0];
      console.log(`   Title: ${r.title}`);
      console.log(`   Intro length: ${r.intro?.length || 0} chars`);
      console.log(`   Story length: ${r.story?.length || 0} chars`);
      console.log(`   Description length: ${r.description?.length || 0} chars`);
    }
    
    console.log('\n✅ Database is ready!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testFullFlow();
