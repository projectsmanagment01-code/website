/**
 * Recipe Table with SEO Scores
 * Wraps RecipeTable and enriches recipes with real SEO scores from database
 */
"use client";

import React, { useEffect, useState } from 'react';
import { Recipe } from '@/outils/types';
import { RecipeTable as BaseRecipeTable } from './RecipeTable';
import { Loader2, Sparkles } from 'lucide-react';

interface RecipeTableWithSEOProps {
  recipes: Recipe[];
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

interface SEOReport {
  recipeId: string;
  seoScore: number;
  status: string;
}

export const RecipeTableWithSEO: React.FC<RecipeTableWithSEOProps> = (props) => {
  const [enrichedRecipes, setEnrichedRecipes] = useState<Recipe[]>(props.recipes);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenerateButton, setShowGenerateButton] = useState(false);
  const [selectedRecipes, setSelectedRecipes] = useState<Set<string>>(new Set());
  const [generationProgress, setGenerationProgress] = useState<{
    current: number;
    total: number;
    currentRecipe?: string;
  }>({ current: 0, total: 0 });

  // Fetch SEO scores on mount and when recipes change
  useEffect(() => {
    fetchSEOScores();
  }, [props.recipes]);

  const fetchSEOScores = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/seo/reports');
      
      if (response.ok) {
        const data = await response.json();
        const reports: SEOReport[] = data.reports || [];
        
        // Create a map of recipeId -> seoScore
        const scoreMap = new Map<string, number>();
        reports.forEach((report: SEOReport) => {
          if (report.status === 'success') {
            scoreMap.set(report.recipeId, report.seoScore);
          }
        });
        
        // Enrich recipes with SEO scores
        const enriched = props.recipes.map(recipe => ({
          ...recipe,
          seoScore: scoreMap.get(recipe.id) || 0
        }));
        
        setEnrichedRecipes(enriched);
        
        // Show generate button if any recipe has no SEO score
        const hasRecipesWithoutSEO = enriched.some(r => !r.seoScore || r.seoScore === 0);
        setShowGenerateButton(hasRecipesWithoutSEO);
      }
    } catch (error) {
      console.error('Failed to fetch SEO scores:', error);
      setEnrichedRecipes(props.recipes);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSEO = async () => {
    // Determine which recipes to process
    const recipesToProcess = selectedRecipes.size > 0 
      ? Array.from(selectedRecipes)
      : enrichedRecipes
          .filter(r => !r.seoScore || r.seoScore === 0)
          .map(r => r.id);

    if (recipesToProcess.length === 0) {
      alert('No recipes selected or all recipes already have SEO scores.');
      return;
    }

    const confirmMessage = selectedRecipes.size > 0
      ? `Generate SEO reports for ${recipesToProcess.length} selected recipe(s)?`
      : `Generate SEO reports for ${recipesToProcess.length} recipe(s) without SEO scores?`;

    if (!confirm(`${confirmMessage}\n\nThis may take a few minutes and will use OpenAI API credits.\nRecipes will be processed one by one to avoid API limits.`)) {
      return;
    }

    try {
      setIsGenerating(true);
      setGenerationProgress({ current: 0, total: recipesToProcess.length });
      
      let successCount = 0;
      let failedCount = 0;
      const failedRecipes: string[] = [];

      // Process recipes one by one
      for (let i = 0; i < recipesToProcess.length; i++) {
        const recipeId = recipesToProcess[i];
        const recipe = enrichedRecipes.find(r => r.id === recipeId);
        
        setGenerationProgress({ 
          current: i + 1, 
          total: recipesToProcess.length,
          currentRecipe: recipe?.title || recipeId
        });

        try {
          const response = await fetch('/api/seo/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recipeId })
          });

          if (response.ok) {
            successCount++;
          } else {
            const error = await response.json();
            console.error(`Failed to generate SEO for recipe ${recipeId}:`, error);
            failedCount++;
            failedRecipes.push(recipe?.title || recipeId);
          }
        } catch (error) {
          console.error(`Error processing recipe ${recipeId}:`, error);
          failedCount++;
          failedRecipes.push(recipe?.title || recipeId);
        }

        // Small delay between requests to be nice to the API
        if (i < recipesToProcess.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Show completion message
      let message = `✅ SEO Generation Complete!\n\nSuccess: ${successCount}\nFailed: ${failedCount}`;
      if (failedRecipes.length > 0) {
        message += `\n\nFailed recipes:\n${failedRecipes.join('\n')}`;
      }
      alert(message);

      // Refresh scores and clear selection
      await fetchSEOScores();
      setSelectedRecipes(new Set());
      
    } catch (error: any) {
      console.error('Failed to generate SEO:', error);
      alert(`❌ SEO generation failed:\n${error.message}\n\nMake sure OPENAI_API_KEY is set in your .env file.`);
    } finally {
      setIsGenerating(false);
      setGenerationProgress({ current: 0, total: 0 });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        <span className="ml-3 text-gray-600">Loading SEO scores...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {showGenerateButton && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              AI SEO Enhancement Available
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              {selectedRecipes.size > 0 
                ? `Generate SEO for ${selectedRecipes.size} selected recipe(s).`
                : `Some recipes don't have SEO reports yet. Generate AI-powered SEO enhancements.`}
            </p>
          </div>
          <button
            onClick={handleGenerateSEO}
            disabled={isGenerating}
            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
          >
            {isGenerating ? 'Generating...' : 'Generate SEO'}
          </button>
        </div>
      )}

      {/* Progress display during SEO generation */}
      {isGenerating && generationProgress.total > 0 && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-800">
              Generating SEO Reports...
            </span>
            <span className="text-sm text-green-600">
              {generationProgress.current} / {generationProgress.total}
            </span>
          </div>
          <div className="w-full bg-green-200 rounded-full h-2 mb-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(generationProgress.current / generationProgress.total) * 100}%` }}
            />
          </div>
          {generationProgress.currentRecipe && (
            <p className="text-xs text-green-700">
              Processing: {generationProgress.currentRecipe}
            </p>
          )}
        </div>
      )}
      
      <BaseRecipeTable
        {...props}
        recipes={enrichedRecipes}
      />
    </div>
  );
};
