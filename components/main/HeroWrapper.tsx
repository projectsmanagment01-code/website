// HeroWrapper.tsx
"use client";
import { usePathname } from "next/navigation";
import RecipeHero from "../RecipeHero";

export default function HeroWrapper({ children }: any) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const isSlug = segments[segments.length - 2] === "recipes";
  const isSlugPage = pathname?.includes("/recipes/");
  if (isSlug && isSlugPage) {
    return <>{children}</>;
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <section className="bg-stone-100">
          <div className="container-md section-sm">
            <RecipeHero />
          </div>
        </section>

        {children}
      </main>
    </div>
  );
}
