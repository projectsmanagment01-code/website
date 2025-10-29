import { NextRequest, NextResponse } from "next/server";
import { jsonResponseNoCache, errorResponseNoCache } from '@/lib/api-response-helpers';
import { verifyAdminToken } from "@/lib/auth";
import { getPageContent, updatePageContent } from "@/lib/page-content-service";

/**
 * Contact page content management - now using database
 */

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return errorResponseNoCache('Unauthorized', 401);
    }

    const content = await getPageContent('contact');
    return jsonResponseNoCache(content);
  } catch (error) {
    console.error("Error loading contact content from database:", error);
    return errorResponseNoCache('Failed to load contact content', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return errorResponseNoCache('Unauthorized', 401);
    }

    const body = await request.json();
    const userId = authResult.payload?.email || 'admin';
    
    // Validate the structure if cards are provided
    if (body.cards && !Array.isArray(body.cards)) {
      return errorResponseNoCache('Invalid content structure', 400);
    }

    // Validate each card
    if (body.cards) {
      for (const card of body.cards) {
        if (!card.id || !card.title || !card.description || !card.email || !card.icon) {
          return errorResponseNoCache('Each card must have id, title, description, email, and icon', 400);
        }
      }
    }

    // Save to database
    await updatePageContent('contact', body, userId);
    console.log("✅ Contact content saved to database");
    
    return jsonResponseNoCache({ success: true });
  } catch (error) {
    console.error("Error saving contact content to database:", error);
    return errorResponseNoCache('Failed to save contact content', 500);
  }
}