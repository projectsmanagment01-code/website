import { NextRequest, NextResponse } from "next/server";
import { jsonResponseNoCache, errorResponseNoCache } from '@/lib/api-response-helpers';
import { checkHybridAuthOrRespond } from "@/lib/auth-standard";
import { getSiteInfo, updateSiteInfo } from "@/lib/site-config-service";

/**
 * GET /api/admin/content/site
 * Returns site configuration from database
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authCheck = await checkHybridAuthOrRespond(request);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const siteInfo = await getSiteInfo();
    return jsonResponseNoCache(siteInfo);
  } catch (error) {
    console.error("Error loading site settings from database:", error);
    return errorResponseNoCache('Failed to load site settings', 500);
  }
}

/**
 * POST /api/admin/content/site
 * Updates site configuration in database
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authCheck = await checkHybridAuthOrRespond(request);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const data = await request.json();
    
    // Save to database
    await updateSiteInfo(data, authCheck.payload?.email || authCheck.payload?.sub?.toString() || 'admin');
    
    console.log("✅ Site settings saved successfully to database");
    
    return jsonResponseNoCache({ 
      success: true, 
      message: "Site settings saved successfully",
      data 
    });
  } catch (error) {
    console.error("Error saving site settings to database:", error);
    return errorResponseNoCache('Failed to save site settings', 500);
  }
}