import { NextRequest, NextResponse } from "next/server";
import { jsonResponseNoCache, errorResponseNoCache } from '@/lib/api-response-helpers';
import jwt from "jsonwebtoken";
import { getPageContent, updatePageContent } from "@/lib/page-content-service";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

/**
 * Cookies policy content management - now using database
 */

function verifyAuth(request: NextRequest): boolean {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return false;
    }

    const token = authHeader.substring(7);
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch (error) {
    return false;
  }
}

export async function GET(request: NextRequest) {
  if (!verifyAuth(request)) {
    return errorResponseNoCache('Unauthorized', 401);
  }

  try {
    const content = await getPageContent('cookies');
    
    // Map to old format for compatibility
    return jsonResponseNoCache({
      heroTitle: content.heroTitle || '',
      heroDescription: content.heroDescription || '',
      mainContent: content.content || '',
      metaTitle: content.metaTitle || '',
      metaDescription: content.metaDescription || '',
      lastUpdated: content.lastUpdated || null,
    });
  } catch (error) {
    console.error("Error loading cookies content from database:", error);
    return errorResponseNoCache('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  if (!verifyAuth(request)) {
    return errorResponseNoCache('Unauthorized', 401);
  }

  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.heroTitle || !body.heroDescription || !body.mainContent) {
      return errorResponseNoCache('Missing required fields', 400);
    }

    // Map from old format to new format
    const pageData = {
      heroTitle: body.heroTitle,
      heroDescription: body.heroDescription,
      content: body.mainContent,
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
    };

    await updatePageContent('cookies', pageData, 'admin');
    console.log("✅ Cookies content saved to database");
    
    return jsonResponseNoCache({ 
      success: true, 
      message: "Cookies content updated successfully",
      content: { ...pageData, lastUpdated: new Date().toISOString() }
    });
  } catch (error) {
    console.error("Error saving cookies content to database:", error);
    return errorResponseNoCache('Internal server error', 500);
  }
}