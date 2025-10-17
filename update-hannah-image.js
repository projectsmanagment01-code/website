const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateHannahImage() {
  try {
    // First, let's see what's currently in the database
    const current = await prisma.author.findUnique({
      where: { slug: 'hannah' }
    });
    console.log('📝 Current Hannah data:', {
      img: current?.img,
      avatar: current?.avatar
    });

    // Update to correct filename
    const result = await prisma.author.update({
      where: { slug: 'hannah' },
      data: { 
        img: 'woman-cutting-tomatoes-dddsalad.webp',
        avatar: null 
      }
    });
    
    console.log('✅ Updated Hannah author image:', {
      img: result.img,
      avatar: result.avatar
    });
  } catch (error) {
    console.error('❌ Error updating author:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateHannahImage();
