import { PrismaClient } from '@prisma/client';
import { INTERNAL_LINKING_CONFIG } from './config';

export interface OrphanPageData {
  recipeId: string;
  recipeSlug: string;
  recipeTitle: string;
  incomingLinksCount: number;
  outgoingLinksCount: number;
  isOrphan: boolean;
  lastScannedAt: Date;
}

/**
 * Find orphan pages (recipes with few incoming links)
 */
export async function findOrphanPages(prisma: PrismaClient): Promise<OrphanPageData[]> {
  // Get all recipes
  const recipes = await prisma.recipe.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      intro: true,
      story: true,
      description: true,
      instructions: true,
    },
  });
  
  const orphanData: OrphanPageData[] = [];
  const linkCounts = await calculateLinkCounts(prisma, recipes);
  
  for (const recipe of recipes) {
    const counts = linkCounts[recipe.id] || { incoming: 0, outgoing: 0 };
    const isOrphan = counts.incoming < INTERNAL_LINKING_CONFIG.orphanThreshold;
    
    orphanData.push({
      recipeId: recipe.id,
      recipeSlug: recipe.slug,
      recipeTitle: recipe.title,
      incomingLinksCount: counts.incoming,
      outgoingLinksCount: counts.outgoing,
      isOrphan,
      lastScannedAt: new Date(),
    });
  }
  
  // Sort by incoming links (ascending) - most orphaned first
  return orphanData.sort((a, b) => a.incomingLinksCount - b.incomingLinksCount);
}

/**
 * Calculate incoming and outgoing link counts for all recipes
 */
async function calculateLinkCounts(
  prisma: PrismaClient,
  recipes: Array<{ id: string; intro: string | null; story: string | null; description: string | null; instructions: any }>
): Promise<Record<string, { incoming: number; outgoing: number }>> {
  const linkCounts: Record<string, { incoming: number; outgoing: number }> = {};
  
  // Initialize counts
  recipes.forEach(recipe => {
    linkCounts[recipe.id] = { incoming: 0, outgoing: 0 };
  });
  
  // Create slug-to-id mapping
  const slugToId: Record<string, string> = {};
  const allRecipes = await prisma.recipe.findMany({
    select: { id: true, slug: true }
  });
  
  allRecipes.forEach(r => {
    slugToId[r.slug] = r.id;
  });
  
  // Count links in recipe content
  for (const recipe of recipes) {
    const contentFields = [
      recipe.intro,
      recipe.story,
      recipe.description,
      extractTextFromInstructions(recipe.instructions)
    ];
    
    const allContent = contentFields.filter(Boolean).join(' ');
    const links = extractRecipeLinks(allContent);
    
    // Count outgoing links
    linkCounts[recipe.id].outgoing = links.length;
    
    // Count incoming links for target recipes
    links.forEach(targetSlug => {
      const targetId = slugToId[targetSlug];
      if (targetId && linkCounts[targetId]) {
        linkCounts[targetId].incoming++;
      }
    });
  }
  
  return linkCounts;
}

/**
 * Extract recipe slugs from internal links
 */
function extractRecipeLinks(content: string): string[] {
  if (!content) return [];
  
  const regex = /<a\s+[^>]*href="\/recipes\/([^"]+)"[^>]*>/gi;
  const slugs: string[] = [];
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    slugs.push(match[1]);
  }
  
  return slugs;
}

/**
 * Extract text content from instructions JSON
 */
function extractTextFromInstructions(instructions: any): string {
  if (!instructions) return '';
  
  try {
    const data = typeof instructions === 'string' ? JSON.parse(instructions) : instructions;
    
    if (Array.isArray(data)) {
      return data
        .map((step: any) => step.instruction || step.text || '')
        .join(' ')
        .trim();
    }
  } catch (e) {
    // Return as-is if not JSON
    return String(instructions);
  }
  
  return '';
}

/**
 * Update OrphanPage records in database
 */
export async function updateOrphanPagesInDB(
  prisma: PrismaClient,
  orphanData: OrphanPageData[]
): Promise<void> {
  // Delete old records
  await prisma.orphanPage.deleteMany({});
  
  // Insert new records
  await prisma.orphanPage.createMany({
    data: orphanData.map(data => ({
      recipeId: data.recipeId,
      incomingLinks: data.incomingLinksCount,
      outgoingLinks: data.outgoingLinksCount,
      isOrphan: data.isOrphan,
      priority: data.isOrphan ? 'high' : 'low',
      lastChecked: data.lastScannedAt,
      suggestions: [], // Empty for now, can be populated later
    }))
  });
}

/**
 * Get prioritized orphan pages (most in need of links)
 */
export async function getPrioritizedOrphans(
  prisma: PrismaClient,
  limit: number = 20
): Promise<OrphanPageData[]> {
  const orphans = await prisma.orphanPage.findMany({
    where: {
      isOrphan: true,
    },
    include: {
      recipe: {
        select: {
          slug: true,
          title: true,
        }
      }
    },
    orderBy: [
      { incomingLinks: 'asc' },
      { priority: 'desc' }
    ],
    take: limit,
  });
  
  return orphans.map(o => ({
    recipeId: o.recipeId,
    recipeSlug: o.recipe.slug,
    recipeTitle: o.recipe.title,
    incomingLinksCount: o.incomingLinks,
    outgoingLinksCount: o.outgoingLinks,
    isOrphan: o.isOrphan,
    lastScannedAt: o.lastChecked,
  }));
}
