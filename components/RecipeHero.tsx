"use client";
import Image from "next/image";

import Link from "next/link";
import SocialShareButtons from "./Share";
import Recipe from "@/outils/types";
import { ChefHat, Info, Mail, Grid, HelpCircle } from 'lucide-react';
import { hasHtmlTags, renderSafeHtml } from "@/lib/utils";
import { Calendar, Clock } from "lucide-react";

/* -------------------- Breadcrumbs -------------------- */
import { usePathname } from "next/navigation";
import SearchBox from "./SearchBox";

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <ol className="breadcrumb flex flex-wrap items-center text-[19.2px] font-normal">
      {/* Home link */}
      <li className="breadcrumb__item after:content-['>>'] after:px-2 last:after:content-none">
        <Link href="/" className="text-[#c64118] font-bold no-underline">
          Home
        </Link>
      </li>

      {segments.map((seg, idx) => {
        const href = "/" + segments.slice(0, idx + 1).join("/");
        const isLast = idx === segments.length - 1;
        const label =
          seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");

        return (
          <li
            key={href}
            className="breadcrumb__item after:content-['>>'] after:px-2 last:after:content-none"
          >
            {isLast ? (
              <span className="font-bold">{label}</span>
            ) : (
              <Link
                href={href}
                className="text-[#c64118] font-bold no-underline"
              >
                {label}
              </Link>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* -------------------- Recipe Hero -------------------- */
export function RecipeHero({ recipe }: { recipe?: Recipe }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const isExplore = segments[segments.length - 1] === "explore";

  const isSearch = segments[segments.length - 1] === "search";
  const isAbout = segments[segments.length - 1] === "about";
  const isContact = segments[segments.length - 1] === "contact";
  const isCategories = segments[segments.length - 1] === "categories";
  const isCategory = segments[segments.length - 2] === "categories";
  const isFaq = segments[segments.length - 1] === "faq";
  const isAllRecipes = segments[segments.length - 1] === "recipes";

  if (isAllRecipes)
    return (
      <>
        <div className="bg-stone-100 space-y-6 px-4 md:px-6">
          {/* Title Section */}
          <nav>
            <Breadcrumbs />
          </nav>

          <div className="space-y-4">
            <h1 className="leading-tight text-5xl text-black">All Recipes</h1>
          </div>
          <div className="landing__media hidden md:block">
            <ChefHat size={160} className="text-orange-500" />
          </div>
        </div>
      </>
    );
  if (isExplore)
    return (
      <>
        <div className="bg-stone-100 space-y-6 px-4 md:px-6">
          {/* Title Section */}
          <nav>
            <Breadcrumbs />
          </nav>

          <div className="space-y-4">
            <h1 className="leading-tight text-5xl text-black">Explore</h1>
          </div>
        </div>
      </>
    );

  if (isSearch)
    return (
      <>
        <div className="bg-stone-100 space-y-6 px-4 md:px-6">
          {/* Title Section */}
          <nav>
            <Breadcrumbs />
          </nav>

          <SearchBox />
        </div>
      </>
    );
  if (isCategory)
    return (
      <>
        <div className="bg-stone-100 space-y-6 px-4 md:px-6">
          {/* Title Section */}
          <nav>
            <Breadcrumbs />
          </nav>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            {"Tasty Evening Meals"}
          </h1>
          <div className="space-y-4">
            <div className="text-[19.2px] ">
              Make every dinner special with our Evening Meals collection.
              Whether you’re looking for a quick weeknight meal or a dish to
              impress, we’ve got recipes that will satisfy every craving.
              Perfect for family dinners or a cozy night in.
            </div>
            <p className="text-[19.2px]">
              110 results in this collection. (Page 1 Of 10) Updated on Mon, 20
              Jan 2025 17:25:36 GMT
            </p>
          </div>
        </div>
      </>
    );
  if (isAbout)
    return (
      <div className="flex flex-col md:flex-row md:justify-between px-4 md:px-6">
        <div className="bg-stone-100 space-y-6 flex-1">
          <>
            <nav>
              <Breadcrumbs />
            </nav>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              {"About"}
            </h1>
          </>
        </div>

        <div className="landing__media hidden md:block md:flex-shrink-0">
          <Info size={160} className="text-blue-500" />
        </div>
      </div>
    );

  if (isContact)
    return (
      <div className="flex flex-col md:flex-row md:justify-between px-4 md:px-6">
        <div className="bg-stone-100 space-y-6 flex-1">
          <>
            <nav>
              <Breadcrumbs />
            </nav>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              {"Let's connect"}
            </h1>

            <div className="space-y-4">
              <div className="text-[19.2px] ">
                Whether you need cooking advice, want to share feedback, or
                simply want to say hello, feel free to drop me a line! I'm
                always excited to discuss delicious recipes with you.
              </div>
            </div>
          </>
        </div>

        <div className="landing__media hidden md:block md:flex-shrink-0">
          <Mail size={160} className="text-green-500" />
        </div>
      </div>
    );
  if (isCategories)
    return (
      <div className="flex flex-col md:flex-row md:justify-between px-4 md:px-6">
        <div className="bg-stone-100 space-y-6 flex-1">
          <>
            <nav>
              <Breadcrumbs />
            </nav>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              {"All Categories"}
            </h1>

            <div className="space-y-4">
              <div className="text-[19.2px] ">
                Looking for culinary inspiration? Browse through our diverse
                recipe categories to find the perfect dish for any occasion.
                We've got everything from quick weeknight dinners to impressive
                weekend feasts!
              </div>
            </div>
          </>
        </div>
      </div>
    );
  if (isFaq)
    return (
      <div className="flex flex-col md:flex-row md:justify-between px-4 md:px-6">
        <div className="bg-stone-100 space-y-6 flex-1">
          <>
            <nav>
              <Breadcrumbs />
            </nav>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              {"Frequently Asked Questions"}
            </h1>

            <div className="space-y-4">
              <div className="text-[19.2px] ">
                Need help with something? We've got you covered! Browse our FAQ
                section for answers to common questions about our recipes,
                cooking methods, and kitchen hacks.
              </div>
            </div>
          </>
        </div>

        <div className="landing__media hidden md:block md:flex-shrink-0">
          <HelpCircle size={160} className="text-indigo-500" />
        </div>
      </div>
    );

  return (
    <div className="bg-stone-100  space-y-2 px-4 md:px-6">
      {/* Breadcrumbs */}

      <nav>
        <Breadcrumbs />
      </nav>

      {/* Title Section */}
      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
          {recipe?.title}
        </h1>

        <p className="text-[19.2px] text-gray-600">
          {recipe?.featuredText}{" "}
          <Link
            href={recipe?.categoryLink || "#"}
            className="text-[#c64118] hover:underline"
          >
            {recipe?.category}
          </Link>
          .
        </p>

        <p className="text-[19.2px] text-gray-700 leading-relaxed">
          {hasHtmlTags(recipe?.shortDescription || "") ? (
            <span
              dangerouslySetInnerHTML={renderSafeHtml(
                recipe?.shortDescription || ""
              )}
            />
          ) : (
            recipe?.shortDescription
          )}
        </p>
      </div>

      {/* Date and Author Info Section */}
      <div className="flex flex-col space-y-3 py-4 border-t border-b border-gray-300">
        {/* Dates Row */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          {recipe?.createdAt && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                <strong>Published:</strong> {formatDate(recipe.createdAt)}
              </span>
            </div>
          )}
          {/* Only show update time if recipe was actually updated */}
          {recipe?.updatedAt && recipe?.createdAt && 
           new Date(recipe.updatedAt).getTime() > new Date(recipe.createdAt).getTime() && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>
                <strong>Updated:</strong> {formatDate(recipe.updatedDate || recipe.updatedAt)}
              </span>
            </div>
          )}
        </div>

        {/* Author Info Row */}
        {recipe?.author && (
          <div className="flex items-center gap-3">
            <Link href="/authors" className="flex items-center gap-3 group hover:opacity-80 transition-opacity">
              <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-gray-200">
                <Image
                  src={recipe.author.avatar || '/placeholder-user.jpg'}
                  alt={recipe.author.name}
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              </div>
              <span className="text-sm font-medium text-gray-900 group-hover:text-[#c64118]">
                By {recipe.author.name}
              </span>
            </Link>
          </div>
        )}
      </div>

      {/* Social Share Buttons */}
      <SocialShareButtons recipe={recipe} />


    </div>
  );
}
