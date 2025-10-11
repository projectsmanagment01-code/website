import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get all recipes and show their href status
    const recipes = await prisma.recipe.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        href: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const publicRecipes = await prisma.recipe.findMany({
      where: { href: { not: null } },
      select: {
        id: true,
        title: true,
        slug: true,
        href: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return NextResponse.json({
      message: 'Recipe status debug info',
      totalRecipes: recipes.length,
      publicRecipes: publicRecipes.length,
      allRecipes: recipes,
      visibleRecipes: publicRecipes,
    });
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json(
      { error: 'Failed to get debug info' },
      { status: 500 }
    );
  }
}