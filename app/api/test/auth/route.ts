import { NextRequest, NextResponse } from "next/server";
import { verifyApiToken, verifyAdminAuth } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  try {
    // Skip auth in development for testing purposes
    const skipAuth = process.env.NODE_ENV === 'development' || process.env.SKIP_AUTH === 'true';
    
    if (skipAuth) {
      return NextResponse.json({ 
        message: "Test endpoint accessible (auth skipped in development)",
        authStatus: "skipped" 
      });
    }

    // Check for API token in Authorization header
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader) {
      return NextResponse.json({ error: "Authorization header required" }, { status: 401 });
    }

    let authResult = null;

    // Try API token authentication first
    if (authHeader.startsWith("Bearer rtk_")) {
      const token = authHeader.substring(7); // Remove "Bearer " prefix
      authResult = await verifyApiToken(token);
      
      if (authResult) {
        return NextResponse.json({
          message: "API Token authentication successful!",
          authMethod: "apiToken",
          tokenInfo: {
            name: authResult.name,
            createdBy: authResult.createdBy,
            tokenId: authResult.tokenId
          }
        });
      }
    }

    // Try JWT authentication as fallback
    if (authHeader.startsWith("Bearer ")) {
      authResult = await verifyAdminAuth(request);
      
      if (authResult) {
        return NextResponse.json({
          message: "JWT authentication successful!",
          authMethod: "jwt",
          userInfo: {
            username: authResult.username,
            role: authResult.role
          }
        });
      }
    }

    // If we get here, authentication failed
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });

  } catch (error) {
    console.error("Test auth endpoint error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}