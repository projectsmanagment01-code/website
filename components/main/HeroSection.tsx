import React from "react";
import Image from "next/image";

interface HeroContent {
  heroTitle: string;
  heroDescription: string;
  heroButtonText: string;
  heroButtonLink: string;
  heroBackgroundImage: string;
}

interface HeroSectionProps {
  className?: string;
}

// Server-side data fetching
async function getHeroContent(): Promise<HeroContent> {
  try {
    const response = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/content/home`, {
      cache: 'force-cache'
    });
    
    if (response.ok) {
      const data = await response.json();
      return {
        heroTitle: data.heroTitle || "",
        heroDescription: data.heroDescription || "",
        heroButtonText: data.heroButtonText || "",
        heroButtonLink: data.heroButtonLink || "",
        heroBackgroundImage: data.heroBackgroundImage || "",
      };
    }
  } catch (error) {
    console.warn("Failed to load hero content:", error);
  }
  
  // Fallback content
  return {
    heroTitle: "",
    heroDescription: "",
    heroButtonText: "",
    heroButtonLink: "",
    heroBackgroundImage: "",
  };
}

export default async function HeroSection({ className }: HeroSectionProps) {
  const heroContent = await getHeroContent();

  // Don't render hero if no content
  if (!heroContent.heroTitle && !heroContent.heroDescription) {
    return <div className={`min-h-screen ${className || ""}`}></div>;
  }

  return (
    <section
      className={`relative min-h-screen flex items-center ${
        className || ""
      }`}
    >
      {/* Optimized background image - fast initial load with lower quality */}
      <Image
        src={heroContent.heroBackgroundImage}
        alt={heroContent.heroTitle || "Hero background"}
        fill
        priority={true}
        quality={50}
        sizes="100vw"
        loading="eager"
        fetchPriority="high"
        className="object-cover object-center"
      />

      {/* Black transparent overlay */}
      <div className="absolute inset-0 bg-black/50 z-[1]"></div>

      <div className="container-lg relative z-10 text-center">
        <div className="space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight">
            {heroContent.heroTitle}
          </h1>

          <p className="text-lg md:text-xl text-white/90 leading-relaxed">
            {heroContent.heroDescription}
          </p>

          {/* Call to Action Button */}
          <div className="mt-8">
            <a 
              href={heroContent.heroButtonLink} 
              className="inline-block bg-black text-white px-8 py-4 text-sm font-semibold tracking-wide uppercase transition-all duration-300 hover:bg-black/80 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              {heroContent.heroButtonText}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
