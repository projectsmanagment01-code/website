'use client';

import { ImageGenerationTab } from '@/automation/image-generation';
import { usePinterestData } from '@/automation/pinterest/hooks';

export default function ImageGenerationManager() {
  const { spyData, loading, getAuthHeaders } = usePinterestData();

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🎨 AI Image Generation
        </h1>
        <p className="text-gray-600">
          Generate 4 professional food images for each recipe using Google Imagen 3
        </p>
      </div>
      <ImageGenerationTab spyData={spyData} getAuthHeaders={getAuthHeaders} />
    </div>
  );
}
