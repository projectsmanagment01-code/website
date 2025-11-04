"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

interface Slide {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  backgroundImage: string;
}

interface HeroSectionProps {
  className?: string;
}

export default function HeroSection({ className }: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch hero slides from database
  useEffect(() => {
    async function fetchHeroSlides() {
      try {
        const response = await fetch('/api/admin/hero-slides?activeOnly=true');
        if (response.ok) {
          const data = await response.json();
          
          if (data.length > 0) {
            // Map database slides to component format
            const slidesData: Slide[] = data.map((slide: any) => ({
              title: slide.title,
              description: slide.description,
              buttonText: slide.buttonText,
              buttonLink: slide.buttonLink,
              backgroundImage: slide.backgroundImage,
            }));
            
            setSlides(slidesData);
          } else {
            // Fallback to old hero content API if no slides exist
            const fallbackResponse = await fetch('/api/content/home');
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              setSlides([
                {
                  title: fallbackData.heroTitle || "Discover Delicious Recipes",
                  description: fallbackData.heroDescription || "Easy, healthy, and flavorful meals for every occasion",
                  buttonText: fallbackData.heroButtonText || "Explore Recipes",
                  buttonLink: fallbackData.heroButtonLink || "/recipes",
                  backgroundImage: fallbackData.heroBackgroundImage || "/hero-bg.jpg",
                },
              ]);
            }
          }
        }
      } catch (error) {
        console.warn("Failed to load hero slides:", error);
        // Fallback slides on error
        setSlides([
          {
            title: "Discover Delicious Recipes",
            description: "Easy, healthy, and flavorful meals for every occasion",
            buttonText: "Explore Recipes",
            buttonLink: "/recipes",
            backgroundImage: "/hero-bg.jpg",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchHeroSlides();
  }, []);

  // Auto-advance slides every 8 seconds
  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [slides.length]);

  // Manual slide navigation
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (isLoading || slides.length === 0) {
    return <div className={`min-h-screen bg-stone-100 ${className || ""}`}></div>;
  }

  return (
    <section className={`relative min-h-screen overflow-hidden ${className || ""}`}>
      {/* Slides Container */}
      <div className="relative h-screen">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {/* Background Image */}
            <Image
              src={slide.backgroundImage}
              alt={slide.title}
              fill
              priority={index === 0}
              quality={75}
              sizes="100vw"
              className="object-cover object-center"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent z-[1]"></div>

            {/* Content */}
            <div className="absolute inset-0 z-10 flex items-center">
              <div className="w-full" style={{ paddingLeft: "15%" }}>
                <div className="max-w-4xl space-y-6 text-white pr-8">
                  {/* Title with slide-in animation */}
                  <h1
                    className={`text-4xl md:text-5xl lg:text-6xl font-bold leading-tight transition-all duration-700 ${
                      index === currentSlide
                        ? "translate-x-0 opacity-100"
                        : "-translate-x-10 opacity-0"
                    }`}
                    style={{ transitionDelay: "200ms" }}
                  >
                    {slide.title}
                  </h1>

                  {/* Description with slide-in animation */}
                  <p
                    className={`text-lg md:text-xl text-white/90 leading-relaxed transition-all duration-700 ${
                      index === currentSlide
                        ? "translate-x-0 opacity-100"
                        : "-translate-x-10 opacity-0"
                    }`}
                    style={{ transitionDelay: "400ms" }}
                  >
                    {slide.description}
                  </p>

                  {/* Button with slide-in animation */}
                  <div
                    className={`transition-all duration-700 ${
                      index === currentSlide
                        ? "translate-x-0 opacity-100"
                        : "-translate-x-10 opacity-0"
                    }`}
                    style={{ transitionDelay: "600ms" }}
                  >
                    <a
                      href={slide.buttonLink}
                      className="inline-block bg-amber-600 text-white px-5 py-2.5 text-sm font-medium tracking-wide rounded-sm transition-all duration-300 hover:bg-amber-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    >
                      {slide.buttonText}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 bg-slate-800/60 hover:bg-slate-800/80 backdrop-blur-sm text-white p-3 md:p-4 rounded transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            aria-label="Previous slide"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 bg-slate-800/60 hover:bg-slate-800/80 backdrop-blur-sm text-white p-3 md:p-4 rounded transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            aria-label="Next slide"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
                index === currentSlide
                  ? "w-12 h-3 bg-amber-600"
                  : "w-3 h-3 bg-slate-300/60 hover:bg-slate-300/80"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
