interface ArticleBreadcrumbSchemaProps {
  article: {
    title: string;
    slug: string;
    categoryRef?: {
      name: string;
      slug: string;
    } | null;
  };
}

export default function ArticleBreadcrumbSchema({ article }: ArticleBreadcrumbSchemaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  const breadcrumbItems = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: baseUrl
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Articles",
      item: `${baseUrl}/articles`
    }
  ];

  // Add category if exists
  if (article.categoryRef) {
    breadcrumbItems.push({
      "@type": "ListItem",
      position: 3,
      name: article.categoryRef.name,
      item: `${baseUrl}/categories/${article.categoryRef.slug}`
    });
    
    breadcrumbItems.push({
      "@type": "ListItem",
      position: 4,
      name: article.title,
      item: `${baseUrl}/articles/${article.slug}`
    });
  } else {
    breadcrumbItems.push({
      "@type": "ListItem",
      position: 3,
      name: article.title,
      item: `${baseUrl}/articles/${article.slug}`
    });
  }

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems
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
