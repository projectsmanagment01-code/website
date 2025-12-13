import { NextRequest, NextResponse } from "next/server";
import { jsonResponseNoCache, errorResponseNoCache } from "@/lib/api-response-helpers";
import { checkHybridAuthOrRespond } from "@/lib/auth-standard";
import { prisma } from "@/lib/prisma";

const CONFIG_KEY = "homepage-layout";

interface HomepageSection {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  order: number;
}

interface HomepageLayoutSettings {
  sections: HomepageSection[];
  lastUpdated: string;
}

/**
 * GET /api/admin/content/homepage-layout
 * Returns homepage layout settings from database
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authCheck = await checkHybridAuthOrRespond(request);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    // Get settings from database using SiteConfig
    const config = await prisma.siteConfig.findUnique({
      where: { key: CONFIG_KEY },
    });

    if (config && config.data) {
      const data = config.data as HomepageLayoutSettings;
      return jsonResponseNoCache(data);
    }

    // Return empty object if no settings found
    return jsonResponseNoCache({ sections: [], lastUpdated: null });
  } catch (error) {
    console.error("Error loading homepage layout settings:", error);
    return errorResponseNoCache("Failed to load homepage layout settings", 500);
  }
}

/**
 * POST /api/admin/content/homepage-layout
 * Updates homepage layout settings in database
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authCheck = await checkHybridAuthOrRespond(request);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const data = await request.json();

    const settingsData: HomepageLayoutSettings = {
      sections: data.sections || [],
      lastUpdated: new Date().toISOString(),
    };

    // Upsert settings in database using SiteConfig
    await prisma.siteConfig.upsert({
      where: { key: CONFIG_KEY },
      update: {
        data: settingsData as any,
        updatedAt: new Date(),
        updatedBy: authCheck.payload?.email || authCheck.payload?.sub?.toString() || "admin",
      },
      create: {
        key: CONFIG_KEY,
        data: settingsData as any,
        updatedBy: authCheck.payload?.email || authCheck.payload?.sub?.toString() || "admin",
      },
    });

    console.log("✅ Homepage layout settings saved successfully");

    return jsonResponseNoCache({
      success: true,
      message: "Homepage layout settings saved successfully",
      data: settingsData,
    });
  } catch (error) {
    console.error("Error saving homepage layout settings:", error);
    return errorResponseNoCache("Failed to save homepage layout settings", 500);
  }
}
