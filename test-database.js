/**
 * Database Connection Test
 * Run this to verify database connectivity and check for data
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn']
});

async function testDatabase() {
  console.log('🔍 Testing database connection...\n');
  
  try {
    // Test 1: Connection
    console.log('1️⃣ Testing connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully\n');
    
    // Test 2: Check Authors
    console.log('2️⃣ Checking Authors table...');
    const authorCount = await prisma.author.count();
    console.log(`✅ Authors table accessible. Found ${authorCount} authors\n`);
    
    if (authorCount > 0) {
      const authors = await prisma.author.findMany({ take: 3 });
      console.log('📋 Sample authors:');
      authors.forEach(author => {
        console.log(`   - ${author.name} (ID: ${author.id})`);
      });
      console.log('');
    }
    
    // Test 3: Check API Tokens
    console.log('3️⃣ Checking ApiToken table...');
    const tokenCount = await prisma.apiToken.count();
    console.log(`✅ ApiToken table accessible. Found ${tokenCount} tokens\n`);
    
    if (tokenCount > 0) {
      const tokens = await prisma.apiToken.findMany({ 
        take: 3,
        select: {
          name: true,
          isActive: true,
          createdBy: true,
          createdAt: true
        }
      });
      console.log('📋 Sample tokens:');
      tokens.forEach(token => {
        console.log(`   - ${token.name} (Active: ${token.isActive}, Created by: ${token.createdBy})`);
      });
      console.log('');
    }
    
    // Test 4: Check Recipes
    console.log('4️⃣ Checking Recipe table...');
    const recipeCount = await prisma.recipe.count();
    console.log(`✅ Recipe table accessible. Found ${recipeCount} recipes\n`);
    
    // Test 5: Check Admin User
    console.log('5️⃣ Checking Admin table...');
    const adminCount = await prisma.admin.count();
    console.log(`✅ Admin table accessible. Found ${adminCount} admins\n`);
    
    if (adminCount > 0) {
      const admins = await prisma.admin.findMany({
        select: {
          username: true,
          email: true,
          createdAt: true
        }
      });
      console.log('📋 Admin users:');
      admins.forEach(admin => {
        console.log(`   - ${admin.username} (${admin.email})`);
      });
      console.log('');
    }
    
    console.log('✅ All database tests passed!\n');
    console.log('📊 Summary:');
    console.log(`   - Authors: ${authorCount}`);
    console.log(`   - API Tokens: ${tokenCount}`);
    console.log(`   - Recipes: ${recipeCount}`);
    console.log(`   - Admins: ${adminCount}`);
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    console.error('\n💡 Possible issues:');
    console.error('   1. Database is not running');
    console.error('   2. Connection string is incorrect');
    console.error('   3. Tables do not exist (run: npx prisma db push)');
    console.error('   4. Permissions issue\n');
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
