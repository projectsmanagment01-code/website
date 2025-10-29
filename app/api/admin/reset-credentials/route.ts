import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resetToken, newPassword, newUsername } = body;

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Reset token is required' },
        { status: 400 }
      );
    }

    // Verify the reset token against API tokens in database
    const apiToken = await prisma.apiToken.findUnique({
      where: { token: resetToken }
    });

    if (!apiToken) {
      return NextResponse.json(
        { error: 'Invalid reset token' },
        { status: 401 }
      );
    }

    if (!apiToken.isActive) {
      return NextResponse.json(
        { error: 'This API token is inactive' },
        { status: 401 }
      );
    }

    if (new Date() > apiToken.expiresAt) {
      return NextResponse.json(
        { error: 'This API token has expired' },
        { status: 401 }
      );
    }

    if (!newPassword) {
      return NextResponse.json(
        { error: 'newPassword is required' },
        { status: 400 }
      );
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

    return NextResponse.json({
      success: true,
      message: 'Admin credentials reset successfully',
      email: adminEmail,
      username: newUsername || 'Administrator',
      note: 'You can now login with the new password'
    });

  } catch (error) {
    console.error('Admin reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset admin credentials', details: (error as Error).message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
