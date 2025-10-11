import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { newUsername } = await request.json();

    // Validate the new username
    if (!newUsername || typeof newUsername !== "string") {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    if (newUsername.trim().length < 2) {
      return NextResponse.json(
        { error: "Username must be at least 2 characters long" },
        { status: 400 }
      );
    }

    if (newUsername.trim().length > 50) {
      return NextResponse.json(
        { error: "Username must be less than 50 characters long" },
        { status: 400 }
      );
    }

    // For development/demo purposes, we'll use the hardcoded admin
    const adminEmail = "admin@yourrecipesite.com";
    
    // Store the username in AdminSettings
    await prisma.adminSettings.upsert({
      where: { key: `admin_username_${adminEmail}` },
      update: { 
        value: newUsername.trim(),
        updatedBy: adminEmail,
      },
      create: { 
        key: `admin_username_${adminEmail}`,
        value: newUsername.trim(),
        updatedBy: adminEmail,
      },
    });

    return NextResponse.json({
      message: "Username updated successfully",
      username: newUsername.trim(),
    });
  } catch (error) {
    console.error("Change username error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}