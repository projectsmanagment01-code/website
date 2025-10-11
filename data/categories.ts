// types/category.ts

import { Category } from "@/outils/types";

// Default responsive sizes
export const CATEGORY_SIZES =
  "(min-width: 1400px) 372px, (min-width: 1040px) calc(33.24vw - 27px), (min-width: 780px) calc(50vw - 29px), calc(100vw - 32px)";

// Check if we're in mock mode
const MOCK_MODE = process.env.MOCK === "true";

// Static categories for mock mode
const staticCategories: Category[] = [
  {
    id: "1",
    slug: "morning_favorite",
    title: "Morning Favorite",
    href: "/categories/morning_favorites",
    alt: "Delicious Morning Favorites",
    description: "Best Breakfast and Brunch Recipes",
    image:
      "https://c.animaapp.com/mer35j4wJPAxku/assets/1753113321200-qrb53cbf.webp",
  },
  {
    id: "2",
    slug: "quick_lunch",
    title: "Quick Lunch",
    href: "/categories/quick_lunch",
    alt: "Tasty Lunch Ideas",
    description: "Fast and Easy Lunch Recipes",
    image:
      "https://c.animaapp.com/mer35j4wJPAxku/assets/1753113321200-qrb53cbf.webp",
  },
  {
    id: "3",
    slug: "family_dinner",
    title: "Family Dinner",
    href: "/categories/family_dinner",
    alt: "Family Dinner Recipes",
    description: "Wholesome Meals for the Whole Family",
    image:
      "https://c.animaapp.com/mer35j4wJPAxku/assets/1753113321200-qrb53cbf.webp",
  },
];

/**
 * Get all categories - either from API (real data) or static (mock mode)
 */
export async function getCategories(): Promise<Category[]> {
  if (MOCK_MODE) {
    console.log("📂 Using static categories (MOCK_MODE)");
    return staticCategories;
  }

  try {
    console.log("🌐 Fetching dynamic categories from API");
    const response = await fetch("/api/categories");

    if (!response.ok) {
      console.warn(
        "⚠️ Failed to fetch categories from API, falling back to static"
      );
      return staticCategories;
    }

    const categories = await response.json();
    console.log("✅ Loaded", categories.length, "dynamic categories");
    return categories;
  } catch (error) {
    console.error("❌ Error fetching categories:", error);
    console.log("📂 Falling back to static categories");
    return staticCategories;
  }
}

// Export static categories for backward compatibility
export const categories = staticCategories;
