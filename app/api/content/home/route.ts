import { NextRequest, NextResponse } from "next/server";
import { getHeroConfig, getSiteInfo } from "@/lib/site-config-service";

/**
 * GET /api/content/home
 * Returns hero content and basic site info from database
 * 
 * CACHING STRATEGY:
 * - Public API route for frontend consumption
 * - Cached with Cloudflare for 1 hour (CDN layer)
 * - Browser caches for 1 hour (client layer)
 * - Next.js ISR revalidates every hour (server layer)
 * - Tagged with 'home-content' for on-demand revalidation
 */
export async function GET() {
  try {
    // Fetch from database instead of JSON files
    const [heroConfig, siteInfo] = await Promise.all([
      getHeroConfig(),
      getSiteInfo(),
    ]);

    // Return combined data for public website with cache headers
    const data = {
      heroTitle: heroConfig.title || "",
      heroDescription: heroConfig.description || "",
      heroButtonText: heroConfig.buttonText || "",
      heroButtonLink: heroConfig.buttonLink || "",
      heroBackgroundImage: heroConfig.backgroundImage || "",
      logoType: siteInfo.logoType || "text",
      logoText: siteInfo.logoText || "",
      logoTagline: siteInfo.logoTagline || "",
      logoImage: siteInfo.logoImage || "",
      favicon: siteInfo.favicon || "",
      footerCopyright: siteInfo.footerCopyright || "",
      footerVersion: siteInfo.footerVersion || "",
    };

    // PUBLIC API: Enable aggressive caching for performance
    return NextResponse.json(data, {
      headers: {
        // Browser cache: 1 hour
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        // Cloudflare CDN: 1 hour
        'CDN-Cache-Control': 'public, max-age=3600',
        // Tag for on-demand revalidation
        'Cache-Tag': 'home-content',
      },
    });
  } catch (error) {
    console.error("Error loading home content:", error);
    
    // Return empty content on error
    return NextResponse.json({
      heroTitle: "",
      heroDescription: "",
      heroButtonText: "",
      heroButtonLink: "",
      heroBackgroundImage: "",
      logoType: "text",
      logoText: "",
      logoTagline: "",
      logoImage: "",
      favicon: "",
      footerCopyright: "",
      footerVersion: "",
    });
  }
}