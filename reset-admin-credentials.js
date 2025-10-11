const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetAdminCredentials() {
  console.log('🔄 Resetting admin credentials to default values...');
  
  const adminEmail = "admin@guelma.com";
  
  try {
    // Delete existing password hash (so it falls back to default)
    await prisma.adminSettings.deleteMany({
      where: { 
        key: `admin_password_${adminEmail}`
      }
    });
    
    // Delete existing username (so it falls back to default)
    await prisma.adminSettings.deleteMany({
      where: { 
        key: `admin_username_${adminEmail}`
      }
    });
    
    console.log('✅ Admin credentials have been reset to default values:');
    console.log('');
    console.log('📧 Email/Username: admin@guelma.com');
    console.log('🔑 Password: admin123');
    console.log('');
    console.log('🌐 Admin Login URL: http://localhost:3000/admin/login');
    console.log('');
    console.log('⚠️  Please change these credentials after your first login!');
    
  } catch (error) {
    console.error('❌ Error resetting credentials:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminCredentials();