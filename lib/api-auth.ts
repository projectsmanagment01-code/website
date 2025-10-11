import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verify } from "jsonwebtoken";

const prisma = new PrismaClient();

interface JwtPayload {
  username: string;
  role: string;
}

export interface ApiTokenPayload {
  tokenId: string;
  name: string;
  createdBy: string;
}

// Verify API token
export async function verifyApiToken(token: string): Promise<ApiTokenPayload | null> {
  try {
    // Check if token exists and is active
    const apiToken = await prisma.apiToken.findUnique({
      where: { 
        token,
        isActive: true,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (!apiToken) {
      return null;
    }

    // Update last used timestamp
    await prisma.apiToken.update({
      where: { id: apiToken.id },
      data: { lastUsedAt: new Date() }
    });

    return {
      tokenId: apiToken.id,
      name: apiToken.name,
      createdBy: apiToken.createdBy
    };

  } catch (error) {
    console.error("Error verifying API token:", error);
    return null;
  }
}

// Verify admin JWT token
export async function verifyAdminAuth(request: NextRequest): Promise<JwtPayload | null> {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }

    const payload = verify(token, secret) as JwtPayload;
    return payload;
  } catch (error) {
    return null;
  }
}

// Combined auth verification (supports both JWT and API tokens)
export async function verifyAuth(request: NextRequest): Promise<{ type: 'jwt' | 'api', payload: JwtPayload | ApiTokenPayload } | null> {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);

    // Check if it's an API token (starts with rtk_)
    if (token.startsWith('rtk_')) {
      const apiTokenPayload = await verifyApiToken(token);
      if (apiTokenPayload) {
        return { type: 'api', payload: apiTokenPayload };
      }
    }

    // Otherwise, verify as JWT token
    const jwtPayload = await verifyAdminAuth(request);
    if (jwtPayload) {
      return { type: 'jwt', payload: jwtPayload };
    }

    return null;
  } catch (error) {
    console.error("Error in auth verification:", error);
    return null;
  }
}

// Middleware wrapper for API routes that require authentication
export function withAuth(handler: (request: NextRequest, auth: { type: 'jwt' | 'api', payload: JwtPayload | ApiTokenPayload }) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return handler(request, auth);
  };
}

// Admin-only middleware wrapper
export function withAdminAuth(handler: (request: NextRequest, auth: JwtPayload) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const adminAuth = await verifyAdminAuth(request);
    if (!adminAuth) {
      return NextResponse.json({ error: "Admin access required" }, { status: 401 });
    }
    return handler(request, adminAuth);
  };
}