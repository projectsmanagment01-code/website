export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getAdminSettings } from "@/lib/admin-settings";

export async function GET() {
  try {
    const settings = await getAdminSettings();
    const robotsTxtContent = settings.robotsTxt;

    const content =
      robotsTxtContent ||
      `User-agent: *
Allow: /

# Sitemap
Sitemap: https://yourdomain.com/sitemap.xml

# Disallow admin pages
Disallow: /admin/
Disallow: /api/

# Allow search engines to crawl everything else
Allow: /recipes/
Allow: /categories/
Allow: /about
Allow: /contact
Allow: /faq
Allow: /explore
Allow: /search
Allow: /terms
Allow: /privacy
Allow: /cookies
Disallow: /admin/
Allow: /
`;

    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (error) {
    console.error("Error in GET /robots.txt:", error);
    return new NextResponse("Error loading robots.txt", {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
}
