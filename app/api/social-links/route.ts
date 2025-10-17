import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// SECURE: Path to store content files - NOT publicly accessible
const CONFIG_DIR = path.join(process.cwd(), "data", "config");

export async function GET(request: NextRequest) {
  try {
    const filePath = path.join(CONFIG_DIR, "home.json");

    try {
      const content = await fs.readFile(filePath, "utf-8");
      const homeContent = JSON.parse(content);
      
      // Return only enabled social media links
      const enabledLinks = homeContent.socialMediaLinks?.filter((link: any) => 
        link.enabled && link.url && link.url.trim() !== ""
      ) || [];
      
      const response = NextResponse.json({ socialLinks: enabledLinks });
      
      // Add cache control headers
      response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
      
      return response;
    } catch (error) {
      // Return empty array if file doesn't exist or has no social links
      return NextResponse.json({ socialLinks: [] });
    }
  } catch (error) {
    console.error("Error loading social links:", error);
    return NextResponse.json(
      { error: "Failed to load social links" },
      { status: 500 }
    );
  }
}