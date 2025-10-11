import React from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { getCategories, getRecipes } from "@/data/data";

interface SitemapLink {
  href: string;
  title: string;
  description?: string;
}

interface SitemapSection {
  title: string;
  description: string;
  links: SitemapLink[];
}

export default async function Sitemap() {
  // Fetch dynamic data
  const [categories, recipes] = await Promise.all([
    getCategories(),
    getRecipes(),
  ]);

  const staticPages: SitemapSection = {
    title: "Main Pages",
    description: "Core pages and navigation",
    links: [
      {
        href: "/",
        title: "Home",
        description: "Main landing page with featured recipes",
      },
      {
        href: "/about",
        title: "About",
        description: "Learn about our story and mission",
      },
      {
        href: "/contact",
        title: "Contact",
        description: "Get in touch with us",
      },
      { href: "/faq", title: "FAQ", description: "Frequently asked questions" },
      {
        href: "/explore",
        title: "Explore",
        description: "Discover new recipes",
      },
      {
        href: "/search",
        title: "Search",
        description: "Find specific recipes",
      },
      {
        href: "/recipes",
        title: "All Recipes",
        description: "Browse our complete recipe collection",
      },
      {
        href: "/categories",
        title: "Recipe Categories",
        description: "Recipes organized by category",
      },
      {
        href: "/authors",
        title: "Authors",
        description: "Meet our recipe authors",
      },
    ],
  };

  const dynamicCategories: SitemapSection = {
    title: "Recipe Categories",
    description: "Recipes organized by type",
    links: categories.map((category) => ({
      href: category.href,
      title: category.title,
      description: category.description,
    })),
  };

  const dynamicRecipes: SitemapSection = {
    title: "Recipes",
    description: "Individual recipe pages",
    links: recipes.slice(0, 50).map((recipe) => ({
      // Limit to first 50 recipes for performance
      href: `/recipes/${recipe.slug}`,
      title: recipe.title,
      description:
        recipe.shortDescription ||
        recipe.description?.substring(0, 100) + "...",
    })),
  };

  const legalPages: SitemapSection = {
    title: "Legal & Policy",
    description: "Terms, privacy, and legal information",
    links: [
      {
        href: "/privacy",
        title: "Privacy Policy",
        description: "How we handle your data",
      },
      {
        href: "/terms",
        title: "Terms & Conditions",
        description: "Terms of service",
      },
      {
        href: "/cookies",
        title: "Cookie Policy",
        description: "Cookie usage information",
      },
      {
        href: "/disclaimer",
        title: "Disclaimer",
        description: "Legal disclaimer",
      },
    ],
  };

  const allSections = [
    staticPages,
    dynamicCategories,
    dynamicRecipes,
    legalPages,
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Sitemap</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Browse all pages and sections on {siteConfig.name}. Find recipes,
            categories, and helpful resources all in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {allSections.map((section) => (
            <div
              key={section.title}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {section.title}
              </h2>
              <p className="text-gray-600 mb-6">{section.description}</p>

              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                            {link.title}
                          </h3>
                          {link.description && (
                            <p className="text-sm text-gray-500 mt-1">
                              {link.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {link.href}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-xl border border-gray-200 p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Website Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {staticPages.links.length}
              </div>
              <div className="text-sm text-gray-600">Main Pages</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {categories.length}
              </div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {legalPages.links.length}
              </div>
              <div className="text-sm text-gray-600">Legal Pages</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
