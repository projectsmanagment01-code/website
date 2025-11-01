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
  title: 'Our Recipe Authors - Recipes website',
  description: 'Meet the talented chefs and home cooks behind our delicious recipes. Discover their culinary expertise and passion for cooking.',
  openGraph: {
    title: 'Our Recipe Authors - Recipes website',
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

        {/* Authors List - One Per Line, Alternating Layout */}
        <div className="space-y-16">
          {authors.map((author, index) => {
            const imageUrl = getAuthorImageUrl(author);
            const isEven = index % 2 === 0;
            
            return (
              <article 
                key={author.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                <div className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 p-8`}>
                  {/* Author Image */}
                  <div className="flex-shrink-0 mx-auto md:mx-0">
                    <Image
                      src={imageUrl}
                      alt={author.name}
                      width={300}
                      height={300}
                      className="rounded-2xl object-cover shadow-xl"
                      style={{ width: '300px', height: '300px', minWidth: '300px', minHeight: '300px' }}
                      sizes="300px"
                    />
                  </div>

                  {/* Author Info */}
                  <div className="flex-1 flex flex-col justify-center">
                    {/* Name & Stats */}
                    <div className="mb-6">
                      <h2 className="text-4xl font-bold text-gray-900 mb-3">
                        {author.name}
                      </h2>
                      <div className="flex items-center gap-4 text-base text-gray-600">
                        <span className="flex items-center gap-2">
                          <BookOpen className="w-5 h-5" />
                          <strong>{author.recipeCount}</strong> {author.recipeCount === 1 ? 'Recipe' : 'Recipes'}
                        </span>
                      </div>
                    </div>

                    {/* Bio - Full Text, No Truncation */}
                    {author.bio && (
                      <div className="mb-6">
                        <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                          {author.bio}
                        </p>
                      </div>
                    )}

                    {/* Tags */}
                    {author.tags && author.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {author.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-full font-medium"
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