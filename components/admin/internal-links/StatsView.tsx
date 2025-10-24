'use client';

import { useState, useEffect } from 'react';
import { LinkingStats } from './types';

export default function StatsView() {
  const [stats, setStats] = useState<LinkingStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/internal-links/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading statistics...</div>;
  }

  if (!stats) {
    return <div className="p-4 text-center text-gray-500">No statistics available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Link Suggestions</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 bg-gray-50 rounded">
            <div className="text-2xl font-bold">{stats.suggestions.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="p-4 bg-yellow-50 rounded">
            <div className="text-2xl font-bold text-yellow-600">{stats.suggestions.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="p-4 bg-blue-50 rounded">
            <div className="text-2xl font-bold text-blue-600">{stats.suggestions.approved}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
          <div className="p-4 bg-green-50 rounded">
            <div className="text-2xl font-bold text-green-600">{stats.suggestions.applied}</div>
            <div className="text-sm text-gray-600">Applied</div>
          </div>
          <div className="p-4 bg-red-50 rounded">
            <div className="text-2xl font-bold text-red-600">{stats.suggestions.rejected}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
        </div>
      </div>

      {/* Average Score */}
      <div className="p-4 bg-orange-50 rounded">
        <div className="text-sm text-gray-600">Average Relevance Score</div>
        <div className="text-3xl font-bold text-orange-600">
          {stats.suggestions.avgRelevanceScore.toFixed(1)}
        </div>
      </div>

      {/* Orphan Stats */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Orphan Pages</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-red-50 rounded">
            <div className="text-2xl font-bold text-red-600">{stats.orphans.total}</div>
            <div className="text-sm text-gray-600">Total Orphans</div>
          </div>
          <div className="p-4 bg-blue-50 rounded">
            <div className="text-2xl font-bold text-blue-600">
              {stats.orphans.avgIncomingLinks.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Avg Incoming</div>
          </div>
          <div className="p-4 bg-green-50 rounded">
            <div className="text-2xl font-bold text-green-600">
              {stats.orphans.avgOutgoingLinks.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Avg Outgoing</div>
          </div>
        </div>
      </div>

      {/* Top Source Recipes */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Top Source Recipes</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left text-sm font-medium">Recipe</th>
                <th className="p-2 text-left text-sm font-medium">Suggestions</th>
              </tr>
            </thead>
            <tbody>
              {stats.topSourceRecipes.map(recipe => (
                <tr key={recipe.recipeId} className="border-b">
                  <td className="p-2 text-sm">
                    <a
                      href={`/recipes/${recipe.recipeSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 hover:underline"
                    >
                      {recipe.recipeTitle}
                    </a>
                  </td>
                  <td className="p-2 text-sm font-medium">{recipe.suggestionCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Target Recipes */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Most Linked To Recipes</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left text-sm font-medium">Recipe</th>
                <th className="p-2 text-left text-sm font-medium">Incoming Links</th>
              </tr>
            </thead>
            <tbody>
              {stats.topTargetRecipes.map(recipe => (
                <tr key={recipe.recipeId} className="border-b">
                  <td className="p-2 text-sm">
                    <a
                      href={`/recipes/${recipe.recipeSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 hover:underline"
                    >
                      {recipe.recipeTitle}
                    </a>
                  </td>
                  <td className="p-2 text-sm font-medium">{recipe.linkCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Last Scan */}
      {stats.lastScanDate && (
        <div className="text-sm text-gray-600">
          Last scan: {new Date(stats.lastScanDate).toLocaleString()}
        </div>
      )}
    </div>
  );
}
