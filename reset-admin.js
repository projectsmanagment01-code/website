/**
 * Reset Admin Credentials
 * Use this to set or reset your admin username and password
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function resetAdminCredentials() {
  console.log('🔐 Admin Credentials Reset Tool\n');
  console.log('This will set/reset your admin login credentials.\n');

  try {
    const adminEmail = "admin@yourrecipesite.com";

    // Get new username
    const username = await question('Enter new username (or press Enter for "admin"): ');
    const finalUsername = username.trim() || 'admin';

    // Get new password
    const password = await question('Enter new password (or press Enter for "admin123"): ');
    const finalPassword = password.trim() || 'admin123';

    // Hash the password
    console.log('\n🔒 Hashing password...');
    const hashedPassword = await bcrypt.hash(finalPassword, 10);

    // Save to database
    console.log('💾 Saving to database...');

    await prisma.adminSettings.upsert({
      where: { key: `admin_username_${adminEmail}` },
      update: { 
        value: finalUsername,
        updatedAt: new Date(),
        updatedBy: 'reset-script'
      },
      create: { 
        key: `admin_username_${adminEmail}`,
        value: finalUsername,
        updatedBy: 'reset-script'
      }
    });

    await prisma.adminSettings.upsert({
      where: { key: `admin_password_${adminEmail}` },
      update: { 
        value: hashedPassword,
        updatedAt: new Date(),
        updatedBy: 'reset-script'
      },
      create: { 
        key: `admin_password_${adminEmail}`,
        value: hashedPassword,
        updatedBy: 'reset-script'
      }
    });

    console.log('\n✅ Admin credentials updated successfully!\n');
    console.log('─────────────────────────────────────');
    console.log('📋 New Credentials:');
    console.log(`   Username: ${finalUsername}`);
    console.log(`   Email:    ${adminEmail}`);
    console.log(`   Password: ${finalPassword.replace(/./g, '*')}`);
    console.log('─────────────────────────────────────\n');
    console.log('🌐 Login at: http://localhost:3001/admin/login\n');
    console.log('⚠️  Save these credentials in a secure location!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

resetAdminCredentials();
