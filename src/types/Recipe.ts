export interface Author {
  name: string;
  bio: string;
  avatar: string;
}

export interface CategoriesSection {
  title: string;
  description: string;
}

export interface CategoryHierarchy {
  main: string;
  sub: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface WhyYouLove {
  title: string;
  reasons: string[];
}

export interface EssentialIngredientGuideItem {
  ingredient: string;
  description: string;
  tips: string[];
}

export interface IngredientGuideItem {
  name: string;
  amount: string;
  notes: string;
}

export interface IngredientsGroup {
  groupName: string;
  items: IngredientGuideItem[];
}

export interface Instruction {
  step: number;
  title: string;
  description: string;
  image?: string;
  tips?: string[];
}

export interface CompleteProcessItem {
  phase: string;
  steps: string[];
  duration: string;
}

export interface Section {
  title: string;
  content: string;
  image?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Timing {
  prep: string;
  cook: string;
  total: string;
  difficulty: string;
}

export interface RecipeInfo {
  serves: number;
  calories: number;
  cuisine: string;
  diet: string[];
}

export interface RelatedRecipe {
  id: string;
  title: string;
  image: string;
  slug: string;
}

export interface Recipe {
  href: string | undefined;
  imageAlt: string;
  categoryHref: string | undefined;
  id: string;
  img: string;
  title: string;
  slug: string;
  intro: string;
  description: string;
  shortDescription: string;
  story: string;
  testimonial: string;

  // Metadata
  category: string;
  categoryLink: string;
  featuredText: string;
  author: Author;
  updatedDate: string;

  // Categories Section
  categories: CategoriesSection;
  categoryHierarchy: CategoryHierarchy;
  allCategories: Category[];

  // Content
  whyYouLove: WhyYouLove;
  essIngredientGuide: EssentialIngredientGuideItem[];
  ingredientGuide: IngredientGuideItem[];
  ingredients: IngredientsGroup[];
  instructions: Instruction[];
  completeProcess: CompleteProcessItem[];
  sections: Section[];

  // Extras
  mustKnowTips: string[];
  professionalSecrets: string[];
  faq: FAQItem[];
  questions: {
    title: string;
    items: FAQItem[];
  };

  // Meta info
  serving: string;
  storage: string;
  timing: Timing;
  recipeInfo: RecipeInfo;

  // Media
  heroImage: string;
  images: string[];

  // Add-ons
  notes: string[];
  tools: string[];
  allergyInfo: string;
  nutritionDisclaimer: string;

  relatedRecipes: RelatedRecipe[];
}