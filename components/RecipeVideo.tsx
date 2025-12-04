"use client";

import { useState } from "react";

interface RecipeVideoProps {
  videoUrl?: string;
  title: string;
  className?: string;
}

/**
 * RecipeVideo Component
 * 
 * Displays a YouTube video embed for recipes that have a video URL.
 * Features:
 * - Lazy loading with thumbnail preview
 * - Click to play (loads iframe on demand for better performance)
 * - Responsive 16:9 aspect ratio
 * - Accessibility support
 */
export default function RecipeVideo({ videoUrl, title, className = "" }: RecipeVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Don't render anything if no video URL
  if (!videoUrl) return null;

  // Extract YouTube video ID from various URL formats
  const extractYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const videoId = extractYouTubeId(videoUrl);

  // If we couldn't extract a valid YouTube ID, don't render
  if (!videoId) return null;

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;

  return (
    <section className={`recipe-video my-8 ${className}`}>
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
        <svg 
          className="w-6 h-6 text-red-600" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
        Watch How to Make {title}
      </h2>
      
      <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg bg-black">
        {!isPlaying ? (
          // Thumbnail with play button (lazy load - doesn't load iframe until clicked)
          <button
            onClick={() => setIsPlaying(true)}
            className="relative w-full h-full group cursor-pointer"
            aria-label={`Play video: How to Make ${title}`}
          >
            {/* Video Thumbnail */}
            <img
              src={thumbnailUrl}
              alt={`Video thumbnail for ${title}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
            
            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                <svg 
                  className="w-10 h-10 text-white ml-1" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
            
            {/* Duration badge (optional decoration) */}
            <div className="absolute bottom-4 right-4 bg-black/80 text-white text-sm px-2 py-1 rounded">
              Video Recipe
            </div>
          </button>
        ) : (
          // Actual YouTube iframe (only loads when user clicks play)
          <iframe
            src={embedUrl}
            title={`How to Make ${title}`}
            className="absolute inset-0 w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        )}
      </div>
      
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
        Click to watch the step-by-step video guide
      </p>
    </section>
  );
}
