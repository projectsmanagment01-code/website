import { NextRequest, NextResponse } from "next/server";
import { getHeroConfig, getSiteInfo } from "@/lib/site-config-service";

/**
 * GET /api/content/home
 * Returns hero content and basic site info from database
 * Previously read from JSON files which were overwritten on deployment
 */
export async function GET() {
  try {
    // Fetch from database instead of JSON files
    const [heroConfig, siteInfo] = await Promise.all([
      getHeroConfig(),
      getSiteInfo(),
    ]);

    // Return combined data for public website
    return NextResponse.json({
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