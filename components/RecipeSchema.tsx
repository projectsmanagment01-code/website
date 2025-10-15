import { Recipe } from "@/outils/types";
import { getSiteSettings } from "@/lib/server-utils";

interface RecipeSchemaProps {
  recipe: Recipe;
}

export default async function RecipeSchema({ recipe }: RecipeSchemaProps) {
  // Get site settings to use the actual website URL and name
  const siteSettings = await getSiteSettings();
  // Helper function to parse time strings (e.g., "30 minutes", "1 hour 15 minutes")
  const parseTimeToISO8601 = (timeString: string): string => {
    if (!timeString) return "PT0M";
    
    const lowerTime = timeString.toLowerCase();
    let totalMinutes = 0;
    
    // Extract hours
    const hoursMatch = lowerTime.match(/(\d+)\s*hours?/);
    if (hoursMatch) totalMinutes += parseInt(hoursMatch[1]) * 60;
    
    // Extract minutes
    const minutesMatch = lowerTime.match(/(\d+)\s*(?:minutes?|mins?)/);
    if (minutesMatch) totalMinutes += parseInt(minutesMatch[1]);
    
    // If no specific time found, try to extract just numbers
    if (totalMinutes === 0) {
      const numberMatch = lowerTime.match(/(\d+)/);
      if (numberMatch) totalMinutes = parseInt(numberMatch[1]);
    }
    
    return `PT${totalMinutes}M`;
  };

  // Helper function to extract nutrition info if available
  const extractNutrition = () => {
    // This could be expanded based on your recipe data structure
    // For now, we'll return null if no nutrition data is available
    return null;
  };

  // Helper function to extract rating if available
  const extractRating = () => {
    // This could be expanded if you have rating data
    // For now, we'll return null
    return null;
  };

  // Use the site URL from settings (from content management system)
  // This way when you update it in the CMS, it automatically updates everywhere
  const baseUrl = siteSettings.siteDomain ||
                  process.env.NEXT_PUBLIC_BASE_URL || 
                  process.env.NEXT_PUBLIC_SITE_URL || 
                  'https://www.flavorfable.com';

  // Build the structured data object
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.description || recipe.shortDescription,
    image: recipe.images?.map(img => 
      img.startsWith('http') ? img : `${baseUrl}${img}`
    ) || [],
    
    // Author information
    author: {
      "@type": "Person",
      name: recipe.author?.name || "Recipe Author",
      ...(recipe.author?.link && { url: recipe.author.link })
    },

    // Date information
    datePublished: recipe.createdAt || recipe.updatedDate,
    dateModified: recipe.updatedAt || recipe.updatedDate,

    // Recipe category and cuisine
    recipeCategory: recipe.category,
    recipeCuisine: recipe.recipeInfo?.cuisine,

    // Timing information
    prepTime: parseTimeToISO8601(recipe.timing?.prepTime || ""),
    cookTime: parseTimeToISO8601(recipe.timing?.cookTime || ""),
    totalTime: parseTimeToISO8601(recipe.timing?.totalTime || ""),

    // Yield/Servings
    recipeYield: recipe.recipeInfo?.servings || recipe.serving,

    // Ingredients
    recipeIngredient: recipe.ingredients?.flatMap(group => 
      group.items || []
    ) || [],

    // Instructions
    recipeInstructions: recipe.instructions?.map((instruction, index) => ({
      "@type": "HowToStep",
      name: `Step ${index + 1}`,
      text: instruction.instruction,
      position: index + 1
    })) || [],

    // Keywords (tags, dietary info, etc.)
    keywords: [
      recipe.category,
      recipe.recipeInfo?.cuisine,
      recipe.recipeInfo?.dietary,
      recipe.recipeInfo?.difficulty,
      ...(recipe.mustKnowTips || [])
    ].filter(Boolean).join(", "),

    // Additional recipe info
    ...(recipe.recipeInfo?.difficulty && {
      difficulty: recipe.recipeInfo.difficulty
    }),

    // Tools/Equipment needed
    ...(recipe.tools && recipe.tools.length > 0 && {
      tool: recipe.tools.map(tool => ({
        "@type": "HowToTool",
        name: tool
      }))
    }),

    // Recipe notes
    ...(recipe.notes && recipe.notes.length > 0 && {
      recipeNote: recipe.notes.join(" ")
    }),

    // Video (if available in the future)
    // video: { ... }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemaData, null, 2)
      }}
    />
  );
}