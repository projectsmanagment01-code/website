const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Simulated AI response for testing
async function testAIKeywordExtraction() {
  try {
    console.log('\n🧠 Testing AI Keyword Extraction...\n');
    
    const recipes = await prisma.recipe.findMany({ take: 1 });
    
    if (recipes.length === 0) {
      console.log('No recipes found');
      return;
    }
    
    const recipe = recipes[0];
    console.log(`Testing with recipe: "${recipe.title}"\n`);
    
    // Import the AI extractor
    const { extractKeywordsWithAI } = require('./lib/internal-linking/ai-keyword-extractor.ts');
    
    console.log('Extracting AI keywords...');
    const aiKeywords = await extractKeywordsWithAI(recipe);
    
    console.log(`\n✅ Found ${aiKeywords.length} AI keywords:`);
    aiKeywords.forEach(k => {
      console.log(`  - "${k.text}" (${k.category}, relevance: ${k.relevance})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('GITHUB_TOKEN')) {
      console.log('\n💡 Tip: Set GITHUB_TOKEN environment variable to use AI features');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testAIKeywordExtraction();
