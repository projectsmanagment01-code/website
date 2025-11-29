import { Metadata } from "next";
import CategoriesSection from "@/components/main/CategoriesSection";
import HeroSection from "@/components/main/HeroSection";
import LatestRecipesSectionPaginated from "@/components/main/LatestRecipesSectionPaginated";
import TrendingSection from "@/components/main/TrendingSection";
import SubscriptionSection from "@/components/main/SubscriptionSection";
import BackToTop from "@/components/BackToTop";

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

export default function HomePage() {
  return (
    <div className="page-content">
      {/* Hero Section - Full width for visual impact */}
      <section className="bg-stone-100">
        <HeroSection />
      </section>

      {/* Main Content - Wide width with reasonable max-width */}
      <main className="container-wide section-md">
        <CategoriesSection />
        <div className="section-sm">
          <LatestRecipesSectionPaginated recipesPerPage={8} />
        </div>
        <div className="section-sm">
          <TrendingSection limit={8} />
        </div>
      </main>

      {/* Subscription Section */}
      <SubscriptionSection />
      
      {/* Back to Top Button */}
      <BackToTop />
    </div>
  );
}
