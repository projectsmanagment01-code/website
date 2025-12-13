import Image from 'next/image';
import Link from 'next/link';
import { getAuthorImageUrl } from '@/lib/author-image';
import SidebarSubscription from './SidebarSubscription';
import { AdSidebarTop, AdSidebarSticky } from './ads/RecipeAds';

interface ArticleAuthor {
  id: string;
  name: string;
  slug: string;
  avatar?: string | null;
  bio?: string | null;
  img?: string | null;
}

interface RelatedArticle {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  categoryRef?: {
    name: string;
  } | null;
}

interface ArticleData {
  id: string;
  title: string;
  authorRef?: ArticleAuthor | null;
  categoryRef?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

/* -------------------- Author Card -------------------- */
async function ArticleAuthorCard({ article }: { article: ArticleData }) {
  if (!article.authorRef) {
    return null;
  }

  const author = article.authorRef;
  
  // Get author image URL using the shared utility
  const authorImageUrl = getAuthorImageUrl({
    avatar: author.avatar,
    img: author.img,
    name: author.name,
  });

  // Get author intro text
  const getAuthorIntro = (bio: string | null | undefined): string => {
    if (!bio) {
      return `A passionate writer sharing insightful articles and tips. Bringing you the best content to help you learn and grow.`;
    }
    
    // Remove the author name intro part since we handle that separately
    const cleanBio = bio.replace(/^Hey[—\-\s]*I'm\s+\w+[!.]?\s*/i, '');
    return cleanBio || bio;
  };

  const introText = getAuthorIntro(author.bio);

  return (
    <div className="bg-white rounded-lg p-4 md:p-8 text-center shadow-sm border border-gray-100">
      {/* Circular Profile Photo - Perfect Circle */}
      <div className="mb-4 md:mb-6 flex justify-center items-center">
        <div className="relative flex-shrink-0">
          <Image
            src={authorImageUrl}
            alt={author.name}
            width={310}
            height={310}
            quality={100}
            className="rounded-full object-cover"
            style={{ width: '310px', height: '310px' }}
          />
        </div>
      </div>

      {/* Author Introduction - Responsive Typography */}
      <div className="mb-4 md:mb-8">
        <p className="text-gray-700 leading-relaxed text-sm md:text-base">
          <span className="font-medium text-base md:text-lg">Hey— I&apos;m {author.name}!</span>
          {introText && (
            <>
              <br />
              <span className="mt-2 md:mt-3 block">
                {introText}
              </span>
            </>
          )}
        </p>
      </div>

      {/* Link to Authors Page */}
      <div>
        <Link
          href="/authors"
          className="inline-block text-sm font-medium text-gray-900 hover:text-orange-600 transition-colors border-b border-gray-900 hover:border-orange-600"
        >
          — Meet Our Authors —
        </Link>
      </div>
    </div>
  );
}

/* -------------------- Article Sidebar -------------------- */
export default function ArticleSidebar({ 
  article, 
  relatedArticles = [] 
}: { 
  article: ArticleData;
  relatedArticles?: RelatedArticle[];
}) {
  return (
    <div className="relative text-black">
      {/* Sidebar Top Ad */}
      <AdSidebarTop category={article.categoryRef?.name} />

      {/* Author Card Section */}
      <div className="mb-8">
        <ArticleAuthorCard article={article} />
      </div>

      {/* Subscription Form */}
      <div className="mb-8">
        <SidebarSubscription />
      </div>

      {/* Sticky Sidebar Ad */}
      <AdSidebarSticky category={article.categoryRef?.name} />

      {/* Related Articles */}
      <div className="bg-white">
        {/* Header - Larger and more prominent */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-black uppercase tracking-wide">
            You Might Also Like
          </h2>
        </div>

        {/* Article List - Optimized spacing */}
        <div className="space-y-6">
          {relatedArticles.length > 0 ? (
            relatedArticles.map((relatedArticle, index) => (
              <div key={relatedArticle.id || index} className="flex items-start space-x-4">
                {/* 3:4 aspect ratio thumbnail image on left */}
                <div className="flex-shrink-0">
                  <Image
                    width={240}
                    height={320}
                    className="w-[120px] h-[160px] object-cover rounded-lg"
                    alt={relatedArticle.title}
                    quality={100}
                    src={relatedArticle.featuredImage || '/placeholder.jpg'}
                  />
                </div>
                
                {/* Content on right */}
                <div className="flex-1">
                  {/* Category label in red-orange */}
                  <div className="text-sm font-bold text-red-600 uppercase tracking-wider mb-2">
                    {relatedArticle.categoryRef?.name || 'ARTICLE'}
                  </div>
                  
                  {/* Article title with orange hover */}
                  <Link
                    href={`/articles/${relatedArticle.slug}`}
                    title={relatedArticle.title}
                    className="text-black no-underline hover:text-orange-700 transition-colors"
                  >
                    <h3 className="font-bold text-lg leading-tight text-black mb-3">
                      {relatedArticle.title}
                    </h3>
                  </Link>
                  
                  {/* Description paragraph */}
                  {relatedArticle.excerpt && (
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {relatedArticle.excerpt.slice(0, 100).trim()}
                      {relatedArticle.excerpt.length > 100 ? '...' : ''}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-6 text-gray-500">
              <p>No related articles found.</p>
              <Link 
                href="/articles" 
                className="text-orange-600 hover:text-orange-700 mt-2 inline-block"
              >
                Browse all articles →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
