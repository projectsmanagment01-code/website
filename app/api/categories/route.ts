export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getCategoryBySlug } from "@/lib/category-service";
import { Category } from "@/outils/types";
import { prisma } from "@/lib/prisma";

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

  // Use recipe image - it's already a full URL or path, don't add prefix
  const categoryImage = image || "https://c.animaapp.com/mer35j4wJPAxku/assets/1753113321200-qrb53cbf.webp";

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
      const category = await getCategoryBySlug(slug);
      
      if (!category) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 404 }
        );
      }

      // Convert CategoryEntity to Category format for frontend compatibility
      const categoryResponse: Category = {
        id: category.id,
        slug: category.slug,
        title: category.name,
        href: `/categories/${category.slug}`,
        alt: `${category.name} recipes`,
        description: category.description || `Discover delicious ${category.name} recipes`,
        image: "https://c.animaapp.com/mer35j4wJPAxku/assets/1753113321200-qrb53cbf.webp",
        sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
        recipeCount: 0 // TODO: Add recipe count from relationships
      };

      return NextResponse.json(categoryResponse);
    }

    // Get all categories from recipes (the correct approach)
    const recipes = await prisma.recipe.findMany({
      select: {
        category: true,
        categoryLink: true,
        featureImage: true,
        heroImage: true,
        images: true, // Include images array as fallback
      },
    });

    const categoryMap = new Map<
      string,
      { count: number; link: string; image?: string }
    >();

    recipes.forEach((recipe: any) => {
      if (recipe.category) {
        const existing = categoryMap.get(recipe.category);
        
        // Get image: prefer local paths from named fields, then images array
        let recipeImage = recipe.featureImage || recipe.heroImage;
        
        // If image is external URL or null, fallback to first local image from images array
        if (!recipeImage || recipeImage.startsWith('http')) {
          recipeImage = recipe.images && recipe.images.length > 0 ? recipe.images[0] : null;
        }
        
        if (existing) {
          existing.count += 1;
          // Use first available local image
          if (!existing.image && recipeImage) {
            existing.image = recipeImage;
          }
        } else {
          categoryMap.set(recipe.category, {
            count: 1,
            link: `/categories/${recipe.category
              .toLowerCase()
              .replace(/\s+/g, "-")}`,
            image: recipeImage,
          });
        }
      }
    });

    const categories = Array.from(categoryMap.entries()).map(
      ([categoryName, { count, link, image }]) =>
        createCategoryFromName(categoryName, count, link, image)
    );

    // Sort by recipe count (most recipes first)
    const sortedCategories = categories.sort(
      (a, b) => (b.recipeCount || 0) - (a.recipeCount || 0)
    );

    return NextResponse.json(sortedCategories);
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
    return NextResponse.json(fallbackCategories);
  }
}
