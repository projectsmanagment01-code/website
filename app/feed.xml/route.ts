import { NextResponse } from 'next/server';
import { siteConfig } from '@/config/site';
import { prisma } from '@/lib/prisma';

/**
 * RSS Feed Generator for Recipe Website
 * Provides an XML feed of all recipes for RSS readers and aggregators
 * Dynamically fetches fresh data from database
 */
export async function GET() {
  try {
    // Fetch site settings from database for dynamic info
    let siteSettings: any = null;
    try {
      siteSettings = await prisma.siteSettings.findFirst();
    } catch (error) {
      console.warn('Could not fetch site settings from database:', error);
    }

    // Fetch latest recipes directly from database with author relations
    const recipes = await prisma.recipe.findMany({
      where: { 
        href: { not: null } // Only published recipes
      },
      include: {
        authorRef: true, // Include author relation
      },
      orderBy: { 
        createdAt: 'desc' 
      },
      take: 50,
    });

    // Generate RSS XML with dynamic site settings
    const rssXml = generateRSSFeed(recipes, siteSettings);

    return new NextResponse(rssXml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600', // 30 min cache
      },
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return new NextResponse('Error generating feed', { status: 500 });
  }
}

/**
 * Generate RSS 2.0 Feed XML
 */
function generateRSSFeed(recipes: any[]): string {
  const baseUrl = siteConfig.url;
  const buildDate = new Date().toUTCString();

  const items = recipes
    .map(recipe => {
      const recipeUrl = `${baseUrl}${recipe.href}`;
      const imageUrl = recipe.heroImage || recipe.featureImage || recipe.images?.[0];
      const fullImageUrl = imageUrl 
        ? (imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`)
        : `${baseUrl}/placeholder-recipe.jpg`;
      
      const pubDate = recipe.createdAt 
        ? new Date(recipe.createdAt).toUTCString()
        : buildDate;

      const description = escapeXml(
        recipe.shortDescription || 
        recipe.description || 
        recipe.featuredText || 
        `Delicious ${recipe.title} recipe`
      );

      const title = escapeXml(recipe.title || 'Untitled Recipe');
      const category = escapeXml(recipe.category || 'Recipes');
      
      // Get author from authorRef relation (database) or fallback to site author
      const authorName = recipe.authorRef?.name || siteConfig.author.name;
      const authorEmail = siteConfig.author.email;
      const author = escapeXml(authorName);

      return `
    <item>
      <title>${title}</title>
      <link>${recipeUrl}</link>
      <guid isPermaLink="true">${recipeUrl}</guid>
      <description><![CDATA[${description}]]></description>
      <pubDate>${pubDate}</pubDate>
      <category>${category}</category>
      <author>${authorEmail} (${author})</author>
      ${imageUrl ? `
      <enclosure url="${fullImageUrl}" type="image/jpeg" />
      <media:content url="${fullImageUrl}" type="image/jpeg" medium="image">
        <media:title>${title}</media:title>
        <media:description>${description}</media:description>
      </media:content>` : ''}
    </item>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:media="http://search.yahoo.com/mrss/"
     xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(siteConfig.name)}</title>
    <link>${baseUrl}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>en-us</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${baseUrl}/icon.png</url>
      <title>${escapeXml(siteConfig.name)}</title>
      <link>${baseUrl}</link>
    </image>
    <copyright>${siteConfig.copyright.text}</copyright>
    <managingEditor>${siteConfig.author.email} (${escapeXml(siteConfig.author.name)})</managingEditor>
    <webMaster>${siteConfig.author.email} (${escapeXml(siteConfig.author.name)})</webMaster>
    <generator>${siteConfig.name} ${siteConfig.version}</generator>
    <ttl>60</ttl>${items}
  </channel>
</rss>`;
}

/**
 * Escape XML special characters
 */
function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
