/**
 * Public Authors Listing Page
 * 
 * Displays all authors with their profile information and recipe counts
 */

import { Metadata } from 'next';
import { getAllAuthors } from '@/lib/author-integration';
import { Users, BookOpen, Clock } from 'lucide-react';
import { getAuthorImageUrl, getAuthorInitials } from '@/lib/author-image-utils';
import AuthorImage from '@/components/AuthorImage';

export const metadata: Metadata = {
  title: 'Authors - Recipes by Calama',
  description: 'Meet our talented recipe authors and discover their delicious creations.',
  openGraph: {
    title: 'Authors - Recipes by Calama',
    description: 'Meet our talented recipe authors and discover their delicious creations.',
    type: 'website',
  },
};

export default async function AuthorsPage() {
  const authors = await getAllAuthors();

  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Recipe Authors",
    "description": "Meet our talented recipe authors and discover their delicious creations.",
    "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://recipesbycalama.com'}/authors`,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": authors.map((author, index) => {
        const imageUrl = getAuthorImageUrl(author);
        return {
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "Person",
            "name": author.name,
            "description": author.bio,
            "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://recipesbycalama.com'}/authors/${author.slug}`,
            ...(imageUrl ? {
              "image": imageUrl.startsWith('http') 
                ? imageUrl 
                : `${process.env.NEXT_PUBLIC_SITE_URL || 'https://recipesbycalama.com'}${imageUrl}`
            } : {})
          }
        };
      })
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="container-lg section-md">
      <main>
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Authors
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Meet the talented chefs, home cooks, and culinary enthusiasts who share their 
            passion and expertise through our recipe collection.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{authors.length}</h3>
            <p className="text-gray-600">Featured Authors</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {authors.reduce((sum, author) => sum + author.recipeCount, 0)}
            </h3>
            <p className="text-gray-600">Total Recipes</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {authors.length > 0 ? Math.round(authors.reduce((sum, author) => sum + author.recipeCount, 0) / authors.length) : 0}
            </h3>
            <p className="text-gray-600">Avg Recipes per Author</p>
          </div>
        </div>

        {/* Authors Grid */}
        {authors.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Authors Yet</h3>
            <p className="text-gray-600">
              Authors will appear here once recipes are published with author information.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {authors.map((author) => (
              <div key={author.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Author Avatar */}
                <div className="p-6 text-center">
                  <AuthorImage 
                    author={author} 
                    size="md"
                  />

                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {author.name}
                  </h3>

                  {author.bio && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {author.bio}
                    </p>
                  )}

                  <div className="flex justify-center items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{author.recipeCount} recipe{author.recipeCount !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {/* View Profile Button */}
                  <a
                    href={`/authors/${author.slug}`}
                    className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    View Profile
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Become a Recipe Author
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Do you have amazing recipes to share? We're always looking for passionate 
              cooks to join our community and inspire others with their culinary creations.
            </p>
            <a
              href="/contact"
              className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Get In Touch
            </a>
          </div>
        </div>
      </main>
    </div>
    </>
  );
}
