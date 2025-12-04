import { NextRequest, NextResponse } from 'next/server';
import { jsonResponseNoCache, errorResponseNoCache } from '@/lib/api-response-helpers';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resetToken, newPassword, newUsername } = body;

    if (!resetToken) {
      return errorResponseNoCache('Reset token is required', 400);
    }

    // Verify the reset token against API tokens in database
    const apiToken = await prisma.apiToken.findUnique({
      where: { token: resetToken }
    });

    if (!apiToken) {
      return errorResponseNoCache('Invalid reset token', 401);
    }

    if (!apiToken.isActive) {
      return errorResponseNoCache('This API token is inactive', 401);
    }

    if (new Date() > apiToken.expiresAt) {
      return errorResponseNoCache('This API token has expired', 401);
    }

    if (!newPassword) {
      return errorResponseNoCache('newPassword is required', 400);
    }

    const adminEmail = "admin@yourrecipesite.com";
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update admin password in database
    await prisma.adminSettings.upsert({
      where: { key: `admin_password_${adminEmail}` },
      update: { 
        value: hashedPassword,
        updatedBy: 'emergency-reset',
        updatedAt: new Date()
      },
      create: { 
        key: `admin_password_${adminEmail}`,
        value: hashedPassword,
        updatedBy: 'emergency-reset'
      }
    });

    // Optionally update username
    if (newUsername) {
      await prisma.adminSettings.upsert({
        where: { key: `admin_username_${adminEmail}` },
        update: { 
          value: newUsername,
          updatedBy: 'emergency-reset',
          updatedAt: new Date()
        },
        create: { 
          key: `admin_username_${adminEmail}`,
          value: newUsername,
          updatedBy: 'emergency-reset'
        }
      });
    }

    return jsonResponseNoCache({
      success: true,
      message: 'Admin credentials reset successfully',
      email: adminEmail,
      username: newUsername || 'Administrator',
      note: 'You can now login with the new password'
    });

  } catch (error) {
    console.error('Admin reset error:', error);
    return errorResponseNoCache('Failed to reset admin credentials', 500);
  } finally {
    await prisma.$disconnect();
  }
}
