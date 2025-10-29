import { NextRequest, NextResponse } from "next/server";
import { jsonResponseNoCache, errorResponseNoCache } from '@/lib/api-response-helpers';
import { verifyAdminToken } from "@/lib/auth";
import { getPageContent, updatePageContent } from "@/lib/page-content-service";
import { revalidatePath } from "next/cache";

/**
 * Dynamic route for all page content (privacy, terms, about, contact, faq, disclaimer, cookies)
 * Now reads from and writes to database instead of JSON files
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { page: string } }
) {
  try {
    // Verify admin token
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return errorResponseNoCache('Unauthorized', 401);
    }

    // Fetch from database
    const content = await getPageContent(params.page);
    return jsonResponseNoCache(content);
  } catch (error) {
    console.error(`Error loading ${params.page} content:`, error);
    return errorResponseNoCache('Failed to load content', 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { page: string } }
) {
  try {
    // Verify admin token
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return errorResponseNoCache('Unauthorized', 401);
    }

    const body = await request.json();
    const userId = authResult.payload?.email || 'admin';

    // Save to database
    await updatePageContent(params.page, body, userId);

    // Revalidate the public page
    const pageRoutes: Record<string, string> = {
      'privacy': '/privacy',
      'terms': '/terms',
      'about': '/about',
      'contact': '/contact',
      'faq': '/faq',
      'disclaimer': '/disclaimer',
      'cookies': '/cookies'
    };
    
    const route = pageRoutes[params.page];
    if (route) {
      revalidatePath(route);
      console.log(`✅ ${params.page} content saved to database and page revalidated`);
    }

    return jsonResponseNoCache({ success: true });
  } catch (error) {
    console.error(`Error saving ${params.page} content:`, error);
    return errorResponseNoCache('Failed to save content', 500);
  }
}