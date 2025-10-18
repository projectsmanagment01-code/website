import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSiteInfo, updateSiteInfo } from "@/lib/site-config-service";

/**
 * GET /api/admin/content/site
 * Returns site configuration from database
 */
export async function GET() {
  try {
    const siteInfo = await getSiteInfo();
    return NextResponse.json(siteInfo);
  } catch (error) {
    console.error("Error loading site settings from database:", error);
    return NextResponse.json(
      { error: "Failed to load site settings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/content/site
 * Updates site configuration in database
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const token = await auth.getToken(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    
    // Save to database
    await updateSiteInfo(data, token.sub?.toString() || 'admin');
    
    console.log("✅ Site settings saved successfully to database");
    
    return NextResponse.json({ 
      success: true, 
      message: "Site settings saved successfully",
      data 
    });
  } catch (error) {
    console.error("Error saving site settings to database:", error);
    return NextResponse.json(
      { error: "Failed to save site settings" },
      { status: 500 }
    );
  }
}