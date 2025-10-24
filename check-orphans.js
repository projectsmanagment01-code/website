const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkOrphans() {
  try {
    const orphans = await prisma.orphanPage.findMany({
      include: {
        recipe: {
          select: {
            title: true,
            slug: true
          }
        }
      }
    });
    
    console.log('\n📊 Orphan Pages Data:\n');
    orphans.forEach(o => {
      console.log(`Recipe: ${o.recipe.title}`);
      console.log(`  - Slug: ${o.recipe.slug}`);
      console.log(`  - Incoming: ${o.incomingLinks}`);
      console.log(`  - Outgoing: ${o.outgoingLinks}`);
      console.log(`  - Is Orphan: ${o.isOrphan}`);
      console.log(`  - Priority: ${o.priority}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrphans();
