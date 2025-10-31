/**
 * Recipe-related type definitions
 */

export interface RecipeArticleData {
  slug: string;
  title: string;
  authorId: string;
  category: string;
  categoryId?: string;
  description: string;
  shortDescription: string;
  intro: string;
  story: string;
  featuredText: string;
  heroImage: string;
  img: string;
  featureImage: string;
  imageAlt: string;
  images: string[];
  cookingImage?: string;
  preparationImage?: string;
  finalPresentationImage?: string;
  timing: {
    prep: string;
    cook: string;
    total: string;
  };
  serving: string;
  storage: string;
  ingredients: {
    sections: Array<{
      title: string;
      items: string[];
    }>;
  };
  instructions: {
    steps: Array<{
      number: number;
      title: string;
      description: string;
      image?: string;
      tip?: string;
    }>;
  };
  tools: string[];
  mustKnowTips: string[];
  notes: string[];
  professionalSecrets: string[];
  allergyInfo: string;
  nutritionDisclaimer: string;
  whyYouLove: {
    title: string;
    points: string[];
  };
  essIngredientGuide: {
    title: string;
    ingredients: Array<{
      name: string;
      why: string;
      substitute: string;
    }>;
  };
  completeProcess: {
    title: string;
    description: string;
    steps: string[];
  };
  faq: {
    questions: Array<{
      question: string;
      answer: string;
    }>;
  };
  relatedRecipes: Array<{
    title: string;
    slug: string;
    image: string;
  }>;
  testimonial: string;
  recipeInfo: {
    difficulty: string;
    cuisine: string;
    course: string;
    diet: string;
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
    fiber: string;
  };
  updatedDate: string;
  href: string;
  categoryLink: string;
  categoryHref: string;
  status: string;
}

export interface RecipePublishRequest {
  recipe: RecipeArticleData;
  apiToken: string;
}

export interface RecipePublishResult {
  success: boolean;
  recipeId?: string;
  slug?: string;
  url?: string;
  error?: string;
}
