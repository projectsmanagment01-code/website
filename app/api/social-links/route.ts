import { NextRequest, NextResponse } from "next/server";
import { getSocialLinks } from "@/lib/site-config-service";

/**
 * GET /api/social-links
 * Returns enabled social media links from database
 */
export async function GET(request: NextRequest) {
  try {
    const socialLinks = await getSocialLinks();
    
    // Return only enabled social media links with valid URLs
    const enabledLinks = socialLinks.filter(link => 
      link.enabled && link.url && link.url.trim() !== ""
    );
    
    const response = NextResponse.json({ socialLinks: enabledLinks });
    
    // Add cache control headers
    response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    
    return response;
  } catch (error) {
    console.error("Error loading social links from database:", error);
    return NextResponse.json(
      { error: "Failed to load social links" },
      { status: 500 }
    );
  }
}