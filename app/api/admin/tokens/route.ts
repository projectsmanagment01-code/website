import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkHybridAuthOrRespond } from "@/lib/auth-standard";
import crypto from "crypto";

const prisma = new PrismaClient();

// Generate secure API token
function generateApiToken(): string {
  return `rtk_${crypto.randomBytes(32).toString('hex')}`;
}

// Calculate expiration date based on duration
function calculateExpirationDate(duration: string): Date {
  const now = new Date();
  
  switch (duration) {
    case '7days':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case '1month':
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    case '6months':
      return new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
    case '1year':
      return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // Default to 1 month
  }
}

// GET - Fetch all API tokens
export async function GET(request: NextRequest) {
  try {
    const authCheck = await checkHybridAuthOrRespond(request);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const tokens = await prisma.apiToken.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        token: true,
        createdAt: true,
        expiresAt: true,
        isActive: true,
        lastUsedAt: true,
        createdBy: true,
        description: true,
      }
    });

    // Mask tokens for security (show only last 8 characters)
    const maskedTokens = tokens.map((token: any) => ({
      ...token,
      token: `****-****-****-${token.token.slice(-8)}`
    }));

    return NextResponse.json({ tokens: maskedTokens });
  } catch (error) {
    console.error("Error fetching API tokens:", error);
    return NextResponse.json(
      { error: "Failed to fetch API tokens" },
      { status: 500 }
    );
  }
}

// POST - Create new API token
export async function POST(request: NextRequest) {
  try {
    const authCheck = await checkHybridAuthOrRespond(request);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const { name, duration, description } = await request.json();

    if (!name || !duration) {
      return NextResponse.json(
        { error: "Name and duration are required" },
        { status: 400 }
      );
    }

    const token = generateApiToken();
    const expiresAt = calculateExpirationDate(duration);

    const newToken = await prisma.apiToken.create({
      data: {
        name,
        token,
        expiresAt,
        createdBy: authCheck.payload?.email || authCheck.payload?.name || 'admin',
        description: description || null,
      },
    });

    return NextResponse.json({
      message: "API token created successfully",
      token: {
        id: newToken.id,
        name: newToken.name,
        token: newToken.token, // Only return full token on creation
        expiresAt: newToken.expiresAt,
        description: newToken.description,
      }
    });
  } catch (error) {
    console.error("Error creating API token:", error);
    return NextResponse.json(
      { error: "Failed to create API token" },
      { status: 500 }
    );
  }
}

// DELETE - Revoke API token
export async function DELETE(request: NextRequest) {
  try {
    const authCheck = await checkHybridAuthOrRespond(request);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const { searchParams } = new URL(request.url);
    const tokenId = searchParams.get('id');

    if (!tokenId) {
      return NextResponse.json(
        { error: "Token ID is required" },
        { status: 400 }
      );
    }

    await prisma.apiToken.delete({
      where: { id: tokenId }
    });

    return NextResponse.json({
      message: "API token revoked successfully"
    });
  } catch (error) {
    console.error("Error revoking API token:", error);
    return NextResponse.json(
      { error: "Failed to revoke API token" },
      { status: 500 }
    );
  }
}

// PATCH - Update token status (activate/deactivate)
export async function PATCH(request: NextRequest) {
  try {
    const authCheck = await checkHybridAuthOrRespond(request);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const { id, isActive } = await request.json();

    if (!id || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: "Token ID and status are required" },
        { status: 400 }
      );
    }

    const updatedToken = await prisma.apiToken.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json({
      message: `API token ${isActive ? 'activated' : 'deactivated'} successfully`,
      token: {
        id: updatedToken.id,
        isActive: updatedToken.isActive,
      }
    });
  } catch (error) {
    console.error("Error updating API token:", error);
    return NextResponse.json(
      { error: "Failed to update API token" },
      { status: 500 }
    );
  }
}