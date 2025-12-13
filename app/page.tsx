import { Metadata } from "next";
import CategoriesSection from "@/components/main/CategoriesSection";
import HeroSection from "@/components/main/HeroSection";
import LatestRecipesSectionPaginated from "@/components/main/LatestRecipesSectionPaginated";
import LatestArticlesSection from "@/components/main/LatestArticlesSection";
import CategoryRecipesSection from "@/components/main/CategoryRecipesSection";
import TrendingSection from "@/components/main/TrendingSection";
import SubscriptionSection from "@/components/main/SubscriptionSection";
import BackToTop from "@/components/BackToTop";
import { 
  AdHomeHero, 
  AdHomeAfterFeatured, 
  AdHomeMidContent, 
  AdHomeBeforeCategories, 
  AdHomeAfterCategories, 
  AdHomeBeforeFooter 
} from "@/components/ads/HomeAds";
import { prisma } from "@/lib/prisma";

interface HomepageSection {
  id: string;
  enabled: boolean;
  order: number;
  options?: {
    showPagination?: boolean;
  };
}

// Default section order
const DEFAULT_SECTIONS: HomepageSection[] = [
  { id: "hero", enabled: true, order: 1 },
  { id: "ad-hero", enabled: true, order: 2 },
  { id: "ad-before-categories", enabled: true, order: 3 },
  { id: "categories", enabled: true, order: 4 },
  { id: "ad-after-categories", enabled: true, order: 5 },
  { id: "latest-recipes", enabled: true, order: 6, options: { showPagination: true } },
  { id: "ad-after-featured", enabled: true, order: 7 },
  { id: "ad-mid-content", enabled: true, order: 8 },
  { id: "trending", enabled: true, order: 9 },
  { id: "latest-articles", enabled: true, order: 10 },
  { id: "category-recipes", enabled: true, order: 11 },
  { id: "ad-before-footer", enabled: true, order: 12 },
  { id: "subscription", enabled: true, order: 13 },
];

// Get homepage layout settings with order
async function getHomepageLayout(): Promise<HomepageSection[]> {
  try {
    const config = await prisma.siteConfig.findUnique({
      where: { key: "homepage-layout" },
    });

    if (config && config.data) {
      const data = config.data as { sections?: HomepageSection[] };
      if (data.sections && data.sections.length > 0) {
        // Merge with defaults in case new sections were added
        const savedSectionIds = data.sections.map(s => s.id);
        const mergedSections = [
          ...data.sections,
          ...DEFAULT_SECTIONS.filter(d => !savedSectionIds.includes(d.id))
        ];
        return mergedSections.sort((a, b) => a.order - b.order);
      }
    }
  } catch (error) {
    console.warn("Failed to load homepage layout:", error);
  }
  return DEFAULT_SECTIONS;
}

// Function to get home content for metadata
async function getHomeContent() {
  try {
    // Use ISR: Cache for 1 hour, with on-demand revalidation when admin updates
    const response = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/content/home`, {
      next: { 
        revalidate: 3600, // Cache for 1 hour
        tags: ['home-content'] // Tag for on-demand revalidation
      }
    });
    
    if (response.ok) {
      const heroContent = await response.json();
      return {
        metaTitle: `${heroContent.heroTitle || 'Welcome'} | Recipes website`,
        metaDescription: (heroContent.heroDescription && heroContent.heroDescription.length > 160)
          ? heroContent.heroDescription.substring(0, 157) + "..."
          : (heroContent.heroDescription || "Discover simple, delicious plant-based recipes that fit your busy lifestyle."),
      };
    }
  } catch (error) {
    console.warn("Failed to load hero content for metadata:", error);
  }
  
  return {
    metaTitle: "Recipes website - Plant-Based Recipes Made Simple",
    metaDescription: "Discover simple, delicious plant-based recipes that fit your busy lifestyle. Easy healthy cooking made simple.",
  };
}

// Generate dynamic metadata
export async function generateMetadata(): Promise<Metadata> {
  const homeContent = await getHomeContent();
  
  return {
    title: homeContent.metaTitle || "Recipes website - Plant-Based Recipes Made Simple",
    description: homeContent.metaDescription || "Discover simple, delicious plant-based recipes that fit your busy lifestyle. Easy healthy cooking made simple.",
    openGraph: {
      title: homeContent.metaTitle || "Recipes website - Plant-Based Recipes Made Simple",
      description: homeContent.metaDescription || "Discover simple, delicious plant-based recipes that fit your busy lifestyle. Easy healthy cooking made simple.",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: homeContent.metaTitle || "Recipes website   - Plant-Based Recipes Made Simple",
      description: homeContent.metaDescription || "Discover simple, delicious plant-based recipes that fit your busy lifestyle. Easy healthy cooking made simple.",
    },
  };
}

export default async function HomePage() {
  const sections = await getHomepageLayout();

  // Create a map for quick lookup
  const sectionMap = new Map(sections.map(s => [s.id, s]));

  // Define section renderers
  const renderSection = (sectionId: string) => {
    const section = sectionMap.get(sectionId);
    if (!section?.enabled) return null;

    switch (sectionId) {
      case "hero":
        return (
          <section key={sectionId} className="bg-stone-100">
            <HeroSection />
          </section>
        );
      case "ad-hero":
        return (
          <div key={sectionId} className="container-wide">
            <AdHomeHero />
          </div>
        );
      case "ad-before-categories":
        return <AdHomeBeforeCategories key={sectionId} />;
      case "categories":
        return <CategoriesSection key={sectionId} />;
      case "ad-after-categories":
        return <AdHomeAfterCategories key={sectionId} />;
      case "latest-recipes":
        return (
          <div key={sectionId} className="section-sm">
            <LatestRecipesSectionPaginated 
              recipesPerPage={8} 
              showPagination={section.options?.showPagination !== false}
            />
          </div>
        );
      case "ad-after-featured":
        return <AdHomeAfterFeatured key={sectionId} />;
      case "ad-mid-content":
        return <AdHomeMidContent key={sectionId} />;
      case "trending":
        return (
          <div key={sectionId} className="section-sm">
            <TrendingSection limit={8} />
          </div>
        );
      case "latest-articles":
        return (
          <div key={sectionId} className="section-sm">
            <LatestArticlesSection limit={4} />
          </div>
        );
      case "category-recipes":
        return (
          <div key={sectionId} className="section-sm">
            <CategoryRecipesSection recipesPerCategory={4} maxCategories={6} />
          </div>
        );
      case "ad-before-footer":
        return <AdHomeBeforeFooter key={sectionId} />;
      case "subscription":
        return <SubscriptionSection key={sectionId} />;
      default:
        return null;
    }
  };

  // Separate sections that need to be outside the main container
  const outsideMainSections = ["hero", "ad-hero", "subscription"];
  const insideMainSections = sections.filter(s => !outsideMainSections.includes(s.id));
  const beforeMainSections = sections.filter(s => ["hero", "ad-hero"].includes(s.id));
  const afterMainSections = sections.filter(s => ["subscription"].includes(s.id));

  return (
    <div className="page-content">
      {/* Sections before main (hero, ad-hero) - rendered in their saved order */}
      {beforeMainSections.map(section => renderSection(section.id))}

      {/* Main Content - Wide width with reasonable max-width */}
      <main className="container-wide section-md">
        {/* Sections inside main - rendered in their saved order */}
        {insideMainSections.map(section => renderSection(section.id))}
      </main>

      {/* Sections after main (subscription) - rendered in their saved order */}
      {afterMainSections.map(section => renderSection(section.id))}
      
      {/* Back to Top Button - always shown */}
      <BackToTop />
    </div>
  );
}
