import { NextResponse } from "next/server";
import { getSiteInfo } from "@/lib/site-config-service";

/**
 * GET /api/content/site
 * Public endpoint that returns site configuration from database
 * Used by frontend components like Logo, Footer, etc.
 */
export async function GET() {
  try {
    // Fetch from database with JSON fallback
    const siteInfo = await getSiteInfo();
    
    return NextResponse.json(siteInfo);
  } catch (error) {
    console.error("Error loading site settings:", error);
    
    // Return default content on error
    return NextResponse.json({
      logoType: "text",
      logoText: "",
      logoTagline: "",
      logoImage: "",
      favicon: "",
      footerCopyright: "",
      footerVersion: "",
      siteTitle: "",
      siteDescription: "",
      siteDomain: "",
      siteUrl: "",
      siteEmail: "",
      lastUpdated: null,
    });
  }
}