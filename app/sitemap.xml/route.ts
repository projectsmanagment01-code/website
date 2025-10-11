import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import prisma from "@/lib/prisma";
import { withRetry } from "@/lib/prisma-helpers";

export async function GET(request: Request) {
  try {
    // Get dynamic domain from request headers
    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

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

    // Fetch dynamic categories from database
    const categories = await withRetry(() =>
      prisma.category.findMany({
        orderBy: { title: "asc" },
      })
    );

    // Dynamic category pages
    const categoryPages = categories.map((category) => ({
      url: `/categories/${category.slug}`,
      priority: "1.0",
      changefreq: "weekly",
      lastmod: undefined,
    }));

    // Fetch all recipes from database
    const recipes = await withRetry(() =>
      prisma.recipe.findMany({
        select: {
          slug: true,
          updatedAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      })
    );

    // Dynamic recipe pages
    const recipePages = recipes.map((recipe) => ({
      url: `/recipes/${recipe.slug}`,
      priority: "1.0",
      changefreq: "monthly",
      lastmod:
        recipe.updatedAt?.toISOString().split("T")[0] ||
        recipe.createdAt?.toISOString().split("T")[0] ||
        new Date().toISOString().split("T")[0],
    }));

    // Combine all pages
    const allPages = [...staticPages, ...categoryPages, ...recipePages];

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
    console.error("Error generating sitemap:", error);
    return new NextResponse("Error generating sitemap", { status: 500 });
  }
}
