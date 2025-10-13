"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Recipe, Category } from "@/outils/types";

export default function DynamicSearch() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentRecipes, setRecentRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch categories
      const categoriesRes = await fetch("/api/categories");
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.slice(0, 12)); // Show top 12 categories
      }

      // Fetch recent recipes
      const recipesRes = await fetch("/api/recipe?page=1&limit=12");
      if (recipesRes.ok) {
        const recipesData = await recipesRes.json();
        setRecentRecipes(recipesData.recipes || recipesData);
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 p-8 mx-auto">
      {/* Categories Section */}
      <div className="flex flex-col gap-6">
        <h2 className="text-3xl font-bold text-gray-900 uppercase tracking-wide">
          Find Our Categories
        </h2>
        <div className="flex flex-wrap gap-4">
          {categories.map((category, index) => (
            <Link
              key={index}
              href={category.href}
              title={category.description}
              className="inline-flex items-center justify-center text-center font-medium bg-gray-100 text-black border-2 border-black transition-all duration-300 ease-in-out shadow-[0px_6px_0_#000] hover:bg-gray-200 hover:shadow-lg"
              style={{
                borderRadius: "60px",
                padding: "calc(1rem / 2)",
                gap: "1rem",
                fontSize: "calc(1.2rem * 0.9)",
              }}
            >
              <span>{category.title}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Best Recipes Section */}
      <div className="flex flex-col gap-6">
        <h2 className="text-3xl font-bold text-gray-900 uppercase tracking-wide">
          Find Our Best Recipes
        </h2>
        <div className="flex flex-wrap gap-4">
          {recentRecipes.map((recipe, index) => (
            <Link
              key={index}
              href={`/recipes/${recipe.slug}`}
              title={recipe.title}
              className="inline-flex items-center justify-center text-center font-medium bg-gray-100 text-black border-2 border-black transition-all duration-300 ease-in-out shadow-[0px_6px_0_#000] hover:bg-gray-200 hover:shadow-lg"
              style={{
                borderRadius: "60px",
                padding: "calc(1rem / 2)",
                gap: "1rem",
                fontSize: "calc(1.2rem * 0.9)",
              }}
            >
              <img
                src={recipe.img || recipe.heroImage}
                alt={recipe.title}
                className="w-10 h-10 rounded-full bg-gray-100 object-cover"
              />
              <span>{recipe.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
