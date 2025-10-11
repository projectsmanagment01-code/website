import { Recipe } from "@/outils/types";

interface BreadcrumbSchemaProps {
  recipe: Recipe;
}

export default function BreadcrumbSchema({ recipe }: BreadcrumbSchemaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Recipes",
        item: `${baseUrl}/recipes`
      },
      {
        "@type": "ListItem",
        position: 3,
        name: recipe.category,
        item: `${baseUrl}/categories/${recipe.categoryLink || recipe.category.toLowerCase().replace(/\s+/g, '-')}`
      },
      {
        "@type": "ListItem",
        position: 4,
        name: recipe.title,
        item: `${baseUrl}/recipes/${recipe.slug}`
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(breadcrumbData, null, 2)
      }}
    />
  );
}