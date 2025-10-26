import { Metadata } from "next";
import CategoriesSection from "@/components/main/CategoriesSection";
import HeroSection from "@/components/main/HeroSection";
import LatestRecipesSection from "@/components/main/LatestRecipesSection";
import TrendingSection from "@/components/main/TrendingSection";
import SubscriptionSection from "@/components/main/SubscriptionSection";
import BackToTop from "@/components/BackToTop";
import AdSlot from "@/components/ads/AdSlot";

// Function to get home content for metadata
async function getHomeContent() {
  try {
    // Use API route for consistency
    const response = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/content/home`, {
      cache: 'force-cache'
    });
    
    if (response.ok) {
      const heroContent = await response.json();
      return {
        metaTitle: `${heroContent.heroTitle || 'Welcome'} | Recipes by Calama`,
        metaDescription: (heroContent.heroDescription && heroContent.heroDescription.length > 160)
          ? heroContent.heroDescription.substring(0, 157) + "..."
          : (heroContent.heroDescription || "Discover simple, delicious plant-based recipes that fit your busy lifestyle."),
      };
    }
  } catch (error) {
    console.warn("Failed to load hero content for metadata:", error);
  }
  
  return {
    metaTitle: "Recipes by Calama - Plant-Based Recipes Made Simple",
    metaDescription: "Discover simple, delicious plant-based recipes that fit your busy lifestyle. Easy healthy cooking made simple.",
  };
}

// Generate dynamic metadata
export async function generateMetadata(): Promise<Metadata> {
  const homeContent = await getHomeContent();
  
  return {
    title: homeContent.metaTitle || "Recipes by Calama - Plant-Based Recipes Made Simple",
    description: homeContent.metaDescription || "Discover simple, delicious plant-based recipes that fit your busy lifestyle. Easy healthy cooking made simple.",
    openGraph: {
      title: homeContent.metaTitle || "Recipes by Calama - Plant-Based Recipes Made Simple",
      description: homeContent.metaDescription || "Discover simple, delicious plant-based recipes that fit your busy lifestyle. Easy healthy cooking made simple.",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: homeContent.metaTitle || "Recipes by Calama - Plant-Based Recipes Made Simple",
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

      {/* Ad below hero section */}
      <div className="container-wide">
        <AdSlot placement="home_hero_below" className="my-8" />
      </div>

      {/* Main Content - Wide width with reasonable max-width */}
      <main className="container-wide section-md">
        <CategoriesSection />
        <div className="section-sm">
          <LatestRecipesSection limit={8} />
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
