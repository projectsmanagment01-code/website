'use client';

import { siteConfig } from '@/config/site';

interface ArticleSchemaProps {
  article: {
    title: string;
    slug: string;
    content: string;
    excerpt?: string | null;
    featuredImage?: string | null;
    featuredImageAlt?: string | null;
    publishedAt?: Date | string | null;
    updatedAt: Date | string;
    readingTime?: number | null;
    authorRef?: {
      name: string;
      slug: string;
      avatar?: string | null;
    } | null;
  };
}

export default function ArticleSchema({ article }: ArticleSchemaProps) {
  const publishDate = article.publishedAt 
    ? new Date(article.publishedAt).toISOString() 
    : new Date(article.updatedAt).toISOString();
  
  const modifiedDate = new Date(article.updatedAt).toISOString();
  
  const articleUrl = `${siteConfig.url}/articles/${article.slug}`;
  const imageUrl = article.featuredImage?.startsWith('http') 
    ? article.featuredImage 
    : `${siteConfig.url}${article.featuredImage}`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt || '',
    image: article.featuredImage ? [imageUrl] : [],
    datePublished: publishDate,
    dateModified: modifiedDate,
    author: article.authorRef ? [{
      '@type': 'Person',
      name: article.authorRef.name,
      url: `${siteConfig.url}/authors/${article.authorRef.slug}`,
    }] : [{
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    }],
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    ...(article.readingTime && {
      timeRequired: `PT${article.readingTime}M`,
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
