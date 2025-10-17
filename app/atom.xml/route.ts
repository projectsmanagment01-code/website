import { NextResponse } from 'next/server';
import { siteConfig } from '@/config/site';
import { prisma } from '@/lib/prisma';

/**
 * Atom Feed Generator for Recipe Website
 * Provides an Atom 1.0 feed as an alternative to RSS
 * Dynamically fetches fresh data from database
 */
export async function GET() {
  try {
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

    // Generate Atom XML
    const atomXml = generateAtomFeed(recipes);

    return new NextResponse(atomXml, {
      headers: {
        'Content-Type': 'application/atom+xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600', // 30 min cache
      },
    });
  } catch (error) {
    console.error('Error generating Atom feed:', error);
    return new NextResponse('Error generating feed', { status: 500 });
  }
}

/**
 * Generate Atom 1.0 Feed XML
 */
function generateAtomFeed(recipes: any[]): string {
  const baseUrl = siteConfig.url;
  const updated = new Date().toISOString();

  const entries = recipes
    .map(recipe => {
      const recipeUrl = `${baseUrl}${recipe.href}`;
      const imageUrl = recipe.heroImage || recipe.featureImage || recipe.images?.[0];
      const fullImageUrl = imageUrl 
        ? (imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`)
        : `${baseUrl}/placeholder-recipe.jpg`;
      
      const published = recipe.createdAt 
        ? new Date(recipe.createdAt).toISOString()
        : updated;

      const updatedDate = recipe.updatedAt 
        ? new Date(recipe.updatedAt).toISOString()
        : published;

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
  <entry>
    <title>${title}</title>
    <link href="${recipeUrl}" rel="alternate" type="text/html"/>
    <id>${recipeUrl}</id>
    <published>${published}</published>
    <updated>${updatedDate}</updated>
    <author>
      <name>${author}</name>
      <email>${authorEmail}</email>
    </author>
    <category term="${category}"/>
    <summary type="html"><![CDATA[${description}]]></summary>
    <content type="html"><![CDATA[
      <img src="${fullImageUrl}" alt="${title}" style="max-width: 100%; height: auto;"/>
      <p>${description}</p>
      <p><a href="${recipeUrl}">Read the full recipe →</a></p>
    ]]></content>
  </entry>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(siteConfig.name)}</title>
  <link href="${baseUrl}" rel="alternate" type="text/html"/>
  <link href="${baseUrl}/atom.xml" rel="self" type="application/atom+xml"/>
  <id>${baseUrl}/</id>
  <updated>${updated}</updated>
  <subtitle>${escapeXml(siteConfig.description)}</subtitle>
  <rights>${siteConfig.copyright.text}</rights>
  <generator uri="${baseUrl}" version="${siteConfig.version}">${siteConfig.name}</generator>
  <author>
    <name>${escapeXml(siteConfig.author.name)}</name>
    <email>${siteConfig.author.email}</email>
  </author>
  <icon>${baseUrl}/icon.png</icon>
  <logo>${baseUrl}/icon.png</logo>${entries}
</feed>`;
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
