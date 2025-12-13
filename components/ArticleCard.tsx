import Link from 'next/link';
import Image from 'next/image';
import { Clock, Eye, Calendar } from 'lucide-react';

interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    featuredImage?: string | null;
    featuredImageAlt?: string | null;
    tags: string[];
    readingTime?: number | null;
    views: number;
    publishedAt?: Date | string | null;
    authorRef?: {
      name: string;
      slug: string;
      avatar?: string | null;
    } | null;
    categoryRef?: {
      name: string;
      slug: string;
    } | null;
  };
  variant?: 'default' | 'featured' | 'compact';
}

export default function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  const publishDate = article.publishedAt ? new Date(article.publishedAt) : null;
  
  if (variant === 'featured') {
    return (
      <Link 
        href={`/articles/${article.slug}`}
        className="group block relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
      >
        <div className="relative aspect-[16/9] md:aspect-[21/9]">
          {article.featuredImage ? (
            <Image
              src={article.featuredImage}
              alt={article.featuredImageAlt || article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 1200px"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          {article.categoryRef && (
            <span className="inline-block px-3 py-1 bg-amber-500 text-white text-xs font-medium rounded-full mb-3">
              {article.categoryRef.name}
            </span>
          )}
          
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 line-clamp-2 group-hover:text-amber-200 transition-colors">
            {article.title}
          </h2>
          
          {article.excerpt && (
            <p className="text-white/80 text-sm md:text-base line-clamp-2 mb-4 max-w-2xl">
              {article.excerpt}
            </p>
          )}
          
          <div className="flex items-center gap-4 text-white/70 text-sm">
            {article.authorRef && (
              <div className="flex items-center gap-2">
                {article.authorRef.avatar && (
                  <Image
                    src={article.authorRef.avatar}
                    alt={article.authorRef.name}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                )}
                <span>{article.authorRef.name}</span>
              </div>
            )}
            
            {publishDate && (
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>{publishDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
            )}
            
            {article.readingTime && (
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{article.readingTime} min</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }
  
  if (variant === 'compact') {
    return (
      <Link 
        href={`/articles/${article.slug}`}
        className="group flex gap-4 p-3 rounded-lg hover:bg-stone-50 transition-colors"
      >
        {article.featuredImage && (
          <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
            <Image
              src={article.featuredImage}
              alt={article.featuredImageAlt || article.title}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-stone-900 line-clamp-2 group-hover:text-amber-700 transition-colors">
            {article.title}
          </h3>
          <div className="flex items-center gap-3 mt-1 text-stone-500 text-xs">
            {publishDate && (
              <span>{publishDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            )}
            {article.readingTime && (
              <span>{article.readingTime} min read</span>
            )}
          </div>
        </div>
      </Link>
    );
  }
  
  // Default variant
  return (
    <Link 
      href={`/articles/${article.slug}`}
      className="group block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        {article.featuredImage ? (
          <Image
            src={article.featuredImage}
            alt={article.featuredImageAlt || article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
            <span className="text-amber-600 text-6xl font-serif">{article.title.charAt(0)}</span>
          </div>
        )}
        
        {article.categoryRef && (
          <span className="absolute top-3 left-3 px-2 py-1 bg-white/90 text-amber-800 text-xs font-medium rounded">
            {article.categoryRef.name}
          </span>
        )}
      </div>
      
      <div className="p-5">
        <h3 className="text-lg font-bold text-stone-900 line-clamp-2 mb-2 group-hover:text-amber-700 transition-colors">
          {article.title}
        </h3>
        
        {article.excerpt && (
          <p className="text-stone-600 text-sm line-clamp-2 mb-4">
            {article.excerpt}
          </p>
        )}
        
        <div className="flex items-center justify-between text-stone-500 text-xs">
          <div className="flex items-center gap-3">
            {article.authorRef && (
              <span className="font-medium">{article.authorRef.name}</span>
            )}
            {publishDate && (
              <span>{publishDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {article.readingTime && (
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>{article.readingTime} min</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Eye size={12} />
              <span>{article.views}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
