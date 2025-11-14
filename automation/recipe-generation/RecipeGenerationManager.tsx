/**
 * Recipe Generation Manager - Wrapper component
 */

'use client';

import { usePinterestData } from '@/automation/pinterest/hooks';
import RecipeGenerationTab from './RecipeGenerationTab';

export default function RecipeGenerationManager() {
  const { spyData, loading, getAuthHeaders, loadSpyData } = usePinterestData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 dark:border-blue-400"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading data...</p>
        </div>
      </div>
    );
  }

  return <RecipeGenerationTab spyData={spyData} getAuthHeaders={getAuthHeaders} onRefresh={loadSpyData} />;
}
