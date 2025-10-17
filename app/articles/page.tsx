import { Metadata } from 'next';
import { FileText, Calendar, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Articles - Recipes by Calama',
  description: 'Explore our collection of cooking articles, tips, and culinary guides. Learn new techniques and discover food stories.',
  openGraph: {
    title: 'Articles - Recipes by Calama',
    description: 'Explore our collection of cooking articles, tips, and culinary guides.',
    type: 'website',
  },
};

// Placeholder articles data - to be replaced with database data later
const placeholderArticles = [
  {
    id: '1',
    title: 'The Ultimate Guide to Baking Perfect Bread',
    excerpt: 'Learn the secrets to baking artisan-quality bread at home with our comprehensive guide.',
    category: 'Baking',
    author: 'Editorial Team',
    date: '2025-10-15',
    slug: 'ultimate-guide-baking-bread',
    image: '/placeholder-article.jpg',
  },
  {
    id: '2',
    title: '10 Essential Kitchen Tools Every Cook Needs',
    excerpt: 'Discover the must-have kitchen tools that will transform your cooking experience.',
    category: 'Kitchen Tips',
    author: 'Editorial Team',
    date: '2025-10-12',
    slug: 'essential-kitchen-tools',
    image: '/placeholder-article.jpg',
  },
  {
    id: '3',
    title: 'Understanding Food Pairings: A Beginner\'s Guide',
    excerpt: 'Master the art of combining flavors with our expert guide to food pairings.',
    category: 'Cooking Techniques',
    author: 'Editorial Team',
    date: '2025-10-08',
    slug: 'food-pairings-guide',
    image: '/placeholder-article.jpg',
  },
];

export default function ArticlesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container-lg section-md">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6">
            <FileText className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Articles & Guides
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Explore our collection of cooking articles, kitchen tips, and culinary guides. 
            Enhance your cooking skills and discover the stories behind your favorite dishes.
          </p>
        </div>

        {/* Coming Soon Notice */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-500 p-6 rounded-lg mb-12 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Articles Coming Soon!
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We're working on bringing you amazing cooking articles, kitchen tips, and culinary guides. 
                Check back soon for helpful content that will enhance your cooking journey.
              </p>
            </div>
          </div>
        </div>

        {/* Placeholder Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {placeholderArticles.map((article) => (
            <article 
              key={article.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group"
            >
              {/* Article Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-orange-200 to-amber-200 flex items-center justify-center">
                <FileText className="w-16 h-16 text-white opacity-50" />
              </div>

              {/* Article Content */}
              <div className="p-6">
                {/* Category Badge */}
                <div className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-sm font-semibold rounded-full mb-3">
                  {article.category}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors line-clamp-2">
                  {article.title}
                </h3>

                {/* Excerpt */}
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {article.excerpt}
                </p>

                {/* Meta Information */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(article.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{article.author}</span>
                  </div>
                </div>

                {/* Read More Link */}
                <div className="inline-flex items-center gap-2 text-orange-600 font-semibold group-hover:gap-3 transition-all">
                  <span>Coming Soon</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            What to Expect
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                In-Depth Guides
              </h3>
              <p className="text-gray-600">
                Comprehensive articles covering cooking techniques, ingredient deep-dives, and culinary tips.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Seasonal Content
              </h3>
              <p className="text-gray-600">
                Articles tailored to seasonal ingredients and holiday cooking to keep your meals fresh.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Expert Tips
              </h3>
              <p className="text-gray-600">
                Professional cooking tips and tricks from experienced chefs and home cooking experts.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Meanwhile, Explore Our Recipes
          </h2>
          <p className="text-gray-600 mb-6">
            While we prepare our articles section, discover hundreds of delicious recipes.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Browse Recipes
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </main>
    </div>
  );
}
