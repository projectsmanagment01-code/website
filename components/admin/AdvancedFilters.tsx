import React from 'react';
import { Search, Filter, Calendar, Tag, TrendingUp, X } from 'lucide-react';

interface AdvancedFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  seoScoreRange: [number, number];
  setSeoScoreRange: (range: [number, number]) => void;
  dateRange: string;
  setDateRange: (range: string) => void;
  categories: string[];
  onClearFilters: () => void;
  activeFiltersCount: number;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  seoScoreRange,
  setSeoScoreRange,
  dateRange,
  setDateRange,
  categories,
  onClearFilters,
  activeFiltersCount
}) => {
  return (
    <div className="bg-gray-50 border border-gray-300 rounded p-4 shadow-lg transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#303740]" />
          <h3 className="font-medium text-gray-800 text-sm">Advanced Filters</h3>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-700">
              {activeFiltersCount} active
            </span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            <X className="w-3 h-3" />
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="block text-xs text-gray-700 mb-1">Search Recipes</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Title, ingredients, author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-xs text-gray-700 mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-xs text-gray-700 mb-1">Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-xs text-gray-700 mb-1">Date Range</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">Last 3 Months</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* SEO Score Range */}
      <div className="mt-4">
        <label className="block text-xs text-gray-700 mb-2">
          <TrendingUp className="w-3 h-3 inline mr-1" />
          SEO Score Range: {seoScoreRange[0]} - {seoScoreRange[1]}
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="100"
            value={seoScoreRange[0]}
            onChange={(e) => setSeoScoreRange([parseInt(e.target.value), seoScoreRange[1]])}
            className="flex-1"
          />
          <input
            type="range"
            min="0"
            max="100"
            value={seoScoreRange[1]}
            onChange={(e) => setSeoScoreRange([seoScoreRange[0], parseInt(e.target.value)])}
            className="flex-1"
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>Poor (0)</span>
          <span>Good (50)</span>
          <span>Excellent (100)</span>
        </div>
      </div>
    </div>
  );
};