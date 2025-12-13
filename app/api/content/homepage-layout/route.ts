import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CONFIG_KEY = "homepage-layout";

interface HomepageSection {
  id: string;
  enabled: boolean;
}

interface HomepageLayoutData {
  sections?: HomepageSection[];
}

/**
 * GET /api/content/homepage-layout
 * Public endpoint to get homepage layout settings (cached)
 */
export async function GET(request: NextRequest) {
  try {
    // Get settings from database using SiteConfig
    const config = await prisma.siteConfig.findUnique({
      where: { key: CONFIG_KEY },
    });

    if (config && config.data) {
      const data = config.data as HomepageLayoutData;
      
      // Return only enabled status for each section (minimal data for frontend)
      const enabledSections: Record<string, boolean> = {};
      if (data.sections) {
        data.sections.forEach((section: HomepageSection) => {
          enabledSections[section.id] = section.enabled;
        });
      }
      
      return NextResponse.json(enabledSections, {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      });
    }

    // Return empty object if no settings found (all sections will show by default)
    return NextResponse.json({}, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Error loading homepage layout settings:", error);
    // Return empty object on error (all sections will show by default)
    return NextResponse.json({}, { status: 200 });
  }
}
