import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { getHeroConfig, updateHeroConfig, getSocialLinks, updateSocialLinks } from "@/lib/site-config-service";

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
    return NextResponse.json({
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
    return NextResponse.json(
      { error: "Failed to load content" },
      { status: 500 }
    );
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Create response with cache invalidation headers
    const response = NextResponse.json({ success: true });
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    return response;
  } catch (error) {
    console.error("Error saving home content to database:", error);
    return NextResponse.json(
      { error: "Failed to save content" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/content/home
 * Alias for POST - same functionality
 */
export async function PUT(request: NextRequest) {
  return POST(request);
}