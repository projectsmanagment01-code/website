const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    console.log('Testing database models...');
    
    // Test InternalLinkSuggestion
    const suggestions = await prisma.internalLinkSuggestion.findMany({ take: 1 });
    console.log('✅ InternalLinkSuggestion model works');
    
    // Test OrphanPage
    const orphans = await prisma.orphanPage.findMany({ take: 1 });
    console.log('✅ OrphanPage model works');
    
    console.log('All models working correctly!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
