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
    if (!confirm(`Generate SEO reports for all recipes?\n\nThis may take a few minutes and will use OpenAI API credits.`)) {
      return;
    }

    try {
      setIsGenerating(true);
      const response = await fetch('/api/seo/generate-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ SEO Generation Complete!\n\nSuccess: ${data.summary.success}\nFailed: ${data.summary.failed}\n\nRefresh to see updated scores.`);
        // Refresh scores
        await fetchSEOScores();
      } else {
        const error = await response.json();
        throw new Error(error.details || error.error);
      }
    } catch (error: any) {
      console.error('Failed to generate SEO:', error);
      alert(`❌ SEO generation failed:\n${error.message}\n\nMake sure OPENAI_API_KEY is set in your .env file.`);
    } finally {
      setIsGenerating(false);
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
              Some recipes don't have SEO reports yet. Generate AI-powered SEO enhancements for all recipes.
            </p>
          </div>
          <button
            onClick={handleGenerateSEO}
            disabled={isGenerating}
            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate SEO
              </>
            )}
          </button>
        </div>
      )}
      
      <BaseRecipeTable
        {...props}
        recipes={enrichedRecipes}
      />
    </div>
  );
};
