/**
 * Public Authors Listing Page
 * 
 * Beautiful author cards with all information - NO individual profiles
 */

import { Metadata } from 'next';
import { getAllAuthors } from '@/lib/author-integration';
import { Users, BookOpen, Mail } from 'lucide-react';
import Image from 'next/image';
import { getAuthorImageUrl } from '@/lib/author-image';

export const metadata: Metadata = {
  title: 'Our Recipe Authors - Recipes by Calama',
  description: 'Meet the talented chefs and home cooks behind our delicious recipes. Discover their culinary expertise and passion for cooking.',
  openGraph: {
    title: 'Our Recipe Authors - Recipes by Calama',
    description: 'Meet the talented chefs and home cooks behind our delicious recipes.',
    type: 'website',
  },
};

export default async function AuthorsPage() {
  const authors = await getAllAuthors();

  return (
    <div className="container-lg section-md">
      <main>
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Meet Our Authors
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            The passionate home cooks and culinary enthusiasts who share their 
            favorite recipes, kitchen tips, and cooking stories with you.
          </p>
        </div>

        {/* Authors Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {authors.map((author) => {
            const imageUrl = getAuthorImageUrl(author);
            
            return (
              <article 
                key={author.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-visible hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex flex-col md:flex-row md:items-center p-8 gap-6">
                  {/* Author Image - Perfect Circle */}
                  <div className="flex-shrink-0 mx-auto md:mx-0">
                    <Image
                      src={imageUrl}
                      alt={author.name}
                      width={224}
                      height={224}
                      className="rounded-full object-cover shadow-xl ring-4 ring-white"
                      style={{ width: '224px', height: '224px', minWidth: '224px', minHeight: '224px' }}
                      sizes="224px"
                    />
                  </div>

                  {/* Author Info */}
                  <div className="flex-1">
                    {/* Name & Stats */}
                    <div className="mb-4">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        {author.name}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          <strong>{author.recipeCount}</strong> {author.recipeCount === 1 ? 'Recipe' : 'Recipes'}
                        </span>
                      </div>
                    </div>

                    {/* Bio */}
                    {author.bio && (
                      <div className="mb-6">
                        <p className="text-gray-700 leading-relaxed line-clamp-4">
                          {author.bio}
                        </p>
                      </div>
                    )}

                    {/* Tags */}
                    {author.tags && author.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {author.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Empty State */}
        {authors.length === 0 && (
          <div className="text-center py-16">
            <Users className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Authors Yet</h3>
            <p className="text-gray-600">
              Check back soon to meet our recipe authors!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}