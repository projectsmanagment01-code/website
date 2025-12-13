import { Metadata } from 'next';
import { FileText } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import ArticleCard from '@/components/ArticleCard';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Articles - Recipes website',
  description: 'Explore our collection of cooking articles and culinary guides.',
};

// Pagination component matching recipes page style
const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  basePath = "/articles",
}) => {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  const getPageNumbers = () => {
    let pages: (number | string)[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      if (startPage > 2) {
        pages.push("...");
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages - 1) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <nav className="flex justify-center mt-8">
      <ul className="flex gap-1 sm:gap-2 list-none p-0 m-0 text-xs sm:text-sm">
        {/* First Arrow - Hidden on mobile */}
        <li className="hidden sm:flex">
          {isFirstPage ? (
            <span className="px-2 sm:px-3 py-2 rounded-2xl bg-gray-200 text-gray-600 cursor-not-allowed block">
              «
            </span>
          ) : (
            <Link
              href={`${basePath}?page=1`}
              className="px-2 sm:px-3 py-2 rounded-2xl bg-black text-white hover:bg-gray-800 transition-colors block"
            >
              «
            </Link>
          )}
        </li>

        {/* Previous */}
        <li className="flex">
          {isFirstPage ? (
            <span className="px-2 sm:px-3 py-2 rounded-2xl bg-gray-200 text-gray-600 cursor-not-allowed block">
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">‹</span>
            </span>
          ) : (
            <Link
              href={`${basePath}?page=${currentPage - 1}`}
              className="px-2 sm:px-3 py-2 rounded-2xl bg-black text-white hover:bg-gray-800 transition-colors block"
            >
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">‹</span>
            </Link>
          )}
        </li>

        {/* Page Numbers */}
        {getPageNumbers().map((page, index) => (
          <li key={index} className="flex">
            {page === "..." ? (
              <span className="px-2 sm:px-3 py-2 rounded-2xl bg-gray-200 text-gray-600 block">
                ...
              </span>
            ) : page === currentPage ? (
              <span className="px-2 sm:px-3 py-2 rounded-2xl bg-gray-200 text-gray-600 cursor-not-allowed block">
                {page}
              </span>
            ) : (
              <Link
                href={`${basePath}?page=${page}`}
                className="px-2 sm:px-3 py-2 rounded-2xl bg-black text-white hover:bg-gray-800 transition-colors block"
              >
                {page}
              </Link>
            )}
          </li>
        ))}

        {/* Next */}
        <li className="flex">
          {isLastPage ? (
            <span className="px-2 sm:px-3 py-2 rounded-2xl bg-gray-200 text-gray-600 cursor-not-allowed block">
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">›</span>
            </span>
          ) : (
            <Link
              href={`${basePath}?page=${currentPage + 1}`}
              className="px-2 sm:px-3 py-2 rounded-2xl bg-black text-white hover:bg-gray-800 transition-colors block"
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">›</span>
            </Link>
          )}
        </li>

        {/* Last Arrow - Hidden on mobile */}
        <li className="hidden sm:flex">
          {isLastPage ? (
            <span className="px-2 sm:px-3 py-2 rounded-2xl bg-gray-200 text-gray-600 cursor-not-allowed block">
              »
            </span>
          ) : (
            <Link
              href={`${basePath}?page=${totalPages}`}
              className="px-2 sm:px-3 py-2 rounded-2xl bg-black text-white hover:bg-gray-800 transition-colors block"
            >
              »
            </Link>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Math.max(1, params.page ? parseInt(params.page) : 1);
  const pageSize = 9;

  // Get total count for pagination
  const totalArticles = await prisma.article.count({
    where: { status: 'published' },
  });
  const totalPages = Math.ceil(totalArticles / pageSize);

  const articles = await prisma.article.findMany({
    where: { status: 'published' },
    include: {
      authorRef: { select: { id: true, name: true, slug: true, avatar: true } },
      categoryRef: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { publishedAt: 'desc' },
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
  });

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <section className="bg-stone-100 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-stone-900 mb-4">
            Articles & Guides
          </h1>
          <p className="text-lg sm:text-xl text-stone-600 max-w-2xl mx-auto">
            Explore our collection of cooking articles, culinary guides, tips, and food stories to enhance your kitchen skills.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
            
            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath="/articles"
            />
          </>
        ) : (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-stone-900 mb-2">Coming Soon!</h2>
            <p className="text-stone-600">Articles are on the way. Check back soon!</p>
          </div>
        )}
      </main>
    </div>
  );
}
