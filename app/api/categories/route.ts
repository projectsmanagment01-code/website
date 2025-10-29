export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { Category } from "@/outils/types";
import { prisma } from "@/lib/prisma";
import { safeImageUrl } from "@/lib/utils";
import { getCategories, getCategoryBySlug as getNewCategoryBySlug } from "@/lib/category-service-new";

// Helper function to create category from recipe data
function createCategoryFromName(
  categoryName: string,
  count: number,
  link: string,
  image?: string
): Category {
  // Normalize category name for consistent slug generation
  const normalizedName = categoryName
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .toLowerCase()
    .trim();

  const slug = normalizedName.replace(/\s+/g, "-");

  // Use recipe image - check if it already has the full path or just filename
  let categoryImage = "https://c.animaapp.com/mer35j4wJPAxku/assets/1753113321200-qrb53cbf.webp";
  if (image) {
    // If image already starts with /uploads, use it as-is
    // Otherwise, prepend the uploads path
    const rawPath = image.startsWith('/uploads') ? image : `/uploads/recipes/${image}`;
    // IMPORTANT: Encode URL to handle legacy filenames with spaces
    categoryImage = safeImageUrl(rawPath);
  }

  return {
    id: slug,
    slug,
    title: normalizedName
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
    href: link,
    description: `Discover ${count} delicious ${normalizedName} recipes`,
    image: categoryImage,
    alt: `${normalizedName} recipes`,
    sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
    recipeCount: count,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    // If slug is provided, get specific category with details
    if (slug) {
      const category = await getNewCategoryBySlug(slug, true); // Include recipes
      
      if (!category) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 404 }
        );
      }

      // Convert to frontend format
      const categoryResponse: Category = {
        id: category.id,
        slug: category.slug,
        title: category.name,
        href: `/categories/${category.slug}`,
        alt: `${category.name} recipes`,
        description: category.description || `Discover delicious ${category.name} recipes`,
        image: safeImageUrl(category.image),
        sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
        recipeCount: (category as any).recipes?.length || 0
      };

      return NextResponse.json(categoryResponse);
    }

    // NEW SYSTEM: Get categories from Category table
    try {
      const dbCategories = await getCategories({
        includeInactive: false,
        includeCount: true,
        orderBy: 'order',
        orderDirection: 'asc'
      });
      
      // If we have categories in the database, use them
      if (dbCategories && dbCategories.length > 0) {
        // ✅ OPTIMIZED: Get old system counts in ONE batched query
        const oldSystemCounts = await prisma.recipe.groupBy({
          by: ['category'],
          where: {
            category: {
              not: ''
            }
          },
          _count: {
            id: true
          }
        });

        // Create lookup map for O(1) access
        const oldCountMap = new Map<string, number>();
        oldSystemCounts.forEach((group) => {
          if (group.category && group._count && typeof group._count === 'object' && 'id' in group._count) {
            oldCountMap.set(group.category.toLowerCase(), group._count.id);
          }
        });

        // HYBRID COUNT: Use BOTH new categoryId and old category string
        const categoriesWithHybridCount = dbCategories.map((cat) => {
          // Count recipes with new categoryId relationship
          const newSystemCount = cat._count?.recipes || 0;
          
          // Count recipes with old category string (from batched query)
          const oldSystemCount = oldCountMap.get(cat.slug.toLowerCase()) || 0;
          
          // Use whichever count is higher (handles partial migration)
          const totalCount = Math.max(newSystemCount, oldSystemCount);
          
          return {
            id: cat.id,
            slug: cat.slug,
            title: cat.name,
            href: `/categories/${cat.slug}`,
            alt: `${cat.name} recipes`,
            description: cat.description || `Discover ${totalCount} delicious ${cat.name} recipes`,
            image: safeImageUrl(cat.image),
            sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
            recipeCount: totalCount
          };
        });
        
        return NextResponse.json(categoriesWithHybridCount);
      }
    } catch (catError) {
      console.warn('⚠️ New category system not ready, falling back to old system:', catError);
    }
    
    // FALLBACK: Old system (for backward compatibility during migration)
    const recipes = await prisma.recipe.findMany({
      select: {
        category: true,
        categoryLink: true,
        images: true,
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    const categoryMap = new Map<
      string,
      { count: number; link: string; image?: string }
    >();

    recipes.forEach((recipe: any) => {
      if (recipe.category) {
        const existing = categoryMap.get(recipe.category);
        if (existing) {
          existing.count += 1;
        } else {
          const firstImage = recipe.images?.[0] || null;
          categoryMap.set(recipe.category, {
            count: 1,
            link: `/categories/${recipe.category
              .toLowerCase()
              .replace(/\s+/g, "-")}`,
            image: firstImage,
          });
        }
      }
    });

    const categories = Array.from(categoryMap.entries()).map(
      ([categoryName, { count, link, image }]) =>
        createCategoryFromName(categoryName, count, link, image)
    );

    const sortedCategories = categories.sort(
      (a, b) => (b.recipeCount || 0) - (a.recipeCount || 0)
    );

    // PUBLIC API: Enable caching for performance
    return NextResponse.json(sortedCategories, {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'CDN-Cache-Control': 'public, max-age=3600',
        'Cache-Tag': 'categories',
      },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    
    // Provide fallback categories instead of just error
    const fallbackCategories: Category[] = [
      {
        id: "breakfast",
        slug: "breakfast",
        title: "Breakfast",
        href: "/categories/breakfast",
        alt: "Breakfast recipes",
        description: "Start your day with delicious breakfast recipes",
        image: "/images/categories/default.jpg",
        sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
        recipeCount: 0
      },
      {
        id: "lunch", 
        slug: "lunch",
        title: "Lunch",
        href: "/categories/lunch",
        alt: "Lunch recipes",
        description: "Quick and tasty lunch ideas",
        image: "/images/categories/default.jpg",
        sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
        recipeCount: 0
      },
      {
        id: "dinner",
        slug: "dinner", 
        title: "Dinner",
        href: "/categories/dinner",
        alt: "Dinner recipes",
        description: "Hearty dinner recipes for the family",
        image: "/images/categories/default.jpg",
        sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
        recipeCount: 0
      },
      {
        id: "desserts",
        slug: "desserts",
        title: "Desserts", 
        href: "/categories/desserts",
        alt: "Dessert recipes",
        description: "Sweet treats and dessert recipes",
        image: "/images/categories/default.jpg",
        sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
        recipeCount: 0
      }
    ];
    
    console.log("🔄 Using fallback categories due to database error");
    return NextResponse.json(fallbackCategories, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        'CDN-Cache-Control': 'public, max-age=300',
      },
    });
  }
}
