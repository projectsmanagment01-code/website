import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  insertLinksInContent,
  validateLinkInsertion,
  type ProcessedField,
} from '@/lib/internal-linking';

/**
 * POST /api/admin/internal-links/apply
 * Apply approved link suggestions to recipes
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { suggestionIds, recipeId } = body;
    
    if (!suggestionIds || !Array.isArray(suggestionIds) || suggestionIds.length === 0) {
      return NextResponse.json(
        { error: 'suggestionIds array is required' },
        { status: 400 }
      );
    }
    
    // Get selected suggestions (any status except already applied)
    const suggestions = await prisma.internalLinkSuggestion.findMany({
      where: {
        id: { in: suggestionIds },
        status: { not: 'applied' },
        ...(recipeId ? { sourceRecipeId: recipeId } : {})
      },
      include: {
        sourceRecipe: true,
        targetRecipe: {
          select: { slug: true }
        }
      }
    });
    
    if (suggestions.length === 0) {
      return NextResponse.json(
        { error: 'No suggestions found or all already applied' },
        { status: 404 }
      );
    }
    
    // Group suggestions by source recipe and field
    const groupedByRecipe: Record<string, Record<ProcessedField, typeof suggestions>> = {};
    
    for (const suggestion of suggestions) {
      const recipeId = suggestion.sourceRecipeId;
      const fieldName = suggestion.fieldName as ProcessedField;
      
      if (!groupedByRecipe[recipeId]) {
        groupedByRecipe[recipeId] = {} as any;
      }
      
      if (!groupedByRecipe[recipeId][fieldName]) {
        groupedByRecipe[recipeId][fieldName] = [];
      }
      
      groupedByRecipe[recipeId][fieldName].push(suggestion);
    }
    
    const results: any[] = [];
    
    // Apply links for each recipe
    for (const [recipeId, fields] of Object.entries(groupedByRecipe)) {
      const recipe = suggestions.find(s => s.sourceRecipeId === recipeId)?.sourceRecipe;
      
      if (!recipe) continue;
      
      const updateData: any = {};
      const appliedSuggestionIds: string[] = [];
      
      // Process each field
      for (const [fieldName, fieldSuggestions] of Object.entries(fields)) {
        // Get current content
        let content = '';
        
        if (fieldName === 'intro') content = recipe.intro || '';
        else if (fieldName === 'story') content = recipe.story || '';
        else if (fieldName === 'description') content = recipe.description || '';
        else if (fieldName === 'instructions') {
          content = extractInstructionsText(recipe.instructions);
        }
        
        if (!content) {
          console.log(`Skipping ${fieldName} for ${recipe.title} - no content`);
          continue;
        }
        
        console.log(`Processing ${fieldName} for ${recipe.title}: ${(fieldSuggestions as any[]).length} suggestions`);
        
        // Convert suggestions to opportunities format
        const opportunities = (fieldSuggestions as any[]).map(s => ({
          sourceRecipeId: s.sourceRecipeId,
          targetRecipeId: s.targetRecipeId,
          targetSlug: s.targetRecipe.slug,
          targetTitle: '',
          anchorText: s.anchorText,
          fieldName: s.fieldName,
          position: s.position,
          sentenceContext: s.sentenceContext,
          relevanceScore: s.relevanceScore,
          keywordType: 'unknown',
        }));
        
        // Insert links
        const result = insertLinksInContent(content, opportunities, fieldName as ProcessedField);
        
        console.log(`  Applied ${result.appliedLinks.length} out of ${opportunities.length} links`);
        
        // Validate
        const validation = validateLinkInsertion(result.updatedContent);
        
        if (!validation.valid) {
          console.error(`  Validation failed:`, validation.errors);
          continue;
        }
        
        // Update field (skip instructions for now)
        if (fieldName === 'instructions') {
          console.log(`  Skipping instructions update (needs special handling)`);
          continue;
        } else {
          updateData[fieldName] = result.updatedContent;
          console.log(`  Updated ${fieldName} successfully`);
        }
        
        // Track applied suggestions
        appliedSuggestionIds.push(...(fieldSuggestions as any[]).map(s => s.id));
      }
      
      // Update recipe if there are changes
      if (Object.keys(updateData).length > 0) {
        await prisma.recipe.update({
          where: { id: recipeId },
          data: updateData,
        });
        
        // Mark suggestions as applied
        await prisma.internalLinkSuggestion.updateMany({
          where: {
            id: { in: appliedSuggestionIds }
          },
          data: {
            status: 'applied',
            appliedAt: new Date(),
          }
        });
        
        results.push({
          recipeId,
          recipeTitle: recipe.title,
          recipeSlug: recipe.slug,
          fieldsUpdated: Object.keys(updateData),
          linksApplied: appliedSuggestionIds.length,
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      recipesUpdated: results.length,
      totalLinksApplied: results.reduce((sum, r) => sum + r.linksApplied, 0),
      details: results,
    });
    
  } catch (error: any) {
    console.error('Error applying links:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to apply links' },
      { status: 500 }
    );
  }
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
