import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import { getCategories, getRecipes } from "@/data/data";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  try {
    // Get dynamic domain from request headers
    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    logger.info("Generating sitemap", { host, baseUrl });

    // Static pages
    const staticPages = [
      { url: "/", priority: "1.0", changefreq: "daily", lastmod: undefined },
      {
        url: "/about",
        priority: "0.8",
        changefreq: "monthly",
        lastmod: undefined,
      },
      {
        url: "/contact",
        priority: "0.7",
        changefreq: "monthly",
        lastmod: undefined,
      },
      {
        url: "/faq",
        priority: "0.5",
        changefreq: "monthly",
        lastmod: undefined,
      },
      {
        url: "/explore",
        priority: "0.5",
        changefreq: "daily",
        lastmod: undefined,
      },
      {
        url: "/search",
        priority: "0.5",
        changefreq: "weekly",
        lastmod: undefined,
      },
      {
        url: "/recipes",
        priority: "1.0",
        changefreq: "daily",
        lastmod: undefined,
      },
      {
        url: "/categories",
        priority: "0.5",
        changefreq: "weekly",
        lastmod: undefined,
      },
      {
        url: "/authors",
        priority: "0.7",
        changefreq: "weekly",
        lastmod: undefined,
      },
      {
        url: "/privacy",
        priority: "0.1",
        changefreq: "yearly",
        lastmod: undefined,
      },
      {
        url: "/terms",
        priority: "0.3",
        changefreq: "yearly",
        lastmod: undefined,
      },
      {
        url: "/cookies",
        priority: "0.3",
        changefreq: "yearly",
        lastmod: undefined,
      },
      {
        url: "/disclaimer",
        priority: "0.3",
        changefreq: "yearly",
        lastmod: undefined,
      },
    ];

    // Fetch dynamic categories
    let categories: Array<{ slug: string }> = [];
    try {
      const fetchedCategories = await getCategories();
      categories = fetchedCategories.map(c => ({ slug: c.slug }));
      logger.info(`Fetched ${categories.length} categories for sitemap`);
    } catch (error) {
      logger.error("Failed to fetch categories for sitemap", { error });
      // Continue with empty categories array
    }

    // Dynamic category pages
    const categoryPages = categories.map((category) => ({
      url: `/categories/${category.slug}`,
      priority: "1.0",
      changefreq: "weekly",
      lastmod: undefined,
    }));

    // Fetch all recipes
    let recipes: Array<{ slug: string; updatedAt: Date | string | null; createdAt: Date | string | undefined }> = [];
    try {
      const fetchedRecipes = await getRecipes();
      recipes = fetchedRecipes.map(r => ({ 
        slug: r.slug, 
        updatedAt: r.updatedAt || null, 
        createdAt: r.createdAt 
      }));
      logger.info(`Fetched ${recipes.length} recipes for sitemap`);
    } catch (error) {
      logger.error("Failed to fetch recipes for sitemap", { error });
      // Continue with empty recipes array
    }

    // Helper to format date
    const formatDate = (date: Date | string | null | undefined) => {
      if (!date) return undefined;
      if (typeof date === 'string') return date.split('T')[0];
      return date.toISOString().split('T')[0];
    };

    // Dynamic recipe pages
    const recipePages = recipes.map((recipe) => ({
      url: `/recipes/${recipe.slug}`,
      priority: "1.0",
      changefreq: "monthly",
      lastmod: formatDate(recipe.updatedAt) || formatDate(recipe.createdAt) || new Date().toISOString().split("T")[0],
    }));

    // Combine all pages
    const allPages = [...staticPages, ...categoryPages, ...recipePages];

    logger.info(`Generated sitemap with ${allPages.length} URLs`);

    // Generate XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod || new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "s-maxage=86400, stale-while-revalidate",
      },
    });
  } catch (error) {
    logger.error("Fatal error generating sitemap", { error: error instanceof Error ? error.message : String(error) });
    
    // Return minimal sitemap with just static pages on error
    const minimalSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://${request.headers.get("host") || "localhost:3000"}/</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
    
    return new NextResponse(minimalSitemap, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate", // Shorter cache on error
      },
    });
  }
}
