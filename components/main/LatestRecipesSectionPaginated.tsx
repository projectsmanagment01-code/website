import React from 'react';
import LatestRecipesWithPagination from './LatestRecipesWithPagination';
import Recipe from '@/outils/types';

interface LatestRecipesSectionProps {
  className?: string;
  recipesPerPage?: number;
}

async function fetchInitialRecipes(limit: number = 8) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/recipe?page=1&limit=${limit}`, {
      next: { revalidate: 1800 }, // Revalidate every 30 minutes
      cache: 'force-cache',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch recipes');
    }

    const data = await response.json();
    return {
      recipes: data.recipes || [],
      total: data.pagination?.total || 0,
    };
  } catch (error) {
    console.error('Error fetching initial recipes:', error);
    return {
      recipes: [],
      total: 0,
    };
  }
}

export default async function LatestRecipesSection({
  className,
  recipesPerPage = 8,
}: LatestRecipesSectionProps) {
  const { recipes, total } = await fetchInitialRecipes(recipesPerPage);

  // Don't render if no recipes
  if (recipes.length === 0) {
    return null;
  }

  return (
    <LatestRecipesWithPagination
      initialRecipes={recipes}
      initialTotal={total}
      recipesPerPage={recipesPerPage}
    />
  );
}
