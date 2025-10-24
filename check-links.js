const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLinks() {
  try {
    const recipes = await prisma.recipe.findMany({
      select: {
        id: true,
        title: true,
        intro: true,
        story: true,
        description: true
      },
      take: 3
    });
    
    console.log('\n🔍 Checking for internal links in recipes...\n');
    
    recipes.forEach(recipe => {
      console.log(`Recipe: ${recipe.title}`);
      
      const fields = ['intro', 'story', 'description'];
      fields.forEach(field => {
        const content = recipe[field] || '';
        const links = content.match(/<a\s+[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/gi);
        
        if (links && links.length > 0) {
          console.log(`  ${field}:`);
          links.forEach(link => {
            const hrefMatch = link.match(/href="([^"]*)"/);
            const textMatch = link.match(/>([^<]*)</);
            if (hrefMatch && textMatch) {
              console.log(`    - "${textMatch[1]}" → ${hrefMatch[1]}`);
            }
          });
        }
      });
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkLinks();
