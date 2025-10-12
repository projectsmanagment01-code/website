/**
 * Database Connection and Author Fetch Test
 * Run this to diagnose connection issues
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn', 'info']
});

async function testDatabase() {
  console.log('🔍 Testing database connection...\n');
  
  try {
    // Test 1: Connection
    console.log('1️⃣ Testing connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully\n');
    
    // Test 2: Count authors
    console.log('2️⃣ Counting authors...');
    const authorCount = await prisma.author.count();
    console.log(`✅ Found ${authorCount} authors in database\n`);
    
    // Test 3: Fetch all authors
    console.log('3️⃣ Fetching all authors...');
    const authors = await prisma.author.findMany({
      take: 10
    });
    console.log(`✅ Retrieved ${authors.length} authors:`);
    authors.forEach(author => {
      console.log(`   - ${author.name} (ID: ${author.id}, Slug: ${author.slug})`);
    });
    console.log('');
    
    // Test 4: Count API tokens
    console.log('4️⃣ Counting API tokens...');
    const tokenCount = await prisma.apiToken.count();
    console.log(`✅ Found ${tokenCount} API tokens in database\n`);
    
    // Test 5: Fetch API tokens
    console.log('5️⃣ Fetching API tokens...');
    const tokens = await prisma.apiToken.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        createdAt: true,
        isActive: true,
        expiresAt: true
      }
    });
    console.log(`✅ Retrieved ${tokens.length} tokens:`);
    tokens.forEach(token => {
      const status = token.isActive ? '🟢 Active' : '🔴 Inactive';
      const expired = new Date(token.expiresAt) < new Date() ? '⚠️ EXPIRED' : '✅ Valid';
      console.log(`   - ${token.name} (${status}, ${expired})`);
    });
    console.log('');
    
    // Test 6: Count recipes
    console.log('6️⃣ Counting recipes...');
    const recipeCount = await prisma.recipe.count();
    console.log(`✅ Found ${recipeCount} recipes in database\n`);
    
    console.log('🎉 ALL TESTS PASSED!\n');
    console.log('📊 Summary:');
    console.log(`   - Authors: ${authorCount}`);
    console.log(`   - API Tokens: ${tokenCount}`);
    console.log(`   - Recipes: ${recipeCount}`);
    
  } catch (error) {
    console.error('\n❌ ERROR OCCURRED:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.code) {
      console.error('Error code:', error.code);
    }
    
    if (error.meta) {
      console.error('Error meta:', JSON.stringify(error.meta, null, 2));
    }
    
    console.error('\nFull error:', error);
    
    // Check specific error types
    if (error.message.includes('authentication failed')) {
      console.error('\n💡 SOLUTION: Check your DATABASE_URL in .env file');
      console.error('   Make sure username and password are correct');
    }
    
    if (error.message.includes('does not exist')) {
      console.error('\n💡 SOLUTION: Run "npx prisma db push" to create tables');
    }
    
    if (error.message.includes('connect')) {
      console.error('\n💡 SOLUTION: Check if PostgreSQL is running on port 5432');
      console.error('   Check if database "recipes" exists');
    }
    
  } finally {
    await prisma.$disconnect();
    console.log('\n👋 Database connection closed');
  }
}

// Run the test
testDatabase()
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
