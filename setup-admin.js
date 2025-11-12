import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function setupAdminUser() {
  try {
    console.log('🔧 Setting up admin user...');
    
    const adminEmail = 'admin@yourrecipesite.com';
    const defaultPassword = 'admin123';
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);
    
    // Store admin credentials in AdminSettings
    await prisma.adminSettings.upsert({
      where: { key: `admin_password_${adminEmail}` },
      update: { value: hashedPassword },
      create: {
        key: `admin_password_${adminEmail}`,
        value: hashedPassword,
        updatedBy: 'system'
      }
    });
    
    // Store admin username
    await prisma.adminSettings.upsert({
      where: { key: `admin_username_${adminEmail}` },
      update: { value: 'Administrator' },
      create: {
        key: `admin_username_${adminEmail}`,
        value: 'Administrator',
        updatedBy: 'system'
      }
    });
    
    console.log('✅ Admin user setup complete!');
    console.log('📧 Email: admin@yourrecipesite.com');
    console.log('🔑 Password: admin123');
    console.log('');
    console.log('You can now login at: http://localhost:3000/admin/login');
    
  } catch (error) {
    console.error('❌ Error setting up admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupAdminUser();