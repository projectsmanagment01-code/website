import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, Eye } from 'lucide-react';
import Breadcrumbs from './RecipeHero';

interface ArticleData {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
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

/* -------------------- Format Date Helper -------------------- */
const formatDate = (dateString: string | Date) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/* -------------------- Article Hero (Server Component matching RecipeHero) -------------------- */
export default function ArticleHero({ article }: { article: ArticleData | null }) {
  if (!article) return null;
  
  const publishDate = article.publishedAt || article.createdAt || article.updatedAt;
  const updateDate = article.updatedAt;
  
  // Check if article was actually updated (different from created)
  const wasUpdated = article.createdAt && article.updatedAt && 
    new Date(article.updatedAt).getTime() > new Date(article.createdAt).getTime();

  return (
    <div className="bg-stone-100 space-y-2 px-4 md:px-6">
      {/* Breadcrumbs - Use same component as recipes */}
      <nav>
        <Breadcrumbs />
      </nav>

      {/* Title Section */}
      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
          {article.title}
        </h1>

        {/* Excerpt/Description with category link */}
        {article.excerpt && (
          <p className="text-[19.2px] text-gray-600">
            {article.excerpt}{' '}
            {article.categoryRef && (
              <Link
                href={`/categories/${article.categoryRef.slug}`}
                className="text-[#c64118] hover:underline"
              >
                {article.categoryRef.name}
              </Link>
            )}
            {article.categoryRef && '.'}
          </p>
        )}
      </div>

      {/* Date and Author Info Section */}
      <div className="flex flex-col space-y-3 py-4 border-t border-b border-gray-300">
        {/* Dates Row */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          {publishDate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                <strong>Published:</strong> {formatDate(publishDate)}
              </span>
            </div>
          )}
          {/* Only show update time if article was actually updated */}
          {wasUpdated && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>
                <strong>Updated:</strong> {formatDate(updateDate)}
              </span>
            </div>
          )}
          {/* Reading Time */}
          {article.readingTime && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{article.readingTime} min read</span>
            </div>
          )}
          {/* Views */}
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span>{article.views.toLocaleString()} views</span>
          </div>
        </div>

        {/* Author Info Row */}
        {article.authorRef && (
          <div className="flex items-center gap-3">
            <Link href="/authors" className="flex items-center gap-3 group hover:opacity-80 transition-opacity">
              <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-gray-200">
                <Image
                  src={article.authorRef.avatar || '/placeholder-user.jpg'}
                  alt={article.authorRef.name}
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              </div>
              <span className="text-sm font-medium text-gray-900 group-hover:text-[#c64118]">
                By {article.authorRef.name}
              </span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
