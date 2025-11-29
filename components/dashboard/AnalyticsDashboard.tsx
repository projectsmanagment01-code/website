'use client';

import { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  FileText, 
  Users, 
  Mail,
  Clock,
  BarChart3,
  Activity,
  Calendar
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalRecipes: number;
    publishedRecipes: number;
    draftRecipes: number;
    totalViews: number;
    avgViews: number;
    totalSubscribers: number;
    activeSubscribers: number;
    recentSubscribers: number;
    subscriberGrowthRate: number;
  };
  topRecipes: Array<{
    id: string;
    title: string;
    slug: string;
    category: string;
    views: number;
    img?: string;
    heroImage?: string;
    lastViewedAt?: Date;
  }>;
  recentRecipes: Array<{
    id: string;
    title: string;
    slug: string;
    category: string;
    status: string;
    createdAt: Date;
    views: number;
  }>;
  categoryStats: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  trends: {
    views: Array<{ date: string; views: number }>;
    subscribers: Array<{ date: string; subscribers: number }>;
  };
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        {error || 'Failed to load analytics'}
      </div>
    );
  }

  const { overview, topRecipes, recentRecipes, categoryStats } = analytics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">Comprehensive overview of your website performance</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Recipes */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-green-600 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              {overview.publishedRecipes} live
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{overview.totalRecipes}</p>
          <p className="text-sm text-gray-600 mt-1">Total Recipes</p>
          <p className="text-xs text-gray-500 mt-2">{overview.draftRecipes} drafts</p>
        </div>

        {/* Total Views */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">
              ~{overview.avgViews} avg
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{overview.totalViews.toLocaleString()}</p>
          <p className="text-sm text-gray-600 mt-1">Total Views</p>
          <p className="text-xs text-gray-500 mt-2">All time</p>
        </div>

        {/* Subscribers */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Mail className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-green-600 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +{overview.recentSubscribers} this week
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{overview.totalSubscribers}</p>
          <p className="text-sm text-gray-600 mt-1">Total Subscribers</p>
          <p className="text-xs text-gray-500 mt-2">{overview.activeSubscribers} active</p>
        </div>

        {/* Growth Rate */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
            <span className={`text-sm font-medium flex items-center gap-1 ${
              overview.subscriberGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {overview.subscriberGrowthRate >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {Math.abs(overview.subscriberGrowthRate)}%
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {overview.subscriberGrowthRate >= 0 ? '+' : ''}{overview.subscriberGrowthRate}%
          </p>
          <p className="text-sm text-gray-600 mt-1">Growth Rate</p>
          <p className="text-xs text-gray-500 mt-2">Last 7 days</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Recipes */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-gray-600" />
                Top Performing Recipes
              </h3>
              <Eye className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topRecipes.slice(0, 5).map((recipe, index) => (
                <div
                  key={recipe.id}
                  className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <img
                    src={recipe.img || recipe.heroImage || '/placeholder.jpg'}
                    alt={recipe.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {recipe.title}
                    </p>
                    <p className="text-xs text-gray-500">{recipe.category}</p>
                  </div>
                  <div className="flex items-center gap-1 text-purple-600">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm font-semibold">{recipe.views.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gray-600" />
              Category Distribution
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {categoryStats.slice(0, 8).map((cat, index) => {
                const colors = [
                  'bg-blue-500',
                  'bg-green-500',
                  'bg-purple-500',
                  'bg-orange-500',
                  'bg-pink-500',
                  'bg-indigo-500',
                  'bg-red-500',
                  'bg-yellow-500',
                ];
                return (
                  <div key={cat.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {cat.category.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm text-gray-500">
                        {cat.count} ({cat.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`${colors[index % colors.length]} h-2.5 rounded-full transition-all duration-300`}
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            Recent Activity
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {recentRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{recipe.title}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(recipe.createdAt).toLocaleDateString()} • {recipe.category}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    recipe.status === 'published' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {recipe.status}
                  </span>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">{recipe.views}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
