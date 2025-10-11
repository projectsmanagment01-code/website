import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    // Verify authentication
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // For development/demo purposes, we'll use the hardcoded admin
    const adminEmail = "admin@yourrecipesite.com";
    
    // Check if we have a stored password (from previous reset)
    const storedPasswordData = await prisma.adminSettings.findUnique({
      where: { key: `admin_password_${adminEmail}` }
    });

    let isCurrentPasswordValid = false;

    if (storedPasswordData?.value) {
      // Compare with stored hashed password
      isCurrentPasswordValid = await bcrypt.compare(currentPassword, storedPasswordData.value);
    } else {
      // Compare with hardcoded password for first-time users
      isCurrentPasswordValid = currentPassword === "admin123";
    }

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Store the new hashed password
    await prisma.adminSettings.upsert({
      where: { key: `admin_password_${adminEmail}` },
      update: { 
        value: hashedNewPassword,
        updatedBy: adminEmail,
      },
      create: { 
        key: `admin_password_${adminEmail}`,
        value: hashedNewPassword,
        updatedBy: adminEmail,
      },
    });

    return NextResponse.json({
      message: "Password changed successfully"
    });

  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}