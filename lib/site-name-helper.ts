import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

/**
 * Get website name from AI Context Settings (cached for performance)
 * Falls back to config/site.ts if not set in database
 */
export const getWebsiteName = unstable_cache(
  async (): Promise<string> => {
    try {
      const aiContextSettings = await prisma.adminSettings.findUnique({
        where: { key: "aiContextSettings" },
      });

      if (aiContextSettings?.value) {
        const parsed = JSON.parse(aiContextSettings.value);
        if (parsed.websiteName) {
          return parsed.websiteName;
        }
      }
    } catch (error) {
      console.error("Failed to fetch website name from database:", error);
    }

    // Fallback to config file
    return "Recipes website";
  },
  ["website-name"],
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ["website-name", "admin-settings"],
  }
);
