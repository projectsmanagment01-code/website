'use client';

import { ImageGenerationTab } from '@/automation/image-generation';
import { usePinterestData } from '@/automation/pinterest/hooks';

export default function ImageGenerationManager() {
  const { spyData, loading, getAuthHeaders, loadSpyData } = usePinterestData();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  return <ImageGenerationTab spyData={spyData} getAuthHeaders={getAuthHeaders} onRefresh={loadSpyData} />;
}
