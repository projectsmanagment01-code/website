import React, { useState, useMemo } from "react";
import { Recipe } from "@/outils/types";
import { Edit, Trash2, Eye, Plus, Calendar, Tag, User, Filter, Check } from "lucide-react";
import { getAuthorImage } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { SEOScoreIndicator } from "@/components/admin/SEOScoreIndicator";
import { CompletionBar } from "@/components/admin/CompletionBar";
import { AdvancedFilters } from "@/components/admin/AdvancedFilters";
import { BulkOperations } from "@/components/admin/BulkOperations";

interface RecipeTableProps {
  recipes: Recipe[];
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export const RecipeTable: React.FC<RecipeTableProps> = ({
  recipes,
  onEdit,
  onDelete,
  onAdd
}) => {
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [seoScoreRange, setSeoScoreRange] = useState<[number, number]>([0, 100]);
  const [dateRange, setDateRange] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  
  // Bulk operations states
  const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(recipes.map(recipe => recipe.category)));
    return uniqueCategories.sort();
  }, [recipes]);

  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      // Search filter
      const searchMatch = searchTerm === "" || 
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (recipe.author?.name && recipe.author.name.toLowerCase().includes(searchTerm.toLowerCase()));

      // Status filter
      const statusMatch = statusFilter === "all" || recipe.status === statusFilter;

      // Category filter
      const categoryMatch = categoryFilter === "all" || recipe.category === categoryFilter;

      // SEO Score filter
      const seoMatch = (recipe.seoScore || 0) >= seoScoreRange[0] && (recipe.seoScore || 0) <= seoScoreRange[1];

      return searchMatch && statusMatch && categoryMatch && seoMatch;
    });
  }, [recipes, searchTerm, statusFilter, categoryFilter, seoScoreRange]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (statusFilter !== "all") count++;
    if (categoryFilter !== "all") count++;
    if (seoScoreRange[0] > 0 || seoScoreRange[1] < 100) count++;
    return count;
  }, [searchTerm, statusFilter, categoryFilter, seoScoreRange]);

  // Selection handlers
  const handleSelectRecipe = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRecipes(prev => [...prev, id]);
    } else {
      setSelectedRecipes(prev => prev.filter(recipeId => recipeId !== id));
    }
  };

  const handleSelectAll = () => {
    setSelectedRecipes(filteredRecipes.map(recipe => recipe.id));
  };

  const handleClearSelection = () => {
    setSelectedRecipes([]);
  };

  // Mock bulk operations (since not implemented in parent yet)
  const handleBulkDelete = async () => {
    console.log('Bulk delete for:', selectedRecipes);
    setSelectedRecipes([]);
  };

  const handleBulkStatusChange = async (status: 'published' | 'draft') => {
    console.log('Bulk status change to:', status, 'for:', selectedRecipes);
    setSelectedRecipes([]);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setSeoScoreRange([0, 100]);
    setDateRange("all");
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-gray-900 mb-0.5">
            Recipe Management
          </h1>
          <p className="text-xs text-gray-600">
            Manage your recipe collection with advanced tools
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm border rounded-lg transition-colors ${
              showFilters || activeFiltersCount > 0
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-3 h-3" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-3 h-3" />
            Add Recipe
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <AdvancedFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          seoScoreRange={seoScoreRange}
          setSeoScoreRange={setSeoScoreRange}
          dateRange={dateRange}
          setDateRange={setDateRange}
          categories={categories}
          onClearFilters={handleClearFilters}
          activeFiltersCount={activeFiltersCount}
        />
      )}

      {/* Bulk Operations */}
      <BulkOperations
        selectedRecipes={selectedRecipes}
        totalRecipes={filteredRecipes.length}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        onBulkDelete={handleBulkDelete}
        onBulkStatusChange={handleBulkStatusChange}
        isDeleting={false}
        isUpdatingStatus={false}
      />

      {/* Results Summary */}
      <div className="flex justify-between items-center text-xs text-gray-600 bg-gray-50 px-2 py-0.5 rounded">
        <span>
          Showing {filteredRecipes.length} of {recipes.length} recipes
        </span>
        {selectedRecipes.length > 0 && (
          <span className="text-blue-600 font-medium text-xs">
            {selectedRecipes.length} selected
          </span>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse min-w-[1000px]">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm w-12">
                  <input
                    type="checkbox"
                    checked={selectedRecipes.length === filteredRecipes.length && filteredRecipes.length > 0}
                    onChange={(e) => e.target.checked ? handleSelectAll() : handleClearSelection()}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm w-80">Recipe</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm w-32">Author</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm w-24">Category</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm w-20">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm w-20">Views</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm w-16">SEO</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecipes.map((recipe) => (
                <tr key={recipe.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedRecipes.includes(recipe.id)}
                      onChange={(e) => handleSelectRecipe(recipe.id, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={recipe.img}
                        alt={recipe.title}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-gray-900 text-sm truncate">
                          {recipe.title}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">
                          {recipe.intro}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <img
                        src={getAuthorImage(recipe.author)}
                        alt={recipe.author?.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {recipe.author?.name || "Unknown"}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Tag className="w-3 h-3" />
                      <span className="text-sm truncate">{recipe.category}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={recipe.status || 'draft'} />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Eye className="w-3 h-3" />
                      <span className="text-sm">{recipe.views?.toLocaleString() || '0'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <SEOScoreIndicator score={recipe.seoScore || 0} />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => window.open(`/recipes/${recipe.slug || recipe.id}`, '_blank')}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="View Recipe"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(recipe)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit Recipe"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(recipe.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete Recipe"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredRecipes.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeFiltersCount > 0 ? 'No matching recipes' : 'No recipes yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {activeFiltersCount > 0 
              ? 'Try adjusting your filters to see more results.' 
              : 'Get started by creating your first recipe.'
            }
          </p>
          {activeFiltersCount > 0 ? (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          ) : (
            <button
              onClick={onAdd}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add First Recipe
            </button>
          )}
        </div>
      )}
    </div>
  );
};
