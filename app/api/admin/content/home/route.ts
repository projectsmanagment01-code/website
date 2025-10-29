import { NextRequest, NextResponse } from "next/server";
import { jsonResponseNoCache, errorResponseNoCache } from '@/lib/api-response-helpers';
import { verifyAdminToken } from "@/lib/auth";
import { getHeroConfig, updateHeroConfig, getSocialLinks, updateSocialLinks } from "@/lib/site-config-service";
import { revalidateAdminPaths } from "@/lib/cache-busting";

// Aggressive cache-busting configuration
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * GET /api/admin/content/home
 * Returns hero content and social links from database for admin editing
 */
export async function GET(request: NextRequest) {
  try {
    const [heroConfig, socialLinks] = await Promise.all([
      getHeroConfig(),
      getSocialLinks(),
    ]);

    // Return data in format expected by admin panel
    return jsonResponseNoCache({
      heroTitle: heroConfig.title,
      heroDescription: heroConfig.description,
      heroButtonText: heroConfig.buttonText,
      heroButtonLink: heroConfig.buttonLink,
      heroBackgroundImage: heroConfig.backgroundImage,
      metaTitle: heroConfig.metaTitle,
      metaDescription: heroConfig.metaDescription,
      socialMediaLinks: socialLinks,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error loading home content from database:", error);
    return errorResponseNoCache('Failed to load content', 500);
  }
}

/**
 * POST /api/admin/content/home
 * Updates hero content and social links in database
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin token
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return errorResponseNoCache('Unauthorized', 401);
    }

    const body = await request.json();
    
    // Extract hero config and social links
    const heroData = {
      title: body.heroTitle,
      description: body.heroDescription,
      buttonText: body.heroButtonText,
      buttonLink: body.heroButtonLink,
      backgroundImage: body.heroBackgroundImage,
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
    };

    // Save to database
    const userId = authResult.payload?.email || 'admin';
    await Promise.all([
      updateHeroConfig(heroData, userId),
      updateSocialLinks(body.socialMediaLinks || [], userId),
    ]);

    console.log("✅ Home content saved successfully to database");

    // CRITICAL: Revalidate admin paths and home page
    await revalidateAdminPaths('/');
    
    // CRITICAL: Revalidate cache tags for instant frontend updates
    const { revalidateByTags } = await import('@/lib/cache-busting');
    await revalidateByTags(['home-content']);

    // Return response with cache invalidation headers
    return jsonResponseNoCache({ success: true });
  } catch (error) {
    console.error("Error saving home content to database:", error);
    return errorResponseNoCache('Failed to save content', 500);
  }
}

/**
 * PUT /api/admin/content/home
 * Alias for POST - same functionality
 */
export async function PUT(request: NextRequest) {
  return POST(request);
}