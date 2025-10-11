"use client";

import { useEffect, useRef } from "react";

/**
 * ViewTracker Component
 * Tracks recipe views on the client side with debouncing and duplicate prevention
 * Compatible with static generation
 */

interface ViewTrackerProps {
  recipeId: string;
  debounceMs?: number; // Default 1000ms to prevent spam
}

export default function ViewTracker({
  recipeId,
  debounceMs = 1000,
}: ViewTrackerProps) {
  const hasTrackedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only run on client side and if not already tracked
    if (typeof window === "undefined" || hasTrackedRef.current) {
      return;
    }

    // Check if we've already tracked this recipe in this session
    const viewedRecipes = getViewedRecipesFromStorage();
    if (viewedRecipes.has(recipeId)) {
      hasTrackedRef.current = true;
      return;
    }

    // Debounce the view tracking to prevent spam
    timeoutRef.current = setTimeout(async () => {
      try {
        console.log(`🔍 Tracking view for recipe ${recipeId}...`);
        const response = await fetch(`/api/recipe/${recipeId}/view`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log(
            `✅ View tracked for recipe ${recipeId}:`,
            data.views,
            "views"
          );

          // Mark as viewed in storage
          viewedRecipes.add(recipeId);
          saveViewedRecipesToStorage(viewedRecipes);
          hasTrackedRef.current = true;
        } else {
          console.error("❌ Failed to track view:", await response.text());
        }
      } catch (error) {
        console.error("❌ Error tracking view:", error);
      }
    }, debounceMs);

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [recipeId, debounceMs]);

  // This component doesn't render anything
  return null;
}

/**
 * Get viewed recipes from localStorage
 */
function getViewedRecipesFromStorage(): Set<string> {
  if (typeof window === "undefined") return new Set();

  try {
    const stored = localStorage.getItem("viewed_recipes");
    if (stored) {
      const parsed = JSON.parse(stored);
      // Clean up old entries (older than 24 hours)
      const now = Date.now();
      const validEntries = Object.entries(parsed)
        .filter(
          ([_, timestamp]) => now - (timestamp as number) < 24 * 60 * 60 * 1000
        )
        .map(([id]) => id);

      return new Set(validEntries);
    }
  } catch (error) {
    console.error("Error reading viewed recipes from storage:", error);
  }

  return new Set();
}

/**
 * Save viewed recipes to localStorage
 */
function saveViewedRecipesToStorage(viewedRecipes: Set<string>): void {
  if (typeof window === "undefined") return;

  try {
    const storageData: Record<string, number> = {};
    const now = Date.now();

    viewedRecipes.forEach((recipeId) => {
      storageData[recipeId] = now;
    });

    localStorage.setItem("viewed_recipes", JSON.stringify(storageData));
  } catch (error) {
    console.error("Error saving viewed recipes to storage:", error);
  }
}
