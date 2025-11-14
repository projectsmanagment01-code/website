/**
 * Category Matcher Service
 * Automatically matches recipes to correct categories based on keywords, tags, and content analysis
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CategoryMatchResult {
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  confidence: number; // 0-100
  matchReasons: string[];
}

export class CategoryMatcher {
  
  /**
   * Category keyword mapping - defines what keywords/tags belong to each category
   */
  private static categoryKeywords: Record<string, string[]> = {
    // Breakfast & Morning
    'breakfast': ['breakfast', 'morning', 'brunch', 'pancake', 'waffle', 'oatmeal', 'cereal', 'toast', 'egg', 'omelet', 'frittata', 'bagel', 'muffin', 'granola', 'smoothie bowl'],
    'morning_favorite': ['breakfast', 'morning', 'brunch', 'pancake', 'waffle', 'french toast', 'eggs', 'bacon', 'sausage'],
    
    // Lunch
    'lunch': ['lunch', 'sandwich', 'salad', 'wrap', 'burrito', 'bowl', 'pita', 'panini', 'soup and sandwich', 'quick lunch'],
    'quick_lunch': ['lunch', 'quick', 'fast', 'easy', 'sandwich', 'wrap', '15 minute', '20 minute', 'no cook'],
    
    // Dinner & Evening
    'dinner': ['dinner', 'supper', 'evening', 'main course', 'entrée', 'family meal', 'weeknight dinner'],
    'family_dinner': ['dinner', 'family', 'casserole', 'baked', 'roast', 'pot', 'stew', 'comfort food'],
    'evening_meals': ['dinner', 'evening', 'supper', 'main dish', 'entrée'],
    
    // Appetizers & Snacks
    'appetizer': ['appetizer', 'starter', 'hors d\'oeuvre', 'finger food', 'party food', 'snack', 'dip', 'spread', 'bite', 'crostini', 'bruschetta'],
    'snack': ['snack', 'bite', 'nibble', 'munchie', 'treat', 'quick bite', 'healthy snack'],
    
    // Desserts & Sweets
    'dessert': ['dessert', 'sweet', 'cake', 'cookie', 'brownie', 'pie', 'tart', 'pudding', 'ice cream', 'gelato', 'pastry', 'candy', 'chocolate', 'frosting', 'icing'],
    'cake': ['cake', 'cupcake', 'layer cake', 'sheet cake', 'bundt', 'pound cake', 'sponge cake', 'frosting', 'icing'],
    'cookies': ['cookie', 'biscuit', 'bar cookie', 'drop cookie', 'cut-out cookie'],
    
    // Bread & Baking
    'bread': ['bread', 'loaf', 'baguette', 'roll', 'bun', 'focaccia', 'ciabatta', 'sourdough', 'yeast bread', 'quick bread'],
    'baking': ['baking', 'baked', 'oven', 'dough', 'pastry', 'scone', 'biscuit'],
    
    // Soups & Stews
    'soup': ['soup', 'broth', 'stock', 'bisque', 'chowder', 'consommé', 'gazpacho'],
    'stew': ['stew', 'chili', 'gumbo', 'ragout', 'hotpot', 'slow cooker'],
    
    // Salads
    'salad': ['salad', 'greens', 'lettuce', 'coleslaw', 'slaw', 'chopped salad', 'caesar', 'cobb'],
    
    // Pasta & Noodles
    'pasta': ['pasta', 'spaghetti', 'penne', 'rigatoni', 'fettuccine', 'linguine', 'ravioli', 'lasagna', 'macaroni', 'noodle'],
    
    // Rice & Grains
    'rice': ['rice', 'risotto', 'pilaf', 'fried rice', 'rice bowl', 'biryani'],
    'grain': ['grain', 'quinoa', 'couscous', 'bulgur', 'farro', 'barley', 'wheat berry'],
    
    // Meat & Protein
    'chicken': ['chicken', 'poultry', 'hen', 'rooster', 'chicken breast', 'chicken thigh', 'drumstick'],
    'beef': ['beef', 'steak', 'ground beef', 'roast beef', 'brisket', 'short rib', 'sirloin'],
    'lamb': ['lamb', 'mutton', 'lamb chop', 'leg of lamb', 'lamb shank'],
    'seafood': ['fish', 'seafood', 'shrimp', 'salmon', 'tuna', 'cod', 'tilapia', 'crab', 'lobster', 'scallop', 'clam', 'mussel'],
    'vegetarian': ['vegetarian', 'veggie', 'meatless', 'plant-based', 'meat-free'],
    'vegan': ['vegan', 'plant-based', 'dairy-free', 'egg-free'],
    
    // Cuisines
    'italian': ['italian', 'italian-american', 'tuscan', 'sicilian', 'napoletana'],
    'mexican': ['mexican', 'tex-mex', 'taco', 'enchilada', 'quesadilla', 'burrito', 'fajita', 'salsa'],
    'asian': ['asian', 'chinese', 'japanese', 'thai', 'korean', 'vietnamese', 'indian', 'stir fry', 'curry'],
    'mediterranean': ['mediterranean', 'greek', 'middle eastern', 'lebanese', 'turkish'],
    'american': ['american', 'bbq', 'barbecue', 'southern', 'comfort food'],
    
    // Cooking Methods
    'grilled': ['grill', 'grilled', 'bbq', 'barbecue', 'charcoal', 'gas grill'],
    'fried': ['fried', 'deep fried', 'pan fried', 'sautéed', 'crispy'],
    'baked': ['baked', 'roasted', 'oven-baked'],
    'slow_cooker': ['slow cooker', 'crockpot', 'instant pot', 'pressure cooker'],
    
    // Beverages
    'beverage': ['drink', 'beverage', 'cocktail', 'mocktail', 'smoothie', 'juice', 'tea', 'coffee', 'latte', 'shake'],
    
    // Special Occasions
    'holiday': ['holiday', 'christmas', 'thanksgiving', 'easter', 'halloween', 'valentine', 'new year'],
    'party': ['party', 'celebration', 'gathering', 'potluck', 'buffet'],
    
    // Dietary
    'gluten_free': ['gluten free', 'gluten-free', 'celiac'],
    'keto': ['keto', 'ketogenic', 'low carb', 'low-carb'],
    'paleo': ['paleo', 'paleolithic', 'primal'],
    'healthy': ['healthy', 'nutritious', 'light', 'clean eating', 'wholesome']
  };

  /**
   * Find the best matching category for a recipe
   */
  static async findBestCategory(recipeData: {
    title: string;
    description: string;
    keyword?: string;
    ingredients?: any;
    category?: string; // SEO category from spy data
  }): Promise<CategoryMatchResult | null> {
    try {
      // Get all active categories
      const categories = await prisma.category.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true
        }
      });

      if (categories.length === 0) {
        console.warn('⚠️ No active categories found in database');
        return null;
      }

      // Combine all recipe text for analysis
      const recipeText = [
        recipeData.title,
        recipeData.description,
        recipeData.keyword || '',
        recipeData.category || '',
        JSON.stringify(recipeData.ingredients || {})
      ].join(' ').toLowerCase();

      // Score each category
      const categoryScores: Map<string, { score: number; reasons: string[] }> = new Map();

      for (const category of categories) {
        let score = 0;
        const reasons: string[] = [];

        // Try to match category slug or name with keyword mappings
        const categoryKeywords = this.categoryKeywords[category.slug] || [];
        
        // Check if any keywords match
        for (const keyword of categoryKeywords) {
          if (recipeText.includes(keyword.toLowerCase())) {
            score += 10;
            reasons.push(`Contains keyword: "${keyword}"`);
          }
        }

        // Direct category name match (high confidence)
        if (recipeText.includes(category.name.toLowerCase())) {
          score += 20;
          reasons.push(`Direct category name match: "${category.name}"`);
        }

        // Direct category slug match
        if (recipeText.includes(category.slug.replace(/_/g, ' '))) {
          score += 15;
          reasons.push(`Category slug match: "${category.slug}"`);
        }

        // Check if SEO category matches
        if (recipeData.category && 
            (recipeData.category.toLowerCase() === category.name.toLowerCase() ||
             recipeData.category.toLowerCase() === category.slug.replace(/_/g, ' '))) {
          score += 25;
          reasons.push(`SEO category exact match: "${recipeData.category}"`);
        }

        if (score > 0) {
          categoryScores.set(category.id, { score, reasons });
        }
      }

      // Find the best match
      let bestMatch: CategoryMatchResult | null = null;
      let highestScore = 0;

      for (const category of categories) {
        const scoreData = categoryScores.get(category.id);
        if (scoreData && scoreData.score > highestScore) {
          highestScore = scoreData.score;
          bestMatch = {
            categoryId: category.id,
            categoryName: category.name,
            categorySlug: category.slug,
            confidence: Math.min(100, scoreData.score), // Cap at 100
            matchReasons: scoreData.reasons
          };
        }
      }

      if (bestMatch) {
        console.log(`✅ Category match found: ${bestMatch.categoryName} (${bestMatch.confidence}% confidence)`);
        console.log(`   Reasons:`, bestMatch.matchReasons);
      } else {
        console.warn('⚠️ No matching category found for recipe');
      }

      return bestMatch;

    } catch (error) {
      console.error('❌ Error matching category:', error);
      return null;
    }
  }

  /**
   * Find matching author based on category tags
   */
  static async findMatchingAuthor(categoryId: string): Promise<string | null> {
    try {
      // Get the category
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        select: { name: true, slug: true }
      });

      if (!category) {
        return null;
      }

      // Get all authors with tags
      const authors = await prisma.author.findMany({
        select: {
          id: true,
          name: true,
          tags: true
        }
      });

      // Find author whose tags match the category
      for (const author of authors) {
        if (author.tags && author.tags.length > 0) {
          // Check if any author tag matches category name or slug
          const matchingTag = author.tags.find(tag => 
            tag.toLowerCase() === category.name.toLowerCase() ||
            tag.toLowerCase() === category.slug.replace(/_/g, ' ').toLowerCase() ||
            tag.toLowerCase().includes(category.name.toLowerCase()) ||
            category.name.toLowerCase().includes(tag.toLowerCase())
          );

          if (matchingTag) {
            console.log(`✅ Author match: ${author.name} has tag "${matchingTag}" matching category "${category.name}"`);
            return author.id;
          }
        }
      }

      console.warn(`⚠️ No author found with tags matching category: ${category.name}`);
      return null;

    } catch (error) {
      console.error('❌ Error finding matching author:', error);
      return null;
    }
  }

  /**
   * Get suggested authors for a specific category
   */
  static async getSuggestedAuthorsForCategory(categoryId: string): Promise<Array<{
    id: string;
    name: string;
    matchingTags: string[];
  }>> {
    try {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        select: { name: true, slug: true }
      });

      if (!category) {
        return [];
      }

      const authors = await prisma.author.findMany({
        select: {
          id: true,
          name: true,
          tags: true
        }
      });

      const suggestions = authors
        .map(author => {
          const matchingTags = author.tags.filter(tag =>
            tag.toLowerCase() === category.name.toLowerCase() ||
            tag.toLowerCase() === category.slug.replace(/_/g, ' ').toLowerCase() ||
            tag.toLowerCase().includes(category.name.toLowerCase()) ||
            category.name.toLowerCase().includes(tag.toLowerCase())
          );

          return {
            id: author.id,
            name: author.name,
            matchingTags
          };
        })
        .filter(suggestion => suggestion.matchingTags.length > 0);

      return suggestions;

    } catch (error) {
      console.error('❌ Error getting suggested authors:', error);
      return [];
    }
  }
}
