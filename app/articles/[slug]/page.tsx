// Force static generation for maximum performance
export const dynamic = "force-static";
export const revalidate = 3600; // Revalidate every hour

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ArticleContent } from '@/components/ArticleContent';
import ArticleSidebar from '@/components/ArticleSidebar';
import ArticleSchema from '@/components/ArticleSchema';
import ArticleBreadcrumbSchema from '@/components/ArticleBreadcrumbSchema';
import BackToTop from '@/components/BackToTop';
import FloatingShare from '@/components/FloatingShare';
import { siteConfig } from '@/config/site';

interface ArticlePageRouteProps {
  params: Promise<{ slug: string }>;
}

async function getArticle(slug: string) {
  const article = await prisma.article.findUnique({
    where: { slug, status: 'published' },
    include: {
      authorRef: {
        select: {
          id: true,
          name: true,
          slug: true,
          avatar: true,
          bio: true,
          img: true,
        },
      },
      categoryRef: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });
  
  if (article) {
    // Increment view count in background
    prisma.article.update({
      where: { id: article.id },
      data: { views: { increment: 1 } },
    }).catch(console.error);
  }
  
  return article;
}

async function getRelatedArticles(articleId: string, categoryId: string | null, limit: number = 4) {
  const articles = await prisma.article.findMany({
    where: {
      status: 'published',
      id: { not: articleId },
      ...(categoryId ? { categoryId } : {}),
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      featuredImage: true,
      categoryRef: {
        select: { name: true },
      },
    },
    orderBy: { publishedAt: 'desc' },
    take: limit,
  });
  
  return articles;
}

export async function generateMetadata({ params }: ArticlePageRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  
  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }
  
  const publishDate = article.publishedAt 
    ? new Date(article.publishedAt).toISOString() 
    : new Date(article.createdAt).toISOString();
  
  return {
    title: article.metaTitle || article.title,
    description: article.metaDescription || article.excerpt || '',
    keywords: article.focusKeyword ? [article.focusKeyword, ...article.tags] : article.tags,
    authors: article.authorRef ? [{ name: article.authorRef.name }] : undefined,
    openGraph: {
      title: article.ogTitle || article.title,
      description: article.ogDescription || article.excerpt || '',
      type: 'article',
      publishedTime: publishDate,
      modifiedTime: new Date(article.updatedAt).toISOString(),
      authors: article.authorRef ? [`${siteConfig.url}/authors/${article.authorRef.slug}`] : undefined,
      images: article.ogImage || article.featuredImage ? [
        {
          url: article.ogImage || article.featuredImage!,
          width: 1200,
          height: 630,
          alt: article.featuredImageAlt || article.title,
        }
      ] : undefined,
      url: `${siteConfig.url}/articles/${slug}`,
      siteName: siteConfig.name,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.ogTitle || article.title,
      description: article.ogDescription || article.excerpt || '',
      images: article.ogImage || article.featuredImage ? [article.ogImage || article.featuredImage!] : undefined,
    },
    alternates: {
      canonical: article.canonicalUrl || `${siteConfig.url}/articles/${slug}`,
    },
  };
}

export default async function ArticlePageRoute({ params }: ArticlePageRouteProps) {
  const { slug } = await params;
  const article = await getArticle(slug);
  
  if (!article) {
    notFound();
  }
  
  // Fetch related articles
  let relatedArticles: any[] = [];
  try {
    relatedArticles = await getRelatedArticles(article.id, article.categoryId, 4);
  } catch (error) {
    console.error("❌ Failed to fetch related articles:", error);
  }
  
  return (
    <>
      {/* Schema.org structured data for Google */}
      <ArticleSchema article={article} />
      <ArticleBreadcrumbSchema article={article} />
      
      {/* Floating Share Buttons on Left */}
      <FloatingShare 
        title={article.title} 
        description={article.excerpt || undefined}
        image={article.featuredImage || undefined}
      />
      
      <div className="container-wide section-md">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8" data-sidebar-container>
          {/* Main Content */}
          <main className="lg:col-span-7">
            <ArticleContent article={article} />
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <ArticleSidebar article={article} relatedArticles={relatedArticles} />
          </aside>
        </div>
      </div>
      
      {/* Back to Top Button */}
      <BackToTop />
    </>
  );
}

// Generate static params for all published articles
export async function generateStaticParams() {
  const articles = await prisma.article.findMany({
    where: { status: 'published' },
    select: { slug: true },
  });
  
  return articles.map((article) => ({
    slug: article.slug,
  }));
}
