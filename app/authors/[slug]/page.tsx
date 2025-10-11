/**
 * Individual Author Profile Page
 * 
 * Displays a single author with their profile information and recipes
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAuthorBySlug, getAuthors } from '@/lib/author-service';
import { prisma } from '@/lib/prisma';
import { Users, BookOpen, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getAuthorImageUrl, getAuthorInitials } from '@/lib/author-image-utils';
import AuthorImage from '@/components/AuthorImage';

interface AuthorPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  try {
    // Get all authors using the paginated function with a large limit
    const result = await getAuthors(1, 1000);
    
    return result.authors.map((author) => ({
      slug: author.slug,
    }));
  } catch (error) {
    console.error('Error generating static params for authors:', error);
    return [];
  }
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { slug } = await params; // Fix: Await params before accessing properties
  const author = await getAuthorBySlug(slug);
  
  if (!author) {
    return {
      title: 'Author Not Found',
    };
  }

  return {
    title: `${author.name} - Recipe Author | Recipes by Calama`,
    description: author.bio || `Discover delicious recipes by ${author.name}`,
    openGraph: {
      title: `${author.name} - Recipe Author`,
      description: author.bio || `Discover delicious recipes by ${author.name}`,
      type: 'profile',
      images: getAuthorImageUrl(author) ? [
        {
          url: getAuthorImageUrl(author)!,
          width: 400,
          height: 400,
          alt: author.name,
        }
      ] : [],
    },
  };
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { slug } = await params; // Fix: Await params before accessing properties
  const author = await getAuthorBySlug(slug);

  if (!author) {
    notFound();
  }

  // Get recipes by this author - Direct database access to avoid API calls during build
  let authorRecipes: any[] = [];
  try {
    const recipes = await prisma.recipe.findMany({
      where: {
        authorId: author.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    authorRecipes = recipes || [];
  } catch (error) {
    console.error('Error fetching author recipes:', error);
    authorRecipes = [];
  }

  // Generate structured data for SEO
  const authorImageUrl = getAuthorImageUrl(author);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": author.name,
    "description": author.bio,
    "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://recipesbycalama.com'}/authors/${author.slug}`,
    ...(authorImageUrl ? {
      "image": authorImageUrl.startsWith('http') 
        ? authorImageUrl 
        : `${process.env.NEXT_PUBLIC_SITE_URL || 'https://recipesbycalama.com'}${authorImageUrl}`
    } : {}),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://recipesbycalama.com'}/authors/${author.slug}`
    },
    ...(authorRecipes.length > 0 ? {
      "knowsAbout": authorRecipes.map(recipe => ({
        "@type": "Recipe",
        "name": recipe.title,
        "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://recipesbycalama.com'}/recipes/${recipe.slug}`
      }))
    } : {})
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="container-lg section-md">
      <main>
        {/* Back Navigation */}
        <div className="mb-8">
          <Link 
            href="/authors"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Authors
          </Link>
        </div>

        {/* Author Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Author Avatar */}
            <div className="flex-shrink-0">
              <AuthorImage 
                author={author} 
                size="lg"
              />
            </div>

            {/* Author Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {author.name}
              </h1>

              {author.bio && (
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  {author.bio}
                </p>
              )}

              {/* Author Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-blue-900 mb-1">
                    {authorRecipes.length}
                  </h3>
                  <p className="text-blue-600 text-sm">
                    Recipe{authorRecipes.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Clock className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-900 mb-1">
                    {authorRecipes.length > 0 ? 
                      Math.round(authorRecipes.reduce((sum, recipe) => sum + (parseInt(recipe.timing?.prepTime || '30')), 0) / authorRecipes.length)
                      : 0
                    }m
                  </h3>
                  <p className="text-green-600 text-sm">Avg Prep Time</p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Users className="w-4 h-4 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-purple-900 mb-1">
                    {authorRecipes.length > 0 ? new Set(authorRecipes.map(recipe => recipe.category)).size : 0}
                  </h3>
                  <p className="text-purple-600 text-sm">
                    Categor{(authorRecipes.length > 0 ? new Set(authorRecipes.map(recipe => recipe.category)).size : 0) !== 1 ? 'ies' : 'y'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Author Recipes */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Recipes by {author.name}
          </h2>

          {authorRecipes.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Recipes Yet</h3>
              <p className="text-gray-600">
                This author hasn't published any recipes yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {authorRecipes.map((recipe) => (
                <div key={recipe.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Recipe Image */}
                  <div className="aspect-video bg-gray-100 relative">
                    {recipe.img && (
                      <img
                        src={recipe.img}
                        alt={recipe.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {recipe.category && (
                      <div className="absolute top-3 left-3">
                        <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                          {recipe.category}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Recipe Info */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {recipe.title}
                    </h3>

                    {recipe.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {recipe.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{recipe.timing?.prepTime || '30'}m</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{recipe.recipeInfo?.servings || '4'} servings</span>
                      </div>
                    </div>

                    <Link
                      href={`/recipes/${recipe.slug}`}
                      className="inline-block w-full bg-orange-600 hover:bg-orange-700 text-white text-center px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      View Recipe
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related Authors */}
        <div className="mt-16 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Discover More Authors
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Explore our community of passionate cooks and discover new flavors 
            and cooking techniques from around the world.
          </p>
          <Link
            href="/authors"
            className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            Browse All Authors
          </Link>
        </div>
      </main>
    </div>
    </>
  );
}