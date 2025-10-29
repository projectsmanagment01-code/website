import React, { useState, useMemo } from "react";
import { Recipe } from "@/outils/types";
import { Edit, Trash2, Eye, Plus, Calendar, Tag, User, Filter, Check, ChefHat, UserCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { getAuthorImage, safeImageUrl } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { SEOScoreIndicator } from "./SEOScoreIndicator";
import { AdvancedFilters } from "./AdvancedFilters";
import { BulkOperations } from "./BulkOperations";
import { adminFetch } from "@/lib/admin-fetch";

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
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Bulk operations states
  const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isGeneratingSEO, setIsGeneratingSEO] = useState(false);

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

      // Status filter - Check if recipe is published (has public URL/slug and not explicitly draft)
      const actualStatus = recipe.status || (recipe.slug && !recipe.slug.includes('draft') ? 'published' : 'draft');
      const statusMatch = statusFilter === "all" || actualStatus === statusFilter;

      // Category filter
      const categoryMatch = categoryFilter === "all" || recipe.category === categoryFilter;

      // SEO Score filter
      const seoMatch = (recipe.seoScore || 0) >= seoScoreRange[0] && (recipe.seoScore || 0) <= seoScoreRange[1];

      return searchMatch && statusMatch && categoryMatch && seoMatch;
    });
  }, [recipes, searchTerm, statusFilter, categoryFilter, seoScoreRange]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredRecipes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRecipes = filteredRecipes.slice(startIndex, endIndex);

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoryFilter, seoScoreRange]);

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

  const handleSelectCurrentPage = () => {
    setSelectedRecipes(paginatedRecipes.map(recipe => recipe.id));
  };

  const handleClearSelection = () => {
    setSelectedRecipes([]);
  };

  // Bulk operations
  const handleBulkDelete = async () => {
    if (selectedRecipes.length === 0 || isDeleting) return;
    
    // SINGLE confirmation for ALL recipes
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedRecipes.length} recipe${selectedRecipes.length !== 1 ? 's' : ''}? This action cannot be undone.`
    );
    
    if (confirmed) {
      setIsDeleting(true);
      try {
        // Get admin token for authentication
        const token = localStorage.getItem('admin_token');
        if (!token) {
          throw new Error('Authentication required');
        }

        const response = await adminFetch('/api/recipe/bulk-update', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            recipeIds: selectedRecipes,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete recipes');
        }

        // NO INDIVIDUAL onDelete calls - just bulk API call
        setSelectedRecipes([]);
        // Force a page refresh to show updated data
        window.location.reload();
      } catch (error) {
        console.error('Error deleting recipes:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleBulkStatusChange = async (status: 'published' | 'draft') => {
    if (selectedRecipes.length === 0 || isUpdatingStatus) return;
    
    setIsUpdatingStatus(true);
    try {
      // Get admin token for authentication
      const token = localStorage.getItem('admin_token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await adminFetch('/api/recipe/bulk-update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipeIds: selectedRecipes,
          updates: { status },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update recipe status');
      }

      // Update the local state to reflect the changes
      setSelectedRecipes([]);
      
      // Force a page refresh to show updated data
      window.location.reload();
      
    } catch (error) {
      console.error('Error updating recipe status:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle bulk SEO generation
  const handleBulkSEOGenerate = async () => {
    if (selectedRecipes.length === 0 || isGeneratingSEO) return;

    const confirmMessage = `Generate SEO reports for ${selectedRecipes.length} selected recipe${selectedRecipes.length !== 1 ? 's' : ''}?\n\nThis may take a few minutes and will use OpenAI API credits.\nRecipes will be processed one by one to avoid API limits.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setIsGeneratingSEO(true);
      
      let successCount = 0;
      let failedCount = 0;
      const failedRecipes: string[] = [];

      // Process recipes one by one to avoid API limits
      for (let i = 0; i < selectedRecipes.length; i++) {
        const recipeId = selectedRecipes[i];
        const recipe = recipes.find(r => r.id === recipeId);
        
        try {
          const response = await adminFetch('/api/seo/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recipeId })
          });

          if (response.ok) {
            successCount++;
          } else {
            const error = await response.json();
            console.error(`Failed to generate SEO for recipe ${recipeId}:`, error);
            failedCount++;
            failedRecipes.push(recipe?.title || recipeId);
          }
        } catch (error) {
          console.error(`Error processing recipe ${recipeId}:`, error);
          failedCount++;
          failedRecipes.push(recipe?.title || recipeId);
        }

        // Small delay between requests to be nice to the API
        if (i < selectedRecipes.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Show completion message
      let message = `✅ SEO Generation Complete!\n\nSuccess: ${successCount}\nFailed: ${failedCount}`;
      if (failedRecipes.length > 0) {
        message += `\n\nFailed recipes:\n${failedRecipes.join('\n')}`;
      }
      alert(message);

      // Clear selection and refresh the page to see updated SEO scores
      setSelectedRecipes([]);
      window.location.reload();
      
    } catch (error: any) {
      console.error('Failed to generate SEO:', error);
      alert(`❌ SEO generation failed:\n${error.message}\n\nMake sure OPENAI_API_KEY is set in your .env file.`);
    } finally {
      setIsGeneratingSEO(false);
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setSeoScoreRange([0, 100]);
    setDateRange("all");
  };

  // Helper function to get real recipe status
  const getRealRecipeStatus = (recipe: Recipe): 'published' | 'draft' => {
    // If status is explicitly set, use it
    if (recipe.status) return recipe.status;
    
    // Use href field as status indicator
    // If href is null, empty, or contains 'draft', it's a draft
    // Otherwise, it's published
    if (!recipe.href || recipe.href.includes('draft')) {
      return 'draft';
    }
    
    return 'published';
  };

  // Helper function to get proper image URL
  // UPDATED: Now handles legacy filenames with spaces using safeImageUrl
  const getRecipeImageUrl = (imagePath: string) => {
    if (!imagePath) return '/uploads/recipes/default-recipe.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    
    let finalPath: string;
    if (imagePath.startsWith('/')) {
      finalPath = imagePath;
    } else {
      finalPath = `/uploads/recipes/${imagePath}`;
    }
    
    // Encode URL to handle legacy filenames with spaces
    return safeImageUrl(finalPath);
  };

  // Helper function to handle recipe image errors
  const handleRecipeImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    target.style.display = 'none';
    const parent = target.parentElement;
    if (parent && !parent.querySelector('.recipe-fallback')) {
      const fallback = document.createElement('div');
      fallback.className = 'recipe-fallback w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center';
      fallback.innerHTML = '<svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M8.1 13.34l2.83-2.83L13.84 13.34a1 1 0 001.41-1.41L12.42 9.1a1 1 0 00-1.41 0L8.1 11.93a1 1 0 001.41 1.41z"/><path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm0 18a8 8 0 118-8 8 8 0 01-8 8z"/></svg>';
      parent.insertBefore(fallback, target);
    }
  };

  // Helper function to handle author image errors
  const handleAuthorImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    target.style.display = 'none';
    const parent = target.parentElement;
    if (parent && !parent.querySelector('.author-fallback')) {
      const fallback = document.createElement('div');
      fallback.className = 'author-fallback w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center';
      fallback.innerHTML = '<svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"></path></svg>';
      parent.insertBefore(fallback, target);
    }
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
        onBulkSEOGenerate={handleBulkSEOGenerate}
        isDeleting={isDeleting}
        isUpdatingStatus={isUpdatingStatus}
        isGeneratingSEO={isGeneratingSEO}
      />

      {/* Results Summary */}
      <div className="flex justify-between items-center text-xs text-gray-600 bg-gray-50 px-2 py-0.5 rounded">
        <span>
          Showing {startIndex + 1}-{Math.min(endIndex, filteredRecipes.length)} of {filteredRecipes.length} recipes
        </span>
        <div className="flex items-center gap-4">
          {selectedRecipes.length > 0 && (
            <span className="text-blue-600 font-medium text-xs">
              {selectedRecipes.length} selected
            </span>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs">Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="text-xs border border-gray-300 rounded px-2 py-1"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse min-w-[1000px]">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm w-12">
                  <input
                    type="checkbox"
                    checked={paginatedRecipes.length > 0 && paginatedRecipes.every(recipe => selectedRecipes.includes(recipe.id))}
                    onChange={(e) => e.target.checked ? handleSelectCurrentPage() : handleClearSelection()}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm w-70">Recipe</th>
                <th className="text-left py-3 px-0.1 font-medium text-gray-900 text-sm w-25">Author</th>
                <th className="text-left py-3 px-0.1 font-medium text-gray-900 text-sm w-30">Category</th>
                <th className="text-left py-3 px-0.1 font-medium text-gray-900 text-sm w-20">Status</th>
                <th className="text-left py-3 px-0.1 font-medium text-gray-900 text-sm w-15">Views</th>
                <th className="text-left py-3 px-0.1 font-medium text-gray-900 text-sm w-25">SEO</th>
                <th className="text-left py-3 px-0.1 font-medium text-gray-900 text-sm w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecipes.map((recipe) => (
                <tr key={recipe.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-1 px-4">
                    <input
                      type="checkbox"
                      checked={selectedRecipes.includes(recipe.id)}
                      onChange={(e) => handleSelectRecipe(recipe.id, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="py-3 ">
                    <div className="flex items-center gap-3">
                      <img
                        src={getRecipeImageUrl(recipe.img)}
                        alt={recipe.title}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                        onError={handleRecipeImageError}
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
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={getAuthorImage(recipe.author)}
                        alt={recipe.author?.name}
                        className="w-6 h-6 rounded-full"
                        onError={handleAuthorImageError}
                      />
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {recipe.author?.name || "Unknown"}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-0.1">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Tag className="w-3 h-3" />
                      <span className="text-sm truncate">{recipe.category}</span>
                    </div>
                  </td>
                  <td className="py-3 px-0.1">
                    <StatusBadge status={getRealRecipeStatus(recipe)} />
                  </td>
                  <td className="py-3 px-0.1">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Eye className="w-3 h-3" />
                      <span className="text-sm">{recipe.views?.toLocaleString() || '0'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-0.1">
                    <SEOScoreIndicator score={recipe.seoScore || 0} />
                  </td>
                  <td className="py-3 px-0.1">
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

      {/* Pagination */}
      {filteredRecipes.length > itemsPerPage && (
        <div className="flex items-center justify-between bg-white border border-gray-200 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            {/* First Page */}
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title="First page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            
            {/* Previous Page */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`px-3 py-1 text-sm rounded ${
                      pageNumber === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>
            
            {/* Next Page */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            
            {/* Last Page */}
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Last page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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