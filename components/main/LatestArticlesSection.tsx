import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ArrowRight, Clock, Calendar } from "lucide-react";

interface LatestArticlesSectionProps {
  className?: string;
  limit?: number;
}

async function getLatestArticlesFromDB(limit: number = 4) {
  try {
    const articles = await prisma.article.findMany({
      where: { status: "published" },
      include: {
        authorRef: { select: { name: true, slug: true, avatar: true } },
        categoryRef: { select: { name: true, slug: true } },
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
    });
    return articles;
  } catch (error) {
    console.error("Failed to fetch latest articles:", error);
    return [];
  }
}

export default async function LatestArticlesSection({
  className,
  limit = 4,
}: LatestArticlesSectionProps) {
  const articles = await getLatestArticlesFromDB(limit);

  // Don't render if no articles available
  if (articles.length === 0) {
    return null;
  }

  const [featuredArticle, ...restArticles] = articles;

  return (
    <section className={`py-12 ${className || ""}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 uppercase flex items-center basis-[0%] grow after:bg-zinc-200 after:block after:basis-[0%] after:grow after:h-1.5 after:min-w-4 after:w-full after:ml-4 after:rounded-lg">
          Latest Articles
        </h2>
        <Link
          href="/articles"
          title="All Articles"
          className="text-white font-bold items-center bg-neutral-900 flex ml-4 p-2 rounded-full hover:bg-neutral-800 transition-colors"
        >
          <ArrowRight className="w-4 h-4 text-white" />
        </Link>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Featured Article (Large) */}
        {featuredArticle && (
          <Link
            href={`/articles/${featuredArticle.slug}`}
            className="group relative overflow-hidden rounded-2xl bg-stone-100 aspect-[4/3] lg:aspect-auto lg:row-span-2 lg:min-h-[400px]"
          >
            {featuredArticle.featuredImage ? (
              <Image
                src={featuredArticle.featuredImage}
                alt={featuredArticle.featuredImageAlt || featuredArticle.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-amber-200" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-6">
              {featuredArticle.categoryRef && (
                <span className="inline-block px-3 py-1 bg-amber-500 text-white text-xs font-medium rounded-full mb-3">
                  {featuredArticle.categoryRef.name}
                </span>
              )}

              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 line-clamp-2 group-hover:text-amber-200 transition-colors">
                {featuredArticle.title}
              </h3>

              {featuredArticle.excerpt && (
                <p className="text-white/80 text-sm line-clamp-2 mb-3 hidden sm:block">
                  {featuredArticle.excerpt}
                </p>
              )}

              <div className="flex items-center gap-4 text-white/70 text-sm">
                {featuredArticle.readingTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {featuredArticle.readingTime} min read
                  </span>
                )}
                {featuredArticle.publishedAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(featuredArticle.publishedAt).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </span>
                )}
              </div>
            </div>
          </Link>
        )}

        {/* Rest of Articles (Small Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          {restArticles.map((article) => (
            <Link
              key={article.id}
              href={`/articles/${article.slug}`}
              className="group flex gap-4 bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Thumbnail */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-lg overflow-hidden">
                {article.featuredImage ? (
                  <Image
                    src={article.featuredImage}
                    alt={article.featuredImageAlt || article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="120px"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200" />
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col justify-center flex-1 min-w-0">
                {article.categoryRef && (
                  <span className="text-xs text-amber-600 font-medium mb-1">
                    {article.categoryRef.name}
                  </span>
                )}

                <h4 className="font-semibold text-stone-900 line-clamp-2 group-hover:text-amber-700 transition-colors">
                  {article.title}
                </h4>

                <div className="flex items-center gap-3 mt-2 text-xs text-stone-500">
                  {article.readingTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.readingTime} min
                    </span>
                  )}
                  {article.publishedAt && (
                    <span>
                      {new Date(article.publishedAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
