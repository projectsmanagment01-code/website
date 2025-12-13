'use client';

import Image from 'next/image';

interface ArticleData {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  featuredImageAlt?: string | null;
  tags: string[];
  readingTime?: number | null;
  views: number;
  publishedAt?: Date | string | null;
  updatedAt: Date | string;
  createdAt?: Date | string;
  authorRef?: {
    id: string;
    name: string;
    slug: string;
    avatar?: string | null;
    bio?: string | null;
  } | null;
  categoryRef?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

/* -------------------- Article Content (for page.tsx - no hero) -------------------- */
export function ArticleContent({ article }: { article: ArticleData }) {
  return (
    <div className="space-y-8 mt-2 text-md max-w-none">
      {/* Featured Image */}
      {article.featuredImage && (
        <div className="relative w-full rounded-lg overflow-hidden shadow-xl">
          <Image
            src={article.featuredImage}
            alt={article.featuredImageAlt || article.title}
            width={1200}
            height={800}
            quality={75}
            style={{
              width: "100%",
              height: "auto",
            }}
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 65vw, 1200px"
          />
        </div>
      )}

      {/* Main Content */}
      <div 
        className="article-content prose prose-stone prose-lg max-w-none
          prose-headings:text-stone-900 prose-headings:font-bold
          prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-4
          prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-2
          prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
          prose-h4:text-lg prose-h4:mt-6 prose-h4:mb-2 prose-h4:font-semibold
          prose-p:text-stone-700 prose-p:leading-relaxed prose-p:text-[18px] prose-p:mb-4
          prose-a:text-[#c64118] prose-a:no-underline hover:prose-a:text-orange-700 hover:prose-a:underline
          prose-strong:text-stone-900 prose-strong:font-bold
          prose-blockquote:border-l-4 prose-blockquote:border-orange-500 prose-blockquote:bg-orange-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-gray-800
          prose-img:rounded-xl prose-img:shadow-md prose-img:w-full prose-img:my-6
          prose-ul:text-stone-700 prose-ul:my-4 prose-ul:pl-6
          prose-ol:text-stone-700 prose-ol:my-4 prose-ol:pl-6
          prose-li:text-[18px] prose-li:leading-relaxed prose-li:mb-2 prose-li:pl-2
          [&_ul]:list-disc [&_ul]:space-y-2
          [&_ol]:list-decimal [&_ol]:space-y-2
          prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
          prose-pre:bg-gray-900 prose-pre:text-gray-100
          [&_table]:w-full [&_table]:border-collapse
          [&_th]:bg-stone-100 [&_th]:border [&_th]:border-stone-300 [&_th]:p-3 [&_th]:text-left [&_th]:font-semibold
          [&_td]:border [&_td]:border-stone-300 [&_td]:p-3
          [&_br]:block [&_br]:mb-2
        "
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="mt-10 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 bg-stone-100 text-stone-700 text-sm rounded-full hover:bg-stone-200 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ArticleContent;
