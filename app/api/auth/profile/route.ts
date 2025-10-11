import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // For development/demo purposes, we'll use the hardcoded admin
    const adminEmail = "admin@yourrecipesite.com";
    
    // Get username from AdminSettings
    const usernameData = await prisma.adminSettings.findUnique({
      where: { key: `admin_username_${adminEmail}` }
    });

    // Return user information
    return NextResponse.json({
      email: adminEmail,
      name: usernameData?.value || "Administrator",
      username: usernameData?.value || "Administrator",
      role: "Administrator",
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}