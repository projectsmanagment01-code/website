'use client';

import { useState, useEffect } from 'react';
import { OrphanPage } from './types';

export default function OrphanPagesView() {
  const [orphans, setOrphans] = useState<OrphanPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    fetchOrphans();
  }, []);

  const fetchOrphans = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/internal-links/orphans');
      const data = await response.json();
      
      if (data.success) {
        setOrphans(data.orphans);
      }
    } catch (error) {
      console.error('Error fetching orphans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    setScanning(true);
    try {
      const response = await fetch('/api/admin/internal-links/orphans/scan', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        alert(`Scan complete! Found ${data.orphanCount} orphan pages out of ${data.totalRecipes} recipes.`);
        fetchOrphans();
      }
    } catch (error) {
      console.error('Error scanning orphans:', error);
      alert('Failed to scan orphan pages');
    } finally {
      setScanning(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading orphan pages...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Orphan Pages</h3>
          <p className="text-sm text-gray-600">Recipes with fewer than 3 incoming links</p>
        </div>
        <button
          onClick={handleScan}
          disabled={scanning}
          className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
        >
          {scanning ? 'Scanning...' : 'Scan for Orphans'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-red-50 rounded">
          <div className="text-2xl font-bold text-red-600">{orphans.length}</div>
          <div className="text-sm text-gray-600">Total Orphans</div>
        </div>
        <div className="p-4 bg-blue-50 rounded">
          <div className="text-2xl font-bold text-blue-600">
            {orphans.length > 0 ? (orphans.reduce((sum, o) => sum + o.incomingLinksCount, 0) / orphans.length).toFixed(1) : 0}
          </div>
          <div className="text-sm text-gray-600">Avg Incoming Links</div>
        </div>
        <div className="p-4 bg-green-50 rounded">
          <div className="text-2xl font-bold text-green-600">
            {orphans.length > 0 ? (orphans.reduce((sum, o) => sum + o.outgoingLinksCount, 0) / orphans.length).toFixed(1) : 0}
          </div>
          <div className="text-sm text-gray-600">Avg Outgoing Links</div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left text-sm font-medium">Recipe</th>
              <th className="p-2 text-left text-sm font-medium">Incoming Links</th>
              <th className="p-2 text-left text-sm font-medium">Outgoing Links</th>
              <th className="p-2 text-left text-sm font-medium">Last Scanned</th>
              <th className="p-2 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orphans.map(orphan => (
              <tr key={orphan.recipeId} className="border-b hover:bg-gray-50">
                <td className="p-2 text-sm">
                  <div className="font-medium">{orphan.recipeTitle}</div>
                  <div className="text-xs text-gray-500">{orphan.recipeSlug}</div>
                </td>
                <td className="p-2 text-sm">
                  <span className={`font-medium ${
                    orphan.incomingLinksCount === 0 ? 'text-red-600' :
                    orphan.incomingLinksCount < 3 ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {orphan.incomingLinksCount}
                  </span>
                </td>
                <td className="p-2 text-sm">{orphan.outgoingLinksCount}</td>
                <td className="p-2 text-sm text-gray-600">
                  {new Date(orphan.lastScannedAt).toLocaleDateString()}
                </td>
                <td className="p-2">
                  <a
                    href={`/recipes/${orphan.recipeSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-600 hover:text-orange-800 text-sm"
                  >
                    View Recipe
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {orphans.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No orphan pages found. Click "Scan for Orphans" to check your recipes.
        </div>
      )}
    </div>
  );
}
