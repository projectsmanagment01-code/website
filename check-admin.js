/**
 * Admin Login Helper
 * Run this to check/reset your admin credentials
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkAdminCredentials() {
  console.log('🔍 Checking Admin Credentials...\n');

  try {
    const adminEmail = "admin@yourrecipesite.com";

    // Check stored username
    const usernameData = await prisma.adminSettings.findUnique({
      where: { key: `admin_username_${adminEmail}` }
    });

    // Check stored password
    const passwordData = await prisma.adminSettings.findUnique({
      where: { key: `admin_password_${adminEmail}` }
    });

    console.log('📋 Current Admin Settings:');
    console.log('─────────────────────────────────────');
    
    if (usernameData?.value) {
      console.log(`✅ Username: ${usernameData.value}`);
    } else {
      console.log('⚠️  Username: Not set (default: "Administrator")');
    }

    console.log(`📧 Email: ${adminEmail}`);

    if (passwordData?.value) {
      console.log('✅ Password: Custom password set (hashed)');
      console.log(`   Hash: ${passwordData.value.substring(0, 20)}...`);
    } else {
      console.log('⚠️  Password: Using default password "admin123"');
    }

    console.log('\n📝 Login Instructions:');
    console.log('─────────────────────────────────────');
    console.log('Go to: http://localhost:3001/admin/login');
    console.log('');
    
    if (usernameData?.value) {
      console.log(`Username: ${usernameData.value}`);
    } else {
      console.log('Email: admin@yourrecipesite.com');
    }
    
    if (!passwordData?.value) {
      console.log('Password: admin123 (default)');
      console.log('');
      console.log('⚠️  WARNING: You are using the default password!');
      console.log('   Please change it after logging in.');
    } else {
      console.log('Password: [Your custom password]');
    }

    console.log('\n✨ Need to reset credentials? Run:');
    console.log('   node reset-admin.js');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminCredentials();
