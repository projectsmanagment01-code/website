import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  buildKeywordIndex,
  buildKeywordIndexWithAI,
  findLinkOpportunities,
  INTERNAL_LINKING_CONFIG,
  type ProcessedField,
} from '@/lib/internal-linking';

/**
 * POST /api/admin/internal-links/scan
 * Scan recipes for link opportunities and store suggestions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipeId, rescan = false, useAI = false } = body;
    
    // If specific recipeId provided, scan only that recipe
    if (recipeId) {
      const result = await scanSingleRecipe(recipeId, rescan, useAI);
      return NextResponse.json(result);
    }
    
    // Otherwise, scan all recipes
    const result = await scanAllRecipes(rescan, useAI);
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('Error scanning for internal links:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to scan recipes' },
      { status: 500 }
    );
  }
}

/**
 * Scan a single recipe for link opportunities
 */
async function scanSingleRecipe(recipeId: string, rescan: boolean, useAI: boolean) {
  // Get the recipe
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
  });
  
  if (!recipe) {
    throw new Error('Recipe not found');
  }
  
  // Delete existing suggestions if rescanning
  if (rescan) {
    await prisma.internalLinkSuggestion.deleteMany({
      where: { sourceRecipeId: recipeId }
    });
  }
  
  // Build keyword index from all recipes
  const allRecipes = await prisma.recipe.findMany();
  const keywordIndex = useAI 
    ? await buildKeywordIndexWithAI(allRecipes)
    : buildKeywordIndex(allRecipes);
  
  // Find link opportunities in each field
  const allOpportunities: any[] = [];
  
  for (const fieldName of INTERNAL_LINKING_CONFIG.processedFields) {
    let content = '';
    
    if (fieldName === 'intro') content = recipe.intro || '';
    else if (fieldName === 'story') content = recipe.story || '';
    else if (fieldName === 'description') content = recipe.description || '';
    else if (fieldName === 'instructions') {
      // Extract text from instructions JSON
      content = extractInstructionsText(recipe.instructions);
    }
    
    if (!content) continue;
    
    const opportunities = findLinkOpportunities(
      content,
      keywordIndex,
      recipeId,
      fieldName as ProcessedField
    );
    
    allOpportunities.push(...opportunities);
  }
  
  // Limit total suggestions per recipe
  const limitedOpportunities = allOpportunities
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, INTERNAL_LINKING_CONFIG.maxSuggestionsPerRecipe);
  
  // Store suggestions in database
  const suggestions = await Promise.all(
    limitedOpportunities.map(opp =>
      prisma.internalLinkSuggestion.create({
        data: {
          sourceRecipeId: opp.sourceRecipeId,
          targetRecipeId: opp.targetRecipeId,
          anchorText: opp.anchorText,
          fieldName: opp.fieldName,
          position: opp.position,
          relevanceScore: opp.relevanceScore,
          sentenceContext: opp.sentenceContext,
          status: 'pending',
        }
      })
    )
  );
  
  return {
    success: true,
    scannedRecipes: 1,
    totalSuggestions: suggestions.length,
    recipe: {
      id: recipe.id,
      title: recipe.title,
      slug: recipe.slug,
      suggestions: suggestions.length,
    }
  };
}

/**
 * Scan all recipes for link opportunities
 */
async function scanAllRecipes(rescan: boolean, useAI: boolean) {
  const startTime = Date.now();
  
  // Get all recipes
  const allRecipes = await prisma.recipe.findMany();
  
  // Delete all existing suggestions if rescanning
  if (rescan) {
    await prisma.internalLinkSuggestion.deleteMany({});
  }
  
  // Build keyword index once (with or without AI)
  const keywordIndex = useAI
    ? await buildKeywordIndexWithAI(allRecipes)
    : buildKeywordIndex(allRecipes);
  
  let totalSuggestions = 0;
  const recipeResults: any[] = [];
  
  // Process in batches
  const batchSize = INTERNAL_LINKING_CONFIG.batchSize;
  
  for (let i = 0; i < allRecipes.length; i += batchSize) {
    const batch = allRecipes.slice(i, i + batchSize);
    
    for (const recipe of batch) {
      const allOpportunities: any[] = [];
      
      // Scan each field
      for (const fieldName of INTERNAL_LINKING_CONFIG.processedFields) {
        let content = '';
        
        if (fieldName === 'intro') content = recipe.intro || '';
        else if (fieldName === 'story') content = recipe.story || '';
        else if (fieldName === 'description') content = recipe.description || '';
        else if (fieldName === 'instructions') {
          content = extractInstructionsText(recipe.instructions);
        }
        
        if (!content) continue;
        
        const opportunities = findLinkOpportunities(
          content,
          keywordIndex,
          recipe.id,
          fieldName as ProcessedField
        );
        
        allOpportunities.push(...opportunities);
      }
      
      // Limit and store suggestions
      const limitedOpportunities = allOpportunities
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, INTERNAL_LINKING_CONFIG.maxSuggestionsPerRecipe);
      
      if (limitedOpportunities.length > 0) {
        await prisma.internalLinkSuggestion.createMany({
          data: limitedOpportunities.map(opp => ({
            sourceRecipeId: opp.sourceRecipeId,
            targetRecipeId: opp.targetRecipeId,
            anchorText: opp.anchorText,
            fieldName: opp.fieldName,
            position: opp.position,
            relevanceScore: opp.relevanceScore,
            sentenceContext: opp.sentenceContext,
            status: 'pending',
          }))
        });
        
        totalSuggestions += limitedOpportunities.length;
        
        recipeResults.push({
          id: recipe.id,
          title: recipe.title,
          slug: recipe.slug,
          suggestions: limitedOpportunities.length,
        });
      }
    }
  }
  
  const duration = Date.now() - startTime;
  
  return {
    success: true,
    scannedRecipes: allRecipes.length,
    totalSuggestions,
    recipesWithSuggestions: recipeResults.length,
    durationMs: duration,
    topRecipes: recipeResults
      .sort((a, b) => b.suggestions - a.suggestions)
      .slice(0, 10),
  };
}

/**
 * Extract text from instructions JSON
 */
function extractInstructionsText(instructions: any): string {
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
    return String(instructions);
  }
  
  return '';
}
